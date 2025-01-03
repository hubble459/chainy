const glob = new Bun.Glob('**/*.ts');
let files = await Array.fromAsync(glob.scan({cwd: './src/core/action/'}));
files = files.filter(file => !['action.ts', 'index.ts'].includes(file)).map(file => file.slice(0, -3));

const imports = files.map(file => `import {${file.slice(file.lastIndexOf('/') + 1)}} from './${file}';`).join('\n');
const actions = `export const actions = {${files.map(file => file.slice(file.lastIndexOf('/') + 1)).join(', ')}};`;

let get_type = `
export type Action<Context = any, Value = any, Options extends any[] = any[], Return = any> = (context: NonNullable<Context>, value: Value, ...options: Options) => Return;
export type Actions = typeof actions;
export type GetOptions<K extends keyof Actions> = Actions[K] extends Action<any, any, infer Options> ? Options : [];
export type GetType<K extends keyof Actions, Value, Context> =
    {{generics}}
        : Actions[K] extends Action<Context, Awaited<Value> extends unknown[] ? Awaited<Value>[number] : Awaited<Value>, any, infer Return>
            ? Awaited<Value> extends unknown[] ? Return[] : Return
            : Actions[K] extends Action<Context, Awaited<Value>, any, infer Return>
                ? Return
                : never;
export type PossibleActions<Context, Input> = {[K in keyof Actions as GetType<K, Input, Context> extends never ? never : K]: K};`;

let generics = '';
for (const file of files) {
    const text = await Bun.file(`./src/core/action/${file}.ts`).text();
    const generic = /export function [\w_]+<(\w+)( extends ([^>]+))?>/.exec(text);
    const type = generic?.[1];
    if (type) {
        const extend = generic[3] ?? 'unknown';

        const action_name = file.slice(file.lastIndexOf('/') + 1);
        if (file.startsWith('array/')) {
            generics += `K extends '${action_name}' ? Value extends ${extend} ? ReturnType<typeof ${action_name}<Value>> : never`;
        } else {
            generics += `K extends '${action_name}' ? Value extends unknown[] ? Value[number] extends ${extend} ? ReturnType<typeof ${action_name}<Value[number]>> : never : Value extends ${extend} ? ReturnType<typeof ${action_name}<Value>> : never`;
        }
    }
}

get_type = get_type.replace('{{generics}}', generics.trim());

// const get_type = `export type GetType<Action extends keyof typeof actions, Value> = ReturnType<${files.map(file => `Action extends '${file}' ? typeof actions.${file}<Value>`).join(' : ')} : () => 'missing type'>;`;

await Bun.write('./src/core/action/index.ts', `// Autogenerated file! Do not edit.\n\n${imports}\n\n${actions}\n${get_type}\n`);
