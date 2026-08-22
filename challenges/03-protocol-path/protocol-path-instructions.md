# Challenge 3 — Protocol Path

## The Problem

An MRI brain order may not clearly identify the local protocol that should be followed. The useful signal is often in the clinical reason: acute focal deficit, tumor surveillance, seizure localization, cognitive decline, or another focused question.

## Your Challenge

Build a **web-based MRI-brain protocol-selection tool** that recommends the appropriate local protocol for a new request.

Your tool should:

- use the provided annotated orders to learn the relationship between the reason for exam and the protocol to follow
- show the selected `protocol_name` as the recommendation
- let a user inspect, edit, or override the recommendation
- explain which clinical phrases or local protocol description supported the choice
- route unusual or unsafe-to-classify requests to `Radiologist Review`

You may use rules, retrieval, an LLM, or a combination. Protocol names are simplified synthetic local workflow names, not universal clinical guidance.

## The Data

Every order has `study_description` equal to `MRI Brain`. The clinical reason distinguishes the protocol.

`data/protocols.csv` contains the local protocol catalog:

- `protocol_name` — the exact protocol name that the tool should recommend or follow
- `clinical_description` — editable local context describing when that protocol applies

`data/orders.csv` contains annotated examples:

- `study_description`
- `reason_for_exam`
- `protocol_name`

There are two annotated examples for every catalog outcome.

`data/practice-orders.csv` contains one labeled practice case for every outcome:

- `study_description`
- `reason_for_exam`
- `expected_protocol`

Teams may add a `predicted_protocol` column to compare their output with the reference. `expected_protocol` is for comparison only and must not be given to the model as context.

The hidden test contains only:

- `study_description`
- `reason_for_exam`

Its expected output is always one exact `protocol_name` from `protocols.csv`.

## Final-Demo Input

Your application must let an organizer upload a new hidden-test CSV. Do not require a particular filename, row count, preloaded order IDs, or an `expected_protocol` column. Load or preserve the local protocol catalog before classifying the uploaded rows.

## Success

A user should be able to load unfamiliar MRI brain requests, see the local protocol recommended for each, understand why, and override it when needed.

Focus on the **smallest useful version** you can build.

## Final Demo

Show us:

1. The local protocol catalog and examples your tool uses
2. How a user classifies or reviews a new request
3. How the tool performs on hidden-test orders
4. What worked, failed, or surprised you

**No slides. Show the product.**
