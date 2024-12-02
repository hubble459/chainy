import {actions, type Action, type Actions, type GetType} from './action';

// type Actions = typeof actions;
// type ActionOptions<K extends keyof Actions> = Actions[K]['run'] extends Action<infer Options> ? Options : never;
// type PossibleActions<Output = any> = {[K in keyof Actions as GetType<K, Output extends unknown[] ? Actions[K]['take_array'] extends true ? Output : Output[keyof Output] : Output> extends never ? never : K]: K};
// type ActionsWithOptions<Output> = {[K in keyof PossibleActions<Output> as ActionOptions<K> extends undefined ? never : K]: ActionOptions<K>};
// type ActionsWithoutOptions<Output> = {[K in keyof PossibleActions<Output> as undefined extends ActionOptions<K> ? K : never]: K};
// type Propagate<Output, K extends keyof Actions> = Output extends unknown[] ? Actions[K]['take_array'] extends true ? GetType<K, Output> : GetType<K, Output[number]>[] : GetType<K, Output>;
// type ChainCallback<Value, Values extends unknown[], Output extends Chain> = (chain: Chain<Value, Values>) => Output;
// type Last<Values extends unknown[]> = Values extends [...any, infer Last] ? Last : unknown;
// type Before<Values extends unknown[]> = Values extends [...infer Before, any] ? Before : never;
// interface ChainAction<K extends keyof Actions = keyof Actions> {
//     action: K;
//     options: ActionOptions<K>;
// }

type ActionOptions<K extends keyof Actions> = Actions[K] extends Action<any, any, infer Options> ? Options : never;
type PossibleActions<Context, Value> = {[K in keyof Actions as Actions[K] extends Action<Context, Value, any> ? K : never]: K};
type Last<T extends unknown[]> = T extends [...any, infer Last] ? Last : unknown;

type ActionsWithOptions<Context, Value> = {[K in keyof PossibleActions<Context, Value> as ActionOptions<K>[0] extends undefined ? never : K]: ActionOptions<K>};
type ActionsWithoutOptions<Context, Value> = {[K in keyof PossibleActions<Context, Value> as undefined extends ActionOptions<K>[0] ? K : never]: K};
// type Propagate<Output, K extends keyof Actions> = Output extends unknown[] ? Actions[K]['take_array'] extends true ? GetType<K, Output> : GetType<K, Output[number]>[] : GetType<K, Output>;
type ChainCallback<Context, Value, Values extends unknown[], Output extends Chainy<Context, Value, Values>> = (chain: Chainy<Context, Value, Values>) => Output;
type Before<Values extends unknown[]> = Values extends [...infer Before, any] ? Before : never;

interface ChainAction<K extends keyof Actions = keyof Actions> {
    action: K;
    options: ActionOptions<K>;
}

type Chainy<Context, CurrentValue, PreviousValues extends unknown[]> = {
    [K in keyof PossibleActions<Context, CurrentValue>]:
    Actions[K] extends Action<any, any, infer Options>
        ? Options[0] extends never[]
            ? () => Chainy<Context, GetType<K, CurrentValue>, [...PreviousValues, CurrentValue]>
            : (...options: Options) => Chainy<Context, GetType<K, CurrentValue>, [...PreviousValues, CurrentValue]>
        : never
    ;
} & {
    [K in keyof PossibleActions<Context, Last<PreviousValues>> as `or_${K}`]:
    Actions[K] extends Action<any, any, infer Options>
        ? Options[0] extends never[]
            ? () => Chainy<Context, CurrentValue | GetType<K, Last<PreviousValues>>, [...PreviousValues, CurrentValue | GetType<K, Last<PreviousValues>>]>
            : (...options: Options) => Chainy<Context, CurrentValue | GetType<K, Last<PreviousValues>>, [...PreviousValues, CurrentValue | GetType<K, Last<PreviousValues>>]>
        : never
    ;
} & {
    chain<R extends Chainy<unknown, unknown, unknown[]>>(closure: (chainy: Chainy<Context, CurrentValue, PreviousValues>) => R): R;
    or<R extends Chainy<unknown, unknown, unknown[]>>(closure: (chainy: Chainy<Context, Last<PreviousValues>, PreviousValues>) => R): R;
    run(input: Context): CurrentValue;
};

class ChainyClass<Context = unknown, Input = unknown, Values extends unknown[] = [...any], Previous = unknown> {
    private readonly items: (ChainAction | ChainyClass)[] = [];

    constructor() {
        for (const action of Object.keys(actions)) {
            Object.defineProperties(this,
                {
                    [action]: {
                        get: () => {
                            return (options: never) => {
                                this.items.push({action: action as any, options});
                                return this;
                            };
                        },
                    },
                    [`or_${action}`]: {
                        get: () => {
                            return (options: any) => {
                                this.items.push((new ChainyClass() as any)[action](options));
                                return this;
                            };
                        },
                    },
                });
        }
    }

    public add<Output, AddValues extends unknown[]>(chain: ChainCallback<Context, Last<Values>, Values, ChainyClass<Context, Output, AddValues>>): ChainyClass<Context, Input, [...Values, ...AddValues], Last<Values>>;
    public add<K extends keyof ActionsWithoutOptions<Last<Values>>>(action: K): Chain<Input, [...Values, Propagate<Last<Values>, K>], Last<Values>>;
    public add<K extends keyof ActionsWithOptions<Last<Values>>>(action: K, options: ActionOptions<K>): Chain<Input, [...Values, Propagate<Last<Values>, K>], Last<Values>>;
    public add(action: keyof Actions | ChainCallback<Last<Values>, Values, Chain>, options?: any): any {
        if (typeof action === 'function') {
            this.items.push(...(action(new Chain())).items);
        } else {
            this.items.push({action, options});
        }

        return this;
    }

    public or<Output, OrValues extends unknown[]>(chain: ChainCallback<Previous, Values, Chain<Output, OrValues>>): Chain<Input, [...Before<Values>, Last<Values> | Last<OrValues>], Previous>;
    public or<K extends keyof ActionsWithoutOptions<Previous>>(action: K): Chain<Input, [...Before<Values>, Last<Values> | Propagate<Last<Values>, K>], Previous>;
    public or<K extends keyof ActionsWithOptions<Previous>>(action: K, options: ActionOptions<K>): Chain<Input, [...Before<Values>, Last<Values> | Propagate<Last<Values>, K>], Previous>;
    public or(action: keyof Actions | ChainCallback<Previous, Values, Chain>, options?: any): any {
        if (typeof action === 'function') {
            this.items.push(action(new Chain()));
        } else {
            this.items.push(new Chain().add(action as any, options));
        }

        return this;
    }

    public run(context: any, value: any) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]!;
            const next = this.items[i + 1];

            const allowed_to_fail = next instanceof ChainyClass;

            try {
                if (item instanceof ChainyClass) {
                    value = item.run(context, value);
                } else {
                    const action = actions[item.action];
                    if (Array.isArray(value)) {
                        // @ts-expect-error expect_array is not a field
                        if (action.expect_array) {
                            value = action(context, value as any, item.options);
                        } else {
                            value = value.map(v => action(context, v, item.options));
                        }
                    } else {
                        value = action(context, value, item.options);
                    }
                }
                console.log(`Action (${'action' in item ? item.action : item.toString()}) got value ${JSON.stringify(value)}`);
            } catch (e) {
                if (allowed_to_fail) {
                    console.log(`Failed action (${'action' in item ? item.action : item.toString()}) but continuing to next`);
                } else {
                    throw e;
                }
            }
        }

        return value;
    }

    public toArray(): any[] {
        return this.items.map(item => 'toArray' in item ? item.toArray() : item);
    }

    public toString(): string {
        if (!('toJSON' in RegExp.prototype)) {
            // @ts-expect-error toJSON does not exist on RegExp
            // eslint-disable-next-line @typescript-eslint/unbound-method
            RegExp.prototype.toJSON = RegExp.prototype.toString;
        }

        return 'chain:' + this.items.map((v) => {
            if (v instanceof ChainyClass) {
                return v.toString();
            } else if (v.options) {
                return v.action + '(' + JSON.stringify(v.options) + ')';
            }
            return v.action;
        }).join('>>');
    }
}

function chainy<Context, CurrentValue = Context, PreviousValues extends unknown[] = []>(): Chainy<Context, CurrentValue, PreviousValues> {
    return new ChainyClass() as any;
}

const chain = chainy<JQueryStatic>()
    .select('woo')
    .first()
    .text()
    .first()
    .run(null as any);
