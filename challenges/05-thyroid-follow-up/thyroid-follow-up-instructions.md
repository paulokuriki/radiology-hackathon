# Challenge 5 — Thyroid Follow-Up

## The Problem

Incidental thyroid nodules are commonly mentioned in CT and MRI reports obtained for another clinical question. A radiologist may need to extract the finding, consider information not present in the report, and decide whether a follow-up recommendation is appropriate.

## Your Challenge

Build a **web-based reporting assistant** that helps a resident turn an incidental thyroid finding into a transparent draft follow-up recommendation.

Your tool should:

- accept or load a free-text report
- extract the relevant thyroid finding and show the report text supporting that extraction
- let the user confirm or correct the extracted details
- collect key context that is not reliably present in the report
- generate an editable draft recommendation or a review-needed outcome

The tool should support the user's judgment. It should not present a recommendation as an unquestionable clinical decision.

## Minimum Interactive Workflow

1. Paste one report or upload a CSV, then validate the documented input columns when a file is used.
2. Show candidate values extracted from the report beside supporting text when it is available; clearly distinguish form inputs that are not reliably present in the report.
3. Let the user edit every decision input, including the life-expectancy/comorbidity value.
4. Apply the workshop decision tree only after the user confirms the inputs.
5. Show an editable recommendation using the exact applicable text in `recommendations-list.csv`, the non-applicable outcome, or **Needs review**.

### Straight Starting Point

A static HTML, CSS, and JavaScript page is sufficient. Use simple text matching to prefill the form when possible, but make the form itself the reliable path. A deterministic JavaScript function can implement the decision tree after confirmation; an LLM is optional and should only suggest candidate facts, never bypass the confirmation step.

## The Data

`reports.csv` and `practice-reports.csv` contain one complete synthetic report in `report_text`, a `limited_life_expectancy_or_major_competing_comorbidity` form-input value, an `expected_recommendation` reference column, and an `expected_ui_state`. The reports are designed to be pasted into or loaded by the application. The reference columns are for learning and comparison; they should not be provided to the model as input.

The `data` folder also contains `recommendations-list.csv`, which defines the two follow-up recommendation texts and the separate non-incidental applicability outcome. A review-needed state is a user-interface safeguard, not a guideline recommendation.

`practice-reports.csv` is the second annotated report set for comparing output after testing. Hidden-test reports contain only `report_text` and `limited_life_expectancy_or_major_competing_comorbidity`.

The application should let the user confirm or change the limited-life-expectancy/comorbidity value. Patient age may be extracted from clinical history when it is present and should remain editable.

## Extraction and Form Contract

The tool should extract these candidate values from the report and show the supporting text:

- `modality` — CT or MRI for this workshop pathway
- `is_incidental` — yes, no, or uncertain
- `patient_age` — extracted from clinical history when present
- `largest_nodule_size_cm` — the largest reported thyroid-nodule dimension
- `suspicious_features` — yes, no, or uncertain; consider local invasion or suspicious regional lymph nodes

The user must be able to confirm or correct every extracted value and choose:

- `limited_life_expectancy_or_major_competing_comorbidity` — yes, no, or uncertain

If any field required by the decision tree is uncertain, the app should show **Needs review** rather than guess. The user may still correct the form and rerun the transparent decision path.

## Expected Decision Tree

For this workshop, apply the following simplified decision tree only to an **incidental thyroid nodule identified on CT or MRI**. It is adapted from the ACR Incidental Thyroid Findings Committee guidance and is not a substitute for clinical judgment.

```text
Is the thyroid nodule incidental on CT or MRI?
|
|-- No --> Non-incidental thyroid nodule identified;
|          thyroid best practice does not apply.
|
|-- Uncertain --> Needs review.
|
`-- Yes
    |
    |-- Suspicious imaging feature status uncertain?
    |   |
    |   `-- Yes --> Needs review.
    |
    |-- Suspicious imaging feature present?
    |   (local invasion or suspicious regional lymph node)
    |   |
    |   `-- Yes --> Recommend ultrasound follow-up.
    |
    `-- No suspicious feature reported
        |
        |-- Limited life expectancy or major competing comorbidity status uncertain?
        |   |
        |   `-- Yes --> Needs review.
        |
        |-- Limited life expectancy or major competing comorbidity?
        |   |
        |   `-- Yes --> No follow-up imaging recommended.
        |
        `-- No
            |
            |-- Patient age or largest nodule dimension missing?
            |   |
            |   `-- Yes --> Needs review.
            |
            |-- Patient younger than 35 years
            |   |
            |   |-- Largest nodule dimension at least 1.0 cm --> Recommend ultrasound follow-up.
            |   `-- Smaller than 1.0 cm --> No follow-up imaging recommended.
            |
            `-- Patient 35 years or older
                |
                |-- Largest nodule dimension at least 1.5 cm --> Recommend ultrasound follow-up.
                `-- Smaller than 1.5 cm --> No follow-up imaging recommended.
```

If the report or form does not supply a necessary input, the application should show a **needs review** state rather than guessing. This is a product safeguard, not an additional ACR recommendation. If multiple nodules are reported, use the largest dimension for this simplified exercise.

## Final-Demo Input

Your application must let an organizer either upload a hidden-test CSV or paste an individual hidden `report_text`. Validate the required hidden-test columns when a file is uploaded. The hidden file does not include `expected_recommendation` or `expected_ui_state`; those columns must not be required for loading. The user must still be able to review extracted facts and change the comorbidity/life-expectancy value before seeing an editable result.

Reference: [ACR incidental thyroid nodule use case](https://www.acr.org/Data-Science-and-Informatics/AI-in-Your-Practice/AI-Use-Cases/Decreasing-Variability-Follow-Up-Recommendations-Incidental-Thyroid-Nodules) and [ACR Incidental Thyroid Findings Committee white paper](https://www.acr.org/-/media/ACR/NOINDEX/RSCAN/Incidental-Thyroid-Nodule-Follow-up.pdf).

### Optional: LLM API

You can use OpenRouter as an LLM provider. Enter the API key in the application, then call the authenticated `GET https://openrouter.ai/api/v1/models/user` route to find available models. Choose a model `id` from its response; do not assume a model in the global `/models` list is available.

## Success

A resident should be able to see what the tool extracted, understand the evidence in the report, supply missing context, and accept, edit, or defer the drafted recommendation.

Focus on the **smallest useful version** you can build.

## Final Demo

Show us:

1. How the tool extracts a thyroid finding from a report
2. How a user confirms the extraction and supplies missing context
3. The editable recommendation or review-needed result
4. What worked, failed, or surprised you

**No slides. Show the product.**
