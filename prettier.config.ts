// See https://prettier.io/docs/configuration for more about configuration files.

import type { Config } from "prettier";

const config = {
    trailingComma: "es5",
    printWidth: 120,
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    plugins: ["prettier-plugin-tailwindcss"],
} satisfies Config;

export default config;
