import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  "transform": {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }]
  },
  "silent": true,
  "testTimeout": 100000,
  "collectCoverage": true,
  "forceExit": true,
};
export default config;
