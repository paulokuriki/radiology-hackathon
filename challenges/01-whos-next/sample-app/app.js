const REQUIRED_COLUMNS = ["study_id", "snapshot_time", "exam_completed_time", "modality", "exam_description", "patient_location", "order_priority", "clinical_indication"];
const DEFAULT_WEIGHTS = { priority: 45, location: 25, wait: 20, indication: 10 };
const PRIORITY_POINTS = { STAT: 100, Urgent: 67, Routine: 25 };
const LOCATION_POINTS = { ICU: 100, ED: 90, "Inpatient Floor": 55, Outpatient: 15 };
const INDICATION_RULES = [
  { words: ["code stroke", "aphasia", "facial droop", "weakness", "unequal pupils", "mental status"], label: "acute neurologic change", points: 100 },
  { words: ["dissection", "tearing chest", "chest pain"], label: "aortic/chest emergency concern", points: 95 },
  { words: ["pulmonary embolism", "pleuritic", "dyspnea", "hypoxemia", "oxygen requirement"], label: "acute cardiopulmonary concern", points: 85 },
  { words: ["shock", "vasopressor", "elevated lactate"], label: "hemodynamic instability", points: 90 },
  { words: ["intubation", "endotracheal", "line placement", "feeding tube", "before use", "vasoactive"], label: "device position needed", points: 80 },
  { words: ["seizure", "saddle", "urinary retention", "testicular pain"], label: "time-sensitive symptom", points: 75 },
  { words: ["fever", "jaundice", "worsening pain"], label: "acute infectious/abdominal concern", points: 55 },
];

let studies = [];
let manualOrder = [];
const state = { weights: { ...DEFAULT_WEIGHTS }, location: "", priority: "", search: "" };
const $ = (id) => document.getElementById(id);

$("file-input").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try { loadStudies(parseCsv(await file.text())); }
  catch (error) { alert(error.message); event.target.value = ""; }
});

for (const [key, value] of Object.entries(DEFAULT_WEIGHTS)) {
  const input = $(`${key}-weight`); const output = $(`${key}-value`);
  input.addEventListener("input", () => { state.weights[key] = Number(input.value); output.value = input.value; render(); });
}
$("restore-defaults").addEventListener("click", () => { Object.assign(state.weights, DEFAULT_WEIGHTS); for (const [key, value] of Object.entries(DEFAULT_WEIGHTS)) { $(`${key}-weight`).value = value; $(`${key}-value`).value = value; } render(); });
$("reset-overrides").addEventListener("click", () => { manualOrder = []; render(); });
$("location-filter").addEventListener("change", (e) => { state.location = e.target.value; render(); });
$("priority-filter").addEventListener("change", (e) => { state.priority = e.target.value; render(); });
$("search").addEventListener("input", (e) => { state.search = e.target.value.toLowerCase().trim(); render(); });

function loadStudies(rows) {
  if (!rows.length) throw new Error("This CSV has no study rows.");
  const missing = REQUIRED_COLUMNS.filter((column) => !(column in rows[0]));
  if (missing.length) throw new Error(`This CSV is missing required column(s): ${missing.join(", ")}.`);
  const malformed = rows.find((row) => !isValidDate(row.snapshot_time) || !isValidDate(row.exam_completed_time));
  if (malformed) throw new Error(`Study ${malformed.study_id || "(unknown)"} has an invalid snapshot or completed time.`);
  studies = rows.map((row) => ({ ...row, id: row.study_id, waitMinutes: Math.max(0, (new Date(row.snapshot_time) - new Date(row.exam_completed_time)) / 60000) }));
  manualOrder = [];
  setupFilters();
  $("empty-state").hidden = true; $("workspace").hidden = false;
  $("snapshot-time").textContent = formatDate(studies[0].snapshot_time);
  render();
}

function setupFilters() {
  for (const [id, field] of [["location-filter", "patient_location"], ["priority-filter", "order_priority"]]) {
    const select = $(id); const first = select.options[0].outerHTML;
    select.innerHTML = first + [...new Set(studies.map((study) => study[field]))].sort().map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  }
}

function scoreStudy(study) {
  const indication = indicationSignal(study.clinical_indication);
  const wait = Math.min(100, (study.waitMinutes / 360) * 100);
  const inputs = { priority: PRIORITY_POINTS[study.order_priority] ?? 35, location: LOCATION_POINTS[study.patient_location] ?? 35, wait, indication: indication.points };
  const weightTotal = Object.values(state.weights).reduce((sum, n) => sum + n, 0) || 1;
  const score = Object.entries(inputs).reduce((sum, [key, points]) => sum + points * state.weights[key], 0) / weightTotal;
  return { score, indication, inputs };
}

function indicationSignal(text) {
  const clean = (text || "").toLowerCase();
  if (!clean || clean.includes("not provided")) return { points: 35, labels: ["indication missing — review"] };
  const matches = INDICATION_RULES.filter((rule) => rule.words.some((word) => clean.includes(word)));
  return { points: matches.length ? Math.max(...matches.map((rule) => rule.points)) : 25, labels: matches.map((rule) => rule.label) };
}

function orderedStudies() {
  const calculated = studies.map((study) => ({ ...study, analysis: scoreStudy(study) }));
  const automatic = calculated.sort((a, b) => b.analysis.score - a.analysis.score || b.waitMinutes - a.waitMinutes);
  const manual = manualOrder.map((id) => automatic.find((study) => study.id === id)).filter(Boolean);
  return [...manual, ...automatic.filter((study) => !manualOrder.includes(study.id))];
}

function render() {
  if (!studies.length) return;
  const all = orderedStudies();
  const visible = all.filter((study) => (!state.location || study.patient_location === state.location) && (!state.priority || study.order_priority === state.priority) && (!state.search || `${study.exam_description} ${study.clinical_indication} ${study.study_id}`.toLowerCase().includes(state.search)));
  $("study-count").textContent = studies.length;
  $("now-count").textContent = all.filter((study) => tier(study.analysis.score) === "Read now").length;
  const body = $("worklist-body"); body.innerHTML = "";
  visible.forEach((study) => {
    const rank = all.indexOf(study) + 1; const item = $("row-template").content.cloneNode(true); const row = item.querySelector("tr");
    if (manualOrder.includes(study.id)) row.classList.add("manual");
    item.querySelector(".rank").textContent = rank;
    const level = tier(study.analysis.score); const tierEl = item.querySelector(".tier"); tierEl.textContent = level; tierEl.classList.add(level === "Read now" ? "now" : level === "Read next" ? "next" : "wait");
    item.querySelector(".score").textContent = `Decision score ${Math.round(study.analysis.score)}`;
    item.querySelector(".study").innerHTML = `<strong>${escapeHtml(study.exam_description)}</strong><span>${escapeHtml(study.study_id)} · ${escapeHtml(study.modality)}</span>`;
    item.querySelector(".context").innerHTML = `<strong>${escapeHtml(study.patient_location)} · ${escapeHtml(study.order_priority)}</strong><span>${escapeHtml(study.clinical_indication || "No clinical indication")}</span>`;
    item.querySelector(".waiting").textContent = formatWait(study.waitMinutes);
    item.querySelector(".reasons").innerHTML = reasonTags(study);
    const up = item.querySelector(".move-up"), down = item.querySelector(".move-down");
    up.disabled = rank === 1; down.disabled = rank === all.length; up.addEventListener("click", () => moveStudy(study.id, -1)); down.addEventListener("click", () => moveStudy(study.id, 1));
    body.append(item);
  });
  if (!visible.length) body.innerHTML = '<tr><td colspan="7" class="context">No studies match these filters.</td></tr>';
}

function moveStudy(id, direction) {
  const current = orderedStudies().map((study) => study.id); const from = current.indexOf(id); const to = from + direction;
  if (to < 0 || to >= current.length) return;
  [current[from], current[to]] = [current[to], current[from]];
  manualOrder = current; render();
}
function tier(score) { return score >= 70 ? "Read now" : score >= 45 ? "Read next" : "Can wait"; }
function reasonTags(study) { const tags = [`${study.order_priority} order`, `${study.patient_location} location`, `${formatWait(study.waitMinutes)} waiting`]; const labels = study.analysis.indication.labels; return [...tags, ...labels].map((tag) => `<span class="reason-tag ${tag.includes("missing") ? "review" : ""}">${escapeHtml(tag)}</span>`).join(""); }
function formatWait(minutes) { const hours = Math.floor(minutes / 60), mins = Math.round(minutes % 60); return hours ? `${hours}h ${mins}m` : `${mins}m`; }
function formatDate(value) { return new Date(value).toLocaleString([], { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }); }
function isValidDate(value) { return !Number.isNaN(new Date(value).getTime()); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char])); }
function parseCsv(text) {
  const lines = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) { const char = text[i], next = text[i + 1]; if (char === '"' && quoted && next === '"') { cell += '"'; i++; } else if (char === '"') quoted = !quoted; else if (char === ',' && !quoted) { row.push(cell); cell = ""; } else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && next === '\n') i++; row.push(cell); if (row.some((value) => value.trim())) lines.push(row); row = []; cell = ""; } else cell += char; }
  if (quoted) throw new Error("The CSV has an unmatched quotation mark."); if (cell || row.length) { row.push(cell); lines.push(row); }
  if (lines.length < 2) throw new Error("The CSV needs a header row and at least one study row.");
  const headers = lines[0].map((header) => header.trim().replace(/^\uFEFF/, ""));
  return lines.slice(1).map((values, index) => { if (values.length !== headers.length) throw new Error(`CSV row ${index + 2} has ${values.length} values; expected ${headers.length}.`); return Object.fromEntries(headers.map((header, i) => [header, values[i].trim()])); });
}

async function loadSampleWorklist() {
  try {
    const response = await fetch("../data/worklist.csv");
    if (!response.ok) throw new Error("Sample worklist could not be loaded.");
    loadStudies(parseCsv(await response.text()));
  } catch {
    // The upload workflow remains available when the app is opened directly from a local file.
  }
}

loadSampleWorklist();
