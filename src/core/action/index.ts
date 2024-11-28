// Autogenerated file! Do not edit.

import { regex } from './regex';
import { select } from './select';
import { value } from './value';
import { text } from './text';
import { split } from './split';
import { first } from './first';
import { join } from './join';
import { trim } from './trim';
import { flatten } from './flatten';
import { list } from './list';
import { attribute } from './attribute';
import { matches } from './matches';
export const actions = { regex, select, value, text, split, first, join, trim, flatten, list, attribute, matches };
export type GetType<Action extends keyof typeof actions, Value> = ReturnType<Action extends 'regex' ? typeof actions.regex.run<Value> : Action extends 'select' ? typeof actions.select.run<Value> : Action extends 'value' ? typeof actions.value.run<Value> : Action extends 'text' ? typeof actions.text.run<Value> : Action extends 'split' ? typeof actions.split.run<Value> : Action extends 'first' ? typeof actions.first.run<Value> : Action extends 'join' ? typeof actions.join.run<Value> : Action extends 'trim' ? typeof actions.trim.run<Value> : Action extends 'flatten' ? typeof actions.flatten.run<Value> : Action extends 'list' ? typeof actions.list.run<Value> : Action extends 'attribute' ? typeof actions.attribute.run<Value> : Action extends 'matches' ? typeof actions.matches.run<Value> : () => 'missing type'>;
