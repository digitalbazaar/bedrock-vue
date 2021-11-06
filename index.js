/*!
 * Vue frontend framework running on Bedrock.
 *
 * Copyright (c) 2018-2021 Digital Bazaar, Inc. All rights reserved.
 */
/* eslint-disable vue/one-component-per-file */
/* eslint-disable vue/component-definition-name-casing */
import {ready} from 'bedrock-web';
import config from './config.js';
import BrApp from './BrApp.vue';
import Vue from 'vue';
import VueRouter from 'vue-router';

/* global VUE_DEVTOOLS, VUE_PERFORMANCE, VUE_PRODUCTIONTIP */
// early Vue config setup from possible defines
if(typeof VUE_DEVTOOLS !== 'undefined') {
  Vue.config.devtools = JSON.parse(VUE_DEVTOOLS);
}
if(typeof VUE_PERFORMANCE !== 'undefined') {
  Vue.config.performance = JSON.parse(VUE_PERFORMANCE);
}
if(typeof VUE_PRODUCTIONTIP !== 'undefined') {
  Vue.config.productionTip = JSON.parse(VUE_PRODUCTIONTIP);
}

/**
 * Auto starts the main Vue application. By default, this function will
 * call `bootstrap`. It can be overridden via `setStart` to run some custom
 * function instead.
 */
export let start = bootstrap;

// autostart once bedrock web app is ready
ready.then(() => start());

// eslint-disable-next-line no-unused-vars
export function install(Vue, options) {
  // auto install router
  Vue.use(VueRouter);

  // register default empty components to be optionally overwritten
  Vue.component('br-root', () => import(
    /* webpackChunkName: "bedrock-vue-core" */
    './BrRoot.vue'));
  // eslint-disable-next-line vue/require-render-return
  Vue.component('br-header', {render() {}});
  // eslint-disable-next-line vue/require-render-return
  Vue.component('br-footer', {render() {}});
  // default generic top-level error component
  Vue.component('br-error-base', () => import(
    /* webpackChunkName: "bedrock-vue-core" */
    './BrErrorBase.vue'));

  // auto install br-app
  Vue.component('br-app', BrApp);

  // include `config` in Vue components
  Vue.mixin({
    beforeCreate() {
      const options = this.$options;
      if(options.config) {
        this.$config = options.config;
      } else if(options.parent && options.parent.$config) {
        this.$config = options.parent.$config;
      } else {
        this.$config = config;
      }
    }
  });
}

// access to the root Vue
export let rootVue;

/**
 * Sets the root Vue to mount. If `false` is passed, then no root Vue will be
 * automatically mounted.
 *
 * When the web app is ready, `start` will be called which will bootstrap
 * the application using the root Vue `vue`. If `vue` is a function, it is
 * assumed to be a factory function; it will be called and the return value
 * passed as the root Vue. The return value may be a Promise, permitting other
 * setup to occur before the root Vue is ready.
 *
 * @param vue the root Vue to use or `false` to disable automount.
 */
export function setRootVue(vue) {
  if(vue === false) {
    // disable bootstrapping the application
    rootVue = false;
    return;
  }

  if(!(vue && (typeof vue === 'function' || vue instanceof Vue))) {
    throw new Error(
      '`vue` must be a `Vue` instance or a factory function that returns ' +
      'a `Vue` instance or a Promise that resolves to one.');
  }
  rootVue = vue;
}

/**
 * Replaces `start` with another function. The function `fn` is responsible
 * for calling `bootstrap` to cause the Vue application to be bootstrapped;
 * if it does not, then `bootstrap` must be manually called when appropriate.
 *
 * This is useful as a test hook; a test module may call `setStart` to get
 * control over the startup process and delay bootstrapping an application
 * until some other event has occurred.
 *
 * @param fn the new start function to call.
 */
export function setStart(fn) {
  start = fn;
}

/**
 * Bootstraps the main Vue application.
 */
export async function bootstrap() {
  if(window._bedrock && window._bedrock.vue &&
    window._bedrock.vue.bootstrapped) {
    console.warn('bedrock-vue bootstrap called more than once; ignoring.');
    return;
  }

  // note that bedrock application has been bootstrapped
  window._bedrock = window._bedrock || {};
  window._bedrock.vue = {bootstrapped: true};

  let vue;

  if(typeof rootVue === 'function') {
    vue = await rootVue();
  } else {
    vue = await Promise.resolve(rootVue);
  }

  if(!vue) {
    // only warn when root vue is not deliberately set to `false`
    if(vue !== false) {
      console.warn(
        'The root Vue has not been set. You must import and call ' +
        'the `setRootModule()` method from `bedrock-vue`. ' +
        'Bootstrapping the Vue application has been aborted.');
    }
    // clear br-app content
    const root = document.querySelector('br-app');
    while(root.firstChild) {
      root.removeChild(root.firstChild);
    }
    return;
  }

  if(vue.$router) {
    // add not found component by default
    vue.$router.addRoute({
      path: '*',
      component: () => import(
        /* webpackChunkName: "NotFound" */
        './NotFound.vue')
    });

    // update page titles by default
    const defaultTitle = document.title;
    const updateTitle = (to, from, next) => {
      if(typeof to.meta.title === 'string') {
        document.title = to.meta.title;
      } else if(typeof to.meta.title === 'function') {
        document.title = to.meta.title({to, from, next});
      } else {
        document.title = defaultTitle;
      }
      next();
    };
    updateTitle(vue.$route, null, () => {});
    vue.$router.beforeEach(updateTitle);
  }

  // mount root Vue
  vue.$mount('br-app');

  // notify Vue devtools extension of Vue presence
  if(Vue.config.devtools) {
    postMessage({
      devtoolsEnabled: true,
      vueDetected: true
    }, '*');
  }
}

// shared application config
export {config};
