import {actions, type Action, type Actions, type GetOptions, type GetType, type PossibleActions} from './action';

interface ChainyAction<K extends keyof Actions> {
    action: K;
    options: any[];
}

type ChainCallback<Context, Value, Output extends Chainy<any>> = (chain: Chainy<Context, Value>) => Output;

export class Chainy<Context = JQueryStatic, Value = Context, Previous = unknown> {
    private readonly type: 'or' | 'and' = 'and';

    public readonly items: (ChainyAction<keyof Actions> | Chainy<unknown>)[] = [];

    constructor(type: 'and' | 'or' = 'and') {
        this.type = type;
    }

    public add<V>(chain_clojure: ChainCallback<Context, Value, Chainy<Context, V>>): Chainy<Context, V, Value>;
    public add<K extends keyof PossibleActions<Context, Value>>(action: K, ...options: GetOptions<K>): Chainy<Context, GetType<K, Value, any>, Value>;
    public add(action: keyof Actions | ChainCallback<Context, Value, any>, ...options: any[]): this {
        if (typeof action === 'function') {
            this.items.push(action(new Chainy('and')));
        } else {
            this.items.push({action, options});
        }

        return this;
    }

    public or<V>(chain_clojure: ChainCallback<Context, Previous, Chainy<Context, V>>): Chainy<Context, Value | V, Previous>;
    public or<K extends keyof PossibleActions<Context, Previous>>(action: K, ...options: GetOptions<K>): Chainy<Context, GetType<K, Previous, any> | Value, Previous>;
    public or(action: keyof Actions | ChainCallback<Context, any, any>, ...options: any[]): this {
        if (typeof action === 'function') {
            this.items.push(action(new Chainy('or')));
        } else {
            // @ts-expect-error spread argument not allowed?!
            this.items.push(new Chainy('or').add(action, ...options));
        }

        return this;
    }

    public run(input: Context, value?: any): Value {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]!;
            const next = this.items[i + 1];

            const allowed_to_fail = next instanceof Chainy && next.type === 'or';

            try {
                if (item instanceof Chainy) {
                    value = item.run(input, value);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    item.options ??= [];
                    const action = actions[item.action] as Action;
                    if (Array.isArray(value)) {
                        // @ts-expect-error expect_array is not a field
                        if (action.expect_array) {
                            value = action(input, value, ...item.options);
                        } else {
                            value = value.map(v => action(input, v, ...item.options));
                        }
                    } else {
                        value = action(input, value, ...item.options);
                    }
                }
                if (allowed_to_fail) {
                    let n;
                    while ((n = this.items[i + 1]) && n instanceof Chainy && n.type === 'or') {
                        i++;
                    }
                }
                // console.log(`Action (${'action' in item ? item.action : item.toString()}) got value ${JSON.stringify(value)}`);
            } catch (e) {
                if (allowed_to_fail) {
                    // console.log(`Failed action (${'action' in item ? item.action : item.toString()}) but continuing to next`);
                } else {
                    throw e;
                }
            }
        }

        return value;
    }

    public toObject(): any {
        if (!('toJSON' in RegExp.prototype)) {
            // @ts-expect-error toJSON does not exist on RegExp
            // eslint-disable-next-line @typescript-eslint/unbound-method
            RegExp.prototype.toJSON = RegExp.prototype.toString;
        }

        return JSON.parse(JSON.stringify(this));
    }

    public toString(): string {
        if (!('toJSON' in RegExp.prototype)) {
            // @ts-expect-error toJSON does not exist on RegExp
            // eslint-disable-next-line @typescript-eslint/unbound-method
            RegExp.prototype.toJSON = RegExp.prototype.toString;
        }

        return 'chain:' + this.items.map((v) => {
            if (v instanceof Chainy) {
                return v.toString();
            } else if (v.options.length) {
                return v.action + '(' + JSON.stringify(v.options) + ')';
            }
            return v.action;
        }).join('>>');
    }

    static fromJSON(json: unknown): Chainy {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }

        if (!json || typeof json !== 'object' || !('items' in json) || !('type' in json) || !Array.isArray(json.items)) {
            throw new Error('Not a valid JSON object!');
        }

        const chain = new Chainy(json.type as 'or' | 'and');

        for (const item of json.items) {
            if ('items' in item) {
                chain.items.push(this.fromJSON(item));
            } else {
                chain.items.push(item);
            }
        }

        return chain;
    }
}
