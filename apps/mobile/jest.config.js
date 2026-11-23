const preset = require("jest-expo/jest-preset");

module.exports = {
  ...preset,
  moduleNameMapper: {
    ...preset.moduleNameMapper,
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFiles: [...preset.setupFiles, "<rootDir>/jest.setup.ts"],
};
