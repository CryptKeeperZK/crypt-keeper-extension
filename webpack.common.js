const CopyPlugin = require("copy-webpack-plugin");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const path = require("path");

dotenv.config({ path: "./.env" });

const envPlugin = new webpack.EnvironmentPlugin({
  NODE_ENV: "development",
  CRYPTKEEPER_DEBUG: false,
  INFURA_API_KEY: "",
  ALCHEMY_API_KEY: "",
  FREIGHT_TRUST_NETWORK: "",
  PULSECHAIN_API_KEY: "",
});

module.exports = {
  entry: {
    injected: path.join(__dirname, "src/contentScripts/injected.ts"),
    content: path.join(__dirname, "src/contentScripts/index.ts"),
    backgroundPage: path.join(__dirname, "src/background/backgroundPage.ts"),
    popup: path.join(__dirname, "src/ui/popup.tsx"),
  },
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "[name].js",
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
        { from: path.join(__dirname, "./src/static/icons/*"), to: path.join(__dirname, "./dist/[name][ext]") },
        {
          from: path.join(__dirname, "./src/manifest.json"),
          to: path.join(__dirname, "./dist/manifest.json"),
        },
        { from: path.join(__dirname, "./zkeyFiles"), to: path.join(__dirname, "./dist/js/zkeyFiles") },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "./src/popup.html"),
      filename: "../popup.html",
      chunks: ["popup"],
      minify: true,
    }),
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader",
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
