# MedLex infographic workspace

The Infographics sidebar destination is beside Practice. Its 56 illustrated raster posters are grouped into six collections. Select a collection or search a word, then open a poster.

The popup opens at a comfortable desktop size. Its fixed header has **Popup size − / +** beside Close: choose Compact, Comfortable or Wide. This changes the whole window, and the preference is remembered on this device. On a phone the viewer fills the screen so its controls remain usable. On desktop, each poster opens at half the available popup width, so more of the tall image is visible at once. **Fit 50%** restores that overview after zooming; **Full width** uses the entire image area for detailed reading. Scroll down to read the rest of a tall poster. On narrow phones, the overview uses full width so labels remain readable. Study text opens a companion panel; closing it gives the poster the full workspace width again.

| Control | Behavior |
| --- | --- |
| Hand · V | Drag to pan with a mouse; scroll normally with touch. At the overview or full-width size, a horizontal swipe flips posters. |
| Pen · P | Draw an opaque freehand line. |
| Marker · M | Draw a broader translucent line. |
| Highlighter · H | Draw a wide transparent line over the poster. |
| Ink color / stroke size | Choose a drawing color and Fine, Medium or Bold. Each ink tool remembers its color during the viewer session. |
| Sticky note · N | Click the poster to place a note. Keyboard: focus the image stage, then press Enter. |
| Note color | Choose Yellow, Mint, Blue, Rose or Lilac. Recolors a selected note and sets the next note's color. |
| Note header | Drag to move. Keyboard: focus the handle and use arrow keys; Shift moves farther. |
| Note text / × | Write or edit the note; × deletes it. Text is stored and displayed literally. |
| Undo / Redo | Undo or redo current-poster edits. Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z work outside text fields. |
| Clear | Clear the current poster's marks and notes. Undo can restore them before changing posters. |
| Previous / Next | Flip through all posters. Left/Right and Home/End also navigate outside editing fields. |
| + / − / Fit 50% / Full width | Desktop zoom starts at 50% of available width and reaches 300%. Fit 50% or 0 restores the default overview; Full width sets 100%. On narrow phones the overview and minimum zoom are full width. |
| Popup size − / + | Shrink or enlarge the whole desktop viewer. This is separate from poster zoom and fullscreen. |
| Study text | Open definitions, memory cues, recall, checking references and image replacement/download tools. |
| Export notes | Download an editable JSON backup of all drawings and notes. |
| Fullscreen / Escape | Enter or leave fullscreen; Escape closes the viewer. |

The toolbar stays in one line. Scroll it horizontally on a small screen; the Close button remains in the fixed header. Text fields keep their own keyboard behavior. Annotation geometry is stored as image-relative coordinates, so ink aligns with the poster when zooming or resizing. Notes remain legible and within the image bounds.

## Saving and transferring work

Marks and notes save automatically to this browser for each poster. They are independent of the original poster assets, imported image replacements and learning progress. Export each kind of personal data separately before changing devices or clearing site data. Download image exports the underlying poster; Export notes carries its editable annotations.

To restore notes, close the viewer, expand the Infographics backup panel, choose Restore notes backup and review the validated board count. Restore replaces annotations for the posters in that file. It keeps annotations for other posters. Export current notes first when retaining both sets matters.

Undo/redo history is limited to the current poster and viewer session. Committed work survives page changes and reloads when browser storage succeeds. If storage fails, the unsaved status directs the learner to export notes while that session remains open. Local HTML and the hosted site have different browser storage contexts.

## Maintenance and validation

`src/features/infographics/annotations.js` owns annotation validation, bounded stroke/note data, ordered persistence, undo/redo, canvas rendering and note interaction. `index.js` owns navigation, popup sizing, width fitting, study panel and backups. `src/styles/infographics.css` defines the viewer and single-row controls. `src/styles/reading-space.css` defines the 1 cm desktop gutter; `src/state/preferences.js` applies the larger typography base while preserving text-scale settings.

Drawing storage uses a separate IndexedDB database, with local-storage fallback. Backups reject unknown topics, duplicate records, invalid colors, out-of-range coordinates and excessive text/data. Freehand paths are simplified as they grow, preserving long gestures within bounded storage. Included images are raster WebPs derived from illustrated PNGs.

Run `npm run build:test`, `npm run test:infographics`, `npm test` and `npm run test:welcome`. The annotation checks simulate canvas commands, pointer/keyboard input and persistence, including failure recovery. Structural accessibility checks exclude rendered contrast. Fresh native browser/device layout, real touch/fullscreen and screen-reader behavior still need browser review; these are not established by DOM emulation.
