# bedrock-vue

[Vue][] frontend framework running on [Bedrock][].

## Bundling

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

[Bedrock]: https://github.com/digitalbazaar/bedrock
[DefinePlugin]: https://webpack.js.org/plugins/define-plugin/
[Vue Global Config]: https://vuejs.org/v2/api/#Global-Config
[Vue]: https://vuejs.org/
[webpack]: https://webpack.js.org/
