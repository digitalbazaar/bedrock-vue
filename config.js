/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
// import shared web application config
import {config} from 'bedrock-web';

// simple keys used for general purpose config
// package name keys for special purpose config grouping
const vueConfig = {
  // common contact details
  contacts: {
    support: {
      email: null
    }
  },
  ui: {
    // custom component names
    components: {
      'br-error-base': 'br-error-base'
    }
  }
};

// expose vue config in main shared web app config under `vue`
config.vue = vueConfig;
export {vueConfig as config};
