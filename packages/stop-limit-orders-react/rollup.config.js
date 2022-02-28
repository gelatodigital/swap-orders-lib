import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import image from "@rollup/plugin-image";
import scss from "rollup-plugin-scss";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import { visualizer } from "rollup-plugin-visualizer";

// this override is needed because Module format cjs does not support top-level await
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("./package.json");

const globals = {
  ...pkg.devDependencies,
};

const extensions = [".ts", ".js", ".tsx", "jsx"];

export default {
  input: "./src/index.tsx",
  output: [
    {
      file: pkg.main,
      exports: "named",
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "esm",
    },
    // {
    //   file: pkg.browser,
    //   name: "gelatoLimitOrders",
    //   format: "umd",
    // },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions,
      modulesOnly: true,
      jsnext: true,
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: ".",
    }),
    babel({
      babelHelpers: "bundled",
      include: ["src/**/*"],
      exclude: "node_modules/**",
      extensions,
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript",
      ],
      plugins: [
        "babel-plugin-styled-components",
        "macros",
        "babel-plugin-inline-react-svg",
      ],
    }),
    image(),
    scss(),
    json(),
    terser(),
    visualizer(),
  ],
  external: Object.keys(globals),
};
