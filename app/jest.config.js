/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@public/(.*)$": "<rootDir>/public/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
  ],
  // Ratcheted thresholds — just below current coverage so any regression
  // fails CI. Raise these as more tests are added (never lower them).
  //
  // 2026-09-08: backup.controller.ts went from 0% to fully covered, so the
  // TODO that justified the earlier drop is discharged. The global bar only
  // moves 15 -> 16 on lines/statements rather than jumping, because a
  // path-specific threshold REMOVES those files from the "global" group —
  // these numbers describe everything EXCEPT src/modules/backup, which is
  // held to its own much higher floor below.
  coverageThreshold: {
    global: {
      branches: 9,
      functions: 12,
      lines: 16,
      statements: 16,
    },
    // The backup module handles database dumps and shells out to psql, so it
    // gets its own floor rather than being allowed to hide behind the (much
    // lower) global average.
    "./src/modules/backup/": {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};