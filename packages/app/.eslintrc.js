const path = require("path");

module.exports = {
  extends: ["@cryptkeeper/eslint-config-react"],
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
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        project: [path.resolve("tsconfig.json")],
        warnOnUnsupportedTypeScriptVersion: true,
      },
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          {
            devDependencies: ["**/*.test.ts", "**/*.test.tsx", "**/server/*.ts", "./src/setupTests.ts"],
          },
        ],
      },
    },
  ],
};
