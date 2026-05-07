import { formatter } from "@lingui/format-po";

const config = {
  locales: ["zh", "en"],
  sourceLocale: "zh",
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: formatter({ lineNumbers: false }),
};

export default config;
