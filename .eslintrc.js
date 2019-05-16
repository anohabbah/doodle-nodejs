module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true,
    'jest': true
  },
  'extends': ['eslint:recommended', 'google', 'plugin:prettier/recommended', 'prettier'],
  'plugins': ['prettier'],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
  },
  'rules': {
    'prettier/prettier': [
      'error',
      {singleQuote: true, semi: true, endOfLine: 'crlf'}
    ],
    'new-cap': ['error', {capIsNew: false}],
    'no-console': 'off'
  },
};
