---
layout:     post
title:      "Angular2 Displaying Data"
date:       2016-03-20 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/angular2-ngfor.jpg"
---
# 数据展示
通过展示一组学生数据，来更好的理解组件当中数据展示和UI更新。如果你还不清楚组件是什么，请参考[Angular2 Simple Component](/2016/03/18/angular2-simple-component/)

*app.ts*

首先定义一组学生数据，有id，姓名和成绩，然后我们用setTimeout模拟异步获取数据

```javascript
import {Component} from 'angular2/core';

var students = [
    {
        id: 1,
        name: 'Mary',
        grade:50
    },
    {
        id: 2,
        name: 'Helen',
        grade:90
    },
    {
        id: 3,
        name: 'Jack',
        grade:55
    }
];

@Component({
    selector: 'my-app',
    templateUrl: 'src/app.html'
})
export class AppComponent {
    title:string = 'Students List';
    students:any;

    constructor() {
        setTimeout(()=>this.students = students, 500);
    }
}
```

*app.html*

在组件模板中添加我们的渲染逻辑

```html
<h3>{% raw %}{{title}}{% endraw %}</h3>
<ul>
    <li *ngFor="#stu of students;#i = index">
        {% raw %}{{i + 1}}-{{stu.name}}-{{stu.grade}}{% endraw %}
    </li>
</ul>
```


*bootstrap.ts*

初始化完成后，需要启动我们的应用程序

```javascript
import {bootstrap}    from 'angular2/platform/browser';
import {AppComponent} from './app';

bootstrap(AppComponent);
```

*index.html*

在HTML中调用组件

```html
<body>
<my-app>loading...</my-app>
...
</body>
```

最后在浏览器中访问index.html，看到效果如下

![alt](/img/angular2-displaying-data/1.png)

# ngFor
ngFor是angular2内置的指令，用来循环列表数据，通过`#`的方式来声明一个变量，很明显stu用来接收单个循环的数据，i用来获取循环的index

> 千万不要忘了ngFor前面的*号，F也要大写，不要写成`ngFor`或者`*ngfor`

# ngIf
现在希望在不及格的行添加`不及格`三个字，修改我们的

*app.html*

```html
<h3>{% raw %}{{title}}{% endraw %}</h3>
<ul>
    <li *ngFor="#stu of students;#i = index">
        {% raw %}{{i + 1}}-{{stu.name}}-{{stu.grade}}{% endraw %} <span *ngIf="stu.grade < 60">不及格</span>
    </li>
</ul>
```

在浏览器中访问index.html，效果如下

![alt](/img/angular2-displaying-data/2.png)

当ngIf后面表达式的值为`true`时，DOM结构会展示，否则隐藏

# 自动更新
下面给组件添加一个按钮，可以动态的添加一个新的学生信息

修改*app.html*，绑定单击事件

```html
<h3>{% raw %}{{title}}{% endraw %}</h3>
<ul>
    <li *ngFor="#stu of students;#i = index">
        {% raw %}{{i + 1}}-{{stu.name}}-{{stu.grade}}{% endraw %} <span *ngIf="stu.grade < 60">不及格</span>
    </li>
</ul>
<button (click)="onClick()">add</button>
```

在组件中添加事件处理方法

*app.ts*

```javascript
@Component({
    selector: 'my-app',
    templateUrl: 'src/app.html'
})
export class AppComponent {
    title:string = 'Students List';
    students:any;

    constructor() {
        setTimeout(()=>this.students = students, 500);
    }

    onClick(){
        this.students.push({
            id: 4,
            name: 'Eric',
            grade: 100
        });
    }
}
```

`(click)="onClick()"`是事件绑定的写法，注意后面onClick一定要带上括号。点击add按钮，我们会发现UI自动更新了，不需要我们手动去操作DOM，这就是MVC框架的强大之处，
我们只需要操作我们的数据即可，操作数据远远比操作DOM要简单，也更易于维护。

# 小结
template当中的数据来自组件实例的属性，事件处理对应于组件的方法。
我们只需要编写组件类，将组件的属性同template关联起来，Angular2就会自动帮我们管理UI的更新，我们需要做的就只是操作数据。