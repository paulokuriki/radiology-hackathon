# Radiology Build Sprint Repository Guide

## Purpose

This repository contains materials for a 90-minute radiology resident build sprint. Teams use synthetic datasets to build small interactive prototypes around real workflow problems.

The objective is not to produce a clinical production system or a single correct algorithm. Each challenge should support product thinking, transparent reasoning, and testing on unseen data.

## Repository Structure

```text
challenges/
  <number>-<slug>/
    <slug>-instructions.md
    data/
hidden-test/  # organizer-only and Git ignored
  <number>-<slug>/
```

- Use two-digit numeric prefixes and lowercase hyphenated slugs.
- Keep the named instruction file and released participant-facing data together in one challenge folder.
- Use `data` for participant-facing files. Keep final-demo data in the root-level `hidden-test/<number>-<slug>/` folder.
- Do not use `.gitkeep`; empty directories do not need to be preserved.

## Data Release Rules

- Provided data is available at the start of the session.
- Hidden-test data uses the same schema and general patterns but is withheld from participants until the final demonstration.
- `hidden-test/` is Git ignored. Do not include it in participant-facing exports or share it before the demo. Maintain an organizer archive or private workspace because Git-ignored files do not travel with a normal clone.

## Final-Demo Input Contract

- An organizer supplies a new file using the documented hidden-test schema. Apps must not depend on a filename, fixed row count, IDs, or preloaded cases.
- Challenges 01–04 and 06 require CSV upload. Challenge 05 may use CSV upload, report-text paste, or both.
- Participant-visible reference columns are comparison aids only and must not be required to load hidden input.

## Browser-First Build Path

- Every challenge can be completed as a self-contained client-side webpage using HTML, CSS, and JavaScript. This is the recommended workshop path.
- Teams should not need Python, a virtual environment, package installation, a backend, or a build step to complete the core workflow.
- Use the browser file-upload control to load CSV data locally. Validate required columns and give a clear message when input is invalid.
- External APIs and LLMs are optional enhancements, never a prerequisite for loading, reviewing, or editing a result. If an app uses an API key, the user supplies it for the current session; do not hard-code or persist it.
- A prototype may use another stack, but evaluation should focus on the workflow, source-grounded reasoning, new-input handling, and user control rather than the technology used.

## Dataset Design Principles

- All data is synthetic. Never add real patient information or identifiers.
- Keep datasets small enough to understand quickly and large enough to require a useful interface. Avoid volume for its own sake.
- Use a stable, simple CSV schema within each challenge and keep it compatible with the hidden test where applicable.
- Make reports and workflows realistic, internally coherent, and clinically plausible.
- Include genuine ambiguity and tradeoffs. A prototype should help a user inspect and decide, not merely reproduce a hidden answer.
- Do not include participant-visible labels, scores, or ground truth that gives away the intended result unless the challenge explicitly requires them.
- Hidden tests should use new examples and varied wording, not a new schema or an unrelated problem.
- Validate every new or edited CSV with a CSV parser before considering it complete.

## Existing Challenge Contracts

### 01 — Who's Next?

Purpose: help a radiologist prioritize a completed worklist transparently.

One or more worklist snapshot CSVs may be used as provided data. Required columns, in this order:

```text
study_id,snapshot_time,exam_completed_time,modality,exam_description,patient_location,order_priority,clinical_indication
```

- `snapshot_time` is the same for every row in a file.
- The interval from `exam_completed_time` to `snapshot_time` represents waiting time.
- The data should create meaningful tradeoffs among urgency, location, waiting time, and indication.
- There is no single correct priority order; explanations, adjustable rules, and manual overrides are valuable product features.

### 02 — Second Look

Purpose: help a radiologist take a quick second look at a report before signing it.

One or more report CSVs may be used as provided data. Required columns:

```text
report_id,report_text
```

- Reports should contain realistic sections such as `EXAM`, `FINDINGS`, and `IMPRESSION`.
- Mix straightforward reports with possible laterality, measurement, trend, negation, omission, or copied-text tensions.
- A complex report is not automatically incorrect. The product should surface evidence for review, not declare a binary verdict.

### 03 — Protocol Path

Purpose: let teams turn annotated local examples into context for selecting the MRI-brain protocol to follow.

The `data` folder contains `protocols.csv`, `orders.csv`, and `practice-orders.csv`. Every order uses `MRI Brain` as its study description:

```text
protocols.csv: protocol_name,clinical_description
orders.csv: study_description,reason_for_exam,protocol_name
```

- Every predicted value must be an exact `protocol_name` from `protocols.csv`.
- The catalog has eleven synthetic MRI-brain protocols plus the `Radiologist Review` route.
- `orders.csv` has two annotated examples for every outcome; `practice-orders.csv` has one labeled self-test example for every outcome.
- `practice-orders.csv` includes `study_description`, `reason_for_exam`, and `expected_protocol`. Teams may add a `predicted_protocol` column; the reference column is for comparison, not classification context.
- Hidden-test `orders.csv` remains unlabeled with only `study_description` and `reason_for_exam`.
- The protocol list is available only in the provided data. Teams must retain or recreate the context they build before testing on new orders.
- Protocol names represent simplified local workshop conventions, not universal clinical guidance. `Radiologist Review` is a valid routing outcome rather than an imaging protocol.

### 04 — Lesion Tracker

Purpose: help a radiologist understand longitudinal change across serial CT chest reports.

Use one patient-history CSV per synthetic patient. Required columns:

```text
study_date,report_text
```

- Include multiple chronologically ordered studies per patient.
- Deliberately vary wording for the same finding and distinguish omission from explicit resolution.
- Use multiple simultaneous findings so the prototype must keep lesion histories separate.

### 05 — Thyroid Follow-Up

Purpose: help a resident convert an incidental thyroid finding in a CT or MRI report into a transparent draft follow-up recommendation.

The `data` folder contains `reports.csv` and `recommendations-list.csv`.

`reports.csv` contains:

```text
report_text,limited_life_expectancy_or_major_competing_comorbidity,expected_recommendation,expected_ui_state
```

- `expected_recommendation` is an annotated reference. It should not be used as model input when the team tests its extraction and recommendation flow.
- `expected_ui_state` distinguishes a ready recommendation, a non-applicable pathway, and a needs-review safeguard.
- `recommendations-list.csv` defines the two ACR follow-up recommendation texts and the separate non-incidental applicability outcome. A needs-review state is interface behavior, not an ACR recommendation.
- Additional report files may repeat the annotated schema so teams can compare predictions with the reference after testing.
- Hidden-test reports contain only `report_text` and `limited_life_expectancy_or_major_competing_comorbidity`.
- The application should use a model only to extract candidate report facts, such as an incidental nodule, its largest measurement, and possible suspicious features.
- The user confirms or corrects extracted facts and supplies context that is not reliably available in the report. Provided examples include the limited-life-expectancy/comorbidity value as a form input; the user should still be able to change it.
- The recommendation must remain editable, cite the applicable reference when used, and support an uncertain or review-needed outcome.
- Do not include patient identifiers or participant-visible answer labels in the dataset.

### 06 — Impression Generator

Purpose: help a radiologist create a concise, source-faithful draft impression from a long report that omits its Impression section.

The `data/reports.csv` required columns are:

```text
report_id,source_report_text,suggested_impression
```

- `source_report_text` includes complete synthetic report content through Findings, without an Impression section.
- `suggested_impression` is a participant-visible comparison example and must never be given to the model as input.
- Source reports should be long and internally coherent, with acute, chronic, stable, incidental, and progressive findings that require prioritization.
- The expected output is no more than three numbered items. It must not invent facts, recommendations, or certainty that is absent from the source text.
- The prototype must let the user edit the prompt, apply it to an uploaded CSV, review generated drafts, and export the uploaded rows with a `generated_impression` column added. The review must make `suggested_impression` available when that column is present, without requiring it.
- Hidden-test reports use only `report_id,source_report_text`; the same CSV workflow must work without `suggested_impression`.
- `data/reports.csv` contains ten source reports; `hidden-test/reports.csv` contains three source-only reports.

## Challenge Brief Style

Each `challenges/<number>-<slug>/<slug>-instructions.md` file should cover the task, data contract, minimum requirements, success criteria, and final demo. Write in plain language for mixed technical backgrounds. Specify the user goal and data contract, but leave interface and implementation decisions open. The final product must be an interactive prototype; a notebook, terminal output, prompt transcript, or slide deck alone is insufficient.

## Organizer Evaluation Support

- Keep `hidden-test/organizer-demo-rubric.md` and one challenge-specific organizer key in each hidden-test folder.
- Use these materials for feedback, not a rigid competition score. Preserve participant-facing hidden input without organizer answers.

## Updating Materials

- When renaming a challenge, update its folder, data references, and the main README together.
- When adding data, preserve the challenge's existing schema and naming conventions.
- Keep README descriptions high level. Put implementation-specific conventions and data contracts in this file.
