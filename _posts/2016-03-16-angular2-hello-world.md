---
layout:     post
title:      "Angular2 Hello World"
date:       2016-03-16 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/angular2-bg.png"
---
# 安装

## [angular2](https://github.com/angular/angular)

> npm install angular2 --save-dev

## [systemjs](https://github.com/systemjs/systemjs)
模块加载库，当然也可以使用别的，例如requirejs，我这里使用了官方推荐的systemjs

> npm install systemjs --save-dev

## [typescript](https://github.com/Microsoft/TypeScript)
angular2拥抱了微软开发的typescript语言，typescript是js的超集，最终是需要编译到js才能执行的

> npm install typescript --save-dev

# 目录
按照下面的结构新建文件

- src
    - app.ts
    - boot.ts
- node_modules
- index.html
- package.json

# 代码

## index.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Angular2 Hello World</title>
</head>
<body>

<my-app>loading...</my-app>

<script src="node_modules/systemjs/dist/system.js"></script>
<script src="node_modules/typescript/lib/typescript.js"></script>

<script src="node_modules/angular2/bundles/angular2-polyfills.js"></script>
<script src="node_modules/rxjs/bundles/Rx.js"></script>
<script src="node_modules/angular2/bundles/angular2.dev.js"></script>
<script>
    System.config({
        transpiler: 'typescript',
        typescriptOptions: { emitDecoratorMetadata: true },
        packages: {
            src: {
                defaultExtension: 'ts'
            }
        }
    });
    System.import('src/boot')
            .then(null, console.error.bind(console));
</script>
</body>
</html>
```

- systemjs是我们的模块管理库，查看官方文档了解更多的配置信息
- typescript用来实时编译我们的ts文件
- angular2-polyfills是对浏览器特性的拓展
- [rxjs](https://github.com/ReactiveX/rxjs)是angular2的依赖，用来处理异步的工作流
- angular2.dev是angular2的源代码

## app.ts
构建组件

```javascript
import {Component} from 'angular2/core';

@Component({
    selector:'my-app',
    template:'<div>Hello World</div>'
})
export class AppComponent{}
```

## boot.ts
启动入口

```javascript
import {bootstrap}    from 'angular2/platform/browser';
import {AppComponent} from './app';

bootstrap(AppComponent);    
```

最后在浏览器里打开index.html

> 注意是以服务器的形式打开

# 小结
为了学习和效率，上面的例子浏览器是直接加载的ts文件，然后通过typescript.js实时编译到js，我们修改的内容能够马上反应到浏览器上。
但是整个编译的过程是在浏览器端执行的，比较耗费时间和性能的，不建议在生产环境这么干。生产环境我们应该结合构建工具如webpack完成离线编译。