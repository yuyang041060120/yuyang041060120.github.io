# 组件
Web Component是未来web开发的趋势，在Angular2的开发当中，我们大部分的时间都是在编写Component,下面来实现一个简单的组件
# @Component
Decorator是ES6的新特性，可以用来修改类的行为，使用Decorator可以大大简化我们的代码，提高可读性，Angular2使用了大量的Decorator，例如@Component,
首先引入Component，import和export也是ES6的新特性

*app.ts*

```
import {Component} from 'angular2/core';
```

然后来声明我们的组件

```
@Component({
    selector:'my-app',
    template:'<div>{{title}}</div>'
})
export class AppComponent{
    title:string = 'App Component';
}
```

#### selector
组件声明，让我们在HTML当中可以使用我们的组件，例如

```
<my-app></my-app>
```

> 不同于Angular1，Angular2的组件和指令是两个不同的概念，所以不能这样使用组件<div my-app></div>

#### template
模板字符串，用来替换的HTML内容，最后渲染到浏览器的是我们的template

#### Class AppComponent
上面说过了Decorator可以用来修饰类，所以@Component({...})主要是来修饰我们类AppComponent，将它声明成一个Component Class，类的内部定义了一个title属性

```
title:string = 'App Component';
```

这种是TypeScript的写法，指定title的类型是一个字符类型，template当中的**{{title}}**是Angular2的模板语法，通过@Component({...})可以将类的属性和方法同模板的内容和行为关联起来，最终呈现渲染后的结果给用户

# bootstrap
声明完组件，让我们来初始化

*bootstrap.ts*

```
import {bootstrap}    from 'angular2/platform/browser';
import {AppComponent} from './app';

bootstrap(AppComponent);
```

在HTML当中引入需要的类库，然后再body当中调用我们的组件

*index.html*

```
<body>

<my-app>
    loading...
</my-app>

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
            simple_component: {
                defaultExtension: 'ts'
            }
        }
    });
    System.import('simple_component/bootstrap')
            .then(null, console.error.bind(console));
</script>
```

# templateUrl
真实开发的环境中，模板的内容都是大量的，放在js当中不利于阅读和维护，我们可以使用templateUrl属性，将模板剥离成单独的HTML文件

*app.ts*

```
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    templateUrl: 'simple_component/app.html'
})
export class AppComponent {
    title:string = 'App Component';
}
```

*app.html*

```
<div>{{title}}</div>
```

[示例例代码参考](https://github.com/yuyang041060120/yuyang041060120.github.io/tree/master/angular2/code)