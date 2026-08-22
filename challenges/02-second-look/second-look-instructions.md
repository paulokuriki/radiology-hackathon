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

## The Data

Each row represents one synthetic radiology report. The dataset contains:

- `report_id`
- `report_text`

Each report includes structured sections such as `EXAM`, `FINDINGS`, and `IMPRESSION`. The reports are free text and may contain multiple findings, measurements, sides of the body, and comparisons with prior examinations.

Some reports contain statements that merit review. Others are complex but internally consistent. The goal is not to label reports as simply right or wrong; it is to make a fast final review more reliable.

### Provided Data

Use the provided reports to understand the kinds of language and relationships your tool needs to handle and to build the first version of the product.

### Hidden Test

During the final demonstration, your application will receive reports that your team has not seen before. The hidden-test data will follow the same schema and general patterns as the provided data.

## Final-Demo Input

Your application must let an organizer upload a new reports CSV with `report_id` and `report_text` columns. 

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
