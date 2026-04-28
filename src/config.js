import fs from 'node:fs';
import path from 'node:path';

export const DEFAULTS = Object.freeze({
  docsDir: 'docs/intent',
  hashLength: 5,
  trailerPrefix: 'Intent',
  installGitHooks: true,
  // Workflow contract that all harness installers translate into native idiom:
  artifacts: ['intent', 'spec', 'plan'],
  dependencies: { spec: ['intent'], plan: ['intent', 'spec'] },
});

export function resolveConfig(flags = {}) {
  const fromFile = flags.config ? loadFile(flags.config) : {};
  return {
    ...DEFAULTS,
    ...fromFile,
    ...stripUndefined({
      docsDir: flags.docsDir,
      hashLength: flags.hashLength != null ? Number(flags.hashLength) : undefined,
      trailerPrefix: flags.trailerPrefix,
      installGitHooks: flags.gitHooks,
    }),
    flags,
  };
}

export function isHeadless(flags = {}) {
  return Boolean(flags.yes || flags.headless || !process.stdin.isTTY || process.env.CI);
}

function loadFile(p) {
  const abs = path.resolve(process.cwd(), p);
  const text = fs.readFileSync(abs, 'utf8');
  if (abs.endsWith('.json')) return JSON.parse(text);
  // For YAML we'd need a parser; keep JSON-only for v0 to avoid the dep.
  throw new Error(`Unsupported config format: ${abs} (only .json supported in v0)`);
}

function stripUndefined(o) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
}
