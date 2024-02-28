/*!
 * Copyright 2018 - 2024 Digital Bazaar, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {createApp, defineAsyncComponent, h} from 'vue';
import {config} from './config.js';
import {ready} from '@bedrock/web';

/**
 * Auto starts the root Vue application. By default, this function will
 * call `bootstrap`. It can be overridden via `setStart` to run some custom
 * function instead.
 */
let _start = bootstrap;

// autostart once bedrock web app is ready
ready.then(() => _start());

// internal state
let _bootstrapDone;
const _bootstrapReady = new Promise(resolve => _bootstrapDone = resolve);
const _state = {
  rootApp: undefined,
  rootVue: undefined,
  hooks: {
    beforeMount: undefined
  },
  initialized: false
};

// export shared application config
export {config};

/**
 * A utility function that gets the root app and root vue. These will be
 * undefined prior to `initialize` being called.
 *
 * @returns {object} An object with `rootApp` and `rootVue`.
 */
export function getRootApp() {
  const {rootApp, rootVue} = _state;
  return {rootApp, rootVue};
}

/**
 * Initializes the root Vue application. This function must be called by the
 * Web app or the root Vue app will never be mounted.
 *
 * When the bedrock Web app is ready, `start` will be called which will, by
 * default, create and bootstrap the root Vue application. After it is
 * bootstrapped, any passed `beforeMount` function will be called. That
 * function must return the root Vue component for root app or `false` to
 * cancel mounting the root app.
 *
 * @param {object} options - The options to use.
 * @param {Function|boolean} options.beforeMount - The function to use to
 *   perform any setup prior to root Vue app being mounted; `false` to prevent
 *   mounting the root app.
 */
export function initialize({beforeMount} = {}) {
  if(_state.initialized) {
    throw new Error('"initialize" already called.');
  }
  _state.initialized = true;

  if(typeof beforeMount !== 'function') {
    throw new TypeError('"beforeMount" must be a function.');
  }

  // call `beforeMount` hook after root app is bootstrapped and
  // then mount root app
  _bootstrapReady
    .then(() => beforeMount({app: _state.rootApp}))
    .then(_mount)
    .catch(e => console.error(e));
}

/**
 * Bootstraps the root Vue application.
 *
 * @returns {object} App.
 */
export async function bootstrap() {
  if(window?._bedrock?.vue?.bootstrapped) {
    console.warn('bedrock-vue bootstrap called more than once; ignoring.');
    return;
  }

  // track that bedrock application has been bootstrapped
  window._bedrock = window._bedrock ?? {};
  window._bedrock.vue = {bootstrapped: true};

  // create root app
  const app = _state.rootApp = createApp({
    // use Vue 3.x render syntax
    compatConfig: {
      RENDER_FUNCTION: false
    },
    render: () => h(_state.rootVue)
  });

  // install bedrock-vue core into app
  app.use(install);

  // bootstrapping complete; root app will be mounted once `initialize` is
  // called and `beforeMount` hook, if any, finishes
  _bootstrapDone();

  return app;
}

export function augmentRouter({app, router} = {}) {
  if(typeof app !== 'object') {
    throw new TypeError('"app" must be an object.');
  }
  if(typeof router !== 'object') {
    throw new TypeError('"router" must be an object.');
  }

  // add not found component by default
  router.addRoute({
    path: '/:pathMatch(.*)*',
    component: () => import(
      /* webpackChunkName: "NotFound" */
      '../components/NotFound.vue')
  });

  // update page titles by default
  const defaultTitle = document.title;
  const updateTitle = (to, from) => {
    if(typeof to.meta?.title === 'string') {
      document.title = to.meta.title;
    } else if(typeof to.meta?.title === 'function') {
      document.title = to.meta.title({to, from});
    } else {
      document.title = defaultTitle;
    }
  };
  updateTitle(router.currentRoute.value, null);
  router.beforeEach(updateTitle);
}

// eslint-disable-next-line no-unused-vars
export function install(app) {
  // default generic top-level error component
  // eslint-disable-next-line vue/component-definition-name-casing
  app.component('br-error-base', defineAsyncComponent(() => import(
    /* webpackChunkName: "bedrock-vue-core" */
    '../components/BrErrorBase.vue')));

  // include vue `config` in Vue components; this config is just the
  // `config.vue` portion of the shared web app config
  app.mixin({
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

/**
 * Replaces `start` with another function. The function `fn` is responsible
 * for calling `bootstrap` to cause the root Vue application to be
 * bootstrapped. If it does not, then `bootstrap` must be manually called when
 * appropriate.
 *
 * This is useful as a test hook; a test module may call `setStart` to get
 * control over the startup process and delay bootstrapping an application
 * until some other event has occurred.
 *
 * @param {Function} fn - The new start function to call.
 */
export function setStart(fn) {
  _start = fn;
}

function _mount(rootVue) {
  if(rootVue === undefined) {
    throw new Error(
      '"beforeMount" must return the root Vue or a Promise that ' +
      'resolves to it to mount the root Vue app -- or it must return ' +
      'false to prevent the root Vue app from mounting.');
  }
  if(rootVue === false) {
    // do not mount root app (requested via `false` root vue)
    return false;
  }

  _state.rootVue = rootVue;
  const {rootApp: app} = _state;
  app.mount('br-app');

  // notify Vue devtools extension of app presence
  if(app.config.devtools) {
    postMessage({
      devtoolsEnabled: true,
      vueDetected: true
    }, '*');
  }

  // mounted
  return true;
}
