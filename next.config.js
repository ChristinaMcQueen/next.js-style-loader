const ExtractTextPlugin = require('extract-text-webpack-plugin');
const cssLoaderConfig = require('./config/css-loader-config');
const commonsChunkConfig = require('./config/commons-chunk-config');

module.exports = {
    webpack: (config, options) => {
        const {
            dev, isServer, defaultLoaders
        } = options;
        let { extractCSSPlugin } = options;
        if (!extractCSSPlugin) {
            extractCSSPlugin = new ExtractTextPlugin({
                filename: 'static/style.css'
            });
            config.plugins.push(extractCSSPlugin);
            options.extractCSSPlugin = extractCSSPlugin;
            if (!isServer) {
                // eslint-disable-next-line no-param-reassign
                config = commonsChunkConfig(config, /\.(css|less|styl(us)?|scss|sass)$/);
            }
            // const lessLoaderOptions = {};
            // const cssLoaderOptions = {};
            const cssModules = true;
            const cssLoaderOptions = {
                importLoaders: 1,
                localIdentName: '[local]___[hash:base64:5]'
            };
            options.defaultLoaders = Object.assign({}, defaultLoaders, {
                css: cssLoaderConfig(config, extractCSSPlugin, {
                    cssModules,
                    cssLoaderOptions,
                    dev,
                    isServer
                }),
                less: cssLoaderConfig(config, extractCSSPlugin, {
                    cssModules,
                    cssLoaderOptions,
                    dev,
                    isServer,
                    loaders: [
                        {
                            loader: 'less-loader',
                            options: cssLoaderOptions
                        }
                    ]
                }),
                stylus: cssLoaderConfig(config, extractCSSPlugin, {
                    cssModules,
                    cssLoaderOptions,
                    dev,
                    isServer,
                    loaders: [
                        {
                            loader: 'stylus-loader',
                            options: cssLoaderOptions
                        }
                    ]
                }),
                sass: cssLoaderConfig(config, extractCSSPlugin, {
                    cssModules,
                    cssLoaderOptions,
                    dev,
                    isServer,
                    loaders: [
                        {
                            loader: 'sass-loader',
                            options: cssLoaderOptions
                        }
                    ]
                })
            });

            config.module.rules.push({
                test: /\.css$/,
                exclude: /node_modules/,
                use: options.defaultLoaders.css
            }, {
                test: /\.less$/,
                exclude: /node_modules/,
                use: options.defaultLoaders.less
            }, {
                test: /\.styl(us)?$/,
                exclude: /node_modules/,
                use: options.defaultLoaders.stylus
            }, {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: options.defaultLoaders.sass
            }, {
                test: /\.sass$/,
                exclude: /node_modules/,
                use: options.defaultLoaders.sass
            });
        }
        return config;
    },
    webpackDevMiddleware: config => config,
    exportPathMap(defaultPathMap) {
        return {
            '/': { page: '/' },
            '/about': { page: '/about' },
            '/p/hello-nextjs': { page: '/post', query: { title: 'hello-nextjs' } },
            '/p/learn-nextjs': { page: '/post', query: { title: 'learn-nextjs' } },
            '/p/deploy-nextjs': { page: '/post', query: { title: 'deploy-nextjs' } }
        };
    }
};
