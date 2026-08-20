import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/dist/**", "**/.expo/**", "**/android/**", "**/ios/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // metro.config.js / babel.config.js are CommonJS and run in Node, not on-device.
    files: ["**/*.config.js", "**/*.cjs"],
    languageOptions: { sourceType: "commonjs", globals: globals.node },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  prettier,
);
