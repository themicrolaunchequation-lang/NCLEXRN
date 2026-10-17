# MedLex migration status — Phase 0

Phase 0 keeps schemaVersion 3. It continues reading medlex-v1 and medlex-course-v2 for migration and leaves those keys untouched. Existing v2/v3 imports and AES-GCM encrypted backups remain supported. No v4 export or migration is introduced in this phase.

Original medical collections are unchanged. Existing draft keys and bodies remain readable. Optional expansion.worksheetMeta records creation/edit timestamps, last step and row count, while existing expansion.drafts stores the writing. Metadata is additive and travels with the existing full backup. No course outcome, completion state or score is inferred from writing.

Phase 1 must preserve these records during the module/Vite refactor. Phase 5 is responsible for the specified IndexedDB/v4 migration and rollback mirror; its migration proof is not claimed now.
