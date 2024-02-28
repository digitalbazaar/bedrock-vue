# bedrock-vue

[Vue][] frontend framework running on [Bedrock][].

## Bundling

TODO: This section needs to be updated for Vue 3 changes.

Special constants are available to setup the [Vue Global Config][] at bundle
time. If unset, the config values are left at their defaults.

- `VUE_DEVTOOLS`: [Vue.config.devtools](https://vuejs.org/v2/api/#devtools)
- `VUE_PERFORMANCE`: [Vue.config.performance](https://vuejs.org/v2/api/#performance)
- `VUE_PRODUCTIONTIP`: [Vue.config.productionTip](https://vuejs.org/v2/api/#productionTip)

When using the [webpack][] [DefinePlugin][], these can be directly set to a
JSON truthy value. A [Bedrock][] command line option can also be used:

```sh
node app.js --webpack-define VUE_PERFORMANCE=true
```

## Migration from Vue 2.x to 3.x

Some of the important architectural changes that are new in Vue 3.x include
the support for multiple Vue apps and a better conceptual separation of Vue
apps and Vue components.

These changes mean that there is not a single global application that is
built into the Vue library; instead, one or more Vue applications need to
be created via the Vue 3.x `createApp` API. Many of the changes listed in
this migration section are the result of this architectural difference.

### Do not call Vue.use(brVue)

Previously, users of this library needed register it as a plugin with
Vue. This must no longer be done.

### Call initialize() instead of setRootVue()

This library will automatically create a root Vue app instance, handling the
common boilerplate found in most Vue Web applications -- similar to how it
previously configured the global Vue app for Vue 2.x.

Previously, users would call `setRootVue()`, passing a function that would
return an instance of the `br-app` Vue component. The `br-app` Vue component
was the root Vue component and it doubled as the global root Vue App. Once
`setRootVue()` returned the `br-app` Vue component, the global root Vue App
would be mounted.

Now, users of this library must instead call `initialize` and pass a
`beforeMount` function in order to cause the root Vue app to mount. The
`beforeMount` function must return the root Vue component to be rendered in the
root Vue app (it may return it as a Promise if asynchronous behavior is
required).

Note that the returned Vue component is no longer an instance (do not call
the component as a constructor, which will now fail in Vue 3.x), and it is
no longer the `br-app` Vue component (or an override of it). This has been made
possible because the root Vue app and the root Vue component have been
separated. This enables this library to create the root Vue app and the
developer to provide the full root Vue component (customizing it however they
see fit).

If `initialize` is not called, the root Vue app will never be mounted,
mirroring similar behavior to calling `setRootVue(false)` in the older version.

The `initialize` function can be called at any time during the life of the
Web application (which is different from how `setRootVue` needed to be called
early or extra coordination was required to delay bedrock-web's `ready`
promise). It should, of course, generally still be called early to prevent any
flash of content or delay for the end user.

### Create your own BrApp (BrApp and other default components removed)

This library no longer needs to create the root Vue component, since it
can create the root Vue app separately. Therefore, users of this library now
have more freedom to customize the root Vue component. This also means that
the root Vue component they provide must include more elements in its template.
For example, if a developer wants router support, they must include the
`<router-view />` element -- and anything else, as there is no default
template nor is any root Vue component provided by this library. The Vue
component returned from `beforeMount` is the root Vue component.

So, in order to recreate the behavior that previous versions of library
provided, developers can add a `BrApp.vue` (or use any other name of their
choosing) root Vue component like this:

```html
<template>
  <br-root>
    <br-header />
    <router-view />
    <br-footer />
  </br-root>
</template>

<script>
export default {
  name: 'BrApp'
};
</script>

<style>
</style>
```

Then, it can be imported and returned from `beforeMount`:

```js
import {initialize} as brVue from '@bedrock/vue';
import BrApp from '../components/BrApp.vue';

initialize({
  async beforeMount({app}) {
    return BrApp;
  }
})
```

Note that any other components like `br-header` and `br-footer` (again,
different app-specific / library-specific names for these compnoents are
recommended now that these are no longer provided by this library) would
need to be defined by the developer as well.

### Import and create your router

Vue 3.x uses a new router. This router needs to be created via an imported
function now, instead of installing a Vue plugin and then using a constructor.

Previously:

```js
import {setRootVue} from '@bedrock/vue';
import VueRouter from 'vue-router';

setRootVue(async () => {
  const router = new VueRouter({
    mode: 'history',
    routes: []
  });

  const BrApp = Vue.component('br-app');
  return new BrApp({router});
});
```

Now:

```js
import {initialize, augmentRouter} from '@bedrock/vue';
import {createRouter, createWebHistory} from 'vue-router';
import MyApp from '../components/MyApp.vue';

initialize({
  async beforeMount({app}) {
    const router = createRouter({
      history: createWebHistory(),
      routes: []
    });
    // adds common functionality like "not found" route
    // and page title setter
    augmentRouter({app, router});
    app.use(router);

    return MyApp;
  }
})
```

## License

[Apache License, Version 2.0](LICENSE) Copyright 2011-2024 Digital Bazaar, Inc.

Additional Bedrock libraries are available for non-commercial use such as
self-study, research, personal projects, or for evaluation purposes. See the
[Bedrock Non-Commercial License v1.0](https://github.com/digitalbazaar/bedrock/LICENSES/LicenseRef-Bedrock-NC-1.0.txt)
for details.

Commercial licensing and support are available by contacting
[Digital Bazaar](https://digitalbazaar.com/) <support@digitalbazaar.com>.

[Bedrock]: https://github.com/digitalbazaar/bedrock
[DefinePlugin]: https://webpack.js.org/plugins/define-plugin/
[Vue Global Config]: https://vuejs.org/v2/api/#Global-Config
[Vue]: https://vuejs.org/
[webpack]: https://webpack.js.org/
