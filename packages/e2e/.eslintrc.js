module.exports = {
  extends: ["@cryptkeeperzk/eslint-config-base", "plugin:playwright/playwright-test"],
  ignorePatterns: [".eslintrc.js", "playwright.config.ts"],
  settings: {
    react: {
      version: "18",
    },
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "import/no-extraneous-dependencies": ["off"],
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
  ],
};
