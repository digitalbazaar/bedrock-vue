module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'digitalbazaar',
    'digitalbazaar/jsdoc',
    'digitalbazaar/module',
    'digitalbazaar/vue'
  ],
  ignorePatterns: ['node_modules/']
};
