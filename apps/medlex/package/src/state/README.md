`runtime.js` is the single in-memory store. `v3` is its compatibility projection;
`state` and `course` retain existing feature APIs. `actions.js` owns hydration,
legacy migration, validation and queued save requests. `storage.js` owns the v4
IndexedDB adapter, category transactions, localStorage rollback/fallback and real
completion/error state. `offline.js` owns hosted installation support.

Actions notify store listeners after nested edits. Pure selectors accept records
and clocks rather than reading globals. See the root MIGRATION.md for the exact
persisted format and recovery behavior.
