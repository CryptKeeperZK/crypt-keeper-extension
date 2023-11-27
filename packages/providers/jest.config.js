module.exports = {
  preset: "../../jest-preset.js",
  displayName: "@cryptkeeperzk/providers",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "@src/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["ts", "js"],
  collectCoverageFrom: ["src/**/*.{ts,js}"],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "/__tests__/", "./src/index.ts"],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
};
