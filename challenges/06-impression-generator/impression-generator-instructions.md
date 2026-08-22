# Challenge 6 — Impression Generator

## The task

Build a small webpage that drafts an impression from a radiology report.

## Minimum requirements

Your tool must:

- Let the user upload a CSV containing `report_id` and `source_report_text`. It may also contain `suggested_impression`.
- Let the user write and edit the prompt used to generate impressions.
- Generate an impression for each report in the uploaded CSV.
- Let the user review the generated impressions. When `suggested_impression` is present, make it available for comparison.
- Create an output CSV that preserves the uploaded rows and adds a `generated_impression` column.

You decide the interface and workflow. Do not depend on a particular filename, known report IDs, or a fixed row count.

Do not send the `suggested_impression` to the model. It is for your team's review, not for the model to copy.

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

It will not include `suggested_impression`. Upload and process it, then show the generated impressions and output CSV.

Explain one thing that worked, failed, or surprised you.

## If you finish early

Consider improvements such as saved prompt versions, source-evidence highlighting, or a summary across all reports.

## Success

A successful prototype lets a radiologist test a prompt on a report collection, compare drafts with provided examples, improve the prompt, and apply the same workflow to new data.

**No slides. Show the experiment working.**
