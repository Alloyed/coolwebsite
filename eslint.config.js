import eslintJs from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type import('eslint').Linter.FlatConfig */
const userConfig = {
  // Add app-specific configuration here!
  rules: {
    "no-undef": "off",
  },
};

/** @type import('eslint').Linter.FlatConfig */
const typescriptConfig = {
  files: ["*.ts", "**/*.ts"],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
  plugins: {
    "@typescript-eslint": typescriptPlugin,
  },
  rules: {
    ...typescriptPlugin.configs.recommended.rules,
  },
};

export default [
  eslintJs.configs.recommended,
  typescriptConfig,
  eslintConfigPrettier,
  userConfig,
];
