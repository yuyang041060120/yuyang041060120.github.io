# 安装
### angular2

> npm install angular2

### [systemjs](https://github.com/systemjs/systemjs)
模块加载库，当然也可以使用别的，例如requirejs

> npm install systemjs

### [typescript](https://github.com/Microsoft/TypeScript)
angular2依赖于微软开发的typescript语言，typescript是js的超集，最终是需要编译到js才能执行的。
为了开发效率，浏览器端是直接加载的ts文件，然后通过ts的脚本实时编译到js，我们修改的内容能够马上反应到浏览器上。
但是编译的过程是比较耗费时间和性能的，不建议在生产环境这么干。生产中我们应该结合构建工具完成离线编译。

> npm install typescript

# 目录
按照下面的结构新建文件

- hello_world
    - app.ts
    - bootstrap.ts
- node_modules
- index.html

# 内容
### index.html

    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Angular2</title>
    </head>
    <body>
    
    <my-component>
        loading...
    </my-component>
    
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
                hello_world: {
                    defaultExtension: 'ts'
                }
            }
        });
        System.import('hello_world/bootstrap')
                .then(null, console.error.bind(console));
    </script>
    </body>
    </html>

- systemjs是我们的模块管理库
- typescript用来实时编译我们的ts文件
- angular2-polyfills是对浏览器特性的拓展
- rxjs是angular2的依赖
- angular2.dev是angular2的源代码

### app.ts
声明一个组件，注意selector和index.html里body标签下面的内容，试着删除index.html里的<my-component>看看控制台会不会报错

    import {Component} from 'angular2/core';
    
    @Component({
        selector:'my-component',
        template:'<div>Hello World</div>'
    })
    export class AppComponent{}
    
### bootstrap.ts
启动项，在index.html里System.import('hello_world/bootstrap')可以看到

    import {bootstrap}    from 'angular2/platform/browser';
    import {AppComponent} from './app';
    
    bootstrap(AppComponent);    

最后在浏览器里打开index.html，看看最终效果
# 小结
整体来说启动一个angular2的程序还是比较繁琐的，特别是和typescript结合，增加了额外的学习成本。

[示例例代码参考](https://github.com/yuyang041060120/yuyang041060120.github.io/tree/master/angular2/code)