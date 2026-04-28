import { installPlain } from './plain.js';
import { installClaudeCode } from './claude-code.js';
import { installCodex } from './codex.js';
import { installOpenCode } from './opencode.js';
import { installOmx } from './omx.js';
import { installOmc } from './omc.js';
import { installOmo } from './omo.js';
import { installSuperpowers } from './superpowers.js';

/**
 * Order matters: a parent harness must install before its extension.
 *  - claude-code → omc → superpowers
 *  - codex → omx
 *  - opencode → omo
 *  - plain runs only when no other harness is selected.
 */
export const INSTALL_ORDER = [
  'plain',
  'claude-code',
  'omc',
  'superpowers',
  'codex',
  'omx',
  'opencode',
  'omo',
  'agents-md',
];

export const INSTALLERS = {
  plain: installPlain,
  'claude-code': installClaudeCode,
  codex: installCodex,
  opencode: installOpenCode,
  omx: installOmx,
  omc: installOmc,
  omo: installOmo,
  superpowers: installSuperpowers,
  'agents-md': installPlain, // alias: bare AGENTS.md treatment is identical to plain
};

export const ALL_HARNESSES = ['claude-code', 'codex', 'opencode', 'omx', 'omc', 'omo', 'superpowers'];
