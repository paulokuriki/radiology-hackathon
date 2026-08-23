# Challenge 2 — Second Look

## The Problem

Before a report is finalized, a radiologist may need to catch inconsistencies introduced by dictation, editing, or copied-forward text.

These issues can be subtle. A report may use different laterality in the Findings and Impression, describe a changing measurement as stable, or contain a statement that deserves another look. At the same time, many complex reports are internally consistent and should not generate distracting alerts.

## Your Challenge

Build a **web-based report-review tool** that helps a radiologist take a quick second look before signing a report.

Your tool should:

- use the provided free-text reports
- identify statements that may be internally inconsistent or deserve review
- show the evidence behind each potential issue

You decide what is worth checking and how the user should see it. There is no required algorithm, alert threshold, or single correct set of findings.

## Minimum Interactive Workflow

1. Upload a report CSV and validate the `report_id` and `report_text` columns.
2. Let the user open one report at a time and inspect the complete source text.
3. Surface at least two kinds of review cue from this set: laterality difference, measurement difference, trend tension, and finding-versus-Impression tension.
4. For every cue, show the text that prompted it and phrase it as a neutral prompt for verification.
5. Let the user filter to reports with cues and mark a report reviewed for the current session.

### Straight Starting Point

A single client-side web page using HTML, CSS, and JavaScript is sufficient for this challenge. Split the report into `FINDINGS` and `IMPRESSION`, compare simple laterality words and measurements, and look for conflicting trend or conclusion language. An LLM prompt-based review is optional; when used, the user can enter an API key for the current session.

## The Data

Each row represents one synthetic radiology report. The dataset contains:

- `report_id`
- `report_text`

Each report includes structured sections such as `EXAM`, `FINDINGS`, and `IMPRESSION`. The reports are free text and may contain multiple findings, measurements, sides of the body, and comparisons with prior examinations.

Some reports contain statements that merit review. Others are complex but internally consistent. The goal is not to label reports as simply right or wrong; it is to make a fast final review more reliable.

### Provided Data

Use the provided reports to understand the kinds of language and relationships your tool needs to handle and to build the first version of the product.

### Optional: LLM API

You can use OpenRouter as an LLM provider. Enter the API key in the application, then call the authenticated `GET https://openrouter.ai/api/v1/models/user` route to find available models. Choose a model `id` from its response; do not assume a model in the global `/models` list is available.

### Hidden Test

During the final demonstration, your application will receive reports that your team has not seen before. The hidden-test data will follow the same schema and general patterns as the provided data.

## Final-Demo Input

Your application must let an organizer upload a new reports CSV with `report_id` and `report_text` columns. It must not rely on a filename, fixed row count, known report IDs, or a preloaded dataset.

## Success

A radiologist should be able to open a report, quickly understand what deserves a second look, and see the specific text that led the tool to flag it.

Strong solutions make their reasoning visible. They may use rules, keyword matching, section comparison, measurement checks, an AI model, or another approach entirely. The product should support the radiologist's judgment rather than claim to determine whether a report is correct.

Focus on the **smallest useful version** you can build.

## Final Demo

Show us:

1. What you built
2. How a radiologist reviews a report with it
3. How it performs on the **hidden-test reports**
4. What worked, failed, or surprised you

**No slides. Show the product.**
