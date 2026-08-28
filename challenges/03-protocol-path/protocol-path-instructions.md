# Challenge 3 — Protocol Path

## The Problem

An MRI brain order may not clearly identify the best protocol that should be followed. One of the most useful signals is often in the clinical reason: acute focal deficit, tumor surveillance, seizure localization, cognitive decline, or another focused question.

## Your Challenge

Build a **web-based MRI-brain protocol-selection tool** that recommends the appropriate local protocol for a new request.

Your tool should:

- use the provided annotated orders to learn the relationship between the reason for exam and the protocol to follow
- show the selected `protocol_name` as the recommendation
- let a user inspect, edit, or override the recommendation
- explain which clinical phrases or local protocol description supported the choice
- route unusual or unsafe-to-classify requests to `Radiologist Review`

You may use rules, retrieval, an LLM, or a combination. Protocol names are simplified synthetic local workflow names, not universal clinical guidance.

## Minimum Interactive Workflow

1. Load the local protocol catalog and annotated examples before classifying new orders.
2. Upload a CSV and validate the `study_description` and `reason_for_exam` columns.
3. Return one exact `protocol_name` from `protocols.csv` for every order, or return `Radiologist Review` when the request has no clear or safe match.
4. Show the clinical phrases, catalog description, or similar annotated examples that supported the recommendation.
5. Let the user change the recommendation from the local protocol catalog.

### Straight Starting Point

A static HTML, CSS, and JavaScript page is sufficient. Build a small phrase bank for each protocol from `protocols.csv` and the annotated examples, score the phrases against `reason_for_exam`, and select the strongest match. If no score is meaningful or two routes conflict, use `Radiologist Review` rather than guessing. This is a local workshop convention, not universal clinical guidance.

## The Data

Every order has `study_description` equal to `MRI Brain`. The clinical reason distinguishes the protocol.

`data/protocols.csv` contains the protocols catalog:

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

Your application must let an organizer upload a new hidden-test CSV. Do not require a particular filename, row count, preloaded order IDs, or an `expected_protocol` column. Validate the documented input columns and load or preserve the local protocol catalog before classifying the uploaded rows.

## Success

A user should be able to load unfamiliar MRI brain requests, see the local protocol recommended for each, understand why, and override it when needed.

Focus on the **smallest useful version** you can build.

### Optional: LLM API

You can use OpenRouter as an LLM provider. Enter the API key in the application, then call the authenticated `GET https://openrouter.ai/api/v1/models/user` route to find available models. Choose a model `id` from its response; do not assume a model in the global `/models` list is available.

## Final Demo

Show us:

1. The local protocol catalog and examples your tool uses
2. How a user classifies or reviews a new request
3. How the tool performs on hidden-test orders
4. What worked, failed, or surprised you

**No slides. Show the product.**
