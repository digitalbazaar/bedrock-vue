/*!
 * Copyright 2019 - 2024 Digital Bazaar, Inc.
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

// import shared web application config
import {config} from '@bedrock/web';

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
