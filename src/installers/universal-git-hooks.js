import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { readAsset, writeFileIfMissing, chmodExec, ensureDir } from '../util/fs.js';

/**
 * Universal git layer — works with any harness or none.
 *
 * Installs:
 *   .githooks/prepare-commit-msg  (5-char hex prefix → Intent/Spec/Plan trailer injection)
 *   .githooks/pre-commit          (intent→spec→plan dependency gate)
 * Sets:
 *   git config core.hooksPath .githooks
 * Configures hooks via env-var bridge so paths/names are not hardcoded:
 *   .githooks/.intent-kit-env
 */
export async function installUniversalGitHooks(cwd, config, ctx) {
  const hooksDir = path.join(cwd, '.githooks');
  ensureDir(hooksDir);

  const prepare = readAsset('git-hooks/prepare-commit-msg');
  const preCommit = readAsset('git-hooks/pre-commit');

  const prepPath = path.join(hooksDir, 'prepare-commit-msg');
  const preCommitPath = path.join(hooksDir, 'pre-commit');

  const r1 = writeFileIfMissing(prepPath, prepare, { force: ctx.force });
  if (r1.written) chmodExec(prepPath);
  const r2 = writeFileIfMissing(preCommitPath, preCommit, { force: ctx.force });
  if (r2.written) chmodExec(preCommitPath);

  // Drop a tiny env file the hooks `source` to read configurable paths/names,
  // so users can change defaults without re-running the installer.
  const envFile = path.join(hooksDir, '.intent-kit-env');
  const envContent = `# intent-kit hook config — edit values, don't rename keys.
INTENT_KIT_DOCS_DIR=${config.docsDir}
INTENT_KIT_HASH_LENGTH=${config.hashLength}
INTENT_KIT_TRAILER_PREFIX=${config.trailerPrefix}
`;
  writeFileIfMissing(envFile, envContent, { force: ctx.force });

  // Set core.hooksPath if not already pointing at .githooks
  if (!ctx.dryRun) {
    try {
      const current = execSync('git config core.hooksPath', { cwd, encoding: 'utf8' }).trim();
      if (current !== '.githooks') {
        execSync('git config core.hooksPath .githooks', { cwd });
      }
    } catch {
      // Not yet configured — set it.
      execSync('git config core.hooksPath .githooks', { cwd });
    }
  }

  return {
    files: [prepPath, preCommitPath, envFile].filter((p) => fs.existsSync(p)),
    notes: ['core.hooksPath set to .githooks'],
  };
}
