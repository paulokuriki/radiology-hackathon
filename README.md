# Radiology Hackathon 🩻

A 90-minute hands-on build session for UTSW radiology residents.

Teams use synthetic datasets and any available coding or AI tools to turn a real radiology problem into a small, working, interactive prototype. No prior programming experience is required.

The goal is not to build production software. It is to learn how quickly clinical expertise can become a testable product idea.

## The challenge menu

Each team receives one challenge and its participant-facing `data/` folder. Open the linked instructions first; they define the task, files, and final-demo input.

| Challenge | Build prompt |
| --- | --- |
| [01 · Who's Next?](https://github.com/paulokuriki/radiology-hackathon/blob/main/challenges/01-whos-next/whos-next-instructions.md) | Help a radiologist prioritize a worklist. |
| [02 · Second Look](https://github.com/paulokuriki/radiology-hackathon/blob/main/challenges/02-second-look/second-look-instructions.md) | Flag meaningful report inconsistencies without creating alert fatigue. |
| [03 · Protocol Path](https://github.com/paulokuriki/radiology-hackathon/blob/main/challenges/03-protocol-path/protocol-path-instructions.md) | Route an MRI brain order to the appropriate named protocol or radiologist review. |
| [04 · Lesion Tracker](https://github.com/paulokuriki/radiology-hackathon/blob/main/challenges/04-lesion-tracker/lesion-tracker-instructions.md) | Track findings across serial CT chest reports. |
| [05 · Thyroid Follow-Up](https://github.com/paulokuriki/radiology-hackathon/blob/main/challenges/05-thyroid-follow-up/thyroid-follow-up-instructions.md) | Turn an incidental thyroid finding into a transparent, editable follow-up recommendation. |
| [06 · Impression Generator](https://github.com/paulokuriki/radiology-hackathon/blob/main/challenges/06-impression-generator/impression-generator-instructions.md) | Draft a concise, source-faithful impression from a long report. |

## How this session works ⚡

1. **Understand (15–25 min):** explore the data and define the user and decision your tool will support.
2. **Plan (25–32 min):** choose the smallest useful feature set. A good framing is: *“We are building a tool that helps ___ do ___ by ___.”*
3. **Build (32–60 min):** make the core workflow interactive. Creating a dynamic webpage is recommended.
4. **Test and demo (60–90 min):** test on provided examples, refine the experience, then run your tool on new organizer-supplied input.

Each team will have 3 minutes to present the problem, the product working on an unseen test set, and one lesson learned.

## Final-demo contract 🧪

Organizers will supply new dataset, using the same schema documented in the challenge instructions. Your tool must load it, process and show the results.

- Challenges 1–4: provide a CSV-upload workflow.
- Challenges 5–6: provide CSV upload, individual-report paste, or both.
- Some provided files include reference columns for learning and self-testing. Hidden inputs omit them; your app cannot require them.

The unseen data tests whether the workflow transfers to another example of the same problem—not whether a team guessed a secret answer.

## What a strong prototype does

- Solves one clear radiology workflow problem.
- Makes the key decision or next step easy to understand.
- Keeps the user in control, especially when information is uncertain.
- Shows source evidence or reasoning when that helps a radiologist judge the result.
- Works on new input, not only the examples used to build it.

Keep the scope small. A simple tool that makes one decision faster or clearer is more valuable than an unfinished enterprise system.

## Repository layout

```text
challenges/
  <challenge>/
    <challenge>-instructions.md
    data/                    # participant-facing synthetic files
hidden-test/                 # organizer-only; Git ignored
```

All material in `challenges/` is synthetic and safe to share with participants. `hidden-test/` is intentionally Git ignored, so organizers must preserve it in a separate private archive or workspace; it will not travel with a normal clone.

---

## Built by UTSW AIR-Hub

This session is hosted by the [AI in Radiology Hub (AIR-Hub)](https://labs.utsouthwestern.edu/air-hub-ai-lab/about-us) at UT Southwestern. AIR-Hub builds, validates, and deploys clinically useful AI for radiology, and its team will serve as the technical mentors for this session.

Mentors are here to help you move through technical roadblocks, sharpen the scope, and test ideas. They will not build the project for you. The clinical problem, product decisions, and final prototype belong to your team.

**UTSW AIR-Hub: Applying advanced AI and informatics to improve efficiency and quality, advance education, and ultimately improve patient care.**
