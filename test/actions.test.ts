import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import jQueryFactory from 'jquery';
import {actions} from '../src/core/action';

const {attribute, regex, select, text} = actions;

describe('actions', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const {window} = new JSDOM(html) as unknown as Window;
    const $ = jQueryFactory(window, true);

    test('select', () => {
        const element = select.run($, undefined, 'h1')[0];

        expect(element?.text()).toBe('Lord of Destiny Wheel');
    });

    test('select:chained', () => {
        const value = select.run($, undefined, 'ul.manga-info-text');

        const element = select.run($, value, 'h1')[0];

        expect(element?.text()).toBe('Lord of Destiny Wheel');
    });

    test('text', () => {
        const value = select.run($, undefined, 'ul.manga-info-text h1')[0];

        const result = text.run($, value, 'all');

        expect(result).toBe('Lord of Destiny Wheel');
    });

    test('attribute', () => {
        const value = select.run($, undefined, 'meta[name="description"]')[0];

        const result = attribute.run($, value, 'content');

        expect(result).toBe('A planet called Ghost Star suddenly appeared, causing the earth\'s animals and plants to evolve into monsters that can destroy humans. At the time of human extinction, people accidentally discovered a way to log into the ghost star, and found that they could gain power against mon');
    });

    test('regex', () => {
        const value1 = select.run($, undefined, 'ul.manga-info-text h1')[0];

        const value2 = text.run($, value1, 'all');

        const value3 = regex.run($, value2, {regex: /\w+ \w+ /});

        expect(value3).toBe('Destiny Wheel');
    });
});
