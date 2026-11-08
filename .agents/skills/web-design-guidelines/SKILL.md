---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance (accessibility, focus, forms, animation, typography, layout, dark mode, i18n). Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or before finishing any UI change.
license: MIT
metadata:
  author: vercel
  version: "1.0.0-local"
  upstream: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Vercel's Web Interface Guidelines.

> Local change from upstream: the upstream skill fetches its rules from GitHub on every run.
> This copy reads the vendored rules in `guidelines.md` (vercel-labs/web-interface-guidelines @ 434b7f9, 2026-10-05, MIT)
> so reviews work offline and the instructions cannot change without a reviewed commit.
> To update, replace `guidelines.md` with the latest `command.md` from that repo.

## How It Works

1. Read `guidelines.md` in this folder.
2. Read the specified files (or ask the user for files/pattern).
3. Check against all rules in the guidelines. Translate React-specific wording to Vue
   (`onClick` → `@click`, `onKeyDown` → `@keydown`, `<Link>` → `<RouterLink>`, `className` → `class`).
4. Output findings in the terse `file:line` format the guidelines specify.

## Project precedence

Where a guideline conflicts with `.agents/rules/frontend-standards.md` or the
`awan-design-system` skill (tokens, numerals, RTL), the project rules win.
