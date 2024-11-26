import { describe, expect, test } from 'bun:test';
import { Chain } from '../src/core/chain';

describe('serialize', () => {
    test('json', () => {
        const chain = new Chain();

        const result = chain
            .do('select', 'h1')
            .do('first')
            .do('text')
            .toJSON();

        expect(result).toBe('{"chain":[[{"action":"select","options":"h1"}],[{"action":"first"}],[{"action":"text"}]]}');
    });
});
