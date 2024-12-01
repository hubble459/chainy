const glob = new Bun.Glob('*.ts');
let files = await Array.fromAsync(glob.scan({cwd: './src/core/action/'}));
files = files.filter(file => !['action.ts', 'index.ts'].includes(file)).map(file => file.slice(0, -3));

const imports = files.map(file => `import {${file}} from './${file}';`).join('\n');
const actions = `export const actions = {${files.join(', ')}};`;
const get_type = `export type GetType<Action extends keyof typeof actions, Value> = ReturnType<${files.map(file => `Action extends '${file}' ? typeof actions.${file}.run<Value>`).join(' : ')} : () => 'missing type'>;`;

await Bun.write('./src/core/action/index.ts', `// Autogenerated file! Do not edit.\n\n${imports}\n${actions}\n${get_type}\n`);
