# Process — Catch the Mischievous Cat

## Status of this record

This document separates evidence from the supplied conversation and current source from facts that still need the author's input. Code inspection does not establish development chronology, user-test results or authorship. No browser play-through or user trial was performed as part of this documentation review.

## Starting idea

The earlier concept was a room-like webpage where a mischievous cat could hide among page elements. The current implementation turns that idea into a Canvas 2D room with a box, a curtain, food placement and a catch opportunity while the cat eats.

The intended experience is a short loop of noticing a response, adjusting behaviour and trying again. Offering food creates a more deliberate interaction than only clicking a moving target. These statements describe the concept and the current design; they do not establish when each feature was added.

**[TODO: explain your own motivation and why you chose this audience and visual style.]**

## How the current interaction works

The main states are `relaxed`, `alert`, `hidden`, `eating` and `caught`.

One piece of code that connects action to response is the canvas `pointerdown` handler. When the state is `eating`, it checks whether the pointer is within 64 canvas units of the cat's catch target. If so, it sets `win = true`, changes the state to `caught`, updates the labels and displays a success message. The render function draws the success overlay. The action therefore changes the program's state and gives both textual and visual feedback.

An ordinary mistake is clicking the cat too early. In the relaxed or alert state, a click within the cat's hit area sends it into hiding and displays an explanatory message. The player can recover through a hiding hotspot, waiting or the restart control. This is an implemented recovery path, not a claim of tested usability.

The pointer coordinates are converted from the displayed canvas size to its internal 960 × 560 coordinate system. CSS scales the canvas and changes the surrounding layout below 650 pixels.

## A design or code change I actually made

**[TODO: complete this section with a real change. The final source alone cannot prove an earlier version or a revision.]**

- Earlier behaviour or design: [TODO]
- Problem or reason for changing it: [TODO]
- Change made: [TODO: identify the relevant handler, function or visual element]
- Result and evidence: [TODO: describe what you checked, without inventing measurements]
- Related commit, if available: [TODO: actual commit identifier]

Possible areas for a future revision include matching the curtain hotspot to its drawing, restricting food to the floor, clearing all placement state on restart, and adding a keyboard alternative. These are review findings, not completed changes.

## User trial required by the assignment

**Not yet documented.** Ask at least one other person to try the game before explaining how it works. Record what they actually do; do not include identifying information or publish a recording of them.

| Trial detail | Actual record to complete |
| --- | --- |
| Date, browser and device | [TODO] |
| Task or introduction given before play | [TODO: use a neutral task without teaching the controls] |
| First action attempted | [TODO] |
| Hesitation, mistake or unexpected action | [TODO] |
| Whether they understood the feedback | [TODO: observation or clearly labelled participant comment] |
| What happened when they tried food and restart | [TODO] |
| Improvement made because of the observation | [TODO: actual before/after change] |
| If the design was kept, the evidence-based reason | [TODO: complete only if applicable] |
| Follow-up check after the decision | [TODO] |

Do not describe this trial as completed until it has happened. A planned test or source review does not replace the required trial.

## Verification record

Completed for these documents: static inspection of the retrieved `index.html`, its embedded game JavaScript and the separate `styles.css`. The separate `script.js` attachment was not available, so its contents and consistency with the export remain unverified.

The checks below are planned, not passed:

- [ ] Follow the README instructions from a fresh terminal and record browser/device: [TODO].
- [ ] Place food, wait for eating, catch the cat and observe the success overlay.
- [ ] Click the cat too early and verify recovery from hiding.
- [ ] Try both hiding hotspots and compare their hit areas with the drawing.
- [ ] Try dragging food outside the room and placing it with a subsequent click.
- [ ] Try repeated clicks, a cancelled drag, and restart during and after food placement.
- [ ] Check narrow-screen layout and record any touch-control limitations.
- [ ] Reconcile the separate `script.js` with the inline implementation.

Record actual outcomes, failures and fixes here: **[TODO]**.

## AI tools and decisions

Confirmed from the supplied conversation: ChatGPT was consulted for interaction ideas and visual-style suggestions. The visible record does not contain the full assistant responses, so it cannot establish which suggestions were adopted.

Codex was used for this documentation task to inspect the available source and draft English README, process and credits documents. This documentation task did not modify the game.

**[TODO: confirm the tools actually used to build the game, including any AI assistance with code, images, debugging or writing. The export's runtime markers do not establish who wrote the game or which model generated it.]**

- AI suggestion I kept: [TODO: actual suggestion, where it was used and why].
- AI suggestion I changed or rejected: [TODO: actual suggestion, your decision and why; state “not applicable” only if accurate].
- My own implementation and review work: [TODO].
- Verification of AI output: [TODO: actual checks and corrections].

## Development history and submission

**[TODO: describe actual milestones and link them to genuine commits if available. Do not invent dates, commits or earlier versions.]**

Before submission, finish the real user trial and revision record, resolve credits, add a real screenshot, include working source and necessary assets, and check that the public repository opens while signed out. The supplied brief gives the deadline as **1 November 2026, 23:59 Hong Kong time**. Submit your actual repository URL through Canvas.
