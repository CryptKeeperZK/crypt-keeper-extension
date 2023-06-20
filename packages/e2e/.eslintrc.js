const fs = require("fs");
const path = require("path");

const prettierConfig = fs.readFileSync(path.resolve("../../.prettierrc"), "utf8");
const prettierOptions = JSON.parse(prettierConfig);
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  extends: ["airbnb", "prettier", "plugin:import/recommended", "plugin:playwright/playwright-test"],
  ignorePatterns: [".eslintrc.js", "playwright.config.ts"],
  root: true,
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
    es2022: true,
  },
  plugins: ["json", "prettier", "unused-imports", "import"],
  parser: "@babel/eslint-parser",
  settings: {
    "import/resolver": {
      typescript: {},
      node: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        moduleDirectory: ["node_modules", "src", "e2e"],
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
      classes: true,
      impliedStrict: true,
    },
  },
  reportUnusedDisableDirectives: isProduction,
  rules: {
    "import/no-cycle": ["error"],
    "unused-imports/no-unused-imports": "error",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.ts"],
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
    "class-methods-use-this": "off",
    "prefer-promise-reject-errors": "off",
    "max-classes-per-file": "off",
    "no-use-before-define": ["off"],
    "no-shadow": "off",
    curly: ["error", "all"],
  },
  overrides: [
    {
      files: ["e2e/**/*.ts", "e2e/**/*.tsx"],
      rules: {
        "playwright/prefer-lowercase-title": "error",
        "playwright/prefer-to-be": "error",
        "playwright/prefer-to-have-length": "error",
        "playwright/prefer-strict-equal": "error",
        "playwright/max-nested-describe": ["error", { max: 1 }],
        "playwright/no-restricted-matchers": [
          "error",
          {
            toBeFalsy: "Use `toBe(false)` instead.",
            not: null,
          },
        ],
      },
    },

    {
      files: ["**/*.ts", "**/*.tsx"],
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
        "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "no-public" }],
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
              "test",
              "expect",
            ],
          },
        ],
      },
    },
  ],
};