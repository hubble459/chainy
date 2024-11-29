import {actions, type GetType} from './action';
import type {Action} from './action/action';

type Actions = typeof actions;
type ActionOptions<K extends keyof Actions> = Actions[K]['run'] extends Action<infer Options> ? Options : never;
type PossibleActions<Output = any> = {[K in keyof Actions as GetType<K, Output extends unknown[] ? Actions[K]['take_array'] extends true ? Output : Output[keyof Output] : Output> extends never ? never : K]: K};
type ActionsWithOptions<Output> = {[K in keyof PossibleActions<Output> as ActionOptions<K> extends undefined ? never : K]: ActionOptions<K>};
type ActionsWithoutOptions<Output> = {[K in keyof PossibleActions<Output> as undefined extends ActionOptions<K> ? K : never]: K};
type Propagate<Output, K extends keyof Actions> = Output extends unknown[] ? Actions[K]['take_array'] extends true ? GetType<K, Output> : GetType<K, Output[number]>[] : GetType<K, Output>;
type ChainCallback<Value, Values extends unknown[], Output extends Chain> = (chain: Chain<Value, Values>) => Output;
type Last<Values extends unknown[]> = Values extends [...any, infer Last] ? Last : unknown;
type Before<Values extends unknown[]> = Values extends [...infer Before, any] ? Before : never;
interface ChainAction<K extends keyof Actions = keyof Actions> {
    action: K;
    options: ActionOptions<K>;
}

export class Chain<Input = unknown, Values extends unknown[] = [...any], Previous = unknown> {
    private readonly items: (ChainAction | Chain)[] = [];

    public add<Output, AddValues extends unknown[]>(chain: ChainCallback<Last<Values>, Values, Chain<Output, AddValues>>): Chain<Input, [...Values, ...AddValues], Last<Values>>;
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

    public execute(input: JQueryStatic, value?: Values[0]): Last<Values> {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]!;
            const next = this.items[i + 1];

            const allowed_to_fail = next instanceof Chain;

            try {
                if (item instanceof Chain) {
                    value = item.execute(input, value);
                } else {
                    const action = actions[item.action];
                    if (Array.isArray(value)) {
                        if (action.take_array) {
                            value = action.run(input, value, item.options);
                        } else {
                            value = value.map(v => action.run(input, v, item.options));
                        }
                    } else {
                        value = action.run(input, value, item.options);
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

        return value as any;
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
            if (v instanceof Chain) {
                return v.toString();
            } else if (v.options) {
                return v.action + '(' + JSON.stringify(v.options) + ')';
            }
            return v.action;
        }).join('>>');
    }
}
