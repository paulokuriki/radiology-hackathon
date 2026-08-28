# Challenge 1 — Who's Next?

## The Problem

At the start of a shift, a radiologist may have many exams waiting to be read.

Some are clearly urgent. Others are not, but have been waiting a long time or come from patients whose location and clinical indication deserve attention. A simple first-in, first-out list does not capture these tradeoffs, and a priority label alone is often not enough.

## Your Challenge

Build a **web-based worklist-prioritization tool** that helps a radiologist decide which studies to read now, which to read next, and which can wait.

Your tool should:

- use the provided worklist snapshot
- help the user identify studies that deserve prompt attention
- account for more than one factor, such as urgency, location, waiting time, and clinical indication
- explain why a study is being prioritized
- provide an interactive way to explore, adjust, or override the result

You decide which signals matter and how they should be combined. There is no required layout, algorithm, or single correct ranking.

## Minimum Interactive Workflow

1. Upload a worklist CSV and validate the eight documented columns.
2. Show a suggested reading sequence using at least order priority, patient location, waiting time, and clinical indication.
3. Show the factors that raised each study, including a review cue when the indication is missing or unclear.
4. Let the user change the visible policy and manually move a study in the sequence.

### Straight Starting Point

A static HTML, CSS, and JavaScript page is sufficient. A useful first version assigns visible points to order priority and location, converts waiting time to a score, checks a short list of urgency phrases in the indication, and combines those signals into a suggested tier. The scores are decision support, not a clinical mandate.

## The Data

Each dataset is a snapshot of completed synthetic examinations waiting to be read. Each row contains:

- `study_id`
- `snapshot_time`
- `exam_completed_time`
- `modality`
- `exam_description`
- `patient_location`
- `order_priority`
- `clinical_indication`

All rows in a file share the same `snapshot_time`. The difference between `snapshot_time` and `exam_completed_time` represents how long the study has been waiting to be interpreted.

The clinical indication is brief free text. It may contain useful urgency signals, be incomplete, or require the user to apply judgment.

### Provided Data

Use the two provided snapshots to understand the tradeoffs, decide on a prioritization policy, and build your first version. Deliberately test your tool on the second snapshot after the core interaction works.

### Hidden Test

During the final demonstration, your application will receive a new worklist snapshot that your team has not seen before. The hidden test will follow the same schema and general patterns as the provided data.

## Final-Demo Input

Your application must let an organizer upload a new worklist CSV with the documented columns. It must not rely on a filename, fixed row count, known study IDs, or a preloaded dataset.

## Success

A radiologist should be able to open the worklist, quickly understand what needs attention, and see a clear rationale for the suggested order.

A strong solution treats its prioritization as transparent decision support, not an unquestionable answer. Useful approaches may use filters, groups, visible weighting rules, keyword-based flags, manual overrides, or another design entirely.

Focus on the **smallest useful version** you can build.

### Optional: LLM API

You can use OpenRouter as an LLM provider. Enter the API key in the application, then call the authenticated `GET https://openrouter.ai/api/v1/models/user` route to find available models. Choose a model `id` from its response; do not assume a model in the global `/models` list is available.

## Final Demo

Show us:

1. What you built
2. How a radiologist uses it to decide what to read next
3. How it performs on the **hidden test worklist**
4. What worked, failed, or surprised you

**No slides. Show the product.**
