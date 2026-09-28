# Specification Sync

You should not need to remember a manual workflow.

When a game specification is confirmed in conversation, the working agent must propagate it through the full chain:

`decision -> Excel canonical spec -> repository mirror -> data -> implementation -> tests -> sync status`

## Human workflow
The user only gives decisions and reviews results. The user is not expected to edit Markdown, JSON, code, or the Excel workbook manually.

## Why both Excel and repository mirror exist
The Excel workbook is optimized for human review and remains the canonical detailed specification.
GitHub coding tools do not always support writing binary XLSX files directly, so this directory stores a text mirror that every coding agent can read.

A task is incomplete if code changes but the spec mirror does not, or if the spec changes but affected code/tests are left stale.

See:
- `../AGENTS.md`
- `CURRENT_SPEC.md`
- `spec-manifest.json`
