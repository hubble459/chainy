import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import jQueryFactory from 'jquery';
import { allText, ownText } from '../src/util';

describe('texts', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const { window } = new JSDOM(html) as unknown as Window;
    const $ = jQueryFactory(window, true);

    test('own text', () => {
        expect(ownText($('ul.manga-info-text li:nth-child(7) a'))).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('all text', () => {
        expect(allText($('ul.manga-info-text li:nth-child(7) a'))).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });
});
