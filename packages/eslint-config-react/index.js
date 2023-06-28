module.exports = {
  extends: ["@cryptkeeperzk/eslint-config-base", "plugin:react/recommended"],
  plugins: ["react-hooks"],
  settings: {
    react: {
      version: "18",
    },
  },
  rules: {
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
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/label-has-for": "off",
    "react/require-default-props": [
      "error",
      {
        functions: "defaultArguments",
      },
    ],
    "react/no-unused-prop-types": "error",
    "react/function-component-definition": ["error", { namedComponents: ["arrow-function"] }],
  },
};
