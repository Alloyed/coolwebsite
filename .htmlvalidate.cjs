// https://html-validate.org/usage/index.html
module.exports = {
  root: true,
  extends: [
    // https://html-validate.org/rules/presets.html
    "html-validate:recommended",
    "html-validate:document",
    "html-validate:prettier",
  ],
  elements: ["html5"],
  rules: {
    "require-sri": ["warn", { target: "crossorigin" }],
  },
};
