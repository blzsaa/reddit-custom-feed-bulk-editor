/* eslint-env node */
const fs = require("fs");
const IN_PRODUCTION = process.env.NODE_ENV === "production";

function primeVueComponents() {
  const mainTs = fs.readFileSync("./src/main.ts", "utf-8");
  return mainTs
    .split("\n")
    .filter((line) => line.includes('from "primevue'))
    .map((line) => line.split(" ")[3].slice(1, -2))
    .map((line) => `./node_modules/${line}/**/*.js`);
}

module.exports = {
  plugins: [
    IN_PRODUCTION &&
      require("@fullhuman/postcss-purgecss")({
        content: [
          `./public/**/*.html`,
          `./src/**/*.vue`,
          ...primeVueComponents(),
        ],
        defaultExtractor(content) {
          const contentWithoutStyleBlocks = content.replace(
            /<style[^]+?<\/style>/gi,
            ""
          );
          return (
            contentWithoutStyleBlocks.match(
              /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g
            ) || []
          );
        },
        safelist: [
          /-(leave|enter|appear)(|-(to|from|active))$/,
          /^(?!(|.*?:)cursor-move).+-move$/,
          /^router-link(|-exact)-active$/,
          /data-v-.*/,
        ],
      }),
  ],
};
