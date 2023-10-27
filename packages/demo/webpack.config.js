const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        }),
    ],
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
                use: ['style-loader', 'css-loader'],
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
    }
};

