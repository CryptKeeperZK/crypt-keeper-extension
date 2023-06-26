module.exports = {
  testTimeout: 10000,
  transform: {
    "\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.tests.json" }],
  },
  testMatch: ["**/src/**/__tests__/**/*.[jt]s?(x)", "**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleFileExtensions: ["ts", "js", "tsx", "jsx"],
  coverageReporters: ["clover", "lcov", "json", "json-summary", "text", "text-summary"],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "/__tests__/"],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
