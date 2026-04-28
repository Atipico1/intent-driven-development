import fs from 'node:fs';
import { ensureDir } from './fs.js';
import path from 'node:path';

const BEGIN_MARK = '<!-- intent-kit:rules-begin -->';
const END_MARK = '<!-- intent-kit:rules-end -->';

/**
 * Insert or replace the IDD rules block (delimited by intent-kit markers)
 * inside a target markdown file. Idempotent.
 */
export function upsertRulesBlock(filePath, rulesMarkdown) {
  ensureDir(path.dirname(filePath));

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, rulesMarkdown + '\n');
    return { mode: 'created' };
  }

  const cur = fs.readFileSync(filePath, 'utf8');
  if (cur.includes(BEGIN_MARK) && cur.includes(END_MARK)) {
    const before = cur.slice(0, cur.indexOf(BEGIN_MARK));
    const after = cur.slice(cur.indexOf(END_MARK) + END_MARK.length);
    fs.writeFileSync(filePath, before + rulesMarkdown + after);
    return { mode: 'updated' };
  }

  fs.writeFileSync(filePath, cur.replace(/\s*$/, '') + '\n\n' + rulesMarkdown + '\n');
  return { mode: 'appended' };
}
