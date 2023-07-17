module.exports = {
  extends: ['airbnb-typescript/base', "plugin:@typescript-eslint/recommended", "plugin:import/recommended", "plugin:import/typescript"],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    semi: ["warn", "never"],
    "import/extensions": ["warn", "never"],
    "@typescript-eslint/semi": ["warn", "never"],
    "indent": ["warn", 2]
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],

      },
    },
    "import/extensions": [
      ".js",
      ".jsx",
      ".ts",
      ".tsx"
    ]
  }
};