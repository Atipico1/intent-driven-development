# intent-kit

> Git-native Intent-Driven Development for AI coding agents.
> Captures **intent → spec → plan** as git artifacts, enforced by git hooks,
> integrated with the harnesses you already use.

`git log` for AI-written code goes blank fast. Commit messages have *what*
("feat: add X") and lose the *why* ("user actually wanted Y, we considered
Z and rejected it"). Transcripts evaporate, Slack threads scatter, and a
week later nobody — including the agent — remembers why the code exists.

`intent-kit` makes the *why* a first-class git artifact:

- A small docs tree (`docs/intent/<slug>/{intent,spec,plan}.md`).
- A 5-char commit-prefix mechanism that the prepare-commit-msg hook
  rewrites into `Intent: …` / `Spec: …` / `Plan: …` trailers.
- A pre-commit hook that blocks out-of-order work (`spec.md` without
  `intent.md`, `plan.md` without `intent.md` + `spec.md`).
- One-command setup that detects your AI coding harness and wires up
  the right native extension point — slash commands, skills, hooks —
  so the agent actually follows the workflow.

```sh
npx intent-kit init
```

The prepare-commit-msg hook leaves *unprefixed* commits alone. So hot-fixes,
unrelated work, and bare git users coexist with the workflow without ceremony.

## What you get

```
your-repo/
├── .githooks/
│   ├── prepare-commit-msg        # [<5-char-hash>] subject → Intent/Spec/Plan trailers
│   ├── pre-commit                # plan→spec→intent dependency gate
│   └── .intent-kit-env           # configurable paths/names
├── docs/intent/
│   └── _templates/{intent,spec,plan}.md
└── (harness-specific scaffold below)
```

`git log --grep "Intent: docs/intent/<slug>/"` reconstructs origin → spec →
implementation for any feature.

## Supported harnesses (auto-detected)

| Harness | Detected via | What gets installed |
|---|---|---|
| **Claude Code** | `.claude/`, `CLAUDE.md` | skills `idd-capture`, slash commands `/intent` `/spec` `/plan`, PreToolUse:Skill hook, CLAUDE.md memory |
| **Codex (OpenAI)** | `.codex/`, `AGENTS.md` | `.codex/hooks.json` (UserPromptSubmit + Stop intent gate), enforce-intent script, `.codex/config.toml` opt-in, AGENTS.md memory |
| **OpenCode (sst)** | `.opencode/`, `opencode.json` | `.opencode/skills/idd-capture`, `/intent` `/spec` `/plan` slash commands, `instructions` glob → AGENTS.md, AGENTS.md memory |
| **superpowers** (obra/superpowers Claude Code plugin) | `~/.claude/plugins/installed_plugins.json` entry, `.claude/overrides/superpowers/` | overrides for `superpowers:brainstorming`, `:writing-plans`, `:executing-plans`, `:subagent-driven-development` injected via PreToolUse:Skill hook |
| **omc** (oh-my-claudecode) | `.omc/`, omc plugin entry | `.omc/skills/idd-capture` with `triggers`/`pipeline`/`handoff` chaining into `deep-interview` |
| **omx** (oh-my-codex) | `.omx/setup-scope.json`, omx plugin | `.codex/skills/idd-capture` with `next-skill: ralplan` chaining, `.omx/intents/` |
| **omo** (oh-my-openagent) | `.opencode/`, oh-my-opencode dep | reuses OpenCode skill; omo's claude-code-plugin-loader picks up the install transparently |
| **plain** (no harness) | fallback | AGENTS.md memory only |

You can pass `--target <harness…>` to force specific installers, or `--target all`.

## Usage

### Interactive (default)

```sh
npx intent-kit init
```

Walks you through detection → harness selection → docs path confirmation.

### Headless / agent-driven

```sh
npx intent-kit init --yes
npx intent-kit init --yes --target claude-code superpowers
npx intent-kit init --yes --target all --docs-dir docs/intents
```

`--yes` (and CI environments, and non-TTY stdin) accept all defaults and
skip prompts. Useful for `npm install` postinstall, agent-run setup, and CI.

### Verify

```sh
npx intent-kit doctor
```

Confirms hooks are installed, `git core.hooksPath` is set, templates exist,
and reports which harnesses are active.

### Sync after `npm install`

`intent-kit` exports a `sync` command that re-applies `git core.hooksPath`.
Add it to your project's `package.json`:

```json
{
  "scripts": {
    "prepare": "intent-kit sync"
  }
}
```

So teammates running `npm install` automatically pick up the hooks.

## How the commit-prefix → trailer mechanism works

1. You generate a 5-char hash for your slug:
   ```sh
   slug="2026-04-28-my-feature"
   hash=$(printf '%s' "$slug" | shasum | cut -c1-5)
   ```
2. Write `hash:` into `docs/intent/<slug>/intent.md` frontmatter.
3. Commit subject lines start with the prefix:
   `[<hash>] feat(my-feature): wire up the new module`
4. The `prepare-commit-msg` hook:
   - Looks up the slug by hash.
   - Strips the prefix (so it never lands in git history).
   - Appends trailers — each independently, only if the file exists:
     - `Intent: docs/intent/<slug>/intent.md` (added once intent.md exists)
     - `Spec: docs/intent/<slug>/spec.md` (added if spec.md exists)
     - `Plan: docs/intent/<slug>/plan.md` (added if plan.md exists)

The first commit on a slug — when only intent.md exists — still gets the
Intent trailer. Spec and Plan trailers join later as those artifacts land.

## Configuration

The `.githooks/.intent-kit-env` file holds the runtime knobs:

```sh
INTENT_KIT_DOCS_DIR=docs/intent
INTENT_KIT_HASH_LENGTH=5
INTENT_KIT_TRAILER_PREFIX=Intent
```

Edit values to change behaviour without re-running the installer.

## Concept inheritance

`intent-kit` codifies a concept space pioneered by:

- [matthewsinclair/intent](https://github.com/matthewsinclair/intent) — Intent
  Steel Thread methodology (separate WHY/WHAT/HOW documents).
- [Exadra37/ai-intent-driven-development](https://github.com/Exadra37/ai-intent-driven-development)
  — markdown rules for AI agents around a single Intent doc.
- [obra/superpowers](https://github.com/obra/superpowers) — `brainstorming` /
  `writing-plans` / `executing-plans` skills as a Claude Code plugin.

This project's contribution is the **enforcement layer**: hash-prefix → trailer
injection, intent-spec-plan dependency gate via pre-commit, and one-command
multi-harness wiring.

## License

MIT — see [LICENSE](./LICENSE).
