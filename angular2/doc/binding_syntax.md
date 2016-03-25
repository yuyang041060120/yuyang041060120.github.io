# 属性绑定

先看个简单的例子

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div bind-title="title">App Component</div>
        <div [title]="title">App Component</div>
        <div title="{{title}}">App Component</div>
    `
})
export class AppComponent {
    title:string='This is the app component';
}
```

![alt](images/binding_syntax/1.png)

三种写法都是有效的，但是新手容易疑惑，什么时候使用{{}}的写法，什么时候又不需要呢？

- bind-property和[property]本质上没有区别，只是写法不同而已
- [property]这种写法原生HTML是不支持的，是Angular2附加的属性，所以不需要添加{{}}
- propery的写法就是正常的HTML属性，如果不加{{}}，就是正常的字符串，例如

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `        
        <div [title]="title">App Component</div>
        <div title="title">App Component</div>
    `
})
export class AppComponent {
    title:string='This is the app component';
}
```

![alt](images/binding_syntax/2.png)

是不是任何属性都可以这样绑定呢？我们试着添加一个不存在的age属性试一下

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [age]="age">App Component</div>
    `
})
export class AppComponent {
    age:number=10;
}
```

结果控制台报错

![alt](images/binding_syntax/3.png)

是因为我们使用了非法的属性造成的吗？绝对不是！报错的主要原因是因为

> Angular2的绑定是针对property的而不是atttribute

attribute的绑定可以使用[attr.attribute]的语法

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [attr.age]="age">App Component</div>
    `
})
export class AppComponent {
    age:number=10;
}
```

![alt](images/binding_syntax/4.png)

class和style虽然也是property，由于它们的特殊性（操作频繁，语法相对复杂），Angular2提供了不同的绑定方式

# class绑定
### 单class绑定

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [class.red]="isRed">App Component</div>
    `,
    styles:[`
        .red {
            background-color:red;
        }
    `]
})
export class AppComponent {
    isRed:boolean = true;
}
```

![alt](images/binding_syntax/5.png)

### 多class绑定

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [ngClass]="{red:isRed,bold:isBold}">App Component</div>
    `,
    styles:[`
        .red {
            background-color:red;
        }

        .bold{
            font-weight:bolder;
        }
    `]
})
export class AppComponent {
    isRed:boolean = true;
    isBold:boolean = true;
}
```

![alt](images/binding_syntax/6.png)

# style绑定
### 单style绑定

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [style.fontSize.px]="fontSize">App Component</div>
    `
})
export class AppComponent {
    fontSize:number = 20;
}
```

![alt](images/binding_syntax/7.png)

> 如果css属性有不同的单位，可以指定

### 多style绑定

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [ngStyle]="{'background-color':backgroundColor,'font-size':fontSize}">App Component</div>
    `
})
export class AppComponent {
    backgroundColor:string = 'green';
    fontSize:string = '20px';
}
```

![alt](images/binding_syntax/8.png)

# 事件绑定
事件通过(event)或者on-event的形式进行绑定，通过$event传递事件参数。看个简单例子

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div (mouseenter)="onMouseenter($event)">App Component</div>
    `
})
export class AppComponent {
    onMouseenter(e) {
        e.target.style.backgroundColor = 'red';
    }
}
```

![alt](images/binding_syntax/9.gif)

# 双向绑定
通过[(ngModel)]或则bindon-ngModel的语法，实现双向绑定

*app.ts*

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div>{{content}}</div>
        <input type="text" [(ngModel)]="content">
    `
})
export class AppComponent {
    content:string = 'init';
}
```

![alt](images/binding_syntax/10.gif)

[示例代码参考](https://github.com/yuyang041060120/yuyang041060120.github.io/tree/master/angular2/code/binding_syntax)