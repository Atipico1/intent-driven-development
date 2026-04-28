import path from 'node:path';
import fs from 'node:fs';
import { readAsset, writeFileIfMissing, ensureDir, chmodExec } from '../util/fs.js';
import { upsertRulesBlock } from '../util/markdown.js';
import { mergeJsonFile } from '../util/json.js';

/**
 * Codex (OpenAI) installer.
 *
 * Codex has a richer enforcement surface than other harnesses: native hooks
 * with `UserPromptSubmit` and `Stop` events that can hard-block a session
 * until intent.md exists. We use that.
 *
 * Installs:
 *  - .codex/config.toml (opts into the codex_hooks feature flag)
 *  - .codex/hooks.json  (registers UserPromptSubmit + Stop intent gate)
 *  - .codex/hooks/enforce-intent.sh (the gate script; exit 2 to block)
 *  - .agents/skills/idd-capture/SKILL.md (Codex auto-discovers .agents/skills)
 *  - Appends IDD rules to AGENTS.md (always-loaded by Codex)
 */
export async function installCodex(cwd, config, ctx, contract) {
  const files = [];

  // Skill — placed in the cross-harness .agents/skills/ tree (Codex + OpenCode auto-load it).
  const skillPath = path.join(cwd, '.agents/skills/idd-capture/SKILL.md');
  if (writeFileIfMissing(skillPath, readAsset('skills/idd-capture/SKILL.md'), { force: ctx.force }).written)
    files.push(skillPath);

  // Hook script
  const hookScript = path.join(cwd, '.codex/hooks/enforce-intent.sh');
  if (writeFileIfMissing(hookScript, readAsset('codex/hooks/enforce-intent.sh'), { force: ctx.force }).written) {
    chmodExec(hookScript);
    files.push(hookScript);
  }

  // hooks.json (deep-merged so any user-defined hooks survive)
  if (!ctx.dryRun) {
    mergeJsonFile(path.join(cwd, '.codex/hooks.json'), {
      hooks: {
        UserPromptSubmit: [
          { command: ['./.codex/hooks/enforce-intent.sh'], description: 'IDD: ensure intent.md exists' },
        ],
        Stop: [
          { command: ['./.codex/hooks/enforce-intent.sh'], description: 'IDD: ensure intent.md exists before turn ends' },
        ],
      },
    });
  }
  files.push(path.join(cwd, '.codex/hooks.json'));

  // Feature opt-in via config.toml. We append the [features] section if missing
  // so existing config keys are preserved.
  const cfgPath = path.join(cwd, '.codex/config.toml');
  ensureDir(path.dirname(cfgPath));
  const featuresLine = '[features]\ncodex_hooks = true\n';
  if (!fs.existsSync(cfgPath)) {
    fs.writeFileSync(cfgPath, featuresLine);
    files.push(cfgPath);
  } else {
    const cur = fs.readFileSync(cfgPath, 'utf8');
    if (!/codex_hooks\s*=\s*true/.test(cur)) {
      fs.writeFileSync(cfgPath, cur.replace(/\s*$/, '') + '\n\n' + featuresLine);
    }
    files.push(cfgPath);
  }

  // AGENTS.md memory
  const agentsMd = path.join(cwd, 'AGENTS.md');
  upsertRulesBlock(agentsMd, contract.rulesMarkdown);
  files.push(agentsMd);

  return {
    files,
    notes: [
      'Codex hooks enabled: UserPromptSubmit + Stop intent gate',
      '.codex/config.toml opts into codex_hooks feature',
      'AGENTS.md memory updated',
    ],
  };
}
