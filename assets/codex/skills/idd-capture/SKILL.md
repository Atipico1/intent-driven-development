---
name: idd-capture
description: Captures user intent into intent.md before spec/plan/code work. Required first step of Intent-Driven Development.
next-skill: ralplan
handoff: docs/intent/{slug}/intent.md
---

See the canonical skill body at the project root: `.agents/skills/idd-capture/SKILL.md`
or `.claude/skills/idd-capture/SKILL.md` (auto-loaded by Codex). Procedure:

1. Pick slug `YYYY-MM-DD-<kebab-topic>`.
2. Hash: `printf '%s' "$slug" | shasum | cut -c1-5`.
3. Draft five sections (Original request / Background context / What they
   actually want / Why now / Intent evolution).
4. User approves.
5. Save to `docs/intent/<slug>/intent.md` with `status: frozen` and `hash:` set.
6. Then proceed to spec / plan / ralplan.
