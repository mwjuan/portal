externals-dependencies
==============================
> Easily exclude dependencies in Webpack

Webpack allows you to define [*externals*](https://webpack.github.io/docs/configuration.html#externals) - modules that should not be bundled.

When bundling with Webpack for the backend - you usually don't want to bundle its `node_modules` dependencies.
This library creates an *externals* function that ignores `node_modules` when bundling in Webpack.<br/>(Inspired by the great [Backend apps with Webpack](http://jlongster.com/Backend-Apps-with-Webpack--Part-I) series and [webpack-node-externals](https://github.com/liady/webpack-node-externals))

## Quick usage
```sh
npm install externals-dependencies --save-dev
```

In your `webpack.config.js`:
```js
var externalsDep = require('externals-dependencies');
...
module.exports = {
    ...
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    node: {
        console: true,
        global: true,
        process: true,
        Buffer: true,
        __filename: true,
        __dirname: true,
        setImmediate: true,
        path: true
    },
    externals: [externalsDep()], // in order to ignore all modules in node_modules folder
    ...
};
```
And that's it. Any node modules in dependencies will no longer be bundled but will be left as `require('module')`.

## Detailed overview
### Description
This library scans the modules those install with `--save`,and builds an externals function that tells Webpack not to bundle those modules, or any sub-modules of theirs. You need run `npm install` before you deploy your app.

### Configuration
This library accepts an `options` object.

#### `options(=[])`
You can parse transmit a array as parameter like this:

```js
    externals: nodeExternals(['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];)
```

All node modules will no longer be bundled but will be left as require('module').
