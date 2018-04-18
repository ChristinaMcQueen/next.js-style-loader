# next.js-style-loaders

# Next.js 教程
🍭[zeit/next.js](https://github.com/zeit/next.js) || 🍭[learnnextjs.com](https://learnnextjs.com/basics/getting-started) 给出了相对比较完整的 Next.js 使用教程。

# 引入样式文件
刚刚接触 Next.js，还不是十分了解，第一个遇到的就是样式文件引入的问题，Next.js 支持样式文件引入，包括 `.css`、`.less`、`.styl`、`.scss`，如果仅需引入一种文件，可以 🍭[戳这里](https://github.com/zeit/next.js#importing-css--sass--less--stylus-files)或者下面列出的模块，亲测可以解决样式引入的问题

* [@zeit/next-css](https://github.com/zeit/next-plugins/tree/master/packages/next-css)
* [@zeit/next-sass](https://github.com/zeit/next-plugins/tree/master/packages/next-sass)
* [@zeit/next-less](https://github.com/zeit/next-plugins/tree/master/packages/next-less)
* [@zeit/next-stylus](https://github.com/zeit/next-plugins/tree/master/packages/next-stylus)

# 多种样式文件引入

由于项目是团队开发，每个人的代码习惯会有所不同，那么，如果想引入多种文件就比较麻烦。我将以上模块进行了合并：

`commons-chunk-config.js` 文件:

```javascript
module.exports = (config, test = /\.css$/) => {
    // Extend the default CommonsChunkPlugin config
    config.plugins = config.plugins.map((plugin) => {
        if (
            plugin.constructor.name === 'CommonsChunkPlugin' &&
            (plugin.filenameTemplate === 'commons.js' || plugin.filenameTemplate === 'main.js')
        ) {
            const defaultMinChunks = plugin.minChunks;
            plugin.minChunks = (module, count) => {
                // Move all styles to commons chunk so they can be extracted to a single file
                if (module.resource && module.resource.match(test)) {
                    return true;
                }
                // Use default minChunks function for non-style modules
                return defaultMinChunks(module, count);
            };
        }
        return plugin;
    });
    return config;
};
```

`css-loader-config.js` 文件:

```javascript
const findUp = require('find-up');
module.exports = (
    config,
    extractPlugin,
    {
        cssModules = false, cssLoaderOptions = {}, dev, isServer, loaders = []
    }
) => {
    const postcssConfig = findUp.sync('postcss.config.js', {
        cwd: config.context
    });
    let postcssLoader;
    if (postcssConfig) {
        postcssLoader = {
            loader: 'postcss-loader',
            options: {
                config: {
                    path: postcssConfig
                }
            }
        };
    }
    const cssLoader = {
        loader: isServer ? 'css-loader/locals' : 'css-loader',
        options: Object.assign(
            {},
            {
                modules: cssModules,
                minimize: !dev,
                sourceMap: dev,
                importLoaders: loaders.length + (postcssLoader ? 1 : 0)
            },
            cssLoaderOptions
        )
    };
    // When not using css modules we don't transpile on the server
    if (isServer && !cssLoader.options.modules) {
        return ['ignore-loader'];
    }
    // When on the server and using css modules we transpile the css
    if (isServer && cssLoader.options.modules) {
        return [cssLoader, postcssLoader, ...loaders].filter(Boolean);
    }
    return [
        dev && 'extracted-loader',
        ...extractPlugin.extract({
            use: [cssLoader, postcssLoader, ...loaders].filter(Boolean)
        })
    ].filter(Boolean);
};
```

`next.config.js` 文件:

```javascript
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const cssLoaderConfig = require('./css-loader-config');
const commonsChunkConfig = require('./commons-chunk-config');

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
                config = commonsChunkConfig(config, /\.(css|less|styl(us)?|scss|sass)$/);
            }
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
    }
};
```
