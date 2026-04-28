import path from 'node:path';
import { upsertRulesBlock } from '../util/markdown.js';

/**
 * Plain harness — no AI tooling detected. Drop the IDD rules into AGENTS.md
 * (the open-standard convention). Future agents — Claude Code, Codex, etc. —
 * will pick the rules up automatically when they're added later.
 */
export async function installPlain(cwd, config, ctx, contract) {
  const target = path.join(cwd, 'AGENTS.md');
  const r = upsertRulesBlock(target, contract.rulesMarkdown);
  return {
    files: [target],
    notes: [`AGENTS.md ${r.mode}`],
  };
}
