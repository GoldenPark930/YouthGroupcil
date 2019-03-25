
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');

import VueRouter from 'vue-router';
Vue.use(VueRouter);

import Notifications from 'vue-notification';
Vue.use(Notifications);

// Editor
// require('jodit/build/jodit.min.js');
require('jodit/build/jodit.min.css');

import * as VueGoogleMaps from 'vue2-google-maps'
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyD2-i1VhNKiam1KK__LKKHz1499rxASqWo',
    libraries: 'places'
  }
})

Vue.filter('truncate', function (text, stop, clamp) {
  return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
})

import store from './store'

Vue.component('menu-component', require('./components/Menu.vue'))
Vue.component('header-component', require('./components/Header.vue'))
Vue.component('modal', require('./components/Modal.vue'))

const Users = Vue.component('users', require('./components/Users.vue'))
const Councils = Vue.component('councils', require('./components/Councils.vue'))
const Questions = Vue.component('questions', require('./components/Questions.vue'))
const Regions = Vue.component('regions', require('./components/Regions.vue'))
const Instruction = Vue.component('instruction', require('./components/Instruction.vue'))
const Files = Vue.component('files', require('./components/Files.vue'))
const Content = Vue.component('content-component', require('./components/Content.vue'))

const BlockEdit = Vue.component('block-edit', require('./components/blocks/Edit.vue'))
const Profile = Vue.component('profile', require('./components/Profile.vue'))

const routes = [
  { path: '/admin', component: Users },
  { path: '/admin/users', component: Users },
  { path: '/admin/councils', component: Councils },
  { path: '/admin/questions', component: Questions },
  { path: '/admin/regions', component: Regions },
  { path: '/admin/instruction', component: Instruction },
  { path: '/admin/content', component: Content },
  { path: '/admin/instruction/block/:id', name: 'block-edit', component: BlockEdit },
  { path: '/admin/files', component: Files },
  { path: '/admin/settings', component: Profile }
];

const router = new VueRouter({
  mode: 'history',
  routes // short for `routes: routes`
})

import i18n from './i18n';

const app = new Vue({
  el: '#app',
  router,
  i18n,
  store,
  created: function () {

    axios.interceptors.response.use(undefined, function (err) {
      return new Promise(function (resolve, reject) {
        if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
          window.location.href = '/login';
        }
        throw err;
      });
    });

    this.$store.dispatch("loadAuthUser");
  }
});
