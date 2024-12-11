/* eslint-disable prefer-const */
import axios, {type InternalAxiosRequestConfig} from 'axios';
import {setupCache} from 'axios-cache-interceptor';
import {JSDOM} from 'jsdom';
import jQueryFactory from 'jquery';

export let json_axios = setupCache(axios.create());
export let html_axios = setupCache(axios.create());
html_axios.defaults.transformResponse = function (this: InternalAxiosRequestConfig, data: any) {
    if (typeof data === 'string') {
        const {window} = new JSDOM(data, {url: this.url}) as unknown as Window;
        return jQueryFactory(window, true);
    }

    throw new Error('Page did not reply with HTML content');
};
