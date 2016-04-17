通过表达式和内置指令，我们可以通过组件展示数据。下面我们来给组件添加一些交互行为，点击按钮可以给div添加背景色

*app.ts*

```typescript
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

*index.html*

```html
<my-app>loading...</my-app>
```

打开浏览器看下效果

![alt](images/component_interactive/1.gif)

功能很简单，但是这里出现了两个重要的绑定

### style binding
通过[style.style-property]可以实现HTML style的动态改变，需要注意的是，右边千万不要写成下面的形式

```html
<div [style.backgroundColor]="{{backgroundColor}}">App Component</div>
```
> 像这种用[]进行的绑定的值就是表达式

### event binding
通过(event)加事件名称的写法就是事件绑定，需要注意的右边方法需要写成执行的形式，千万不要写成如下形式

```html
<button (click)="addBgColor">添加背景色</button>
```

event binding也可以写成如下形式on-event的形式

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [style.backgroundColor]="backgroundColor">App Component</div>
        <button on-click="addBgColor()">添加背景色</button>
    `
})
export class AppComponent {
    backgroundColor:string;

    addBgColor() {
        this.backgroundColor = 'red';
    }
}
```

### $event
通过添加$event参数我们可以获取到原生的事件对象，我们试着点击的时候改变按钮的文字

*app.ts*

```typescript
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

![alt](images/component_interactive/2.gif)

> 我们应该通过改变数据去更新UI，而不是直接操作DOM，上面只是一个$event的事例，真实中千万别这么干

[示例代码参考](https://github.com/yuyang041060120/yuyang041060120.github.io/tree/master/angular2/code/component_interactive)