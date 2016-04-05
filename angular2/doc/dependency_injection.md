# 前言
依赖注入是Angular的核心概念之一。通过依赖注入，我们可以将复杂、繁琐的初始化工作交给Angular，将我们的工作重心更好的放在业务上。Angular2重新编写了依赖注入的逻辑，很好的解决了Angular1依赖注入所遗留的问题和瓶颈。那么什么是依赖注入呢？可以分为两个方面去看

# 依赖注入是一种设计模式
面向对象编程，我们以类为单位组织我们的代码。举个简单的例子，例如汽车，有引擎、轮胎、车门等配置，抽象成代码就是这样的

```typescript
class Car {
  constructor() {
    this.engine = new Engine();
    this.tires = new Tires();
    this.doors = new Doors();
  }
}
```

在构造汽车的过程中，我们安装引擎、轮胎和车门。这样就可以造出一辆汽车了。现在我们想造同一款车，但是想换一种引擎，怎么办？很明显，上面的Car是整个封闭的，如果想换一个引擎，我们就得把车拆开，重新组装

```typescript
class Car {
  constructor() {
    this.engine = new OtherEngine();
    this.tires = new Tires();
    this.doors = new Doors();
  }
}
```

相信大家已经发现上面代码的问题了，耦合性太强，无法定制我们的引擎、轮胎和车门，要想定制，就得把车拆了。如果我们的所有的引擎都符合某一个标准尺寸，然后在车里预留出这个空间，那么我们不就可以随意更换引擎了么？同理轮胎和车门，抽象成代码就是这样的

```typescript
class Car {
  constructor(engine, tires, doors) {
    this.engine = engine;
    this.tires = tires;
    this.doors = doors;
  }
}
```

通过组装的方式造车，预览配置的标准空间，我们就可以随意使用各种配置了

```typescript
var car = new Car(
  new Engine(),
  new Tires(),
  new Doors()
);
```

```typescript
var car = new Car(
  new MockEngine(),
  new MockTires(),
  new MockDoors()
);
```

从测试的角度来说，这样的代码也是易于测试的。上面的注入方式就是**构造器注入**，如果你熟悉Java的话，应该很容易理解这些概念。但是这种注入方式还有一个缺陷，我们得手动去一个个去new这些依赖类，试着想一下某个类依赖于十几个类，而这些类之间又相互依赖，管理这些依赖关系就是件让人头疼的事情了。依赖注入旨在解决依赖管理的问题，帮我们去维护这些依赖关系。

# 依赖注入是一种框架
Angular1中我们可以使用provider、service、factory注入服务，而不需要手动去new这些服务，就像这样

```javascript
angular.module('myApp', [])
	.service('myService', function () {
	    this.obj = {name: 'myService'};
	})
	.factory('myFactory', function (myService) {
	    console.log(myService.obj);
	})
```

核心原理就是将函数toString，然后分析函数的参数名称，并注入相应的服务。但是Angular1的依赖注入有几个问题

- 服务缓存在内部，所有的服务全部都是单例的，无一例外
- 服务是通过名称来区分的，很容易造成冲突，后者会直接覆盖前者，例如

```javascript
angular.module('myApp', [])
	.service('myService', function () {
	    this.obj = {name: 'myService'};
	})
	.factory('myService', function () {
	    return {name: 'myService1'}
	})
```

- 依赖注入内嵌在代码中，无法剥离使用

# Angular2中的依赖注入
下面这张图描述了Angular2当中的依赖注入