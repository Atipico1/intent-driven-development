// Smoke test for intent-kit. Spins up a temp git repo, runs `init` in
// headless mode for several harnesses, and asserts the expected files
// landed. Pure stdlib, no test framework.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CLI = path.join(REPO_ROOT, 'bin/intent-kit.js');

let failures = 0;
const todo = [
  ['plain (no harness)', { signals: [], target: 'plain', expect: ['AGENTS.md', '.githooks/prepare-commit-msg', '.githooks/pre-commit', 'docs/intent/_templates/intent.md'] }],
  ['Claude Code', { signals: ['CLAUDE.md', '.claude/settings.json:{}'], target: 'claude-code', expect: ['.claude/skills/idd-capture/SKILL.md', '.claude/commands/intent.md', '.claude/hooks/intent-kit-skill-override.sh', '.claude/settings.json', 'CLAUDE.md', '.githooks/prepare-commit-msg'] }],
  ['Codex', { signals: ['.codex/'], target: 'codex', expect: ['.codex/hooks.json', '.codex/hooks/enforce-intent.sh', '.codex/config.toml', '.agents/skills/idd-capture/SKILL.md', 'AGENTS.md'] }],
  ['OpenCode', { signals: ['.opencode/'], target: 'opencode', expect: ['.opencode/skills/idd-capture/SKILL.md', '.opencode/commands/intent.md', 'opencode.json', 'AGENTS.md'] }],
  ['superpowers (with Claude Code)', { signals: ['.claude/'], target: ['claude-code', 'superpowers'], expect: ['.claude/intent-kit/overrides/_common.md', '.claude/intent-kit/overrides/brainstorming.md', '.claude/intent-kit/overrides/writing-plans.md', '.claude/hooks/intent-kit-skill-override.sh'] }],
  ['omx (with Codex)', { signals: ['.codex/', '.omx/'], target: ['codex', 'omx'], expect: ['.omx/intents/.gitkeep', '.codex/skills/idd-capture/SKILL.md'] }],
  ['omc (with Claude Code)', { signals: ['.claude/', '.omc/'], target: ['claude-code', 'omc'], expect: ['.omc/skills/idd-capture/SKILL.md', '.omc/intents/.gitkeep'] }],
  ['omo (with OpenCode)', { signals: ['.opencode/', '.opencode/omo'], target: ['opencode', 'omo'], expect: ['.opencode/intents/.gitkeep', '.opencode/skills/idd-capture/SKILL.md'] }],
];

for (const [name, spec] of todo) {
  process.stdout.write(`\n=== ${name} ===\n`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'intent-kit-smoke-'));
  try {
    execSync('git init -q', { cwd: dir });
    execSync('git -c user.email=t@t -c user.name=t commit --allow-empty -m init -q', { cwd: dir });
    for (const sig of spec.signals) {
      if (sig.endsWith('/')) fs.mkdirSync(path.join(dir, sig), { recursive: true });
      else if (sig.includes(':')) {
        const [p, content] = sig.split(':');
        fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
        fs.writeFileSync(path.join(dir, p), content);
      } else fs.writeFileSync(path.join(dir, sig), '');
    }

    const targetArgs = Array.isArray(spec.target) ? ['--target', ...spec.target] : ['--target', spec.target];
    const r = spawnSync(process.execPath, [CLI, 'init', '--yes', ...targetArgs], { cwd: dir, encoding: 'utf8' });
    if (r.status !== 0) {
      console.error(`  ✗ exit ${r.status}\n  stdout: ${r.stdout}\n  stderr: ${r.stderr}`);
      failures++;
      continue;
    }
    for (const f of spec.expect) {
      if (fs.existsSync(path.join(dir, f))) console.log(`  ✓ ${f}`);
      else {
        console.error(`  ✗ missing: ${f}`);
        failures++;
      }
    }

    // Verify git config
    const hooksPath = execSync('git config core.hooksPath', { cwd: dir, encoding: 'utf8' }).trim();
    if (hooksPath === '.githooks') console.log('  ✓ git core.hooksPath = .githooks');
    else {
      console.error(`  ✗ git core.hooksPath = ${hooksPath}`);
      failures++;
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

if (failures > 0) {
  console.error(`\n${failures} smoke check(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll smoke checks passed.');
}
