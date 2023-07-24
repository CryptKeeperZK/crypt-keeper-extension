const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const path = require("path");

const envPlugin = new Dotenv({
  path: "../../.env",
  safe: true,
  allowEmptyValues: true,
  systemvars: true,
});

const TARGET = process.env.TARGET || "chrome";
const MANIFEST_VERSION = process.env.MANIFEST_VERSION || "3";

module.exports = {
  entry: {
    injected: path.resolve(__dirname, "src/background/injectedScript.ts"),
    content: path.resolve(__dirname, "src/background/contentScript.ts"),
    backgroundPage: path.resolve(__dirname, "src/background/backgroundPage.ts"),
    offscreen: path.resolve(__dirname, "src/offscreen/index.ts"),
    popup: path.resolve(__dirname, "src/ui/popup.tsx"),
  },
  output: {
    path: path.resolve(__dirname, "dist/js"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    envPlugin,
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, "./src/static"), to: path.resolve(__dirname, "./dist") },
        {
          from: path.resolve(__dirname, `./src/manifest/v${MANIFEST_VERSION}/manifest.${TARGET}.json`),
          to: path.resolve(__dirname, "./dist/manifest.json"),
        },
        {
          from: path.resolve(__dirname, `../../privacy_policy.md`),
          to: path.resolve(__dirname, "./dist/privacy_policy.md"),
        },
        {
          from: path.resolve(__dirname, `../../LICENSE`),
          to: path.resolve(__dirname, "./dist"),
        },
        { from: path.resolve(__dirname, "../../zkeyFiles"), to: path.resolve(__dirname, "./dist/js/zkeyFiles") },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/popup.html"),
      filename: "../popup.html",
      chunks: ["popup"],
      minify: true,
    }),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        return /.*\/wordlists\/(?!english).*\.json/.test(resource);
      },
    }),
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.build.json",
          },
        },
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader", // Creates style nodes from JS strings
          },
          {
            loader: "css-loader", // Translates CSS into CommonJS
          },
          {
            loader: "sass-loader", // Compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".png", ".svg"],
    alias: {
      "@src": path.resolve(__dirname, "src/"),
      // snarkjs uses ejs which has unsafe-eval function constructor
      ejs: path.resolve(__dirname, "src/config/mock/ejsMock.js"),
      buffer: "buffer",
    },
    fallback: {
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      https: false,
      http: false,
      net: false,
      tls: false,
      path: false,
      os: false,
      fs: false,
      assert: false,
      zlib: false,
      constants: false,
    },
  },
};
