import type {CheerioAPI} from 'cheerio';
import {actions, type Action, type Actions, type GetOptions, type GetType, type PossibleActions} from './action';

interface ChainyAction<K extends keyof Actions> {
    action: K;
    options: any[];
}

type ChainCallback<Context, Value, Output extends Chainy<any>> = (chain: Chainy<Context, Value>) => Output;
type IsPromise<Yes, Value> = Yes extends true ? true : Value extends Promise<any> ? true : false;

export class Chainy<Context = CheerioAPI, Value = Context, Previous = unknown, Async = false> {
    private readonly type: 'or' | 'and' = 'and';

    public readonly items: (ChainyAction<keyof Actions> | Chainy<unknown>)[] = [];

    constructor(type: 'and' | 'or' = 'and') {
        this.type = type;
    }

    public add<V>(chain_clojure: ChainCallback<Context, Value, Chainy<Context, V>>): Chainy<Context, V, Value, IsPromise<Async, Value>>;
    public add<K extends keyof PossibleActions<Context, Value>>(action: K, ...options: GetOptions<K>): Chainy<Context, GetType<K, Value, any>, Value, IsPromise<Async, Value>>;
    public add(action: keyof Actions | ChainCallback<Context, Value, any>, ...options: any[]): any {
        if (typeof action === 'function') {
            this.items.push(action(new Chainy('and')));
        } else {
            this.items.push({action, options});
        }

        return this;
    }

    public or<V>(chain_clojure: ChainCallback<Context, Previous, Chainy<Context, V>>): Chainy<Context, Value | V, Previous, IsPromise<Async, Value>>;
    public or<K extends keyof PossibleActions<Context, Previous>>(action: K, ...options: GetOptions<K>): Chainy<Context, GetType<K, Previous, any> | Value, Previous, IsPromise<Async, Value>>;
    public or(action: keyof Actions | ChainCallback<Context, any, any>, ...options: any[]): any {
        if (typeof action === 'function') {
            this.items.push(action(new Chainy('or')));
        } else {
            this.items.push(new Chainy('or').add(action as any, ...options));
        }

        return this;
    }

    private run_action(input: Context, value: any, item: typeof this.items[number]) {
        if (item instanceof Chainy) {
            return item.run(input, value);
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        item.options ??= [];
        const action = actions[item.action] as Action;

        // @ts-expect-error expect_array is not a field
        if (Array.isArray(value) && !action.expect_array) {
            return value.map(v => action(input, v, ...item.options));
        }

        return action(input, value, ...item.options);
    }

    public run(input: Context, value: any = undefined): Async extends true ? Promise<Value> : Value {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]!;
            const next = this.items[i + 1];

            const next_is_or = next instanceof Chainy && next.type === 'or';

            try {
                value = this.run_action(input, value, item);

                if (value instanceof Promise) {
                    return value
                        .then((v) => {
                            if (next_is_or) {
                                let next_next;
                                // Skip all following actions which are 'or'
                                while ((next_next = this.items[i + 1]) && next_next instanceof Chainy && next_next.type === 'or') {
                                    i++;
                                }
                            }

                            const async_chain = new Chainy<Context>();
                            async_chain.items.push(...this.items.slice(i + 1));
                            return async_chain.run(input, v);
                        })
                        .catch((e: unknown) => {
                            if (!next_is_or) {
                                throw e;
                            }

                            const async_chain = new Chainy<Context>();
                            async_chain.items.push(...this.items.slice(i + 1));
                            return async_chain.run(input, value);
                        }) as any;
                }

                if (next_is_or) {
                    let next_next;
                    // Skip all following actions which are 'or'
                    while ((next_next = this.items[i + 1]) && next_next instanceof Chainy && next_next.type === 'or') {
                        i++;
                    }
                }
                // console.log(`Action (${'action' in item ? item.action : item.toString()}) got value ${JSON.stringify(value)}`);
            } catch (e) {
                if (next_is_or) {
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
