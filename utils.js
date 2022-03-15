/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import Vue from 'vue';

export function makeReactive({
  target, options: {
    addProperty = Vue.set,
    setProperty = defaultPropertySetter
  }
} = {}) {
  return new Proxy(target, createHandler({addProperty, setProperty}));
}

function createHandler({addProperty, setProperty}) {
  const map = new WeakMap();
  const handler = {
    get(target, key) {
      const value = target[key];
      if(typeof value === 'object' && value !== null) {
        let proxy = map.get(value);
        if(!proxy) {
          proxy = new Proxy(value, handler);
          map.set(value, proxy);
        }
        return proxy;
      }
      return value;
    },
    set(target, key, value) {
      if(!target.hasOwnProperty(key)) {
        addProperty(target, key, value);
      } else {
        setProperty(target, key, value);
      }
      return true;
    }
  };
  return handler;
}

function defaultPropertySetter(target, key, value) {
  target[key] = value;
}
