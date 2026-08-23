# Challenge 4 — Lesion Tracker

## The Problem

Radiologists often review multiple prior CT chest reports to understand how findings have changed over time.

This can be slow, repetitive, and difficult when several lesions are described across multiple studies.

## Your Challenge

Build a **web-based lesion tracking tool** that helps a radiologist understand the longitudinal evolution of findings across serial CT chest reports.

Your tool should:

- use the provided patient-history dataset
- identify and track multiple findings across time
- help the user understand how those findings have changed
- provide an interactive way to explore the result

You decide what information is most useful and how it should be presented.

There is no required layout or implementation.

## Minimum Interactive Workflow

1. Upload one patient-history CSV and validate the `study_date` and `report_text` columns.
2. Keep separately described findings separate; do not collapse distinct nodules, nodes, or incidental findings into one history.
3. Let the user select a finding and see dated report evidence for its course over time.
4. For each relevant study, show a transparent status such as `new`, `increased`, `stable`, `decreased`, `resolved`, or `not mentioned`.
5. Treat `not mentioned` as unknown, not as proof that a finding resolved, and let the user inspect the source report before accepting the interpretation.

### Straight Starting Point

A static HTML, CSS, and JavaScript page is sufficient. Start with a small set of recognizable finding types in the supplied CT chest histories, such as pulmonary nodules, lymph nodes, and incidental upper-abdominal findings. Use location words, measurements, and trend terms to build separate timeline cards with source excerpts. A general-purpose extraction model is optional, not required.

## The Data

Each file represents the CT chest history of **one synthetic patient**.

Each row contains:

- `study_date`
- `report_text`

The reports are free text. The same finding may be described differently across studies, and a finding may occasionally not be mentioned in one report and appear again later. Use evidence from the whole report, not only the Impression: a report may contain an important detail in Findings that is not fully repeated in its Impression.

### Provided Data

Use all four provided patient histories to understand the problem and build your prototype. Start with one history, then test your assumptions on the other patients with different wording and lesion patterns.

### Hidden Test

During the final presentation, your application will receive a new patient history that your team has not seen before.

The test data will follow the same structure and general patterns as the provided data.

## Final-Demo Input

Your application must let an organizer upload a new patient-history CSV with `study_date` and `report_text` columns. Validate the input columns. Do not rely on a patient filename, known study dates, a fixed number of studies, or a preloaded patient history.

## Success

A radiologist should be able to load a patient history into your application and understand the evolution of the important findings more easily than by reading all of the reports manually.

Focus on the **smallest useful version** you can build.

## Final Demo

Show us:

1. What you built
2. How a radiologist interacts with it
3. How it performs on the unseen test patient
4. What worked, failed, or surprised you

**No slides. Show the product.**
