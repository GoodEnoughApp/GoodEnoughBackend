module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  extends: ['airbnb-base', 'prettier'],
  env: {
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  plugins: ['jest'],
  rules: {
    camelcase: ['error', { properties: 'never', ignoreDestructuring: true }],
  },
};
