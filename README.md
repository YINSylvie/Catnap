# Catch the Mischievous Cat

A small browser game about finding the right moment to catch a nervous cat in a cozy, pixel-style room.

**Author:** YIN Shiqi 
**Course:** Assignment 3: An interactive experience  

## Idea and intended user

The proposed audience is casual players who want a short, playful mouse or pointer interaction. The goal is to catch the cat by offering food and clicking it while it eats. Moving near the cat or trying to catch it too early can make it hide. This turns the player's action into a visible response and gives them a reason to change their next action.

This audience description is a design interpretation of the current game, not a claim that this audience has been tested. Most on-screen instructions and messages are in Chinese.

## How to play

1. Move the pointer around the room. Moving close to the cat can make it alert; further nearby movement can send it into hiding.
2. If it hides, click the box or curtain interaction area to bring it out, or wait for it to return.
3. Drag the cookie button into the room and release to place food. Alternatively, press and release the cookie button, then click a position in the room.
4. Wait for the eating message and the cat's eating state, then click the cat to catch it.
5. Click **↻ 再玩一次** (Play again) to start another round.

The interface asks players to place food on the floor, although the current code accepts positions anywhere inside the canvas.

## Input, response and feedback

| Input | Program response | Visible feedback |
| --- | --- | --- |
| Move near the cat | Changes from relaxed to alert; repeated qualifying movement can make it hide | State label, cat expression, hiding cue and Chinese message |
| Stop moving after alerting it | Returns to relaxed after about 2.2 seconds without qualifying movement | Updated state label and a calming message |
| Click the cat before it eats | Sends the cat into hiding | Cat moves to a hiding location; message explains that it was scared |
| Click a hiding hotspot while it is hidden | Brings the cat out at that hotspot | Cat reappears and a message describes the box or curtain |
| Place food | Stores the food position; the cat later enters its eating state | Food drawing, food-status label, eating animation details and prompt |
| Click the eating cat | Sets the caught/win state | Success overlay and congratulatory message |
| Press Play again | Resets the principal game state | Cat returns to the centre and the opening message appears |

Food attracts the cat immediately if close enough, or after approximately 3.6 seconds otherwise. It relocates to the food rather than walking along a simulated path. These timings describe the code, not measured play-test results.

## Run locally

Use a modern browser with JavaScript, HTML Canvas 2D and Pointer Events enabled. The inspected game logic requires no paid service, account, API key or game-specific package installation.

From the folder containing `index.html`, run one of these commands if Python 3 is installed:

```powershell
py -m http.server 8000
```

Or, where Python is available as `python`:

```sh
python -m http.server 8000
```

Open <http://localhost:8000> in the browser. Stop the server with Ctrl+C. Python is only a convenient local web server, not a game dependency. These instructions still need to be followed and checked on a fresh terminal before submission.

## Files and dependencies

- `index.html`: the retrieved export contains the page, inline styling, inline game JavaScript, export runtime, bundled libraries and an embedded asset registry.
- `styles.css`: the separately inspected stylesheet provides the warm colours, frame, buttons and responsive layout. The retrieved HTML already includes styling inline.
- `script.js`: [TODO: verify the separate submitted file and its relationship to the inline script. It was not available in the retrieved attachments for this documentation review.]
- `README.md`, `PROCESS.md`, `CREDITS.md`: project explanation, process record and attribution inventory.

The inline game uses native Canvas 2D drawing, DOM events and `requestAnimationFrame`. The HTML also bundles Three.js, p5.js, Tone.js, Matter.js and Phaser; the inspected game logic does not call their APIs. See `CREDITS.md` for the export's library notices and unresolved asset provenance.

## Screenshot

**[TODO: capture the actual running game, save it as `docs/screenshot.png`, and replace this paragraph with `![The game running in a browser](docs/screenshot.png)`. No screenshot has been supplied or generated for this documentation.]**

## Known limitations

- The room interaction depends on a pointer. There is no keyboard equivalent for playing the canvas game, and the canvas label does not describe its changing state to a screen reader.
- Touch usability and browser compatibility have not been verified. The layout contains a small-screen breakpoint, but this alone does not establish mobile usability.
- Proximity and repeated movement trigger fear; the game does not calculate pointer speed despite wording that suggests moving gently.
- Either hiding hotspot reveals the cat at the clicked location, even if it was hiding elsewhere. The curtain drawing and its clickable region do not line up exactly.
- Food can be placed off the floor. There is no `pointercancel` handler for an interrupted food drag.
- Restart resets the main state but does not explicitly clear every internal value, including `armed`, `drag` and `window.snackAt`. A snack-button click may also leave placement armed after a drag. Repeated actions and restart need runtime testing.
- No gameplay audio calls were found. Sound-related messages do not mean actual sound is played.

## Assignment evidence

The main interaction is described above. `PROCESS.md` contains fields for an actual user trial, an evidence-based revision and a truthful account of AI use. `CREDITS.md` separates observed code and bundled notices from unknown origins. Complete the placeholders, add a real screenshot, test the source, and maintain a genuine commit history before submitting the public repository URL.
