---
layout:     post
title:      "Angular2 Component Nested"
date:       2016-03-26 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/angular2-component-nested/bg.png"
---

# 组件复用
编写Angular2，大部分的时间都是在编写组件，为了提高代码的复用性和可读性，我们必然会将一个大的组件拆分成很多细小的组件，让每个小组件只负责一块很小的功能。
保持单一职责的原则会让我们的程序更加健壮，更容易维护。那么如何在Angular2拆分组件并引用呢？看个简单的例子

*app.ts*

```javascript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <h1>{% raw %}{{title}}{% endraw %}</h1>
       <div>{% raw %}{{content}}{% endraw %}</div>
    `
})
export class AppComponent {
    title:string = 'App Component';
    content:string = 'Content A';
}
```

我们现在将content分离出另一个组件，可以复用它，展示不同的内容，新建一个*content.ts*

```javascript
import {Component} from 'angular2/core';

@Component({
    selector: 'content-component',
    template: `
       <div>{% raw %}{{content}}{% endraw %}</div>
    `
})
export class ContentComponent {
    content:string = 'Content A'
}
```

然后app组件里使用content组件

```javascript
@Component({
    selector: 'my-app',
    template: `
        <h1>{% raw %}{{title}}{% endraw %}</h1>
        <content-component></content-component>
    `
})
export class AppComponent {
    title:string = 'App Component';
}
```

是不是这样就可以了呢？不行！我得告诉app组件content-component是一个组件而不是一个没有意义的字符串，这里就需要使用到组件的另一个配置项directives

首先在app.ts中引入content组件

```javascript
import {ContentComponent} from './content';
```

然后添加配置

```javascript
@Component({
    selector: 'my-app',
    template: `
        <h1>{% raw %}{{title}}{% endraw %}</h1>
        <content-component></content-component>
    `,
    directives:[ContentComponent]
})
export class AppComponent {
    title:string = 'App Component';
}
```

最后我们在浏览器中就可以看到我么需要的结果了。

![alt](/img/angular2-component-nested/1.png)

> 为什么这里的配置名称叫directives而不是叫components呢？因为组件也是指令的一种

是不是这样就结束了呢？不是，我们发现上面的例子中有一个致命的缺陷，content组件显示的内容只能是Content A，如果我们想让它显示Content B怎么办，只能重新构造另一个组件？很明显这是不可取的。
为了实现我们content组件复用的目的，就是说它本身不能直接拥有展示的数据，得从外部获取数据，这样的话无论是展示Content A或者别的数据都是OK的。就好比一个纯净的容器，可以装任何物体。

# 输入输出

## 输入

### inputs

通过inputs属性，可以从组件外部获取数据

*content.ts*

```javascript
import {Component} from 'angular2/core';

@Component({
    selector: 'content-component',
    template: `
       <div>{% raw %}{{content}}{% endraw %}</div>
    `,
    inputs: ['content']
})
export class ContentComponent {}
```

从app组件处放入数据

*app.ts*

```javascript
import {Component}        from 'angular2/core';
import {ContentComponent} from './content';

@Component({
    selector: 'my-app',
    template: `
        <h1>{% raw %}{{title}}{% endraw %}</h1>
        <content-component [content]="content"></content-component>
    `,
    directives: [ContentComponent]
})
export class AppComponent {
    title:string = 'App Component';
    content:string = 'Content B';
}
```

我们给app添加个按钮来切换内容，会更明显一点

![alt](/img/angular2-component-nested/2.gif)

> inputs属性的值的名称一定要和组件传递处的名称保持一致

```javascript
inputs: ['content']
<content-component [content]="content"></content-component>
```

最右边这个content是app组件的属性，是向content组件传递数据的，千万弄混了

### @Input
也可以通过@Input装饰器的方式获取输入

*content.ts*

```javascript
import {Component,Input} from 'angular2/core';

@Component({
    selector: 'content-component',
    template: `
       <div>{% raw %}{{content}}{% endraw %}</div>
    `
})
export class ContentComponent {
    @Input() content:string;
}
```

> 如果@Input()当中的参数为空，那么content组件当中的属性名称得和组件调用处的属性名称保持一致，如果把参数加上，content类当中的属性就可以使用别的名称了

*content.ts*

```javascript
import {Component,Input} from 'angular2/core';

@Component({
    selector: 'content-component',
    template: `
       <div>{% raw %}{{str}}{% endraw %}</div>
    `
})
export class ContentComponent {
    @Input('content') str:string;
}
```

## 输出

### outputs

通过input我们获取输入，但是有时候组件也需要对外输出数据，比如上面的Content A传入content组件后，需要用户编辑完后保存，这个时候怎么办？我们可以通过ouputs属性对外输出数据

*content.ts*

```javascript
import {Component,Input,EventEmitter} from 'angular2/core';

@Component({
    selector: 'content-component',
    template: `
       <input type="text" [(ngModel)]="content">
       <button (click)="onClick()">保存</button>
    `,
    inputs: ['content'],
    outputs: ['save']
})
export class ContentComponent {
    content:string;
    save:EventEmitter = new EventEmitter();

    onClick(){
        this.save.emit(this.content);
    }
}
```

*app.ts*

```javascript
import {Component}        from 'angular2/core';
import {ContentComponent} from './content';

@Component({
    selector: 'my-app',
    template: `
        <h1>{% raw %}{{title}}{% endraw %}</h1>
        <content-component [content]="content" (save)="onSave($event)"></content-component>
    `,
    directives: [ContentComponent]
})
export class AppComponent {
    title:string = 'App Component';
    content:string = 'Content A';

    onSave(newContent) {
        alert(newContent);
    }
}
```

![alt](/img/angular2-component-nested/3.gif)

> 输出的实现是通过EventEmitter（订阅发布模式）。两点需要注意，输出的绑定方式是事件绑定；添加$event参数可以获取子组件传递的数据

### @Output

也可以通过@Output装饰器的方式对外输出

*content.ts*

```javascript
import {Component,Input,Output,EventEmitter} from 'angular2/core';

@Component({
    selector: 'content-component',
    template: `
       <input type="text" [(ngModel)]="content">
       <button (click)="onClick()">保存</button>
    `
})
export class ContentComponent {
    @Input() content:string;
    @Output() save:EventEmitter = new EventEmitter();

    onClick(){
        this.save.emit(this.content);
    }
}
```