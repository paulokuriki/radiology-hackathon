# Challenge 6 — Impression Generator

## The Problem

Writing an impression means turning a long, detailed Findings section into a short, clinically useful conclusion. The impression must prioritize urgent findings, preserve important qualifiers and uncertainty, and stay faithful to the source report. A fluent but unsupported statement is not useful.

## Your Challenge

Build a **web-based impression-drafting assistant**. A user should be able to paste or load a source report that has no Impression section and receive an editable draft impression.

Your tool should:

- use the source report as its only clinical evidence
- produce a concise, prioritized impression
- preserve laterality, measurements, comparison language, and uncertainty when they matter
- make urgent or actionable findings easy to recognize
- let the user edit the draft before use
- show the source text supporting each impression item, if your design permits

This is intentionally a prompt-engineering challenge. You may use a carefully designed prompt, structured intermediate extraction, rules, an LLM, or a combination. The goal is a useful review workflow, not a claim that the output is ready to sign without radiologist review.

## The Data

The `data/reports.csv` file contains:

- `report_id`
- `source_report_text`
- `reference_impression`

The file contains ten complete synthetic reports through Findings, but deliberately omits an Impression section. The reports are long and contain a mix of acute, chronic, incidental, stable, and progressive findings. `reference_impression` is a provided reference for comparing drafts; do not send it to the model as input.

The organizer-held hidden test will use the same two input columns except that it will not include a reference impression.

## Final-Demo Input

Your application must let an organizer either upload a hidden-test CSV or paste an individual `source_report_text`. Do not require `reference_impression`, a particular filename, known report IDs, or a fixed number of rows.

## Output Expectations

Ask the system to draft no more than **three numbered impression items**. A strong draft should:

- place time-sensitive findings first
- combine related findings when that improves clarity
- include relevant negative qualifiers, such as no right-heart strain or no hydrocephalus
- avoid promoting every incidental or stable detail into the impression
- never invent a diagnosis, recommendation, measurement, laterality, comparison, or degree of certainty

The reference impression is not the only acceptable wording. The meaningful test is whether a radiologist can see a concise, faithful, editable summary and understand why each item is there.

## Success

A radiologist should be able to load a long report, quickly review the proposed impression, inspect its supporting evidence, and efficiently correct it when needed.

Focus on the **smallest useful version** you can build.

## Final Demo

Show us:

1. The prompt or workflow you designed
2. How a user loads a source report and reviews the draft
3. How the tool performs on a hidden report
4. What worked, failed, or surprised you

**No slides. Show the product.**
