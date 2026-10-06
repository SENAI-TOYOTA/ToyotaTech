const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

const localPlugin = {
  rules: {
    "no-comments": {
      meta: {
        type: "problem",
        docs: {
          description: "disallow comments",
        },
      },
      create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        return {
          Program() {
            for (const comment of sourceCode.getAllComments()) {
              const value = comment.value.trim();
              if (
                value.startsWith("eslint-disable") ||
                value.startsWith("eslint-enable") ||
                value.startsWith("global")
              ) {
                continue;
              }
              context.report({
                loc: comment.loc,
                message: "Comments are not allowed.",
              });
            }
          },
        };
      },
    },
  },
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".expo/**",
      "web-build/**",
      ".expo-shared/**",
      "expo-env.d.ts",
    ],
  },
  {
    plugins: {
      local: localPlugin,
    },
    rules: {
      "no-warning-comments": [
        "error",
        {
          terms: ["todo", "fixme", "xxx", "hack", "bug"],
          location: "anywhere",
        },
      ],
      "local/no-comments": "error",
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
      complexity: ["warn", 25],
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
      "react-hooks/static-components": "off",
      "max-depth": ["warn", 5],
      "max-lines-per-function": [
        "warn",
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    files: ["eslint.config.js", ".prettierrc.js"],
    rules: {},
  },
]);
