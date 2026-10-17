# Saved records and v4 migration

The app reads the original `medlex-v1` and `medlex-course-v2` through their existing
migration, then hydrates the compatible v3 record. Those original keys are not
modified. Existing v3 fields, custom/editor overlays, assignments, reflections,
portfolio, notes, voice choices, assisting language and worksheet drafts are
preserved. Doctor appears first; legacy Student is displayed as Trainee.

On startup the app opens IndexedDB `MedLex-v4`, version 4, with separate profile,
terms, sessions, activity, drafts, portfolio and overlays stores. The migration
splits and reassembles the whole compatible record, including unrecognized fields.
A newer database timestamp takes priority over an older localStorage mirror.
Synthetic round-trip and reload tests cover this behavior.

The internal `app.v3` compatibility projection remains schema 3 for retained
features. Persisted IndexedDB records and exported backups identify schema 4.
A `medlex-v3` localStorage rollback mirror is retained for one release; it is not
an additional cloud copy. Keep a downloaded backup before trying an older app.
Rollback versions cannot use new v4-only features and may not honor newer data.

Writes take immutable snapshots into a queue and commit changed store categories
in transactions. Saved status follows transaction completion, rather than merely
an in-memory edit. Worksheet changes flush on visibility/pagehide; pending changes
also trigger a navigation warning where the browser permits it. A tab/process
terminated before a write completes can still lose its newest unsaved changes.

If IndexedDB is unavailable/blocked, the app uses localStorage and identifies the
fallback in Data settings. A quota/storage error preserves the working record in
memory and shows Not saved with export recovery. Export before closing that tab.
Storage usage is an estimate from the browser when supported.

Current JSON exports use backup version 4 and data schemaVersion 4. Valid v2/v3/v4
imports remain accepted. AES-GCM encrypted backups retain the original PBKDF2
format and 250,000 iterations; real old-v3 encrypted fixtures decrypt in v4.
Wrong passwords fail without replacing the working record. Plain backups and
HTML worksheet exports contain readable learning records; keep them appropriately.

Classic review scheduling remains available. FSRS uses bundled ts-fsrs 5.4.2 with
fuzz disabled. Selecting FSRS does not reschedule old cards; conversion happens
when a card is next rated, keeping its prior due date until that action. Button
predictions and committed schedules use the same calculation and clock inputs.

The hosted app registers its service worker only on HTTPS/localhost. On-disk
HTML uses neither a worker nor hosted cache and remains fully usable offline.
Installing to a home screen depends on the browser; manual guidance is provided.
There is no cross-device sync. To transfer records, export on the old origin and
import on the new one. Tests use synthetic data, not the user's browser records.
