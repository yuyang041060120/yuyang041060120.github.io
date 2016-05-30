---
layout:     post
title:      "Angular2 Components Transfer"
date:       2016-05-29 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/angular2-components-transfer/bg.jpg"
---

# 前言

在Angular2当中使用类似于指令、管道、服务等功能都需要先引入，例如我们在*home.component.ts*组件中使用某个管道，首先需要引入

```javascript
import { MyUppercasePipe } from '../pipes';
```

然后在装饰器中添加pipes配置，最终才能在模板当中使用这个功能

```javascript
import { Component } from '@angular/core';
import { MyUppercasePipe } from '../pipes';

@Component({
    selector: 'my-home',
    template: '<div>{% raw %}{{title | myUppercase}}{% endraw %}</div>',
    pipes: [MyUppercasePipe]
})
export class HomeComponent {
    title: string = 'home component';
}
```

在Angular1当中，当我们在某个模块下定义了filter，在当前模块下就可以随意使用了，无需作任何声明。
那么在Angular2当中是不是也同样如此？拿上面的例子来说，`HomeComponent`的**子组件**是不是无需配置`pipes`可以直接使用myUppercase？

# Pipes

新建一个*child.component.ts*，不配置pipes，直接使用myUppercase管道功能

```javascript
import { Component } from '@angular/core';

@Component({
    selector: 'my-child',
    template: '<div>{% raw %}{{title | myUppercase}}{% endraw %}</div>'
})
export class ChildComponent {
    title: string = 'child component';
}
```

*home.component.ts*修改如下

```javascript
import { Component } from '@angular/core';

import { MyUppercasePipe } from '../pipes';
import { ChildComponent } from './child.component';

@Component({
    selector: 'my-home',
    template: `
        <div>{% raw %}{{title | myUppercase}}{% endraw %}</div>
        <my-child></my-child>
        `,
    pipes: [MyUppercasePipe],
    directives: [ChildComponent]
})
export class HomeComponent {
    title: string = 'home component';
}
```

打开浏览器，会发现控制台抛出了异常

![alt](/img/angular2-components-transfer/1.png)

很明显，`ChildComponent`当中无法识别`myUppercase`，我们再修改*child.component.ts*如下

```javascript
import { Component } from '@angular/core';

import { MyUppercasePipe } from '../pipes';

@Component({
    selector: 'my-child',
    template: '<div>{% raw %}{{title | myUppercase}}{% endraw %}</div>',
    pipes: [MyUppercasePipe]
})
export class ChildComponent {
    title: string = 'child component';
}
```

打开浏览器，发现正常工作了。所以说**子组件无法使用父组件配置的Pipes，每次使用都得单独配置**。

# Directives

看完了管道的传递模式，我们再来看下指令。新建一个*my-highlight.directive.ts*，当鼠标移动到元素上时，背景色变红，鼠标移出恢复原样

```javascript
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[myHighlight]'
})
export class MyHighlightDirective {
    defaultBgColor: string = 'none';

    @HostListener('mouseenter')
    onMouseenter() {
        this.elRef.nativeElement.style.backgroundColor = 'red';
    }

    @HostListener('mouseleave')
    onMouseleave() {
        this.elRef.nativeElement.style.backgroundColor = this.defaultBgColor;
    }

    constructor(private elRef: ElementRef) {
        this.defaultBgColor = elRef.nativeElement.style.backgroundColor;
    }
}
```

父组件*home.component.ts*当中引入该指令，并添加配置

```javascript
import { Component } from '@angular/core';

import { MyHighlightDirective } from '../directives';
import { ChildComponent } from './child.component';

@Component({
    selector: 'my-home',
    template: `
        <div myHighlight>{% raw %}{{title}}{% endraw %}</div>
        <my-child></my-child>
        `,
    directives: [ChildComponent, MyHighlightDirective]
})
export class HomeComponent {
    title: string = 'home component';
}
```

子组件*child.component.ts*当中不添加配置，直接使用该指令

```javascript
import { Component } from '@angular/core';

@Component({
    selector: 'my-child',
    template: '<div myHighlight>{% raw %}{{title}}{% endraw %}</div>'
})
export class ChildComponent {
    title: string = 'child component';
}
```

打开浏览器查看效果，控制台没有报错，但是子组件鼠标移入移出没有任何效果。再次修改子组件代码

```javascript
import { Component } from '@angular/core';

import { MyHighlightDirective } from '../directives';

@Component({
    selector: 'my-child',
    template: '<div myHighlight>{% raw %}{{title}}{% endraw %}</div>',
    directives: [ChildComponent, MyHighlightDirective]
})
export class ChildComponent {
    title: string = 'child component';
}
```

这时子组件正常工作了。**所以子组件无法使用父组件配置的Directives，每次使用都得单独配置**。

# Services

新建一个*logger.service.ts*，主要是打印格式化的日志

```javascript
import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {
    constructor() {
        console.log('New LoggerService');
    }

    log(str: string) {
        console.log(`Logger: ${str}`);
    }
}
```

父组件*home.component.ts*当中配置并注入该服务

```javascript
import { Component } from '@angular/core';

import { LoggerService } from '../services';
import { ChildComponent } from './child.component';

@Component({
    selector: 'my-home',
    template: `
        <div>{% raw %}{{title}}{% endraw %}</div>
        <my-child></my-child>
        `,
    directives: [ChildComponent],
    providers: [LoggerService]
})
export class HomeComponent {
    title: string = 'home component';

    constructor(loggerService: LoggerService) {
        loggerService.log('HomeComponent Constructor');
    }
}
```

子组件*child.component.ts*当中不配置，直接注入该服务

```javascript
import { Component } from '@angular/core';

import { LoggerService } from '../services';

@Component({
    selector: 'my-child',
    template: '<div>{% raw %}{{title}}{% endraw %}</div>'
})
export class ChildComponent {
    title: string = 'child component';

    constructor(loggerService: LoggerService) {
        loggerService.log('ChildComponent Constructor');
    }
}
```

打开控制台输出如下

```bash
New LoggerService
Logger: HomeComponent Constructor
Logger: ChildComponent Constructor
```

说明子组件可以直接注入父组件配置的服务，看控制台输出，很明显注入的是同一个实例，如果我们也给子组件添加上providers配置会怎么样？
你会发现控制台输出如下

```bash
New LoggerService
Logger: HomeComponent Constructor
New LoggerService
Logger: ChildComponent Constructor
```

**子组件不添加providers配置和父组件注入的是服务的同一个实例，如果添加了配置，则注入了一个新的实例**

# Global

每次使用自定义Pipes、Directives和Services时，都得单独引入，有没有办法只配置一次，然后整个应用都可以使用呢？
Angular2提供了`PLATFORM_DIRECTIVES`和`PLATFORM_PIPES`方便我们添加全局的指令和管道。
例如上面的例子，我们在入口*main.ts*作出如下修改

```javascript
import { bootstrap }      from '@angular/platform-browser-dynamic';
import { PLATFORM_DIRECTIVES, PLATFORM_PIPES } from '@angular/core';

import { MyHighlightDirective } from './app/directives';
import { MyUppercasePipe } from './app/pipes';
import { LoggerService } from './app/services';
import { HomeComponent }   from './app/home.component';

bootstrap(HomeComponent, [
    [{provide: PLATFORM_DIRECTIVES, useValue: [MyHighlightDirective], multi: true}],
    [{provide: PLATFORM_PIPES, useValue: [MyUppercasePipe], multi: true}],
    [LoggerService]
]).catch(err => console.error(err));
```

然后就可以在应用程序中直接使用自定义的指令、管道和服务了

```javascript
import { Component } from '@angular/core';

import { LoggerService } from '../services';

@Component({
    selector: 'my-home',
    template: `
        <div myHighlight>{% raw %}{{title | myUppercase}}{% endraw %}</div>
        `
})
export class HomeComponent {
    title: string = 'home component';

    constructor(loggerService: LoggerService) {
        loggerService.log('HomeComponent Constructor');
    }
}
```

The End.