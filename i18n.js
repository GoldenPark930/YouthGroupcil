import Vue from 'vue';
import VueI18n from 'vue-i18n'
import $ from 'jquery';

Vue.use(VueI18n)

import translations from './translations.json';

let locale = $('html').attr('lang');
locale = (typeof locale !== 'undefined') ? locale : 'en';

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: locale, // set locale
  messages: translations, // set locale messages
});

export default i18n;