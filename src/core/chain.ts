import {actions, type Action, type Actions, type GetType} from './action';

type PossibleActions<Value> = {[K in keyof Actions as Value extends unknown ? K : GetType<K, Value> extends never ? never : K]: K};
type ActionOptions<K extends keyof Actions> = Actions[K] extends Action<any, any, infer Options> ? Options : [];

type Propagate<Output, K extends keyof Actions> = GetType<K, Output>;

type ChainCallback<Value, Values extends unknown[], Output extends Chain> = (chain: Chain<Value, Values>) => Output;
type Last<Values extends unknown[]> = Values extends [...any, infer Last] ? Last : unknown;
type Before<Values extends unknown[]> = Values extends [...infer Before, any] ? Before : never;
interface ChainAction<K extends keyof Actions> {
    action: K;
    options: ActionOptions<K>;
}

export class Chain<Input = unknown, Values extends unknown[] = [...any], Previous = unknown> {
    private readonly items: (ChainAction<any> | Chain)[] = [];

    public add<Output, AddValues extends unknown[]>(chain: ChainCallback<Last<Values>, Values, Chain<Output, AddValues>>): Chain<Input, [...Values, ...AddValues], Last<Values>>;
    public add<K extends keyof PossibleActions<Last<Values>>>(action: K, ...options: ActionOptions<K>): Chain<Input, [...Values, Propagate<Last<Values>, K>], Last<Values>>;
    public add(action: keyof Actions | ChainCallback<Last<Values>, Values, Chain>, ...options: any): any {
        if (typeof action === 'function') {
            this.items.push(...(action(new Chain())).items);
        } else {
            this.items.push({action, options});
        }

        return this;
    }

    public or<Output, OrValues extends unknown[]>(chain: ChainCallback<Previous, Values, Chain<Output, OrValues>>): Chain<Input, [...Before<Values>, Last<Values> | Last<OrValues>], Previous>;
    public or<K extends keyof PossibleActions<Previous>>(action: K, ...options: ActionOptions<K>): Chain<Input, [...Before<Values>, Last<Values> | Propagate<Last<Values>, K>], Previous>;
    public or(action: keyof Actions | ChainCallback<Previous, Values, Chain>, ...options: any[]): any {
        if (typeof action === 'function') {
            this.items.push(action(new Chain()));
        } else {
            // @ts-expect-error spread argument not allowed?!
            this.items.push(new Chain().add(action, ...options));
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
                    const action = actions[item.action as keyof Actions];
                    if (Array.isArray(value)) {
                        // @ts-expect-error expect_array is not a field
                        if (action.expect_array) {
                            value = action(input, value as any, ...item.options);
                        } else {
                            value = value.map(v => action(input, v, ...item.options));
                        }
                    } else {
                        value = action(input, value as any, ...item.options);
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
            } else if (v.options.length) {
                return v.action + '(' + JSON.stringify(v.options) + ')';
            }
            return v.action;
        }).join('>>');
    }
}
