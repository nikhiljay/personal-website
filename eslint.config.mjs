import next from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },
  ...next,
  {
    // `eslint-plugin-react-hooks` v6 (bundled with eslint-config-next 16) promotes
    // the new React Compiler rules below to `error`. They flag idiomatic, working
    // patterns already used across this codebase (e.g. syncing external state via
    // `setState` in an effect, and the "latest callback" ref pattern). Keep them as
    // warnings so they stay visible without failing lint on established code.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default eslintConfig;
