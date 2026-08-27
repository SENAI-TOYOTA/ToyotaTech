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
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/[\\u00E1\\u00E0\\u00E2\\u00E3\\u00E9\\u00E8\\u00EA\\u00ED\\u00EF\\u00F3\\u00F4\\u00F5\\u00F6\\u00FA\\u00E7\\u00F1\\u00C1\\u00C0\\u00C2\\u00C3\\u00C9\\u00C8\\u00CA\\u00CD\\u00CF\\u00D3\\u00D4\\u00D5\\u00D6\\u00DA\\u00C7\\u00D1]/]",
          message: "Use English only. Non-ASCII characters detected.",
        },
        {
          selector:
            "TemplateElement[value.raw=/[\\u00E1\\u00E0\\u00E2\\u00E3\\u00E9\\u00E8\\u00EA\\u00ED\\u00EF\\u00F3\\u00F4\\u00F5\\u00F6\\u00FA\\u00E7\\u00F1\\u00C1\\u00C0\\u00C2\\u00C3\\u00C9\\u00C8\\u00CA\\u00CD\\u00CF\\u00D3\\u00D4\\u00D5\\u00D6\\u00DA\\u00C7\\u00D1]/]",
          message: "Use English only. Non-ASCII characters detected.",
        },
        {
          selector:
            "JSXText[value=/[\\u00E1\\u00E0\\u00E2\\u00E3\\u00E9\\u00E8\\u00EA\\u00ED\\u00EF\\u00F3\\u00F4\\u00F5\\u00F6\\u00FA\\u00E7\\u00F1\\u00C1\\u00C0\\u00C2\\u00C3\\u00C9\\u00C8\\u00CA\\u00CD\\u00CF\\u00D3\\u00D4\\u00D5\\u00D6\\u00DA\\u00C7\\u00D1]/]",
          message: "Use English only. Non-ASCII characters detected.",
        },
      ],
      complexity: ["warn", 15],
      "max-depth": ["warn", 4],
      "max-lines-per-function": [
        "warn",
        {
          max: 80,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    files: ["eslint.config.js", ".prettierrc.js"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
]);
