const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
};

module.exports = createJestConfig(customJestConfig);


