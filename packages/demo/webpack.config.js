const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const glob = require("glob");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: __dirname + "/src/components/**/docs/*.+(ts|md)",
          to: path.resolve(__dirname, "./public/docs"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".png", ".svg"],
    alias: { "@src": path.resolve(__dirname, "src/") },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.build.json",
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
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
};
