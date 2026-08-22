# Radiology Build Sprint

A 90-minute hands-on build session for radiology residents.

The goal is simple: **take a real radiology workflow problem, design a useful solution, build a working prototype, test it on new data, and demonstrate it live.**

This is not a coding class and not a traditional hackathon. Participants do not need prior programming experience.

The emphasis is on **problem solving, product thinking, rapid prototyping, and testing**.

---

## Why We Are Doing This

Radiologists understand many workflow problems better than anyone else.

Modern AI-assisted coding tools make it increasingly possible to turn that domain knowledge into working software without spending months learning traditional software development.

During this session, residents will experience the complete build cycle:

**Understand → Plan → Build → Test → Present**

By the end of the session, each team should have a small but functional application designed around a real radiology problem.

---

## Audience

Approximately **20–25 radiology residents** with mixed technical backgrounds.

Participants may include:

- experienced programmers
- residents who have experimented with AI-assisted or "vibe" coding
- residents who have never written code

No prior coding experience is required.

Teams will be intentionally small so that everyone can participate.

---

## Team Structure

Participants will be divided into approximately **6 teams of 3–4 residents**.

Each team will also have a **technical mentor**.

The mentor is there to help the team move quickly when they encounter technical barriers.

The mentor should **guide and unblock**, not build the application for the team.

Within each group, residents should naturally divide responsibilities. Useful roles may include:

- **Clinical/Product Lead** — defines the problem and keeps the solution clinically useful
- **Builder** — works most directly with the coding environment
- **Data/Test Lead** — explores the dataset and tests the application
- **UX/Demo Lead** — focuses on how the user interacts with the product and prepares the demonstration

These are not rigid roles. Everyone should contribute to the design and evaluation of the product.

---

# The Challenge

Each team will receive a different radiology problem.

Teams will also receive synthetic datasets representing the problem.

The challenge is **not** to reproduce a predefined solution.

Teams must decide:

- Who is the user?
- What part of the problem matters most?
- What is the smallest useful solution?
- What information should the system show?
- How should the user interact with it?
- What can realistically be built during the session?

The final product should be a **working interactive prototype**, ideally accessible through a webpage.

A notebook, terminal output, prompt transcript, or slide deck alone is not considered a finished product.

---

# The Six Problems

## 1. Who's Next?

A radiologist begins a shift with many examinations waiting to be interpreted.

Different factors may influence what should be read first, including clinical indication, patient location, urgency, and waiting time.

**Challenge:** Build something that helps a radiologist understand and prioritize the worklist.

Possible solutions might involve ranking, filtering, scoring, visual prioritization, or another approach entirely.

---

## 2. Second Look

Radiology reports occasionally contain inconsistencies or errors.

Examples may include conflicting laterality, incompatible measurements, contradictory statements, or differences between the Findings and Impression.

**Challenge:** Build something that helps identify potentially important problems before a report is finalized.

The team must decide which problems matter and how to communicate them without overwhelming the radiologist with unnecessary alerts.

---

## 3. Protocol Path

Selecting an imaging protocol may require combining the clinical question with patient-specific information and local imaging rules.

Incomplete requests can lead to unnecessary communication and delays.

**Challenge:** Build something that helps users determine the appropriate imaging protocol and recognize when additional information is required.

The solution may use structured logic, interactive questions, AI, or a combination of approaches.

---

## 4. Lesion Tracker

Radiologists frequently review multiple prior CT chest reports to understand how imaging findings have evolved.

Tracking several findings across multiple examinations can be slow and cognitively demanding.

**Challenge:** Build an interactive lesion-tracking tool that helps a radiologist understand the longitudinal evolution of findings across serial CT chest reports.

The application should be able to process free-text reports, recognize multiple findings across time, and present the history in a useful way.

Teams decide whether the best interface involves tables, timelines, cards, charts, report excerpts, summaries, or another design.

---

## 5. Thyroid Follow-Up

Incidental thyroid nodules are often identified on CT or MRI performed for another reason.

Turning a free-text report finding into an appropriate follow-up recommendation requires extracting the relevant finding, recognizing when key clinical context is missing, and applying guidance transparently.

**Challenge:** Build something that helps a resident extract an incidental thyroid finding from a report, confirm needed clinical context, and draft a follow-up recommendation for radiologist review.

The recommendation should remain editable and the user should be able to decline or defer it when the available information is insufficient.

---

## 6. Impression Generator

Radiologists turn detailed free-text findings into concise, clinically useful impressions. That summary must prioritize acute and actionable findings while remaining completely faithful to the source report.

**Challenge:** Build an editable impression-drafting assistant that turns a long report with no Impression section into a concise, source-grounded draft.

Teams decide how to make their prompt, intermediate reasoning, supporting evidence, and user review workflow useful.

---

# The Data

All data used during the session will be **synthetic**.

No real patient information will be used.

Each challenge will have datasets designed specifically for that problem.

Datasets will be small enough to understand quickly and structured so that participants can spend their time building rather than cleaning data.

Most challenges will use CSV files.

## Repository Layout

```text
challenges/
  <challenge-number>-<challenge-name>/
    <challenge-name>-instructions.md
    data/
      <released CSV files>
hidden-test/                 # organizer-only; Git ignored
  <challenge-number>-<challenge-name>/
    <hidden CSV files>
```

- Each challenge folder contains its named instruction file and all participant-facing data.
- `hidden-test/` is organizer-only and Git ignored. It must not be included in a participant-facing export or shared before the final demonstration. Keep a separate organizer archive or private workspace for it: Git ignores mean these files do not travel with a normal clone.

Current challenge materials include:

| Challenge | Dataset form |
| --- | --- |
| 1. Who's Next? | Two completed-worklist snapshot CSVs. |
| 2. Second Look | One free-text report collection CSV. |
| 3. Protocol Path | MRI-brain protocol catalog, annotated orders, and labeled practice orders. |
| 4. Lesion Tracker | One serial-report CSV per synthetic patient. |
| 5. Thyroid Follow-Up | Report collections, form context, and a recommendation list. |
| 6. Impression Generator | Long source reports with provided reference impressions. |

---

## Provided and Hidden-Test Data

Each challenge uses two stages of data.

### Provided Data

Available at the beginning.

Use it to:

- understand the problem
- inspect the available information
- design the solution
- build the first version of the application

### Hidden Test Data

Kept from participants until the final presentation.

During the demo, the team will run its application on data it has **never seen before**.

The hidden test will not introduce a new problem or unexpected schema.

It is intended to answer a simple question:

> Does the system work on new examples of the same problem?

A failure during testing is not necessarily a bad outcome. Understanding **why** a system fails is part of the exercise.

### Final-Demo Input Contract

During the final demo, an organizer will supply a new input using the documented hidden-test schema. Applications must load that input without depending on a particular filename, study ID, row count, or preloaded example.

- Challenges 1–4 must provide a CSV-upload workflow.
- Challenges 5–6 may provide CSV upload, individual-report paste, or both.
- Reference columns included in some provided files are optional comparison data. They are absent from the corresponding hidden input and must not be required for loading.

---

# Session Format

The entire session lasts **90 minutes**.

The schedule is intentionally compressed.

## 0–10 min — Introduction

Overview of:

- the goals of the session
- available tools
- expectations
- how the final demo will work

A short example may be shown to demonstrate how quickly an idea can become a working application.

---

## 10–15 min — Teams and Challenges

Teams receive:

- their challenge
- data folder
- access to their technical mentor

Open the data immediately.

Do not begin by discussing every possible feature.

---

## 15–25 min — Understand

Before building, answer:

1. **Who is the user?**
2. **What specific problem are we solving?**
3. **What would make this useful?**

Explore the dataset.

The goal is to understand the problem before deciding on the interface.

---

## 25–32 min — Plan

Define the smallest useful version of the product.

Complete this sentence:

> **We are building a tool that helps ______ do ______ by ______.**

Choose only the features required to demonstrate that idea.

Avoid designing a complete production system.

---

## 32–60 min — Build

Create the working prototype.

Use any available coding or AI-assisted development tools.

Focus first on the core workflow.

Polish comes second.

The application should be something another person can actually interact with.

---

## 60–70 min — Validate and Improve

Stop adding speculative features.

Run the provided cases through the application, including examples the team did not use first.

Look for:

- incorrect assumptions
- broken workflows
- confusing interface behavior
- incorrect outputs
- edge cases

Fix the most important problems.

---

## 70–88 min — Live Demos

Each team will have approximately **2–3 minutes**.

No slides.

Show the product.

Each demo should cover:

1. **The problem** — what did you decide to solve?
2. **The product** — show the application working.
3. **The unseen test** — run the final test dataset.
4. **The lesson** — what worked, failed, or surprised you?

---

## 88–90 min — Wrap-Up

Brief discussion of what the teams built and what was learned.

---

# What Makes a Successful Prototype?

A successful project does not need to be technically sophisticated.

A simple application that solves one meaningful problem well is better than a complex application with many unfinished features.

Strong prototypes will generally:

- solve a clearly defined radiology problem
- make good use of the provided data
- allow another person to interact with the system
- communicate information clearly
- behave reasonably on unseen examples
- recognize uncertainty or failure where appropriate

---

# Build for a User

Do not think only about the algorithm.

Think about the person using the system.

Ask:

- What should they see first?
- What decision are they trying to make?
- What information can be hidden until needed?
- What should happen when something is uncertain?
- Can the user understand where the result came from?
- Is the interface faster or clearer than the original workflow?

The interface is part of the solution.

---

# Use AI Where It Helps

You are welcome to use AI for:

- writing code
- debugging
- extracting information
- reasoning over text
- generating structured data
- designing interfaces
- improving the application

But **AI does not need to be the product**.

A ranking system, dashboard, timeline, visualization, workflow tool, or decision tree may be more useful than a chatbot.

A text box connected to an LLM is not automatically a useful application.

---

# Keep the Scope Small

You have very little time.

Do not try to build:

- a production-ready clinical application
- a complete PACS or EHR integration
- a comprehensive enterprise workflow
- every feature you can imagine

Instead ask:

> **What is the smallest thing we can build that proves this idea is useful?**

Build that first.

If it works, improve it.

---

# Final Principle

The objective of this session is not to determine who can write the most code.

It is to experience how a radiologist can move from:

**clinical problem → product idea → working software → testing → iteration**

in a very short period of time.

Build something useful.
