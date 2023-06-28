module.exports = {
  preset: "../../jest-preset.js",
  displayName: "@cryptkeeperzk/zk",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    nanoid: "<rootDir>/src/config/mock/nanoidMock.js",
    "@src/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["ts", "js"],
  collectCoverageFrom: ["src/**/*.{ts,js}"],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "/__tests__/", "./src/index.ts"],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
