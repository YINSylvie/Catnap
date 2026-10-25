# Credits and sources — CATNAP

**Project author:** YIN Shiqi  
**Edition covered:** the English desktop version included with these documents  
**Updated:** 25 October 2026

This file distinguishes the project's starting material, AI assistance, visual references, and the files actually distributed with the game.

## Code and interaction design

| Contribution | Source and use |
| --- | --- |
| Starting *Catch the Mischievous Cat* prototype and project direction | Supplied by YIN Shiqi. The existing project is associated with [YINSylvie/Catch-the-Mischievous-Cat](https://github.com/YINSylvie/Catch-the-Mischievous-Cat). Its initial implementation is recorded in local commit `1f11e8d`. The revision builds on its room, nervous-cat, food, hiding, and catching concept. |
| Revised HTML, CSS, JavaScript, interaction rules, Canvas artwork, simple navigation, synthesized tones, and English wording | Substantial code and text generation/debugging assistance from **OpenAI Codex** during this project conversation. The author supplied requirements, references, corrections, and user-trial information. See [PROCESS.md](PROCESS.md) for the division of work and the decisions kept or changed. |
| Tests and documentation | Codex assisted with the state-check script, code/browser inspection, screenshot capture, and drafting/revising README, PROCESS, and this credits file. |
| Course examples, tutorials, or other borrowed implementation code | The author reports no use of course examples, tutorials, or another person's code as an intentional source. No specific external code example was supplied or deliberately adapted during this revision. This is not a claim that the AI-assisted code was written entirely by hand. |

The final implementation uses native browser APIs: Canvas 2D, Pointer Events, `requestAnimationFrame`, Web Audio, and `localStorage`. These are platform features, not bundled third-party code. The optional test script uses Node.js built-in modules only.

## Visual references

Six images supplied by the author were viewed as **style references**:

| Supplied file | What informed the revision |
| --- | --- |
| `像素02.jfif` | Warm domestic interior, wood surfaces, cream furniture, dense small details |
| `像素04.jfif` | Isometric room composition and small personal objects |
| `像素05.jfif` | Intimate atmosphere, warm local lighting, muted darker colors |
| `像素06.jfif` | A complete isometric room with plants, furniture, and a cat-themed domestic setting |
| `像素07.jfif` | Pixel-art color and atmospheric depth |
| `像素08.jfif` | Evening atmosphere and contrasting cool/warm lighting |

The original creators, source URLs, and licences of these supplied reference images were not provided. No ownership or reuse licence is claimed for them. The final game does **not** include the reference files, trace them into imported sprites, or load them as textures/background images. They are acknowledged here as visual influences. They should not be added to a public repository without establishing the applicable source and permission.

## Images, icons, fonts, audio, and data

| Material in this edition | Provenance |
| --- | --- |
| Room, furniture, plants, cat, treats, particles, and lighting | Drawn at runtime by AI-assisted Canvas code in `script.js`. No external sprite sheet, texture pack, photograph, or downloaded background is used. No AI image-generation tool was used for these final visuals. |
| Interface icons | Inline SVG paths in `index.html` and text symbols rendered by the browser. The SVG paths were generated as part of the implementation; no external icon set is imported. |
| Fonts | Installed/system fonts requested through CSS, including Trebuchet MS, Arial, monospace, and serif fallbacks. No font files are redistributed or fetched from a font service. |
| Sound effects | Short sine-wave tones synthesized in `chime()` through Web Audio. No recorded audio, music file, sample pack, or third-party sound effect is included. |
| `docs/screenshot.png` | Actual screenshot of the final English interface captured during browser verification with Codex assistance. It is documentation, not an external art asset. |
| Game data and stories | Small in-code constants and AI-assisted fictional object stories. No external dataset or live API is used. Album stamps are generated locally from gameplay. |

## Legacy files and scope

The earlier exported HTML contained runtime/library bundles, including Three.js, p5.js, Tone.js, Matter.js, and Phaser. The rewritten English `index.html` and `script.js` do not contain or load those bundles, so they are not dependencies of this edition. This clean submission folder does not include the old export, its embedded image registry, or the earlier `assets/` folder.

The original working repository may still retain an old prototype image at `assets/f6f96c279bec42e087ee2a1e786163e0.png`, historical versions, and a local backup folder. The image depicts the earlier interface but is unused by the revised game; its creation/source details have not been established in this record. Do not assume that it is a required or cleared asset for this edition. If distributing legacy material, retain the applicable existing notices and establish the provenance of any retained images. This statement does not apply a new licence to historical or third-party material.

## AI disclosure

OpenAI Codex was used for substantial implementation, artwork-in-code, language, debugging, testing assistance, and documentation. There is no runtime AI dependency, paid model call, generated image service, microphone input, or account requirement in the playable experience. No exact model version is asserted. [PROCESS.md](PROCESS.md) records a suggestion kept and a direction changed by the author.

## GitHub Pages publishing workflow

The current public demonstration uses GitHub Pages. The workflow in `.github/workflows/pages.yml` was prepared with Codex assistance using the official [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). It uses GitHub-maintained `actions/checkout`, `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. Their code remains in their respective upstream action repositories. The previous OpenAI Sites publication remains part of the development history. Changing the hosting address does not change the AI-assistance disclosure.
