/*!
 * Copyright (c) 2018-2022 Digital Bazaar, Inc. All rights reserved.
 */
import BrApp from '../components/BrApp.vue';
import {config} from './config.js';
import {createApp, h} from 'vue';
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
// export utils
export {makeReactive} from './utils.js';

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
 * @param {Function|boolean} beforeMount - The function to use to perform any
 *   setup prior to root Vue app being mounted; `false` to prevent mounting
 *   the root app.
 */
export function initialize({beforeMount} = {}) {
  if(_state.initialized) {
    throw new Error('"initialize" already called.');
  }
  _state.initialized = true;

  if(beforeMount !== undefined && typeof beforeMount !== 'function') {
    throw new TypeError('"beforeMount" must be a function.');
  }

  let promise = _bootstrapReady;

  if(beforeMount) {
    // call `beforeMount` hook once root app is bootstrapped
    promise = promise.then(async () => {
      _state.rootVue = await beforeMount({app: _state.rootApp});
    });
  }

  // finally, mount root app
  promise.then(_mount);
}

/**
 * Bootstraps the root Vue application.
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
    // FIXME: does this render `_state.rootVue` regardless of what the
    // innerHTML is for the mount point? if so, we may be able to dispense
    // with registering default `br-*` components now
    render: () => h(_state.rootVue)
  });

  // install bedrock-vue core into app
  app.use(install);

  // bootstrapping complete; root app will be mounted once `initialize` is
  // called and `beforeMount` hook, if any, finishes
  _bootstrapDone();

  return app;
}

export function augmentRouter({router} = {}) {
  // add not found component by default
  router.addRoute({
    path: '/:pathMatch(.*)*',
    component: () => import(
      /* webpackChunkName: "NotFound" */
      '../components/NotFound.vue')
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
  // FIXME: `app.$route` does not exist, figure out replacement
  //updateTitle(app.$route, null, () => {});
  router.beforeEach(updateTitle);
}

// eslint-disable-next-line no-unused-vars
export function install(app) {
  // register default empty components to be optionally overwritten
  app.component('br-root', () => import(
    /* webpackChunkName: "bedrock-vue-core" */
    '../components/BrRoot.vue'));
  // eslint-disable-next-line vue/require-render-return
  app.component('br-header', {render() {}});
  // eslint-disable-next-line vue/require-render-return
  app.component('br-footer', {render() {}});
  // default generic top-level error component
  app.component('br-error-base', () => import(
    /* webpackChunkName: "bedrock-vue-core" */
    '../components/BrErrorBase.vue'));

  // auto install br-app
  app.component('br-app', BrApp);

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

function _mount() {
  if(_state.rootVue === undefined) {
    // FIXME: throw if not defined instead
    // set default root Vue component
    _state.rootVue = app.component('br-app');
  } else if(_state.rootVue === false) {
    // do not mount root app (requested via `false` root vue)
    return false;
  }

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
