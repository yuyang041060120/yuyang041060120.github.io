---
layout:     post
title:      "Angular2 Component Interactive"
date:       2016-03-22 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/angular2-component-interactive/bg.jpg"
---

通过表达式和Angular2的内置指令，我们可以通过组件展示数据。下面我们来给组件添加一些交互行为，例如点击按钮可以给div添加背景色

*app.ts*

```javascript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [style.backgroundColor]="backgroundColor">App Component</div>
        <button (click)="addBgColor()">添加背景色</button>
    `
})
export class AppComponent {
    backgroundColor:string;

    addBgColor() {
        this.backgroundColor = 'red';
    }
}
```

打开浏览器看下效果

![alt](/img/angular2-component-interactive/1.gif)

功能很简单，但是这里出现了两个重要的绑定

# single style binding
通过[style.style-property]可以实现HTML style单个属性的绑定，需要注意的是，右边千万不要写成下面的形式

```html
<div [style.backgroundColor]="{% raw %}{{backgroundColor}}{% endraw %}">App Component</div>
```
> 像这种用`[]`进行的绑定的值就是表达式，不需要使用`{% raw %}{{}}{% endraw %}`

# event binding
通过`(event)`的写法就是事件绑定，需要注意的右边方法需要写成执行的形式，千万不要忘了括号`()`，例如下面的写法就是错误的

```html
<button (click)="addBgColor">添加背景色</button>
```

event binding也可以写成如下形式on-event的形式

```html
<button on-click="addBgColor()">添加背景色</button>
```

# $event
通过添加$event参数我们可以获取到原生的事件对象，我们试着点击的时候改变按钮的文字

*app.ts*

```javascript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [style.backgroundColor]="backgroundColor">App Component</div>
        <button on-click="addBgColor($event)">添加背景色</button>
    `
})
export class AppComponent {
    backgroundColor:string;

    addBgColor(e) {
        this.backgroundColor = 'red';
        e.target.textContent = '文字改变了';
    }
}
```

![alt](/img/angular2-component-interactive/2.gif)

> 我们应该通过改变数据去更新UI，而不是直接操作DOM，上面只是一个$event的示例，真实中千万别这么干