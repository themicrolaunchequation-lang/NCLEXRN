# Lumen: Workspace storage ("Your learning space")

Where: opened from the Local-first pill (privacy dialog > "Manage your learning space"), from Settings ("Workspace storage and space limit"), from "Where is it saved?" on My Day, from the "could not be saved" bar and from the reader when a source's file is not on the device. Modal type `space` (`ctx.setModal({ type: 'space', focus: 'room' })`).

Code (all new, so merges stay easy): `apps/lumen/src/storage.js` (appended after reader.js, between `/*HCA13:BEGIN*/` and `/*HCA13:END*/`) and `apps/lumen/src/storage.css`. `apps/lumen/build-web.mjs` has one labelled block, "Workspace storage", with asserted patches (and a loud failure if the bundle's own names it uses are renamed): the import gate, the privacy dialog card, a Settings link, the "could not be saved" bar, "Your work and where it lives", the reader's "file not on this device" panel, and a bug fix (`Ro()` called `PDFDocumentProxy.destroy()`, which this pdf.js does not have, so "Remove source" threw for any source opened in the session).

What it does
- Meter against a limit the learner chose (250 MB, 1 GB default, 5 GB, custom from 5 MB, none), never the browser's quota. Counted: original files, page images and previews, notes and highlights (incl. saved transcripts), cards and reviews, other. "App files for offline use" (Cache Storage, any on-device AI model) are shown apart and not counted. Sizes come from what Lumen stores (IndexedDB `lumen.documents.v1` records, state JSON slices), because `estimate().usage` lags and is fuzzy.
- Sources, largest first, with per-source actions: Keep notes only (the file record becomes a stub that keeps `transcripts`; notes, highlights and cards stay), Add the file again (same page count required), Move to folder / Bring back, Remove from this device (confirm; "Back up, then remove" runs the app's own backup and only removes if it finished).
- Make room: the biggest originals, offline app files, an on-device AI model if one is cached.
- Where it lives: This browser (default); a folder (File System Access API, Chrome and Edge): handle kept in IndexedDB `lumen.space.v1`, layout `Lumen/originals/<title> (<id8>)/…` and `Lumen/backups/`, permission asked again after a restart (button, needs a click), originals mirrored on add (optional), "Copy all originals now", backups written there. Without `showDirectoryPicker` it says so and offers "Export a backup file". Session only is the app's existing fallback (storage blocked): shown and explained, not selectable.
- Adding sources: `HCASpaceGate` (patched into the import) warns at 80% of the limit, asks before 100% (Make room / Raise my limit / Add anyway / Not now), and before the browser itself runs out. `_e` (file store write) now reports `QuotaExceededError` (and aborted commits, which used to hang) with a plain "no room left" dialog.
- Persistence: button calls `navigator.storage.persist()`; states in everyday words; absent API handled.
- Backup / restore: the app's own `backupWorkspace` / `restoreWorkspace`; `R()` is wrapped so `Lumen-workspace-*.json` goes to the folder when one is connected, and the last backup date is remembered.

Preferences: `localStorage` key `lumen.space.v1` (`mode`, `limit` bytes or null, `mirror`, `lastBackup`). Nothing is uploaded; there is no server component.

Tests: `apps/tools/lumen-check.mjs` section 7 (mocks `navigator.storage`, `showDirectoryPicker` over OPFS, permission prompts, `IDBObjectStore.put` quota errors, blocked storage).
