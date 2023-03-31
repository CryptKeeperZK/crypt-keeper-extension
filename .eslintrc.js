const fs = require("fs");
const path = require("path");

const prettierConfig = fs.readFileSync(path.resolve(".prettierrc"), "utf8");
const prettierOptions = JSON.parse(prettierConfig);
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  extends: ["airbnb", "prettier", "plugin:react/recommended", "plugin:import/recommended"],
  ignorePatterns: [".eslintrc.js", "commitlint.config.js", "webpack.*.js", "demo/index.tsx"],
  root: true,
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
    es2022: true,
  },
  plugins: ["json", "prettier", "react-hooks", "unused-imports", "import"],
  parser: "@babel/eslint-parser",
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {},
      node: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        moduleDirectory: ["node_modules", "src"],
      },
    },
  },
  parserOptions: {
    project: path.resolve("tsconfig.json"),
    sourceType: "module",
    typescript: true,
    ecmaVersion: 2022,
    experimentalDecorators: true,
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true,
      classes: true,
      impliedStrict: true,
    },
  },
  reportUnusedDisableDirectives: isProduction,
  rules: {
    "import/no-cycle": ["error"],
    "unused-imports/no-unused-imports": "error",
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".tsx", ".jsx", ".js"],
      },
    ],
    "react/jsx-sort-props": [
      "error",
      {
        callbacksLast: true,
        shorthandFirst: true,
        ignoreCase: true,
        reservedFirst: true,
      },
    ],
    "react/sort-prop-types": [
      "error",
      {
        callbacksLast: true,
      },
    ],
    "react/react-in-jsx-scope": "off",
    "react/jsx-boolean-value": "error",
    "react/jsx-handler-names": "error",
    "react/prop-types": "error",
    "react/jsx-no-bind": "error",
    "react-hooks/rules-of-hooks": "error",
    "react/no-array-index-key": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    "react/jsx-props-no-spreading": "off",
    "react/forbid-prop-types": "off",
    "react/state-in-constructor": "off",
    "react/jsx-fragments": "off",
    "react/static-property-placement": ["off"],
    "react/jsx-newline": ["error", { prevent: false }],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.ts",
          "**/*.test.tsx",
          "**/setupTests.ts",
          "webpack.**.js",
          "**/server/mockMerkleProof.ts",
          "jest.config.js",
        ],
      },
    ],
    "no-debugger": isProduction ? "error" : "off",
    "no-console": "error",
    "no-underscore-dangle": "error",
    "no-redeclare": ["error", { builtinGlobals: true }],
    "import/order": [
      "error",
      {
        groups: ["external", "builtin", "internal", "type", "parent", "sibling", "index", "object"],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        warnOnUnassignedImports: true,
        "newlines-between": "always",
      },
    ],
    "prettier/prettier": ["error", prettierOptions],
    "import/prefer-default-export": "off",
    "import/extensions": ["error", { json: "always" }],
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/label-has-for": "off",
    "class-methods-use-this": "off",
    "prefer-promise-reject-errors": "off",
    "max-classes-per-file": "off",
    "react/require-default-props": [
      "error",
      {
        functions: "defaultArguments",
      },
    ],
    "react/no-unused-prop-types": "error",
    "react/function-component-definition": ["error", { namedComponents: ["arrow-function"] }],
    "no-use-before-define": ["off"],
    "no-shadow": "off",
  },
  overrides: [
    {
      files: ["src/**/*.ts", "src/**/*.tsx"],
      parser: "@typescript-eslint/parser",
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/typescript",
      ],
      plugins: ["@typescript-eslint", "prettier"],
      parserOptions: {
        project: ["./tsconfig.json"],
        warnOnUnsupportedTypeScriptVersion: true,
      },
      rules: {
        "@typescript-eslint/explicit-member-accessibility": ["error"],
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-use-before-define": ["error", { functions: false, classes: false }],
        "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
        "@typescript-eslint/no-shadow": [
          "error",
          {
            builtinGlobals: true,
            allow: [
              "postMessage",
              "pushMessage",
              "location",
              "event",
              "history",
              "name",
              "status",
              "History",
              "Selection",
              "Text",
              "Option",
              "screen",
            ],
          },
        ],
      },
    },
  ],
};
