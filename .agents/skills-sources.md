# Vendored skills: sources & versions

Installed on 2026-11-08 by copying the upstream skill folders verbatim (except where noted).
To update, re-copy from the upstream path or run `npx skills update` if you switch to the skills CLI.

| Skill | Upstream | Commit (date) | License | Changes |
|---|---|---|---|---|
| vue-best-practices (v19.1.0) | github.com/vuejs-ai/skills `skills/vue-best-practices` | 198f0cd (2026-10-23) | MIT | none |
| vue-router-best-practices | github.com/vuejs-ai/skills `skills/vue-router-best-practices` | 198f0cd (2026-10-23) | MIT | none |
| create-adaptable-composable | github.com/vuejs-ai/skills `skills/create-adaptable-composable` | 198f0cd (2026-10-23) | MIT | none |
| accessibility (v2.0) | github.com/addyosmani/web-quality-skills `skills/accessibility` | afa8da9 (2026-08-24) | MIT | none |
| performance (v2.0) | github.com/addyosmani/web-quality-skills `skills/performance` | afa8da9 (2026-08-24) | MIT | none |
| shadcn-vue | github.com/unovue/shadcn-vue `skills/shadcn-vue` (official) | d1bf1b3 (2026-11-03) | MIT | none |
| web-design-guidelines | github.com/vercel-labs/agent-skills `skills/web-design-guidelines` + vercel-labs/web-interface-guidelines `command.md` | 1a2c79d / 434b7f9 (2026-10-05) | MIT | rules vendored to `guidelines.md` instead of fetched at runtime; Vue translation note |

Project-owned (not vendored): `awan-design-system`, `html-to-vue`, `mockup-to-vue-tailwind`.

Evaluated and not installed:
- vercel react-best-practices / composition-patterns: React-only.
- vuejs-ai pinia / testing / options-api / jsx / debug-guides: not used in this project (add testing when tests are introduced).
- addyosmani core-web-vitals, web-quality-audit, seo, best-practices: overlap with `performance`/`accessibility`, need a live site, or SEO doesn't apply to an authenticated B2B dashboard.
- anthropics frontend-design: pushes for distinctive new aesthetics, which conflicts with preserving the Awan brand; still available in claude.ai for greenfield work.
- Community Tailwind v4 skills: none from a vendor source, and the popular ones target React + shadcn; Tailwind v4 rules are covered in `awan-design-system`.
