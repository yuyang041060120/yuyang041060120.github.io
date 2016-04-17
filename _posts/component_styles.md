# Styles
通过styles属性可以给我们的组件添加css样式，例如给背景红色

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: '<div>App Component</div>',
    styles:[`
        div{
            background-color: red;
        }
    `]
})
export class AppComponent {}
```

> 注意这里我们没有使用单引号，而是反引号，这是ES6的新特性，方便在js当中换行和缩进，更便于阅读

然后给index.html添加一个div作为对比

*index.html*

```html
<div>Global Text</div>
<my-app>loading...</my-app>
```

然后打开浏览器，查看效果

![alt](images/component_styles/1.png)

只有组件内的div有背景色，对组件之外的div没有任何影响，我们打开控制台看下HTML结构

![alt](images/component_styles/2.png)

很明显Angular2将我们设置的样式处理之后append到了head中，而且给组件当中的模板添加了唯一的属性**_ngcontent-tvs-1**，所以只有组件的样式才会有效。如果我们想让styles设置的样式对组件之外的元素也生效，怎么办？

# Encapsulation
通过配置encapsulation属性可以限定组件styles和外部styles的范围，encapsulation的值主要有三种类型

```typescript
ViewEncapsulation.Emulated
ViewEncapsulation.Native
ViewEncapsulation.None
```

> 如果没有设置encapsulation的值，默认ViewEncapsulation.Emulated

### ViewEncapsulation.Emulated

> 组件设置的样式只对组件本身及其子组件有效，对组件之外的元素无效；组件外设置的样式可以对组件内的元素有效

组件设置的样式对组件之外的元素无效，从上面的例子可以看出来，那么组件外设置的样式可以对组件内的元素有效是什么意思呢，看下面的例子

*index.html*

我们在index.html的head中定义如下css样式

```html
<head>   
    <style>
        div {
            background-color: green;
        }
    </style>
</head>
<body>
<div>Global Text</div>
<my-app>loading...</my-app>
```

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: '<div>App Component</div>'
})
export class AppComponent {}
```

看下页面效果

![alt](images/component_styles/3.png)

> 简单点说，样式的流动是单向的，只能从组件外进入组件内

### ViewEncapsulation.Native

> 组件设置的样式只对组件本身及其子组件有效，对组件之外的元素无效；组件外设置的样式对组件内的元素也是无效

*index.html*

```html
<head>
    <style>
        div {
            background-color: green;
        }      
    </style>
</head>
<body>
<div>Global Div</div>
<p>Global P</p>
<my-app>loading...</my-app>
```

*app.ts*

```typescript
import {Component,ViewEncapsulation} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: '<div>Component Div</div><p>Component P</p>',
    styles:[`        
        p{
            background-color: blue;
        }
    `],
    encapsulation:ViewEncapsulation.Native
})
export class AppComponent {}
```

![alt](images/component_styles/4.png)

> 简单点说，样式的流动是封闭的

怎么实现的？利用了[Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)—能够封装js，css和模板，打开控制台查看Elements

![alt](images/component_styles/5.png)

### ViewEncapsulation.None

> 组件设置的样式对组件本身及其子组件有效，对组件之外的元素有效；组件外设置的样式对组件内的元素有效

*index.html*

```html
<head>
    <style>
        div {
            background-color: green;
        }      
    </style>
</head>
<body>
<div>Global Div</div>
<p>Global P</p>
<my-app>loading...</my-app>
```

```typescript
import {Component,ViewEncapsulation} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: '<div>Component Div</div><p>Component P</p>',
    styles:[`        
        p{
            background-color: blue;
        }
    `],
    encapsulation:ViewEncapsulation.None
})
export class AppComponent {}
```

![alt](images/component_styles/6.png)

> 简单点说，样式的流动是双向的

# StyleUrls
css文件分离

*app.css*

```css
p {
    background-color: blue;
}
```

*app.ts*

```typescript
import {Component, ViewEncapsulation} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: '<div>Component Div</div><p>Component P</p>',
    styleUrls: ['component_styles/app.css'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
}
```

[示例代码参考](https://github.com/yuyang041060120/yuyang041060120.github.io/tree/master/angular2/code/component_styles)