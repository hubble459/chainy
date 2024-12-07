import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import jQueryFactory from 'jquery';
import {chainy} from '../src/core/chainy_proxy';

describe('chain proxy', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const {window} = new JSDOM(html) as unknown as Window;
    const $ = jQueryFactory(window, true);

    test('select > text', () => {
        const result = chainy()
            .select('h1')
            .first()
            .text()
            .run($);

        expect(result).toBe('Lord of Destiny Wheel');
    });

    test('select > text', () => {
        const result = chainy()
            .select('ul.manga-info-text li:nth-child(7) a')
            .text()
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('select > text > join', () => {
        const result = chainy()
            .select('ul.manga-info-text li:nth-child(7) a')
            .text()
            .join('-')
            .run($);

        expect(result).toEqual('Action-Adventure-Drama-Fantasy-Shounen');
    });

    test('or', () => {
        const result = chainy()
            .select('#does-not-exist')
            .or_select('ul.manga-info-text li:nth-child(7) a')
            .text()
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('double or', () => {
        const result = chainy()
            .select('#does-not-exist')
            .or_select('#does-not-exist-2')
            .or_select('ul.manga-info-text li:nth-child(7) a')
            .text()
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('or chain', () => {
        const result = chainy()
            .select('#does-not-exist')
            .or(chain => chain
                .select('ul.manga-info-text li:nth-child(7) a')
                .text())
            .text()
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('and or chain', () => {
        const result = chainy()
            .add(chain => chain
                .select('#does-not-exist')
                .text())
            .or(chain => chain
                .select('ul.manga-info-text li:nth-child(7) a')
                .text())
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('fail', () => {
        const chain = chainy();
        expect(chain
            .select('#does-not-exist')
            .text()
            .run.bind(chain, $)).toThrow('No elements found');
    });
});
