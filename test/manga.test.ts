import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import jQueryFactory from 'jquery';
import {Chainy} from '../src/core/chainy';

describe('manga', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const {window} = new JSDOM(html) as unknown as Window;
    const $ = jQueryFactory(window, true);


    test('select > text', () => {
        const first_text_trim = (chain: Chainy<JQueryStatic, JQuery[]>) => chain.add('first').add('text').add('trim');

        const manga_builder = {
            title: new Chainy()
                .add('select', 'h1:first')
                .add(first_text_trim),
            alternative_titles: new Chainy()
                .add('select', 'h2.story-alternative')
                .add(first_text_trim)
                .add('regex', /^Alternative : /)
                .add('split', /\w*;[\w\n]*/)
                .add('trim'),
            description: new Chainy()
                .add('select', 'meta[name="description"]')
                .add('first')
                .add('attribute', 'content')
                .add('trim'),
            genres: new Chainy()
                .add('select', 'ul.manga-info-text li:nth-child(7) a')
                .add('text')
                .add('trim'),
            authors: new Chainy()
                .add('select', 'ul.manga-info-text li:nth-child(2) a')
                .add('text')
                .add('trim'),
            status: new Chainy()
                .add('select', 'ul.manga-info-text li:nth-child(3)')
                .add(first_text_trim)
                .add('regex', /^Status :\s*/)
                .add(chain => chain.add('matches', /on-?going/ig).add('value', 'Ongoing'))
                .or(chain => chain.add('matches', /drop|stop|unfinished/ig).add('value', 'Unfinished'))
                .or(chain => chain.add('matches', /finished/ig).add('value', 'Finished'))
                .or(chain => chain.add('value', 'Ongoing')),
            is_ongoing: new Chainy()
                .add('select', 'ul.manga-info-text li:nth-child(3)')
                .add(first_text_trim)
                .add('regex', /^Status :\s*/)
                .add(chain => chain.add('matches', /on-?going/ig).add('value', 'Ongoing'))
                .or(chain => chain.add('matches', /drop|stop|unfinished/ig).add('value', 'Unfinished'))
                .or(chain => chain.add('matches', /finished/ig).add('value', 'Finished'))
                .or(chain => chain.add('value', 'Ongoing'))
                .add('matches', /Ongoing/)
                .or(chain => chain.add('value', false))
                .add('value', true),
        };

        const manga = Object.fromEntries(Object.entries(manga_builder).map(([key, chain]) => [key, chain.run($)]));

        expect(manga).toEqual({
            title: 'Lord of Destiny Wheel',
            alternative_titles: ['The Lord of the Wheel of', '命轮之主！当异变降临人间', 'Lord of Destiny Wheel', 'Lord of the Wheel of Fortune! When Changes Come to the World', '隠しジョブでレベルアップ'],
            description: 'A planet called Ghost Star suddenly appeared, causing the earth\'s animals and plants to evolve into monsters that can destroy humans. At the time of human extinction, people accidentally discovered a way to log into the ghost star, and found that they could gain power against mon',
            genres: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen'],
            authors: ['iCiyuan', '动漫', 'Armode Culture'],
            status: 'Ongoing',
            is_ongoing: true,
        });
    });
});
