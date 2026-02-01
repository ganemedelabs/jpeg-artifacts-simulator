// See https://eslint.org/docs/latest/use/configure/configuration-files for more about configuration files.

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
    {
        rules: {
            quotes: "off",
            indent: "off",
            "no-unused-vars": "warn",
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
]);

export default eslintConfig;
