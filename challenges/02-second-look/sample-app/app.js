const state = { reports: [], activeId: null, filterFlags: false, highlights: true, reviewed: new Set(), apiKey: '', modelId: '', isReviewing: false };

const fallbackReports = [
  { report_id: 'DEMO-001', report_text: 'EXAM: CT CHEST\n\nFINDINGS:\n8 mm nodule in the left upper lobe previously measured 6 mm.\n\nIMPRESSION:\nInterval increase in size of a right upper lobe nodule measuring 8 mm.' },
  { report_id: 'DEMO-002', report_text: 'EXAM: CT ABDOMEN\n\nFINDINGS:\nAppendix measures 9 mm with periappendiceal stranding.\n\nIMPRESSION:\nNo acute appendicitis.' }
];

const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
const normalize = (value) => String(value).replace(/\s+/g, ' ').trim();

function splitSections(text) {
  const findings = (text.match(/FINDINGS:\s*([\s\S]*?)(?=\s*IMPRESSION:|$)/i) || [,''])[1];
  const impression = (text.match(/IMPRESSION:\s*([\s\S]*)$/i) || [,''])[1];
  const exam = (text.match(/EXAM:\s*([^\n]+)/i) || [,'Report'])[1].trim();
  return { findings, impression, exam };
}

function mentions(text) {
  return {
    sides: [...text.matchAll(/\b(left|right)\b/gi)].map((m) => m[1].toLowerCase()),
    measurements: [...text.matchAll(/\b(\d+(?:\.\d+)?)\s*(mm|cm)\b/gi)].map((m) => ({ raw:m[0], value:Number(m[1]) * (m[2].toLowerCase() === 'cm' ? 10 : 1) }))
  };
}

function concise(text, max = 180) { const value = normalize(text); return value.length > max ? `${value.slice(0, max - 1)}...` : value; }

function ruleChecks(report) {
  const { findings, impression } = splitSections(report.report_text);
  const found = mentions(findings), concluded = mentions(impression), checks = [];
  const evidence = `FINDINGS: ${concise(findings)}\nIMPRESSION: ${concise(impression)}`;
  const findingSides = [...new Set(found.sides)], impressionSides = [...new Set(concluded.sides)];
  if (findingSides.length === 1 && impressionSides.length === 1 && findingSides[0] !== impressionSides[0]) checks.push({ type:'Possible laterality difference', description:'Verify that the side in Findings matches the side in Impression.', terms:[findingSides[0], impressionSides[0]], evidence });
  if (found.measurements.length && concluded.measurements.length && !found.measurements.some((a) => concluded.measurements.some((b) => a.value === b.value))) checks.push({ type:'Possible measurement difference', description:'Verify that the measurements in Findings and Impression align.', terms:[...found.measurements.map((x) => x.raw), ...concluded.measurements.map((x) => x.raw)], evidence });
  if (/\b(previously measured|increased|increase in size|enlarged|larger)\b/i.test(findings) && /\b(stable|unchanged)\b/i.test(impression)) checks.push({ type:'Possible trend tension', description:'Findings reference change while Impression uses stable language. Verify the intended trend.', terms:['previously measured', 'stable'], evidence });
  if (/\b(appendix measures|periappendiceal|restricted diffusion|loss of gray-white|noncompressible|thrombus|filling defect|fracture|pneumothorax)\b/i.test(findings) && /\b(no acute appendicitis|no acute infarction|no evidence of deep venous thrombosis|no acute fracture|no pneumothorax)\b/i.test(impression)) checks.push({ type:'Possible finding-conclusion tension', description:'Verify that the conclusion reflects the related finding.', terms:[], evidence });
  return checks;
}

function checksFor(report) { return report.aiChecks ?? report.ruleChecks; }
function prepareReports(rows) {
  return rows.map((row) => {
    const report = { report_id:String(row.report_id).trim(), report_text:String(row.report_text).trim() };
    return { ...report, ruleChecks:ruleChecks(report), aiChecks:null, aiStatus:'not reviewed' };
  });
}

function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index], next = text[index + 1];
    if (character === '"' && quoted && next === '"') { field += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { row.push(field); field = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && next === '\n') index += 1; row.push(field); if (row.some((value) => value !== '')) rows.push(row); row = []; field = ''; }
    else field += character;
  }
  row.push(field); if (row.some((value) => value !== '')) rows.push(row);
  const headers = rows.shift()?.map((header) => header.trim());
  if (!headers?.includes('report_id') || !headers.includes('report_text')) throw new Error('CSV needs report_id and report_text columns.');
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))).filter((row) => row.report_id && row.report_text);
}

function renderList() {
  const query = $('search').value.trim().toLowerCase();
  const visible = state.reports.filter((report) => (!state.filterFlags || checksFor(report).length) && (!query || `${report.report_id} ${report.report_text}`.toLowerCase().includes(query)));
  if (!visible.some((report) => report.report_id === state.activeId) && visible[0]) state.activeId = visible[0].report_id;
  $('report-list').innerHTML = visible.map((report) => {
    const { exam } = splitSections(report.report_text);
    const aiLabel = report.aiStatus === 'complete' ? 'AI' : report.aiStatus === 'failed' ? 'AI failed' : '';
    return `<button class="report-row ${report.report_id === state.activeId ? 'active' : ''}" data-id="${escapeHtml(report.report_id)}"><span class="row-dot ${checksFor(report).length ? 'has-flags' : ''}"></span><span><strong class="row-id">${escapeHtml(report.report_id)}</strong><span class="row-exam">${escapeHtml(exam)}</span></span>${aiLabel ? `<span class="ai-row-status ${report.aiStatus}">${aiLabel}</span>` : ''}</button>`;
  }).join('');
  document.querySelectorAll('.report-row').forEach((button) => button.addEventListener('click', () => { state.activeId = button.dataset.id; render(); }));
  $('empty-state').hidden = visible.length > 0; $('review-content').hidden = visible.length === 0;
}

function reportHtml(report) {
  let html = escapeHtml(report.report_text).replace(/^(EXAM|FINDINGS|IMPRESSION):/gm, '<span class="section-label">$1:</span>');
  if (!state.highlights) return html;
  const terms = [...new Set(checksFor(report).flatMap((check) => check.terms).filter(Boolean))].sort((a, b) => b.length - a.length);
  terms.forEach((term) => { const safe = escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); html = html.replace(new RegExp(`(${safe})`, 'gi'), '<mark class="highlight">$1</mark>'); });
  return html;
}

function renderReview() {
  const report = state.reports.find((item) => item.report_id === state.activeId); if (!report) return;
  const checks = checksFor(report), reviewed = state.reviewed.has(report.report_id), reviewKind = report.aiStatus === 'complete' ? 'AI review' : 'Rule-based review';
  $('exam-type').textContent = splitSections(report.report_text).exam; $('active-id').textContent = report.report_id; $('report-text').innerHTML = reportHtml(report);
  $('toggle-highlight').textContent = state.highlights ? 'Highlights on' : 'Highlights off'; $('toggle-highlight').setAttribute('aria-pressed', String(state.highlights));
  $('mark-reviewed').textContent = reviewed ? 'Reviewed' : 'Mark reviewed'; $('mark-reviewed').classList.toggle('reviewed', reviewed); $('review-state').textContent = reviewed ? 'Marked for this session' : '';
  $('check-title').textContent = report.aiStatus === 'failed' ? 'AI review failed' : checks.length ? `${reviewKind} cues` : 'No review cues'; $('check-count').textContent = checks.length;
  $('summary-banner').className = `summary-banner ${checks.length ? 'attention' : ''}`;
  $('summary-banner').textContent = report.aiStatus === 'failed' ? 'AI review did not complete for this report. Rule-based cues are shown instead.' : checks.length ? `${checks.length} item${checks.length === 1 ? '' : 's'} may deserve a quick verification before signing.` : `${reviewKind} found no clear textual tension. This does not replace source review.`;
  $('checks').innerHTML = checks.length ? '' : '<div class="clear-checks"><div class="check-icon">OK</div>No text comparison triggered a review cue.</div>';
  checks.forEach((check) => { const node = $('check-template').content.cloneNode(true); node.querySelector('h4').textContent = check.type; node.querySelector('.check-description').textContent = check.description; node.querySelector('.evidence').textContent = check.evidence; $('checks').append(node); });
}

function render() {
  const flagged = state.reports.filter((report) => checksFor(report).length).length;
  $('report-count').textContent = `${state.reports.length} report${state.reports.length === 1 ? '' : 's'}`; $('flagged-count').textContent = flagged; $('dataset-detail').textContent = `${state.reports.length} report${state.reports.length === 1 ? '' : 's'} ready to review`;
  renderList(); renderReview();
}

function loadReports(rows, name) {
  state.reports = prepareReports(rows); state.activeId = state.reports[0]?.report_id ?? null; state.reviewed.clear(); state.filterFlags = false; $('flag-filter').setAttribute('aria-pressed', 'false'); $('dataset-name').textContent = name; render();
}

function exactExcerpt(reportText, value) { return Boolean(value) && reportText.toLowerCase().includes(String(value).trim().toLowerCase()); }
function parseAiItems(content, reportText) {
  const raw = typeof content === 'string' ? content : ''; const match = raw.match(/\{[\s\S]*\}/); const parsed = JSON.parse(match ? match[0] : raw);
  return (Array.isArray(parsed.items) ? parsed.items : []).filter((item) => exactExcerpt(reportText, item.finding_evidence) || exactExcerpt(reportText, item.impression_evidence)).map((item) => ({ type:String(item.type || 'Possible textual tension'), description:String(item.review_prompt || 'Verify the source text before signing.'), terms:[item.finding_evidence, item.impression_evidence].filter((value) => exactExcerpt(reportText, value)), evidence:`FINDINGS: ${item.finding_evidence || '-'}\nIMPRESSION: ${item.impression_evidence || '-'}` }));
}

function setAiButtonsEnabled(enabled) {
  $('ai-review').disabled = !enabled;
  $('ai-review-all').disabled = !enabled;
}

async function reviewWithAi(report) {
  const prompt = `Review this report for possible internal textual tensions before signing. Use only the supplied report. Flag only: laterality differences, measurement or trend tensions, a finding that conflicts with a conclusion, or a potentially relevant finding absent from the Impression. Do not declare the report wrong, do not diagnose, and do not flag complexity alone. Every item must quote exact text from the report. Return only JSON in this shape: {"items":[{"type":"short neutral label","finding_evidence":"exact quote or empty string","impression_evidence":"exact quote or empty string","review_prompt":"short neutral question"}]}. Return {"items":[]} if there is no clear evidence.\n\nREPORT:\n${report.report_text}`;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${state.apiKey}`, 'Content-Type':'application/json' }, body:JSON.stringify({ model:state.modelId, messages:[{ role:'user', content:prompt }], temperature:0.1 }) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || 'AI review failed.');
  report.aiChecks = parseAiItems(payload?.choices?.[0]?.message?.content, report.report_text);
  report.aiStatus = 'complete';
}

$('search').addEventListener('input', render);
$('flag-filter').addEventListener('click', () => { state.filterFlags = !state.filterFlags; $('flag-filter').setAttribute('aria-pressed', String(state.filterFlags)); render(); });
$('toggle-highlight').addEventListener('click', () => { state.highlights = !state.highlights; renderReview(); });
$('mark-reviewed').addEventListener('click', () => { state.reviewed.has(state.activeId) ? state.reviewed.delete(state.activeId) : state.reviewed.add(state.activeId); renderReview(); });
$('csv-upload').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; try { loadReports(parseCSV(await file.text()), file.name); } catch (error) { alert(error.message); } event.target.value = ''; });
$('load-sample').addEventListener('click', async () => { try { const response = await fetch('../data/reports.csv'); if (!response.ok) throw new Error(); loadReports(parseCSV(await response.text()), 'Sample dataset'); } catch { loadReports(fallbackReports, 'Demo fallback'); } });

$('api-key').addEventListener('input', (event) => {
  state.apiKey = event.target.value.trim(); state.modelId = ''; $('model-select').innerHTML = '<option>Choose a model</option>'; $('model-select').disabled = true; setAiButtonsEnabled(false); $('ai-status').textContent = state.apiKey ? 'Find models available to this key.' : 'Rules-only review is ready.';
});
$('load-models').addEventListener('click', async () => {
  if (!state.apiKey) { $('ai-status').textContent = 'Enter an OpenRouter API key first.'; return; }
  $('load-models').disabled = true; $('ai-status').textContent = 'Finding available models...';
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models/user', { headers:{ Authorization:`Bearer ${state.apiKey}` } }); const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Unable to load models.'); const models = (payload.data || []).filter((model) => !model.id.startsWith('openrouter/')); if (!models.length) throw new Error('No direct models are available to this key.');
    $('model-select').innerHTML = '<option value="">Choose a model</option>' + models.map((model) => `<option value="${escapeHtml(model.id)}">${escapeHtml(model.name || model.id)}</option>`).join(''); $('model-select').disabled = false; $('ai-status').textContent = `${models.length} available model${models.length === 1 ? '' : 's'} found.`;
  } catch (error) { $('ai-status').textContent = error.message || 'Could not load models.'; } finally { $('load-models').disabled = false; }
});
$('model-select').addEventListener('change', (event) => { state.modelId = event.target.value; setAiButtonsEnabled(Boolean(state.modelId)); });
$('ai-review').addEventListener('click', async () => {
  const report = state.reports.find((item) => item.report_id === state.activeId); if (!report || !state.apiKey || !state.modelId) return;
  const button = $('ai-review'); state.isReviewing = true; setAiButtonsEnabled(false); button.textContent = 'Reviewing...'; $('ai-status').textContent = `Reviewing ${report.report_id}...`;
  try {
    await reviewWithAi(report); $('ai-status').textContent = `AI review complete for ${report.report_id}.`; render();
  } catch (error) { report.aiStatus = 'failed'; $('ai-status').textContent = error.message || 'AI review failed.'; render(); } finally { state.isReviewing = false; setAiButtonsEnabled(Boolean(state.modelId)); button.textContent = 'Review with AI'; }
});
$('ai-review-all').addEventListener('click', async () => {
  if (!state.apiKey || !state.modelId || state.isReviewing) return;
  const button = $('ai-review-all'); state.isReviewing = true; setAiButtonsEnabled(false); button.textContent = 'Reviewing all...'; let completed = 0; let failed = 0;
  try {
    for (const report of state.reports) {
      $('ai-status').textContent = `Reviewing ${completed + failed + 1} of ${state.reports.length}: ${report.report_id}...`;
      try { await reviewWithAi(report); completed += 1; } catch { report.aiStatus = 'failed'; failed += 1; }
      render();
    }
    $('ai-status').textContent = `AI review complete: ${completed} reviewed${failed ? `, ${failed} failed` : ''}.`;
  } finally {
    state.isReviewing = false; setAiButtonsEnabled(Boolean(state.modelId)); button.textContent = 'Review all with AI';
  }
});

$('load-sample').click();
