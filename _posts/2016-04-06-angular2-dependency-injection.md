---
layout:     post
title:      "Angular2 Dependency Injection"
date:       2016-04-06 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/angular2-dependency-injection/bg.png"
---
# 前言
依赖注入是Angular的核心概念之一。通过依赖注入，我们可以将复杂、繁琐的对象管理工作交给Angular，将我们的工作重心更好的放在业务上。
依赖注入本身是后端编码的概念，熟悉Spring框架的对其应该不陌生，Angular1首次将依赖注入引入前端开发，Angular2继续将其发扬光大，同时又很好的解决了Angular1中依赖注入所遗留的问题和瓶颈。
那么什么是依赖注入呢？我觉得可以分为两个方面去解读

# 依赖注入是一种设计模式
面向对象编程，我们以类为单位组织我们的代码。举个简单的例子，例如某一款汽车，有引擎、轮胎、车门等配置，抽象成代码就是这样的

```javascript
class Car {
  constructor() {
    this.engine = new Engine();
    this.tires = new Tires();
    this.doors = new Doors();
  }
}
```

在构造汽车的过程中，我们安装引擎、轮胎和车门等配置，这样就可以造出一辆汽车了。但是现在我们还想造同一款车，但是想换一种引擎，怎么办？很明显，上面的Car是整个封闭的，如果想换一个引擎，我们就得重新造一款车

```javascript
class OtherCar {
  constructor() {
    this.engine = new OtherEngine();
    this.tires = new Tires();
    this.doors = new Doors();
  }
}
```

相信大家已经发现上面代码的问题了，耦合性太强，无法定制我们的引擎、轮胎和车门，要想定制，就得从头来过。如果我们的所有的引擎都符合某一个标准尺寸，然后在车里预留出这个空间，那么我们不就可以随意更换引擎了么？同理轮胎和车门，抽象成代码就是这样的

```javascript
class Car {
  constructor(engine, tires, doors) {
    this.engine = engine;
    this.tires = tires;
    this.doors = doors;
  }
}
```

通过组装的方式造车，预留配置的标准空间，同一款车我们可以随意使用各种配置

```javascript
var car = new Car(
  new Engine(),
  new Tires(),
  new Doors()
);
```

```javascript
var car = new Car(
  new MockEngine(),
  new MockTires(),
  new MockDoors()
);
```

从测试的角度来说，这样的代码也是方便测试的。上面的注入方式就是`构造器注入`，通过这样的一种模式可以使我们的代码更加健壮同时也是易于测试的。
但是上面注入的实例都是我们手动去new的，当应用越来越大的时候，我们的依赖会更复杂，试着想一下某个类依赖于十几个类，而这些类之间又相互依赖，管理这些依赖关系就是件让人头疼的事情了。
Angular会帮我们管理并且维护这些依赖关系。

# 依赖注入是一种框架
Angular1中我们可以使用service注入服务，就像这样

```javascript
angular.module('app', [])
        .controller('MyCtrl', function ($scope, comService) {
            comService.handle();
        })
        .service('comService', function () {
            this.handle = function () {
                //todo
            }
        });
```

但是Angular1的依赖注入有几个问题

**所有的服务全部都是单例的**

```javascript
var id = 1;
angular.module('app', [])
        .service('comService', function () {
            this._id = id++;

            this.getId = function () {
                return this._id;
            }
        })
        .controller('ACtrl', function ($scope, comService) {
            console.log(comService.getId()); // 1
        })
        .controller('BCtrl', function ($scope, comService) {
            console.log(comService.getId()); // 1
        });
```

**服务是通过名称来区分的，很容易造成冲突，后者会直接覆盖前者**

```javascript
angular.module('app', [])
        .service('comService', function () {
            this.name = 'company service 1';
        })
        .service('comService', function () {
            this.name = 'company service 2';
        })
        .controller('ACtrl', function ($scope, comService) {
            console.log(comService.name); // company service 2
        });
```

**依赖注入功能内嵌在Angular1中，无法剥离出来单独使用**

# Angular2中的依赖注入

## 组件注入服务

例如有一个日志服务*logger.service.ts*

```javascript
export default class LoggerService {
    log(str) {
        console.log(`Log: ${str}`);
    }
}
```

然后入口组件*app.ts*当中使用这个服务

```javascript
import {Component}   from 'angular2/core';
import LoggerService from './logger.service';

@Component({
    selector: 'my-app',
    template: '<h1>App Component</h1>',
    providers:[LoggerService]
})
export class AppComponent {
    loggerService:LoggerService;

    constructor(loggerService:LoggerService) {
        this.loggerService = loggerService;
    }

    ngOnInit(){
        this.loggerService.log('component init');
    }
}
```

首先我们需要在组件的`providers`配置中引入这个服务，这点很重要，**在Angular2的任何组件（指令等等）当中想要使用我们自定义的服务或者其它功能必须先作出声明**。
在App组件当中我们没有看到任何`new`操作符，但是程序启动后我们可以看到控制台打印了`Log: component init`。Angular2帮我们实例化了LoggerService并注入到了loggerService属性当中。
上面的代码还可以简写成这样

```javascript
@Component({
    selector: 'my-app',
    template: '<h1>App Component</h1>',
    providers:[LoggerService]
})
export class AppComponent {
    constructor(private loggerService:LoggerService) {}

    ngOnInit(){
        this.loggerService.log('component init');
    }
}
```

> `loggerService:LoggerService`，后面指定的类型必不可少，这是注入的关键

在Angular2组件当中使用依赖注入可以简单的分为两步

- 组件当中作出声明
- 组件构造函数当中注入

## 子组件注入服务

新建一个*uuid.ts*的服务，可以生成一个唯一的ID

```javascript
var id = 1;
export default class UuidService {
    id:number;

    constructor() {
        this.id = id++;
    }

    getId() {
        return this.id;
    }
}
```

入口组件*app.ts*

```javascript
import {Component}    from 'angular2/core';
import UuidService    from './uuid.service';
import ChildComponent from './child';

@Component({
    selector: 'my-app',
    template: '<h1>App Component</h1><my-child></my-child>',
    providers:[UuidService],
    directives:[ChildComponent]
})
export class AppComponent {
    constructor(private uuidService:UuidService) {}

    ngOnInit(){
        console.log(this.uuidService.getId());
    }
}
```

新建一个子组件*child.ts*

```javascript
import {Component}   from 'angular2/core';
import UuidService from './uuid.service';

@Component({
    selector: 'my-child',
    template: '<p>Child Component</p>'
})
export default class ChildComponent {
    constructor(private uuidService:UuidService) {}

    ngOnInit(){
        console.log(this.uuidService.getId())
    }
}
```

在子组件当中我们并没有配置`providers`，为啥程序依然正常执行呢？**因为子组件可以注入父组件声明的服务**。打开控制台看到输出了两个`1`，说明父子组件注入的是同一个实例，这并不符合uuid的功能，怎么办？
我们把子组件当中的`providers`声明加上

```javascript
import {Component}   from 'angular2/core';
import UuidService from './uuid.service';

@Component({
    selector: 'my-child',
    template: '<p>Child Component</p>',
    providers:[UuidService]
})
export default class ChildComponent {
    constructor(private uuidService:UuidService) {}

    ngOnInit(){
        console.log(this.uuidService.getId())
    }
}
```

打开控制台，发现打印了`1 2`，这是为什么呢？**Angular2当中每个组件都有自己的依赖注入管理，依赖注入的时候会先在当前组件上寻找服务实例，如果找不到就会使用父组件上依赖注入的实例，如果还找不到，就会抛出异常。**
组件是一个树状结构，我们也可以把依赖注入看成和组件平行的树状结构，每个组件都有自己的依赖管理，这样就解决了Angular1当中服务单例的的问题。

## 服务注入服务

有时候服务之间也会相互依赖，例如上面的例子当中LoggerService依赖另一个FormatService

*format.service.ts*

```javascript
export default class FormatService {
    format() {
        return 'Log: ';
    }
}
```

*logger.service.ts*

```javascript
import FormatService from './format.service';

export default class LoggerService {
    constructor(private formatService:FormatService) {
    }

    log(str) {
        console.log(`${this.formatService.format()}${str}`);
    }
}
```

*app.ts*

```javascript
import {Component}   from 'angular2/core';
import LoggerService from './logger.service';
import FormatService from './format.service';

@Component({
    selector: 'my-app',
    template: '<h1>App Component</h1>',
    providers: [LoggerService, FormatService]
})
export class AppComponent {
    constructor(private loggerService:LoggerService) {
    }

    ngOnInit() {
        this.loggerService.log('component init');
    }
}
```

> 服务依赖的服务也要在`providers`中作出声明

打开控制台，发现抛出了异常，因为我们没有告知Angular2，**LoggerService依赖FormatService**，所以注入失败了。
通过给LoggerService添加`@Injectable()`装饰器，告知Angular2本服务需要注入其它服务

*logger.service.ts*

```javascript
import FormatService from './format.service';
import {Injectable} from 'angular2/core';

@Injectable()
export default class LoggerService {
    constructor(private formatService:FormatService) {
    }

    log(str) {
        console.log(`${this.formatService.format()}${str}`);
    }
}
```

这样我们的程序又能正常工作了。细心的同学会发现我们的App组件也需要注入LoggerService服务，为什么不需要添加`@Injectable()`装饰器？
因为组件声明已经添加了`@Component()`装饰器，所以无需再次添加其它声明了。

> 建议我们所有的服务都添加上`@Injectable()`

## 循环依赖注入

我们将上面的代码改造成下面这样

*format.service.ts*

```javascript
import LoggerService from './logger.service';
import {Injectable} from "angular2/core";

@Injectable()
export default class FormatService {
    constructor(private loggerService:LoggerService){}
    format() {
        return 'Log: ';
    }
}
```

*logger.service.ts*

```javascript
import FormatService from './format.service';
import {Injectable} from "angular2/core";

@Injectable()
export default class LoggerService {
    constructor(private formatService:FormatService) {
    }

    log(str) {
        console.log(`${this.formatService.format()}${str}`);
    }
}
```

打开控制台会发现抛出了异常，像这种两个服务之间相互注入的情况就会产生循环依赖，我们要尽量避免这种情况的发生，保持每个服务的单一职责功能。

# 依赖注入核心

![alt](/img/angular2-dependency-injection/1.svg)

Angular2的依赖注入主要由三个部分构成

- **Injector**   - 暴露接口创建服务实例
- **Provider**   - 包含了当前服务的信息和依赖信息
- **Dependency** - 服务的依赖信息

通过Injector的功能，我们可以脱离Angular2组件来使用依赖注入，例如上面的Car例子，首先引入

```javascript
import {Injector, Injectable} from 'angular2/core';
```

创建我们的Engine等类和Car类

```javascript
class Engine{}
class Tires{}
class Doors{}

@Injectable()
class Car{
    constructor(private engine:Engine, private tires:Tires, private dorrs:Doors){}
}
```

> Car当中需要注入别的类，不要忘了添加 `@Injectable()`

调用Injector的`resolveAndCreate`静态方法创建注入器

```javascript
var injector = Injector.resolveAndCreate([Engine, Tires, Doors, Car]);
```

> 要将所有相关的类添加到参数数组中，如果实例化了参数数组中不存在的类，就会抛出异常

调用`get`方法获取Car类的实例

```javascript
var car = injector.get(Car);
```

比较下面的例子

```javascript
injector.get(Tires) === injector.get(Tires); //true
car.engine === injecotr.get(Engine);     //true
```

> 同一个注入器上获取的实例都是单例的

## Token

我们知道Angular1当中注入的识别是通过参数的字符名称，例如

```javascript
angular.module('app', [])
        .service('comService', function () {
        })
        .controller('ACtrl', function (comService) {

        });
```

controller当中使用的service名称必须和注册处保持一致，否则注入失败。Angular2获取实例则是通过Token

```javascript
var injector = Injector.resolveAndCreate([Engine]);
```

这种方式实际上是简写的，Angular2会帮我们封装成下面的形式

```javascript
var injecotr = Injector.resolveAndCreate([provide(Engine,{useClass:Engine})]);
```

`provide`是Angular2的核心方法之一，返回值是一个Provider实例。第一个参数就是Token，这里我们直接使用了类Engine作为Token，useClass表示通过实例化类的方式注入。
实际上Token可以换成别的类型，例如

```javascript
var injector = Injector.resolveAndCreate([provide('engine', {useClass: Engine})]);
var engine = injector.get('engine');
console.log(engine instanceof Engine); //true
```

> 当然了使用字符串这种方式容易被覆盖

## useClass

实例化类的方式注入，注入器会帮我们new实例，如果传递一个非类，typescript编译都通不过

## useValue

直接注入这个值

```javascript
var injector = Injector.resolveAndCreate([
    provide(Engine, {useValue: 'engine'})
]);
console.log(injector.get(Engine) === 'engine');　//true
```

## useFactory

注入工厂方法的返回值

```javascript
var injector = Injector.resolveAndCreate([provide(Engine, {
    useFactory: function () {
        return 'engine'
    }
})]);
console.log(injector.get(Engine) === 'engine');
```

factory方法当中可以依赖别的服务

```javascript
var injector = Injector.resolveAndCreate([EngineA, EngineB, provide(Engine, {
    useFactory: function (engineA, engineB) {
        if (true) {
            return engineA;
        } else {
            return engineB;
        }
    },
    deps: [EngineA, EngineB]
})]);
console.log(injector.get(Engine) instanceof EngineA); //true
```

## useExisting

使用已存在的实例注入，这个容易跟useClass弄混，注意下面的输出

```javascript
var injector = Injector.resolveAndCreate([
    EngineA,
    provide(EngineB, {useClass: EngineA})
]);
console.log(injector.get(EngineA) === injector.get(EngineB));　//false

var injector = Injector.resolveAndCreate([
    EngineA,
    provide(EngineB, {useExisting: EngineA})
]);
console.log(injector.get(EngineA) === injector.get(EngineB)); //true
```

## multi
如果我们重复注册同一个Token，后面的会覆盖前面的，例如

```javascript
var injector = Injector.resolveAndCreate([
    provide('COM_ID', {useValue: 1}),
    provide('COM_ID', {useValue: 2})
]);
console.log(injector.get('COM_ID')); // 2
```

使用multi配置可以使相同的Token共存，注入的是一个数组

```javascript
var injector = Injector.resolveAndCreate([
    provide('COM_ID', {
        useValue: 1,
        multi: true
    }),
    provide('COM_ID', {
        useValue: 2,
        multi: true
    })
]);
console.log(injector.get('COM_ID'));　// [1,2]
```

相同的Token，不能出现混合的情况，例如下面的写法就会报错

```javascript
var injector = Injector.resolveAndCreate([
    provide('COM_ID', {useValue: 1, multi: true}),
    provide('COM_ID', {useValue: 2})
]);
```

## 子注入器

通过`resolveAndCreateChild`可以创建子注入器

```javascript
var injector = Injector.resolveAndCreate([Engine, Tires, Doors, Car]);
var childInjector = injector.resolveAndCreateChild([Engine, Car]);
var grantInjector = childInjector.resolveAndCreateChild([Car]);

grantInjector.get(Car) === childInjector.get(Car);       //false
grantInjector.get(Car) === injector.get(Car);            //false

grantInjector.get(Engine) === childInjector.get(Engine); //true
childInjector.get(Engine) === injector.get(Engine);      //false

grantInjector.get(Tires) === childInjector.get(Tires);   //true
childInjector.get(Tires) === injector.get(Tires);        //true
```

> 每个注入器都会有自己的依赖注入管理，它会先从本身查找服务，如果找不到就会往父级注入器查找

![alt](/img/angular2-dependency-injection/2.svg)

# 小结

自此Angular2解决了Angular1遗留的问题

 - 我们可以单独使用依赖注入功能
 - Token防止重名覆盖
 - 树状的注入器各自管理自己的实例

# 参考

[Dependency Injection In Angular2](http://blog.thoughtram.io/angular/2015/05/18/dependency-injection-in-angular-2.html)