import path from 'node:path';
import { readAsset, writeFileIfMissing, ensureDir } from '../util/fs.js';

/**
 * Drop intent/spec/plan templates so agents and humans have a starting point.
 * Templates live at <docsDir>/_templates/.
 */
export function installTemplates(cwd, config, ctx) {
  const tplDir = path.join(cwd, config.docsDir, '_templates');
  ensureDir(tplDir);
  const written = [];
  for (const name of config.artifacts) {
    const src = readAsset(`templates/${name}.md`);
    const target = path.join(tplDir, `${name}.md`);
    const r = writeFileIfMissing(target, src, { force: ctx.force });
    if (r.written) written.push(target);
  }
  return { files: written };
}
