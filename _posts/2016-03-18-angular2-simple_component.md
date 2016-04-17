---
layout:     post
title:      "Angular2 Simple Component"
date:       2016-03-18 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/angular2-component-bg.png"
---
# 组件
Web Component是未来web开发的趋势，在Angular2的开发当中，我们大部分的时间都是在编写组件,下面来实现一个简单的组件，目录结构如下：

- src
    - app.ts
    - app.html
    - boot.ts
- node_modules
- index.html
- package.json

如何搭建Angular2的开发环境，可参考[Angular2 Hello World](/2016/03/16/angular2-hello-world/)。

# @Component
在Angular1的程序当中，我们想要使用controller，得通过这样的方式声明

```javascript
angular.module('myApp', [])
    .controller('MainCtrl', function ($scope) {
        //todo
    });
```
同样的，如果我们想要在Angular2中使用组件首先需要声明一个组件，Angular2采用了`@Component`的方式声明组件，深入了解你会发现Angular2的绝大部分功能都是通过Decorator声明的，`@`装饰器是ES7的新特性，可以用来修改类及其方法的行为。typescript支持大部分的ES6/7特性，例如import和export，基本的内容请自行学习。
首先引入Component

```javascript
import {Component} from 'angular2/core';
```

然后来声明我们的组件

```javascript
@Component({
    selector:'my-app',
    template:'<div>{% raw %}{{title}}{% endraw %}</div>'
})
export class AppComponent{
    title:string = 'App Component';
}
```

## selector
声明的组件调用方式，让我们在HTML当中可以使用我们的组件，例如

```html
<my-app></my-app>
```

> 不同于Angular1，组件不能这样使用

```html
<div my-app></div>
```

## template
模板字符串，渲染到浏览器当中的真实HTML结构

## class AppComponent
我们要明白代码的主体是类`AppComponent`，而不是@Component，@Component只是一种单纯的声明方式，告诉Angular2类AppComponent是一个组件了。新手有时候还会犯下面的错：

```javascript
@Component({
    selector:'my-app',
    template:'<div>{% raw %}{{title}}{% endraw %}</div>'
});
export class AppComponent{
    title:string = 'App Component';
}
```

在@Component和class之间添加了`;`，误以为@Component()是一个方法调用。

## {% raw %}{{title}}{% endraw %}

```javascript
title:string = 'App Component';
```

我们在类AppComponent当中声明了一个属性title，我们可以在模板当中使用`{% raw %}{{ }}{% endraw %}`表达式，类似于Angular1当中的`$scope`,这样就可以将组件的数据或者方法同模板的展示或交互关联起来。

# bootstrap
声明完组件，让我们来初始化

```javascript
import {bootstrap}    from 'angular2/platform/browser';
import {AppComponent} from './app';

bootstrap(AppComponent);
```

在index.html当中引入需要的类库，然后再body当中调用我们的组件

```html
<body>

<my-app>loading...</my-app>

...include script
```

打开浏览器查看效果

# templateUrl
真实开发的环境中，模板的内容都是大量的，放在js当中不利于阅读和维护，我们可以使用templateUrl属性，将模板剥离成单独的HTML文件

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    templateUrl: 'src/app.html'
})
export class AppComponent {
    title:string = 'App Component';
}
```

*src/app.html*

```html
<div>{% raw %}{{title}}{% endraw %}</div>
```

# 小结
通过上面的例子，我们大概知道Angular2的启动模式是这样的

1. 通过@Component声明组件
2. index.html当中调用组件的selector
3. 调用bootstrap初始化