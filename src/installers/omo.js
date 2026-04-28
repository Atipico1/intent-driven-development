import path from 'node:path';
import { readAsset, writeFileIfMissing, ensureDir } from '../util/fs.js';

/**
 * omo (oh-my-openagent) installer.
 *
 * omo runs on top of OpenCode. Its `claude-code-plugin-loader` reads
 * `~/.claude/plugins/installed_plugins.json`, so a Claude Code plugin
 * published as intent-kit would auto-flow into omo. For project-local
 * installation we drop the OpenCode-shaped artifacts.
 *
 * OpenCode installer should run first.
 * This adds:
 *  - .opencode/intents/.gitkeep (project-local docs root)
 *  - Note: relies on the OpenCode skill+command files already installed
 */
export async function installOmo(cwd, config, ctx, contract) {
  const files = [];
  ensureDir(path.join(cwd, '.opencode/intents'));
  const gitkeep = path.join(cwd, '.opencode/intents/.gitkeep');
  if (writeFileIfMissing(gitkeep, '', { force: ctx.force }).written) files.push(gitkeep);

  return {
    files,
    notes: [
      'omo loads .claude/skills + Claude Code plugins automatically; no extra omo-specific assets needed',
      'OpenCode-side skill (.opencode/skills/idd-capture/SKILL.md) is the integration point',
    ],
  };
}
