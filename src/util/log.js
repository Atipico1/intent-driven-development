import kleur from 'kleur';

export const log = {
  info: (msg) => console.log(kleur.cyan('ℹ'), msg),
  ok: (msg) => console.log(kleur.green('✓'), msg),
  warn: (msg) => console.log(kleur.yellow('!'), msg),
  err: (msg) => console.error(kleur.red('✗'), msg),
  step: (msg) => console.log(kleur.bold('\n→'), kleur.bold(msg)),
  dim: (msg) => console.log(kleur.gray('  ' + msg)),
};
