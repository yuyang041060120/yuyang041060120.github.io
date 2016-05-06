---
layout:     post
title:      "Webpack DefinePlugin And ProvidePlugin"
date:       2016-05-05 11:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/webpack-defineplugin-and-provideplugin.jpg"
---

# DefinePlugin

通过DefinePlugin可以定义一些全局的变量，我们可以在模块当中直接使用这些变量，无需作任何声明，看一个简单的webpack配置

```javascript
var webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/app'
    },
    output: {
        path: 'dist',
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            DESCRIPTION: 'This Is The Test Text.'
        })
    ]
};
```

入口*app.js*

```javascript
console.log(DESCRIPTION);
```

编译后的*bundle.js*

```javascript
console.log((This Is The Test Text.));
```

DefinePlugin直接将内容替换了，而不是变成一个字符串，很明显这是不正确的，这个时候我们需要对DESCRIPTION作一些额外处理，变成下面这样

```javascript
'"This Is The Test Text."'
```

这个时候输出就正常了

```javascript
console.log(("This Is The Test Text."));
```

除了写成上述的形式，我们一般多采用这种写法

```javascript
JSON.stringify('This Is The Test Text.')
```

看完string类型的替换，继续看看其它的类型

```javascript
new webpack.DefinePlugin({
    DESCRIPTION: JSON.stringify('This Is The Test Text.'),
    HAS_COMPANY: true,
    COUNT: 100,
    ARRAY: JSON.stringify([1, 2, 3]),
    OBJ: JSON.stringify({name: 'xxx'})
})
```

编译后的*bundle.js*

```javascript
console.log(("This Is The Test Text."));
console.log((true));
console.log((100));
console.log(([1,2,3]));
console.log(({"name":"xxx"}));
```

均输出正常。请不要在意输出当中多出的`()`，这对结果没有任何影响。说完了DefinePlugin的使用方式，那么它的实用价值在哪？
DefinePlugin通过定义不同的变量值，使我们在开发和发布的时候执行不同的代码。例如一个典型的变量`process.env.NODE_ENV`

```javascript
new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
})
```

开发的时候开启debug功能，发布的时候关闭

```javascript
if('development' === process.env.NODE_ENV){
    app.enableDebug(true);
}else{
    app.enableDebug(false);
}
```

> DefinePlugin主要是实现开发和发布的不同处理

# ProvidePlugin

ProvidePlugin可以让我们无需引入的情况下，以全局的模式直接使用模块变量。例如我们在*app.js*当中不引入jquery，直接使用`$`

```javascript
var $btn = $('#btn');
```

打开页面的时候控制台报错了

```
Uncaught ReferenceError: $ is not defined
```

因为没有引入的声明，webpack不会把jquery打包进bundle.js，现在我们添加ProvidePlugin配置

```javascript
new webpack.ProvidePlugin({
    '$': 'jquery'
})
```

重新编译，可以正常工作了，打开bundle.js你会发现jquery也被打包进来了，尽管我们没有任何引入jquery的声明。

> 不引入直接使用变量是一种很不好的编码习惯，ProvidePlugin的作用是帮我们HACK一些不规范的模块。

在举一个有实际意义的例子

*webpack.config.js*

```javascript
var webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/app',
        vendor: './src/vendor'
    },
    output: {
        path: 'dist',
        filename: 'bundle.js'
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.jsx', '.js'],
        alias: {
            'react': 'node_modules/react/react.js',
            'react-dom': 'node_modules/react/lib/ReactDOM.js'
        }
    },
    module: {
        loaders: [
            {
                test: /\.(jsx|js)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor'],
            filename: '[name].js'
        })
    ]
};
```

*vendor.jsx*

```javascript
import 'react';
import 'react-dom';
```

*app.jsx*

```javascript
import {Component} from 'react';
import ReactDOM    from 'react-dom';

class AppComponent extends Component {
    render() {
        return <h1>App Component</h1>;
    }
}

ReactDOM.render(
    <AppComponent />,
    document.getElementById('app')
);
```

OK，上述的主要功能是将`react`和`react-dom`单独打包成`vendor.js`，我们自己编写的代码打包成`bundle.js`。第三方类库和业务代码的分离，没毛病！
但是打开页面控制台报错了

```
Uncaught ReferenceError: React is not defined
```

报错信息来自编译后的`bundle.js`的这行

```javascript
_reactDom2.default.render(React.createElement(AppComponent, null), document.getElementById('app'));
```

相信大家已经发现问题所在了，jsx转化成js的时候调用了`React.createElement(...)`，但是我们在`app.jsx`当中并没有引入React，怎么办？
dirty的做法当然是加上React的引用

```javascript
import React,{Component} from 'react';
```

import说了，这个锅我不背！相信大家也不愿意写这种多余的代码，这个时候使用ProvidePlugin就能完美解决问题！

```javascript
new webpack.ProvidePlugin({
    'React': 'react'
})
```