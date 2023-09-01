const path = require("path");

module.exports = {
  extends: ["@cryptkeeperzk/eslint-config-base"],
  ignorePatterns: [".eslintrc.js"],
  settings: {
    react: {
      version: "18",
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
  overrides: [
    {
      files: ["**/*.ts"],
      parserOptions: {
        project: [path.resolve("tsconfig.json")],
        warnOnUnsupportedTypeScriptVersion: true,
      },
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          {
            devDependencies: ["**/*.test.ts", "./src/setupTests.ts"],
          },
        ],
      },
    },
  ],
};
