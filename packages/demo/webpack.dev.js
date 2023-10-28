const { merge } = require("webpack-merge");
const path = require("path");

const common = require("./webpack.config");

module.exports = merge(common, {
  mode: "development",
  devtool: "cheap-module-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 4000,
    hot: true, // Enable Hot Module Replacement (HMR)
  },
});
