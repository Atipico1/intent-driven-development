import { execSync } from 'node:child_process';
import { log } from '../util/log.js';

/**
 * Re-applies the git config — used by package.json `prepare` script so that
 * teammates running `npm install` automatically pick up `core.hooksPath`.
 */
export async function runSync() {
  try {
    execSync('git config core.hooksPath .githooks', { stdio: 'ignore' });
    log.ok('git core.hooksPath = .githooks');
  } catch (err) {
    // Not a git repo, or git not installed — silent no-op (npm install in a
    // tarball context can hit this).
    if (process.env.INTENT_KIT_DEBUG) console.error(err);
  }
}
