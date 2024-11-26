import { actions, type GetType } from './action';

// import type { Action } from './action/action';

type Actions = typeof actions;

// type GetType2<K extends keyof typeof import('./action').actions> = import.meta.import(`./action/${K}`).actions[K]['run'];

type ActionOptions<T extends { run: (...args: any[]) => any }> =
    Parameters<T['run']>[2];

type Propagate<Value, K extends keyof Actions> = Value extends unknown[]
    ? Actions[K]['take_array'] extends true ? GetType<K, Value> : GetType<K, Value[number]>[]
    : GetType<K, Value>;

type ActionsWithOptions = { [K in keyof Actions as unknown extends ActionOptions<Actions[K]> ? never : K ]: Actions[K] };
type ActionsWithoutOptions = { [K in keyof Actions as unknown extends ActionOptions<Actions[K]> ? K : undefined extends ActionOptions<Actions[K]> ? K : never ]: Actions[K] };

interface ChainAction {
    action: keyof Actions
    options: any
}

type ChainCallback<Input, Out extends Chain> = (chain: Chain<Input>) => Out;

export class Chain<Value = unknown, Previous = unknown> {
    private readonly items: (ChainAction | Chain)[][] = [];
    private _debug_indent = -1;
    private get debug_indent() {
        return ' '.repeat(this._debug_indent);
    };

    public do<Out extends Chain>(chain: ChainCallback<Value, Out>): Out;
    public do<K extends keyof ActionsWithoutOptions>(action: K): Chain<Propagate<Value, K>, Value>;
    public do<K extends keyof ActionsWithOptions>(action: K, options: ActionOptions<ActionsWithOptions[K]>): Chain<Propagate<Value, K>, Value>;
    public do<K extends keyof Actions>(action: K | ChainCallback<unknown, Chain>, options?: ActionOptions<Actions[K]>): Chain<Propagate<Value, K>, Value> {
        if (typeof action === 'function') {
            this.items.push([action(new Chain())]);
        } else {
            this.items.push([{ action, options }]);
        }

        return this as any;
    }

    // public else<C extends Chain>(chain: C): C {
    //     this.items.push([chain]);

    //     return chain;
    // }

    public or<V, P>(chain: ChainCallback<Previous, Chain<V, P>>): Chain<V | Value, P | Previous>;
    public or<K extends keyof Actions>(action: K, options: ActionOptions<Actions[K]>): Chain<GetType<K, Previous> | Value, Value>;
    public or<K extends keyof Actions>(action: K | ChainCallback<unknown, Chain>, options?: ActionOptions<Actions[K]>): Chain<GetType<K, Previous> | Value, Value> {
        const last = this.items[this.items.length - 1];
        if (!last) {
            throw new Error('Can not use "or" on empty chain');
        }

        if (typeof action === 'function') {
            last.push(action(new Chain()));
        } else {
            last.push({ action, options });
        }

        return this as any;
    }

    private execute(action: typeof this.items[number], $: JQueryStatic, value: unknown) {
        this._debug_indent++;

        for (const try_action of action) {
            try {
                let result: unknown;

                // Check if the action is a chain
                if (try_action instanceof Chain) {
                    result = try_action.run($, value);
                } else {
                    const executor = actions[try_action.action];

                    // Handle array values if executor doesn't support arrays
                    if (Array.isArray(value) && !executor.take_array) {
                        for (let i = 0; i < value.length; i++) {
                            value[i] = this.execute([try_action], $, value[i]);
                        }
                        this._debug_indent--;
                        return value;
                    }

                    // Run the executor
                    result = executor.run($, value, try_action.options);
                }

                // Log success and return result if valid
                if (result !== undefined) {
                    console.debug(
                        `${this.debug_indent}- ${
                            try_action instanceof Chain ? 'chain' : try_action.action
                        } returned "${Array.isArray(result) ? 'array' : typeof result}"; continuing`
                    );
                    this._debug_indent--;
                    return result;
                }
            } catch (error) {
                // Log errors gracefully
                if (error instanceof Error) {
                    console.debug(
                        `${this.debug_indent}- ${
                            try_action instanceof Chain ? 'chain' : try_action.action
                        } failed with error: "${error.message}"`
                    );
                }
            }
        }

        this._debug_indent--;

        // Throw if no action succeeded
        throw new Error('All actions in the chain failed');
    }

    public run($: JQueryStatic, value: unknown = undefined): Value {
        return this.items.reduce((value, actions) => this.execute(actions, $, value), value) as any;
    }

    public toJSON() {
        return JSON.stringify({ chain: this.items });
    }
}
