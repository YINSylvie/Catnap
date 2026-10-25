# Credits and provenance

This inventory is based on the retrieved `index.html`, its embedded game script, the separate `styles.css`, and the supplied conversation. It is not proof of original authorship or permission. Complete all applicable placeholders before publication.

## Project code and design

| Item | What can be established | Attribution still needed |
| --- | --- | --- |
| Game logic and Canvas 2D drawings | Inline script labelled `canvases/catch-the-mischievous-cat/app.js` draws the room, cat, food and feedback and implements the game states | [TODO: author; borrowed code or examples; actual source URLs; changes made; permission or licence] |
| HTML layout and CSS | Interface markup and inline styles are in the export; a separate `styles.css` was also inspected | [TODO: author and any template, tutorial, course-example or AI contribution] |
| Separate `script.js` | Not available in the retrieved attachments; no comparison was possible | [TODO: inspect and credit its actual contents] |
| Course examples or tutorials | No specific source has been established | [TODO: list each source and what was adapted, or confirm none were used] |

Do not label all code “original” or “written without AI” unless that is accurate and can be explained by the author.

## Export runtime and bundled libraries

The HTML contains Easel-labelled lifecycle/diagnostic scripts, an asset registry and bundled library code. These are present even though the inspected game logic uses native browser APIs rather than the libraries below. Attribution follows notices inside the supplied file; versions are left unspecified unless explicitly observed. These are source identifiers, not claims that online documentation was consulted for the game.

| Bundled component | Notice observed in the HTML | Source identifier |
| --- | --- | --- |
| Three.js | MIT; copyright 2010–2026 three.js authors | [three.js project](https://github.com/mrdoob/three.js) |
| p5.js 2.3.4 | LGPL-2.1; header identifies an unmodified upstream library and references `p5.source.js` | [p5.js v2.3.4 source, as linked in the header](https://github.com/processing/p5.js/tree/v2.3.4) |
| Tone.js | MIT; copyright 2014–2020 Yotam Mann | [Tone.js project](https://github.com/Tonejs/Tone.js) |
| Matter.js | MIT; Liam Brummitt and contributors | [Matter.js project](https://github.com/liabru/matter-js) |
| Phaser | MIT; copyright 2026 Richard Davey, Phaser Studio Inc. | [Phaser project](https://github.com/phaserjs/phaser) |
| Easel-labelled export/runtime code | Runtime identifiers are visible; full origin and terms have not been established | [TODO: export tool/service, applicable attribution and redistribution terms] |

Keep the bundled copyright and licence notices with redistributed code. This table does not replace those notices or the applicable licences. **[TODO: check the final package's licence and source-distribution requirements, especially for bundled p5.js; this documentation review did not verify compliance.]**

## Images and other media

- **Visible room, cat, food and overlay:** the inspected game draws these with Canvas 2D shapes and text. That describes their implementation, not the origin of their design or code. [TODO: identify any visual references, copied drawings or generated design inputs.]
- **Embedded image assets:** the HTML includes a base64 asset registry. The inspected game script does not reference it, but the images remain part of the distributed export. [TODO: inventory every retained embedded image, its creator/source, licence or permission, and any AI generation details actually known. Do not infer provenance from embedded metadata alone.]
- **Emoji:** paw, cat, cookie and heart symbols are rendered as text using the browser/system's available glyphs. No separate emoji image file was identified in the game logic.
- **Fonts:** CSS requests `ui-rounded`, `Trebuchet MS`, `system-ui` and generic fallbacks; no external font request was identified in the inspected markup. Rendering depends on installed fonts.
- **Audio:** no gameplay audio playback was found in the inspected game script. The export nevertheless bundles audio-related runtime/library code. [TODO: confirm whether the final submitted version adds any audio; credit each actual audio source if so.]
- **Data:** no external dataset was identified in the inspected game logic. [TODO: confirm against the final submitted files.]

## AI assistance

The supplied conversation confirms that ChatGPT was consulted for ideas and visual-style suggestions. Which suggestions were used remains to be confirmed by the author. Codex assisted with source inspection and drafting these three English documentation files.

**[TODO: disclose any additional AI tools used for game code, debugging, visual assets or text, including what each tool contributed. Do not infer an image model, code model, prompt history or authorship from the export alone.]**

See `PROCESS.md` for the required account of a suggestion kept and one changed or rejected, when applicable.

## Complete unresolved credits

For every borrowed item, record:

> Item/file: [TODO]  
> Creator or organisation: [TODO]  
> Exact source URL or course-example reference: [TODO]  
> Licence or permission: [TODO]  
> How it was used and modified: [TODO]

No screenshot, user-trial recording, public repository URL or live-site URL has been invented for these documents. Add only real material and verified links.
