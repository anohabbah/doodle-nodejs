module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true,
    'jest': true
  },
  'extends': ['eslint:recommended', 'google', 'plugin:prettier/recommended'],
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
    'no-console': 'off',
    'max-len': [2, { code: 180, tabWidth: 2 }],
    eqeqeq: [2, 'always']
  },
};
