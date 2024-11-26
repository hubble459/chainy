import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import jQueryFactory from 'jquery';
import { Chain } from '../src/core/chain';

describe('chain', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const { window } = new JSDOM(html) as unknown as Window;
    const $ = jQueryFactory(window, true);

    test('select > text', () => {
        const chain = new Chain();

        const result = chain
            .do('select', 'h1')
            .do('first')
            .do('text')
            .run($);

        expect(result).toBe('Lord of Destiny Wheel');
    });

    test('select > list > text', () => {
        const chain = new Chain();

        const result = chain
            .do('select', 'ul.manga-info-text li:nth-child(7) a')
            .do('list')
            .do('text')
            .do('flatten')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('select > list > text > join', () => {
        const chain = new Chain();

        const result = chain
            .do('select', 'ul.manga-info-text li:nth-child(7) a')
            .do('list')
            .do('text')
            .do('join', '-')
            .run($);

        expect(result).toEqual('Action-Adventure-Drama-Fantasy-Shounen');
    });

    test('select > list > ', () => {
        const chain = new Chain();

        const result = chain
            .do('select', 'ul.manga-info-text li:nth-child(7) a')
            .do('text')
            .do('join', '-')
            .run($);

        expect(result).toEqual('Action-Adventure-Drama-Fantasy-Shounen');
    });

    test('or', () => {
        const chain = new Chain();

        const result = chain
            .do('select', '#does-not-exist')
            .or('select', 'ul.manga-info-text li:nth-child(7) a')
            .do('text')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('double or', () => {
        const chain = new Chain();

        const result = chain
            .do('select', '#does-not-exist')
            .or('select', '#does-not-exist-2')
            .or('select', 'ul.manga-info-text li:nth-child(7) a')
            .do('text')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('or chain', () => {
        const chain = new Chain();

        const result = chain
            .do('select', '#does-not-exist')
            .or(chain => chain
                .do('select', 'ul.manga-info-text li:nth-child(7) a')
                .do('text'))
            .do('text')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('fail', () => {
        const chain = new Chain();

        expect(chain
            .do('select', '#does-not-exist')
            .do('text')
            .run.bind(chain, $)).toThrow('Failed');
    });
});
