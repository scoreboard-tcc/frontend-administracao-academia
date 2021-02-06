module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:react/recommended',
    "plugin:react-hooks/recommended",
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    "react/forbid-prop-types": "off",
    "react/prop-types": "off"
  },
  "settings": {
    "import/resolver": {
      "node": {
        "paths": ["src"]
      }
    },
  },
};
