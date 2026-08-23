# Challenge 6 — Impression Generator

## The task

Build a small webpage that drafts an impression from a radiology report.

The draft is a starting point for radiologist review. It must be concise, source-faithful, and never present an unsupported fact, recommendation, or degree of certainty as if it came from the source report.

## Minimum requirements

Your tool must:

- Let the user upload a CSV containing `report_id` and `source_report_text`. It may also contain `suggested_impression`.
- Validate the required columns and work with any filename, report IDs, and row count.
- Let the user write and edit the prompt used to generate impressions.
- Generate an impression for each report in the uploaded CSV.
- Generate no more than three numbered items and do not invent facts, recommendations, or certainty absent from the source report.
- Let the user review each draft alongside its source report. When `suggested_impression` is present, make it available for comparison but never send it to the model.
- Let the user edit the generated draft and export the uploaded rows with a `generated_impression` column added.

You decide the interface and workflow. Do not depend on a particular filename, known report IDs, or a fixed row count.

Do not send the `suggested_impression` to the model. It is for your team's review, not for the model to copy.

## Straight Starting Point

A self-contained HTML, CSS, and JavaScript page is sufficient. Load the CSV through a browser file-upload control, keep the editable prompt and generated drafts in page state, and generate or assemble concise drafts locally. An LLM or external API is optional; if used, the user supplies a session-only key and the app should still make clear when generation fails. Highlighting or listing the source text used for each item is a strong way to support review.

## Data

`data/reports.csv` contains ten synthetic reports with these columns:

- `report_id`
- `source_report_text` — complete report through Findings; there is deliberately no Impression section
- `suggested_impression` — an example for comparison

The suggested impression is not a single required answer. Use it to ask: *Did our prompt prioritize the right information and stay faithful to the source?*

## Final demo

An organizer will provide a new CSV with these columns:

- `report_id`
- `source_report_text`

It will not include `suggested_impression`. Upload and process it, then show the generated impressions and export the output CSV with `generated_impression` added.

Explain one thing that worked, failed, or surprised you.

## If you finish early

Consider improvements such as saved prompt versions, source-evidence highlighting, or a summary across all reports.

## Success

A successful prototype lets a radiologist test a prompt on a report collection, compare drafts with provided examples, improve the prompt, and apply the same workflow to new data.

**No slides. Show the experiment working.**
