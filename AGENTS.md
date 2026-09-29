# RPG Development Contract

This file is the persistent operating contract for every AI/Work session that modifies this repository.

## Source of truth

The human-facing specification workbook is the canonical game specification.
Its current logical name is:

- `RPG制作_仕様正本_同期版.xlsx`

The repository mirror under `spec/` exists so coding agents can reliably consume the current confirmed rules.

Priority when information conflicts:

1. Confirmed rows in the canonical specification workbook
2. `spec/CURRENT_SPEC.md` and `spec/spec-manifest.json`
3. Feature-specific repository documentation
4. Current implementation and tests
5. Old demos, old versioned files, and past chat text

Never restore an old implementation merely because it already exists in code.

## Specification status discipline

Every rule or numeric value must be distinguishable as one of: **確定 / 構造確定 / 初期実装値 / 要レビュー / 廃止旧仕様**. The machine-readable registry is `spec/spec-status.json`.

- A value found in code, tests, generated CSV, or reverse-synced Excel is **not** confirmed merely because it exists or passes tests.
- Reverse-synced skill rows default to **要レビュー** until the user explicitly approves them.
- Balance numbers introduced only to make the game runnable are **初期実装値**.
- Only explicit user decisions may promote an item to **確定**.
- **廃止旧仕様** may remain only where compatibility requires it; it must not leak back into current UI, data names, or gameplay rules.

## Mandatory workflow for a specification change

When the user makes a decision that changes game behavior, data, UI, terminology, or content:

1. Treat the decision as a specification change.
2. Update the canonical workbook first (or, when the binary workbook cannot be written by the current GitHub tool, update the workbook in the conversation/project and update the repository mirror in the same task).
3. Update `spec/CURRENT_SPEC.md` and `spec/spec-manifest.json`.
4. Find every affected data file, implementation file, UI text, and test.
5. Update all affected implementation.
6. Run or update relevant tests.
7. Record implementation status in the workbook/mirror.
8. Report the completed change and any genuinely unresolved item.

Do not stop after only updating documentation when implementation is requested or naturally implied by a confirmed game-spec change.

## Conversation semantics

- Questions such as "今どうなってる？" are read-only. Do not modify specs.
- Suggestions such as "こうした方がいいかな？" are discussion. Do not mark them confirmed.
- Clear decisions such as "それで", "採用", "〜にしよう", "〜を追加して" are specification changes and trigger the mandatory workflow.
- Never silently promote an AI proposal to Confirmed.
- If a numeric balance value is not confirmed, label it Draft / Initial implementation proposal.

## Current non-negotiable confirmed rules

- Mobile portrait orientation.
- Battle party: 6 characters.
- Ally formation: 3x3, six occupied cells and three empty cells.
- Enemy formation: basically 3x3.
- Battle resources: HP + unified SP. MP is obsolete.
- No fixed classes.
- Core stats: PHY / SKL / ARC / MND.
- Mastery Rank is 1-10; 1 Mastery Pt raises Rank by 1; Skill Set Capacity is fixed at 12.
- Unarmed means no hand weapon; gauntlets/knuckles are 格闘. 投擲 uses throwable carry items. Shields are offhand.
- Normal weapon attacks use weapon-configured Scaling, not universal PHY scaling. Enemies use the same four-stat + skill-scaling model.
- Physical damage types: slash / pierce / crush (斬 / 突 / 壊).
- Magic attributes: fire / water / earth / wind / light / dark / neutral.
- Status ailments include: blind, severe poison, sleep, stun, agitation, temptation, instant death.
- Binds: head / arm / leg.
- Spell masteries: Faith / Curse / Magic / Talisman / Machinery / Psychic (信仰 / 呪術 / 魔術 / 符術 / 機巧 / 異能).
- Armor is currently one combined armor slot (防具一式), not separate head/body/hands/feet slots.
- Manual weapon swap costs no turn. Do not auto-swap.
- Row/formation change costs one turn.
- Battle demo work and base/town work must consume the same shared specification.

## UI contract

- Elegant, fashionable, stylish portrait UI.
- Character appeal must not be sacrificed by permanently displaying every piece of information.
- Battle stage: ROUND / terrain / turn order / settings at top, large enemies in the center, acting portrait at lower left, ally 3x3 cards near the bottom, and four commands in one horizontal row beneath the cards.
- AUTO and speed form a vertical pair to the right of the ally cards.
- Skill/item choices use a compact two-column tray. Target and battle descriptions sit between enemies and ally cards.
- Ally cards are a 3x3 grid, not a six-card horizontal strip.
- Current acting ally receives a large character illustration.
- Enemy characters should remain visually large; do not reduce the battle to tiny board tokens.
- Back/cancel controls should be reachable near the lower thumb area where appropriate.
- Skills, equipment, items and Masteries require concise explanations understandable on first use.

## Definition of done

A confirmed spec change is not done until:
- spec mirror updated,
- affected implementation updated,
- relevant tests updated/run,
- obsolete conflicting behavior removed or explicitly marked legacy,
- sync status recorded.

If a tool limitation prevents one step, complete all other steps and explicitly record the blocked step in `spec/spec-manifest.json`.
