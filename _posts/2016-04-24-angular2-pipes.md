---
layout:     post
title:      "Angular2 Pipes"
date:       2016-04-24 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/angular2-pipes/bg.jpg"
---

# 前言

如果经常使用Linux系统，那么你对管道的概念一定不会陌生，例如

```
ps -ef|grep nginx
```

通过`grep`可以将大量的输出加以过滤，只留下nginx的进程。
我们可以将管道的概念比作我们现实中的下水管道，下水管道有不同口径的大小，例如500x500，只允许该大小之内的物体通过，这样就可以过滤我们的输出了。

# Angular1 Filter

在Angular1当中我们使用filter过滤我们的输出，例如实现一个Math.pow功能的过滤器

```javascript
angular.module('app', [])
    .filter('pow', function () {
        return function (value, num) {
            if (typeof(value) !== 'number') return value;
            return Math.pow(value, num || 2);
        }
    })
```

我们在template当中这样使用

```html
<div ng-init="number = 2">
    <p>{% raw %}{{number | pow}}{% endraw %}</p>
    <p>{% raw %}{{number | pow:3}}{% endraw %}</p>
</div>
```

通过`:`的形式传递参数，也可以传递多个参数

```
data | filter:arg1:arg2
```

filter还可以链式调用，例如给上述的输出结果添加一个单位

```javascript
angular.module('app', [])
    .filter('unit', function () {
        return function (value, unit) {
            return value + (unit || '$');
        }
    })
```

在template当中使用

```html
<div ng-init="number = 2">
    <p>{% raw %}{{number | pow | unit}}{% endraw %}</p>
    <p>{% raw %}{{number | pow:3 | unit:'￥'}}{% endraw %}</p>
</div>
```

如果没有filter的概念，那么我们可能用下面的方式处理我们的数据

```javascript
angular.module('app', [])
    .service('filter', function () {
        this.pow = function (value, num) {
            if (typeof(value) !== 'number') return value;
            return Math.pow(value, num || 2);
        };

        this.unit = function (value, unit) {
            return value + (unit || '$');
        }
    })
    .controller('MyCtrl', function ($scope, filter) {
        $scope.number = 2;
        $scope.numberPow = filter.pow($scope.number);
        $scope.numberPowAndUnit = filter.unit($scope.numberPow, '￥');
    })
```

在template当中使用

```html
<div ng-controller="MyCtrl">
    <p>{% raw %}{{number}}{% endraw %}</p>
    <p>{% raw %}{{numberPow}}{% endraw %}</p>
    <p>{% raw %}{{numberPowAndUnit}}{% endraw %}</p>
</div>
```

service的逻辑比较清晰，团队可以约定这个service作为过滤器来使用，但是controller的逻辑就一团糟了，`numberPow`和`numberPowAndUnit`纯粹是为了展示而弄出来的字段，这样的代码不易阅读和维护。
很明显，使用filter有这样几个好处：

- 代码易读
- 展示与逻辑分离
- ...

# Angular2 Pipes

在Angular2中我们使用`@Pipe`装饰器声明我们的管道

*pow.ts*

```javascript
import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
    name: 'pow'
})
export default class PowPipe implements PipeTransform {
    transform(value:any, args:any[]):any {
        if (typeof(value) !== 'number') return value;
        return Math.pow(value, args[0] || 2);
    }
}
```

PipeTransform是一个接口，只有一个transform方法，结合Pipe一起使用。声明完了pow管道，来看看如何在组件*app.ts*当中使用

```javascript
import {Component} from 'angular2/core';
import PowPipe     from './pow';

@Component({
    selector: 'my-app',
    template: `
        <div>{% raw %}{{number | pow}}{% endraw %}</div>
        <div>{% raw %}{{number | pow:3}}{% endraw %}</div>
    `,
    pipes: [PowPipe]
})
export class AppComponent {
    number:number = 2;
}
```

通过`pipes`配置添加我们需要使用的管道，不同于`providers`，**子组件无法使用父组件引入的管道**。

> Angular2的Pipes同样传递多个参数，同样可以链式调用，用法同Angular1一致

# Immutable Data

我们先实现一个简单的数组求和管道*summary.ts*

```javascript
import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
    name: 'summary'
})
export default class SummaryPipe implements PipeTransform {
    transform(list:number[], args:any[]):any {
        return list.reduce((prev, next) => prev + next);
    }
}
```

入口组件*app.ts*

```javascript
import {Component} from 'angular2/core';
import SummaryPipe from './summary';

@Component({
    selector: 'my-app',
    template: `
        <div><span *ngFor="#i of list">{% raw %}{{i}}{% endraw %}&nbsp;</span></div>
        <div>{% raw %}{{list | summary}}{% endraw %}</div>
        <button (click)="onClick()">add 4</button>
    `,
    pipes: [SummaryPipe]
})
export class AppComponent {
    list:number[] = [1, 2, 3];

    onClick() {
        this.list.push(4);
    }
}
```

功能很简单，当程序完成后，我们看到的页面这样的

![alt](/img/angular2-pipes/1.jpg)

然后我们点击**add 4**按钮，发现展示的列表更新了，但是求和的结果没有变化，这是为什么？
不同于UI更新的机制，使用Pipe的时候，只有对象的引用变化了，才会执行Pipe的逻辑，我们将*app.ts*的onClick方法改造下

```javascript
onClick() {
    this.list = [...this.list, 4];
}
```

这个时候点击按钮，UI更新正常了。
为什么Angular2的管道不对数据进行深层次的检测，而是采用判断引用是否变化这样的方式呢？
我们要明白，在不清楚哪个节点的数据变化情况下，就需要对整个对象进行递归检测，代价是十分昂贵的。
那问题又来了，如果某个深层次的数据结构变化了，如何层层的改变引用呢？浅拷贝、深拷贝？No!No!No!
Immutable Data是指一经创建就不可改变的的数据结构，例如上面的例子当中的list，创建完后我们不应该再去修改它，我们可以结合如[immutablejs](https://facebook.github.io/immutable-js/)这样的库去使用。
经过immutablejs处理过的数据都是一个新的引用。

```javascript
import {Component} from 'angular2/core';
import SummaryPipe from './summary';
import Immutable   from 'immutable';

@Component({
    selector: 'my-app',
    template: `
        <div><span *ngFor="#i of list">{% raw %}{{i}}{% endraw %}&nbsp;</span></div>
        <div>{% raw %}{{list | summary}}{% endraw %}</div>
        <button (click)="onClick()">add 4</button>
    `,
    pipes: [SummaryPipe]
})
export class AppComponent {
    list:number[] = Immutable.List([1, 2, 3]);

    onClick() {
        this.list = this.list.push(4);
    }
}
```

更多关于Immutable Data的内容，大家自行搜索，这里不在赘述了。

# Impure Pipes

到目前为止，我们所有的管道或者filter都是直接return我们的处理结果的，如果我们的管道的处理需要依赖服务端返回的结果怎么办？
我们可以将我们的Pipe声明成一个Impure Pipe

```javascript
import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
    name: 'fetchString',
    pure: false
})
export default class FetchStringPipe implements PipeTransform {
    cache:string = null;
    fetched:boolean = false;

    transform(value:number[], args:any[]):any {
        if (!this.fetched) {
            this.fetched = true;
            setTimeout(()=> this.cache = value + ':from server');
        }

        return this.cache;
    }
}
```

将pure设为false，即创建了一个Impure Pipe，可以处理异步流程。
如果你在transform方法当中添加一个`console.log('exec')`，你会发现控制台打印了好多次`exec`，甚至点击逻辑不相关的按钮也会触发。
**可能引起UI更新的操作，如与页面又交互，从服务端请求等都会导致Impure Pipe执行transform方法。**

> 使用Impure Pipe的时候要谨慎，一定要保持逻辑清晰。

# 小结

前端引入管道的概念真是很棒的想法。