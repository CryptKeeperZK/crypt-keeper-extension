const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { merge } = require("webpack-merge");
const TerserPlugin = require('terser-webpack-plugin');

const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        popupVendor: {
          maxSize: 4000000,
          test: /[\\/]node_modules[\\/]/,
          name: "popup-vendor",
          enforce: true,
          chunks: (chunk) => {
            return chunk.name === "popup";
          }
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
          },
        },
      }),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.svgoMinify,
          options: {
            encodeOptions: {
              multipass: true,
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      }),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              jpeg: {
                quality: 100,
              },
              webp: {
                lossless: true,
              },
              avif: {
                lossless: true,
              },
              // by default 100% quality
              png: {},
              // by default 100% quality
              gif: {},
            },
          },
        },
      }),
    ],
  },
});
