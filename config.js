/*!
 * Vue frontend config.
 *
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// shared application config
// simple keys used for general purpose config
// package name keys for special purpose config grouping
export default {
  // common contact details
  contacts: {
    support: {
      email: null
    }
  },
  // initial page load http status string and code, if available
  http: {
    status: null,
    statusCode: null
  },
  ui: {
    // custom component names
    components: {
      'br-error-base': 'br-error-base'
    }
  }
};
