# Phase 5 — Advanced features

Added a resumable interleaved daily engine, due-first review ordering, targeted
missed-word/root practice, confidence capture, exact-feedback spelling diffs,
accepted variants, four-skill decaying estimates and locally computed insights.
Classic and bundled MIT-licensed ts-fsrs scheduling share the prediction/apply
path; switching schedulers does not rewrite existing due dates.

Added IndexedDB v4 with separate profile, terms, sessions, activity, drafts,
portfolio and overlay stores; an in-memory write queue; real completion/error
statuses; visibility/pagehide flushes; v2/v3/v4 imports and v4 exports; and a v3
rollback mirror. Unsupported/blocked IndexedDB falls back to localStorage and
is identified in Settings. Quota failure retains the working record for export.

Added the last ten distinct autosave snapshots per worksheet, restoration,
existing duplicate/delete/undo controls, keyboard area shortcuts, two-step setup,
optional placement, a first-action tip, weekly rest-day recording, storage usage,
HTTPS manifest/service-worker support and browser installation guidance. The
downloaded HTML still works on disk without installation or network access.

Primary implementation files: `src/state/storage.js`, `src/state/offline.js`, `src/features/practice/daily.js`, `src/features/practice/fsrs.js`, `src/features/modern/settings-data.js`, `public/`, `scripts/finalize-build.mjs`.

Development checkpoint: `phase-checkpoints/Phase-5.html` in the review ZIP.
Final integrated QA and size measurements are in `validation.json`; the final
release supersedes these intermediate checkpoints.
