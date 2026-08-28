const REQUIRED_COLUMNS = [
  "study_id",
  "snapshot_time",
  "exam_completed_time",
  "modality",
  "exam_description",
  "patient_location",
  "order_priority",
  "clinical_indication"
];

const DEFAULT_POLICY = {
  weightStat: 55,
  weightUrgent: 32,
  weightRoutine: 6,
  weightEd: 24,
  weightIcu: 22,
  weightInpatient: 12,
  weightOutpatient: 2,
  waitPerHour: 8,
  waitCap: 48,
  phraseBonus: 16,
  missingBonus: 8
};

const URGENCY_TRIGGERS = [
  { label: "stroke or focal neurologic symptom", pattern: /\b(code stroke|aphasia|facial droop|dysarthria|unequal pupils|arm drift|weakness|acute confusion|decline in mental status)\b/i },
  { label: "acute vascular concern", pattern: /\b(dissection|pulmonary embolism|pleuritic|sudden dyspnea|tearing chest pain|syncope)\b/i },
  { label: "shock or oxygenation concern", pattern: /\b(shock|vasopressor|lactate|hypoxemia|oxygen requirement|intubation)\b/i },
  { label: "postoperative infection concern", pattern: /\b(fever|leukocytosis|after surgery|after colectomy|recent bowel surgery|jaundice|rising bilirubin)\b/i },
  { label: "trauma or unstable spine concern", pattern: /\b(trauma|motor vehicle|high-energy|midline|saddle numbness|urinary retention|gait instability)\b/i },
  { label: "time-sensitive tube or line check", pattern: /\b(line placement|tube position|feeding tube|before use|endotracheal|vasoactive infusion)\b/i },
  { label: "acute painful ED presentation", pattern: /\b(abrupt onset|first trimester bleeding|right lower quadrant pain|flank pain|hematuria|testicular pain)\b/i },
  { label: "known malignancy with new symptom", pattern: /\b(new seizure|known intracranial neoplasm|brain metastases)\b/i }
];

let rows = [];
let scoredRows = [];
let displayOrder = [];
let originalOrder = [];

const el = {
  csvInput: document.getElementById("csvInput"),
  loadWorklist: document.getElementById("loadWorklist"),
  loadPractice: document.getElementById("loadPractice"),
  exportCsv: document.getElementById("exportCsv"),
  status: document.getElementById("status"),
  readNowCount: document.getElementById("readNowCount"),
  caseCount: document.getElementById("caseCount"),
  oldestWait: document.getElementById("oldestWait"),
  reviewCount: document.getElementById("reviewCount"),
  resetPolicy: document.getElementById("resetPolicy"),
  applyPolicy: document.getElementById("applyPolicy"),
  clearFilters: document.getElementById("clearFilters"),
  searchBox: document.getElementById("searchBox"),
  tierFilter: document.getElementById("tierFilter"),
  locationFilter: document.getElementById("locationFilter"),
  worklistBody: document.getElementById("worklistBody")
};

const policyInputs = Object.keys(DEFAULT_POLICY).reduce((acc, key) => {
  acc[key] = document.getElementById(key);
  return acc;
}, {});

el.csvInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => loadCsvText(reader.result, file.name);
  reader.onerror = () => setStatus("Could not read that file.", "error");
  reader.readAsText(file);
});

el.loadWorklist.addEventListener("click", () => loadRelativeCsv("../data/worklist.csv", "worklist.csv"));
el.loadPractice.addEventListener("click", () => loadRelativeCsv("../data/practice-worklist.csv", "practice-worklist.csv"));
el.exportCsv.addEventListener("click", exportResults);
el.resetPolicy.addEventListener("click", resetPolicy);
el.applyPolicy.addEventListener("click", () => {
  recomputeScores();
  displayOrder = scoredRows.map(row => row.study_id);
  render();
});
el.clearFilters.addEventListener("click", clearFilters);
el.searchBox.addEventListener("input", render);
el.tierFilter.addEventListener("change", render);
el.locationFilter.addEventListener("change", render);

Object.values(policyInputs).forEach(input => {
  input.addEventListener("input", () => {
    if (!rows.length) return;
    recomputeScores();
    render();
  });
});

function parseCsv(text) {
  const records = [];
  let record = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      record.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      record.push(field);
      if (record.some(value => value.trim() !== "")) records.push(record);
      record = [];
      field = "";
      continue;
    }

    field += char;
  }

  record.push(field);
  if (record.some(value => value.trim() !== "")) records.push(record);
  return records;
}

function validateAndShape(records) {
  if (records.length < 2) {
    throw new Error("The CSV needs a header row and at least one worklist row.");
  }

  const header = records[0].map(value => value.trim());
  const missing = REQUIRED_COLUMNS.filter(column => !header.includes(column));
  if (missing.length) {
    throw new Error(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
  }

  const indexByName = new Map(header.map((name, index) => [name, index]));
  return records.slice(1).map((record, rowIndex) => {
    const shaped = {};
    REQUIRED_COLUMNS.forEach(column => {
      shaped[column] = (record[indexByName.get(column)] || "").trim();
    });
    shaped._sourceRow = rowIndex + 2;
    return shaped;
  });
}

function loadCsvText(text, label) {
  try {
    const records = parseCsv(String(text).replace(/^\uFEFF/, ""));
    rows = validateAndShape(records);
    originalOrder = rows.map(row => row.study_id);
    recomputeScores();
    displayOrder = scoredRows.map(row => row.study_id);
    hydrateLocationFilter();
    setControlsEnabled(true);
    setStatus(`Loaded ${rows.length} studies from ${label}. Scores are visible and editable.`, "success");
    render();
  } catch (error) {
    rows = [];
    scoredRows = [];
    displayOrder = [];
    setControlsEnabled(false);
    setStatus(error.message, "error");
    render();
  }
}

function loadRelativeCsv(path, label) {
  fetch(path)
    .then(response => {
      if (!response.ok) throw new Error(`Could not load ${label}.`);
      return response.text();
    })
    .then(text => loadCsvText(text, label))
    .catch(() => {
      setStatus(`Use Upload CSV to load ${label} if the browser blocks local sample loading.`, "error");
    });
}

function getPolicy() {
  return Object.entries(policyInputs).reduce((policy, [key, input]) => {
    const value = Number(input.value);
    policy[key] = Number.isFinite(value) ? value : DEFAULT_POLICY[key];
    return policy;
  }, {});
}

function resetPolicy() {
  Object.entries(DEFAULT_POLICY).forEach(([key, value]) => {
    policyInputs[key].value = value;
  });
  if (rows.length) {
    recomputeScores();
    displayOrder = scoredRows.map(row => row.study_id);
    render();
  }
}

function recomputeScores() {
  const policy = getPolicy();
  scoredRows = rows
    .map(row => scoreRow(row, policy))
    .sort((a, b) => b.score - a.score || b.waitMinutes - a.waitMinutes || originalOrder.indexOf(a.study_id) - originalOrder.indexOf(b.study_id));
}

function scoreRow(row, policy) {
  const priorityScore = lookupPriority(row.order_priority, policy);
  const locationScore = lookupLocation(row.patient_location, policy);
  const waitMinutes = calculateWaitMinutes(row.snapshot_time, row.exam_completed_time);
  const waitScore = Math.min(policy.waitCap, Math.max(0, waitMinutes / 60 * policy.waitPerHour));
  const indication = scoreIndication(row.clinical_indication, policy);
  const score = Math.round(priorityScore + locationScore + waitScore + indication.score);
  const reasons = [
    `${row.order_priority || "Unknown priority"} order: +${Math.round(priorityScore)}`,
    `${row.patient_location || "Unknown location"} location: +${Math.round(locationScore)}`,
    `${formatWait(waitMinutes)} waiting: +${Math.round(waitScore)}`
  ];

  if (indication.matched.length) {
    indication.matched.forEach(label => reasons.push(`Indication cue, ${label}: +${policy.phraseBonus}`));
  }

  if (indication.reviewCue) {
    reasons.push(`Review cue, missing or unclear indication: +${policy.missingBonus}`);
  }

  return {
    ...row,
    score,
    tier: tierForScore(score),
    waitMinutes,
    reasons,
    reviewCue: indication.reviewCue
  };
}

function lookupPriority(priority, policy) {
  const normalized = String(priority).toLowerCase();
  if (normalized === "stat") return policy.weightStat;
  if (normalized === "urgent") return policy.weightUrgent;
  if (normalized === "routine") return policy.weightRoutine;
  return Math.round(policy.weightUrgent / 2);
}

function lookupLocation(location, policy) {
  const normalized = String(location).toLowerCase();
  if (normalized === "ed" || normalized.includes("emergency")) return policy.weightEd;
  if (normalized === "icu" || normalized.includes("intensive")) return policy.weightIcu;
  if (normalized.includes("inpatient")) return policy.weightInpatient;
  if (normalized.includes("outpatient")) return policy.weightOutpatient;
  return Math.round(policy.weightInpatient / 2);
}

function calculateWaitMinutes(snapshot, completed) {
  const snapshotDate = parseLocalDate(snapshot);
  const completedDate = parseLocalDate(completed);
  if (!snapshotDate || !completedDate) return 0;
  return Math.max(0, Math.round((snapshotDate - completedDate) / 60000));
}

function parseLocalDate(value) {
  if (!value) return null;
  const normalized = value.trim().replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function scoreIndication(text, policy) {
  const trimmed = String(text || "").trim();
  const reviewCue = !trimmed || /\b(not provided|unknown|n\/a|none provided|unclear)\b/i.test(trimmed);
  const matched = URGENCY_TRIGGERS
    .filter(trigger => trigger.pattern.test(trimmed))
    .map(trigger => trigger.label);
  const cappedMatches = matched.slice(0, 3);
  return {
    score: cappedMatches.length * policy.phraseBonus + (reviewCue ? policy.missingBonus : 0),
    matched: cappedMatches,
    reviewCue
  };
}

function tierForScore(score) {
  if (score >= 96) return "Read now";
  if (score >= 72) return "Next wave";
  if (score >= 44) return "Keep visible";
  return "Can wait";
}

function tierClass(tier) {
  return `tier-${tier.toLowerCase().replaceAll(" ", "-")}`;
}

function hydrateLocationFilter() {
  const selected = el.locationFilter.value;
  const locations = Array.from(new Set(rows.map(row => row.patient_location).filter(Boolean))).sort();
  el.locationFilter.innerHTML = `<option value="all">All locations</option>${locations.map(location => `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`).join("")}`;
  if (locations.includes(selected)) el.locationFilter.value = selected;
}

function setControlsEnabled(enabled) {
  [el.exportCsv, el.applyPolicy, el.clearFilters, el.searchBox, el.tierFilter, el.locationFilter].forEach(control => {
    control.disabled = !enabled;
  });
}

function clearFilters() {
  el.searchBox.value = "";
  el.tierFilter.value = "all";
  el.locationFilter.value = "all";
  render();
}

function render() {
  const byId = new Map(scoredRows.map(row => [row.study_id, row]));
  const orderedRows = displayOrder.map(id => byId.get(id)).filter(Boolean);
  const query = el.searchBox.value.trim().toLowerCase();
  const tier = el.tierFilter.value;
  const location = el.locationFilter.value;
  const visibleRows = orderedRows.filter(row => {
    const haystack = `${row.study_id} ${row.modality} ${row.exam_description} ${row.patient_location} ${row.order_priority} ${row.clinical_indication}`.toLowerCase();
    return (!query || haystack.includes(query)) &&
      (tier === "all" || row.tier === tier) &&
      (location === "all" || row.patient_location === location);
  });

  renderMetrics(orderedRows);

  if (!rows.length) {
    el.worklistBody.innerHTML = `<tr class="placeholder-row"><td colspan="7">No worklist loaded yet.</td></tr>`;
    return;
  }

  if (!visibleRows.length) {
    el.worklistBody.innerHTML = `<tr class="placeholder-row"><td colspan="7">No rows match the current filters.</td></tr>`;
    return;
  }

  const policyRank = new Map(scoredRows.map((row, index) => [row.study_id, index + 1]));
  el.worklistBody.innerHTML = visibleRows.map(row => {
    const currentIndex = displayOrder.indexOf(row.study_id);
    const sequence = currentIndex + 1;
    const moved = policyRank.get(row.study_id) !== sequence;
    const reasonHtml = row.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("");
    const reviewCue = row.reviewCue ? `<span class="cue">Review indication</span>` : "";
    const movedCue = moved ? `<span class="override-mark">Manual position</span>` : "";

    return `
      <tr>
        <td><strong>${sequence}</strong><div class="study-subline">Policy ${policyRank.get(row.study_id)}</div></td>
        <td>
          <div class="study-title">${escapeHtml(row.study_id)} - ${escapeHtml(row.modality)}</div>
          <div>${escapeHtml(row.exam_description)}</div>
          <div class="study-subline">${escapeHtml(row.patient_location)} / ${escapeHtml(row.order_priority)}</div>
          <div class="indication">${escapeHtml(row.clinical_indication || "Clinical indication not provided")}</div>
        </td>
        <td>
          <span class="tier-pill ${tierClass(row.tier)}">${escapeHtml(row.tier)}</span>
          ${reviewCue}
          ${movedCue}
        </td>
        <td class="score-cell">${row.score}</td>
        <td>${formatWait(row.waitMinutes)}</td>
        <td><ul class="reason-list">${reasonHtml}</ul></td>
        <td>
          <div class="move-tools">
            <button type="button" data-action="up" data-id="${escapeHtml(row.study_id)}" ${currentIndex === 0 ? "disabled" : ""}>Up</button>
            <button type="button" data-action="down" data-id="${escapeHtml(row.study_id)}" ${currentIndex === displayOrder.length - 1 ? "disabled" : ""}>Down</button>
            <button type="button" data-action="top" data-id="${escapeHtml(row.study_id)}" ${currentIndex === 0 ? "disabled" : ""}>Top</button>
            <button type="button" data-action="bottom" data-id="${escapeHtml(row.study_id)}" ${currentIndex === displayOrder.length - 1 ? "disabled" : ""}>End</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  el.worklistBody.querySelectorAll("button[data-action]").forEach(button => {
    button.addEventListener("click", () => moveStudy(button.dataset.id, button.dataset.action));
  });
}

function renderMetrics(orderedRows) {
  el.caseCount.textContent = String(orderedRows.length);
  el.readNowCount.textContent = String(orderedRows.filter(row => row.tier === "Read now").length);
  el.oldestWait.textContent = orderedRows.length ? formatWait(Math.max(...orderedRows.map(row => row.waitMinutes))) : "0m";
  el.reviewCount.textContent = String(orderedRows.filter(row => row.reviewCue).length);
}

function moveStudy(id, action) {
  const index = displayOrder.indexOf(id);
  if (index < 0) return;
  const nextOrder = displayOrder.slice();
  const [item] = nextOrder.splice(index, 1);

  if (action === "up") nextOrder.splice(Math.max(0, index - 1), 0, item);
  if (action === "down") nextOrder.splice(Math.min(nextOrder.length, index + 1), 0, item);
  if (action === "top") nextOrder.unshift(item);
  if (action === "bottom") nextOrder.push(item);

  displayOrder = nextOrder;
  render();
}

function exportResults() {
  const byId = new Map(scoredRows.map(row => [row.study_id, row]));
  const policyRank = new Map(scoredRows.map((row, index) => [row.study_id, index + 1]));
  const exportColumns = [
    ...REQUIRED_COLUMNS,
    "current_sequence",
    "policy_rank",
    "calculated_priority_score",
    "suggested_tier",
    "wait_minutes",
    "review_cues",
    "prioritization_reasons"
  ];

  const lines = [exportColumns.join(",")];
  displayOrder.forEach((id, index) => {
    const row = byId.get(id);
    const values = [
      ...REQUIRED_COLUMNS.map(column => row[column]),
      index + 1,
      policyRank.get(id),
      row.score,
      row.tier,
      row.waitMinutes,
      row.reviewCue ? "Review indication" : "",
      row.reasons.join("; ")
    ];
    lines.push(values.map(csvEscape).join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "whos-next-prioritized-worklist.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function setStatus(message, type) {
  el.status.textContent = message;
  el.status.className = `status ${type || ""}`.trim();
}

function formatWait(minutes) {
  const safeMinutes = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  if (!hours) return `${remainder}m`;
  if (!remainder) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
