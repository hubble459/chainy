import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import jQueryFactory from 'jquery';
import {actions} from '../src/core/action';
import {cast_date} from '../src/core/action/cast_date';
import {abs_url} from '../src/core/action/abs_url';

const {attribute, regex, select, text} = actions;

describe('actions', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const {window} = new JSDOM(html, {url: 'https://mangakakalot.com/manga/fm939336'}) as unknown as Window;
    const $ = jQueryFactory(window, true);

    test('select', () => {
        const element = select($, $, 'h1')[0];

        expect(element?.text()).toBe('Lord of Destiny Wheel');
    });

    test('select:chained', () => {
        const value = select($, $, 'ul.manga-info-text')[0]!;

        const element = select($, value, 'h1')[0];

        expect(element?.text()).toBe('Lord of Destiny Wheel');
    });

    test('text', () => {
        const value = select($, $, 'ul.manga-info-text h1')[0]!;

        const result = text($, value, 'all');

        expect(result).toBe('Lord of Destiny Wheel');
    });

    test('attribute', () => {
        const value = select($, $, 'meta[name="description"]')[0]!;

        const result = attribute($, value, 'content');

        expect(result).toBe('A planet called Ghost Star suddenly appeared, causing the earth\'s animals and plants to evolve into monsters that can destroy humans. At the time of human extinction, people accidentally discovered a way to log into the ghost star, and found that they could gain power against mon');
    });

    test('regex', () => {
        const value1 = select($, $, 'ul.manga-info-text h1')[0]!;

        const value2 = text($, value1, 'all');

        const value3 = regex($, value2, /\w+ \w+ /);

        expect(value3).toBe('Destiny Wheel');
    });


    test('cast_date', () => {
        const element = cast_date($, 'Oct-16-2024 10:57', 'MMM-dd-yyyy HH:mm');

        expect(element.toISOString()).toBe('2024-10-16T10:57:00.000Z');
    });

    test('abs_url', () => {
        const element = abs_url($, '/index.html');

        expect(element).toBe('https://mangakakalot.com/index.html');
    });
});
