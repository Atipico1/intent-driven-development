import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * Detect which AI coding harnesses are configured in the current project.
 * Returns a list of harness IDs (highest-confidence first).
 *
 * Detection signals are intentionally non-exclusive — a project can use
 * multiple harnesses (e.g. Claude Code + superpowers, or Codex + Cursor).
 */
export function detectHarnesses(cwd = process.cwd()) {
  const detected = new Set();
  const exists = (p) => fs.existsSync(path.join(cwd, p));

  // Claude Code: settings file or memory file
  if (exists('.claude') || exists('CLAUDE.md')) {
    detected.add('claude-code');
  }

  // Superpowers (Claude Code plugin) — only meaningful if Claude Code is present.
  // Canonical signal is ~/.claude/plugins/installed_plugins.json; project-side
  // signals are weaker fallbacks.
  if (detected.has('claude-code')) {
    const projectSignal =
      exists('.claude/overrides/superpowers') ||
      exists('.claude/intent-kit/overrides/_common.md') ||
      readJsonSafe(path.join(cwd, '.claude/settings.json'))?.enabledPlugins?.['superpowers@claude-plugins-official'];
    const globalPlugins = readJsonSafe(path.join(os.homedir(), '.claude/plugins/installed_plugins.json'));
    const globalSignal = globalPlugins && Object.keys(globalPlugins).some((k) => k.startsWith('superpowers@'));
    if (projectSignal || globalSignal) detected.add('superpowers');
  }

  // Codex (OpenAI) — strongest: project-local .codex/. Weaker: AGENTS.md alone (also Cursor/Aider).
  if (exists('.codex')) {
    detected.add('codex');
  }
  // OpenCode — sst/opencode
  if (exists('.opencode') || exists('opencode.json')) {
    detected.add('opencode');
  }
  // omx — oh-my-codex
  if (exists('.omx')) detected.add('omx');
  // omc — oh-my-claudecode
  if (exists('.omc') || exists('.ohmycc') || readJsonSafe(path.join(cwd, '.claude/settings.json'))?.enabledPlugins?.['omc'])
    detected.add('omc');
  // omo — oh-my-openagent (built atop OpenCode, sometimes uses .omo)
  if (exists('.omo') || exists('.opencode/omo')) detected.add('omo');

  // AGENTS.md fallback (Codex / generic open-standard) only if no harness detected yet
  // — record as "agents-md-only" so installers can still wire up a snippet.
  if (detected.size === 0 && exists('AGENTS.md')) {
    detected.add('agents-md');
  }

  return [...detected];
}

export const HARNESS_LABELS = {
  'claude-code': 'Claude Code',
  superpowers: 'superpowers (Claude Code plugin)',
  codex: 'Codex CLI (OpenAI)',
  opencode: 'OpenCode (sst)',
  omx: 'oh-my-codex',
  omc: 'oh-my-claudecode',
  omo: 'oh-my-openagent',
  'agents-md': 'AGENTS.md (generic)',
  plain: 'plain git (no harness)',
};

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}
