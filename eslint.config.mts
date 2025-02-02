// See https://eslint.org/docs/latest/use/configure/configuration-files for more about configuration files.

import babelParser from "@babel/eslint-parser";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";
// @ts-ignore
import _import from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const config = [
    {
        ignores: ["node_modules", "dist", ".next", ".vercel", "package-lock.json"],
    },

    ...fixupConfigRules(
        compat.extends(
            "eslint:recommended",
            "next/core-web-vitals",
            "next/typescript",
            "plugin:import/errors",
            "plugin:jsx-a11y/recommended",
            "plugin:tailwindcss/recommended",
            "plugin:prettier/recommended"
        )
    ),

    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.node,
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },
    },

    {
        files: ["**/*.js", "**/*.jsx"],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
            },
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.node,
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },
    },

    {
        plugins: {
            "@typescript-eslint": fixupPluginRules(typescriptEslint as unknown as Linter),
            import: fixupPluginRules(_import),
            prettier: fixupPluginRules(prettier),
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.node,
            },
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            indent: ["warn", 4],
            quotes: ["warn", "double"],
            "no-unused-vars": "warn",
            "no-console": "off",
            "jsx-a11y/no-autofocus": "off",
            "import/no-extraneous-dependencies": "off",
            "tailwindcss/no-custom-classname": "off",
            "class-methods-use-this": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "prettier/prettier": ["error", { endOfLine: "auto" }],
        },
    },
] satisfies Linter.Config[];

export default config;
