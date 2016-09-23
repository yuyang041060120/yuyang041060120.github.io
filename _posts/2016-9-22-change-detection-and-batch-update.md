---
layout:     post
title:      "Change Detection And Batch Update"
date:       2016-09-22 12:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/change-detection-and-batch-update/bg.jpeg"
---

# 前言

在传统的WEB开发中，当与用户或服务器发生交互时，需要我们手动获取数据并更新DOM，这个过程是繁琐的、易错的。
特别是当页面功能过于复杂时，我们既要关注数据的变化，又要维护DOM的更新，这样写出来的代码是很难维护的。
新一代的框架或库，例如Angular、React、Vue等等让我们的关注点只在数据上，当数据更新时，这些框架/库会帮我们更新DOM。
那么这里就有两个很重要的问题了：当数据变化时，这些框架/库是如何感知到的？当我们连续更新数据时，这些框架/库如何避免连续更新DOM，而是进行批量更新？
带着这两个问题，我将简要分析一下React、Angular1、Angular2及Vue的实现机制。

# React

## Virtual DOM

![alt](/img/change-detection-and-batch-update/virtual-dom.svg)

React在更新UI的时候会根据新老state生成两份虚拟DOM，所谓的虚拟DOM其实就是JavaScript对象，然后在根据特定的diff算法比较这两个对象，找出不同的部分，最后根据改变的那部分进行对应DOM的更新。
那么React是如何知道数据变化了呢？我们通过手动调用setState告知React我们需要更新的数据。

## setState

例如我们这里有一个很简单的组件：

```javascript
class App extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      val: 0,
    };
  }

  handleClick() {
    this.setState({val: 1});
  }

  render() {
    return (
      <div>
        <span>{this.state.val}</span>
        <button onClick={this.handleClick}>change val</button>
      </div>
    )
  }
}
```

当我点击按钮的时候调用`this.setState({val: 1});`，React就会将`this.state.val`更新成`1`，并且自动帮我们更新UI。
如果点击按钮的时候我们连续调用`setState`会怎么样？React是连续更新两次，还是只更新一次呢？为了更好的观察出React的更新机制，我们将点击按钮的逻辑换成下面的代码


```javascript
this.setState({val: 1});
console.log(this.state.val);

this.setState({val: 2});
console.log(this.state.val);
```

打开控制台，点击按钮你会发现打印了`0 0`，同时页面数据也更新成了2。所以我们就得出结论：React的更新并不是同步的，而是批量更新的，而且官网上也说了：
。我们别急着下结论，我们知道应用程序状态的改变主要是下面三种情况引起的：

- Events - 如点击按钮
- Timers - 如setTimeout
- XHR - 从服务器获取数据

我们才测试了事件这一种情景，我们试着看看其余两种情景下state的变化，将点击按钮的逻辑换成如下代码

```javascript
setTimeout(() => {
  this.setState({val: 1});
  console.log(this.state.val);

  this.setState({val: 2});
  console.log(this.state.val);
});
```

打开控制台，点击按钮你会发现打印了`1 2`，相信这个时候很多人就懵了，为啥和第一种情况的输出不一致，不是说好的批量更新的么，怎么变成连续更新了。
我们再试试第三种情景XHR，将点击按钮的逻辑换成下面的代码

```javascript
fetch('/')
  .then(() => {
    this.setState({val: 1});
    console.log(this.state.val);

    this.setState({val: 2});
    console.log(this.state.val);
  });
```

打开控制台，点击按钮你会发现打印的还是`1 2`，这究竟是什么情况？如果仔细观察的话，你会发现上面的输出符合一个规律：`在React调用的方法中连续setState走的是批量更新，此外走的是连续更新`。
为了验证这个的猜想，我们试着在React的生命周期方法中连续调用setState

```javascript
componentDidMount() {
  this.setState({val: 1});
  console.log(this.state.val);

  this.setState({val: 2});
  console.log(this.state.val);
}
```

打开控制台你会发现打印了`0 0 `，更加验证了我们的猜想，因为生命周期方法也是React调用的。到此我们可以得出这样一个结论：

> 在React调用的方法中连续setState走的是批量更新，此外走的是连续更新

说到这里，有些人可能会有这样一个疑惑

```javascript
handleClick() {
  setTimeout(() => {
    this.setState({val: 1});
    console.log(this.state.val);

    this.setState({val: 2});
    console.log(this.state.val);
  });
}
```

setTimeout也是在handleClick当中调用的，为啥不是批量更新呢？
setTimeout确实是在handleClick当中调用的，但是两个setState可不是在handleClick当中调用的，它们是在传递给setTimeout的参数——匿名函数中执行的，走的是事件轮询，不要弄混了。

综上，说setState是异步的需要加一个前提条件，在React调用的方法中执行，这时我们需要通过回调获取到最新的state

```javascript
this.setState({val: 1}, () => {
  console.log(this.state.val);
});
```

相信这个道理大家不难理解，因为事件和生命周期方法都是React调用的，它想怎么玩就怎么玩。那么React内部是如何实现批量更新的呢？

## 事务

React当中事务最主要的功能就是拿到一个函数的执行上下文，提供钩子函数。啥意思？看个例子

```javascript
import Transaction from 'react/lib/Transaction';

const transaction = Object.assign({}, Transaction.Mixin, {
  getTransactionWrappers() {
    return [{
      initialize() {
        console.log('initialize');
      },
      close() {
        console.log('close');
      }
    }];
  }
});
transaction.reinitializeTransaction();
const fn = () => {
  console.log('fn');
};
transaction.perform(fn);
```

执行这段代码，打开控制台会发现打印如下

```bash
initialize
fn
close
```

事务最主要的功能就是可以Wrapper一个函数，通过perform调用，在执行这个函数之前会先调用initialize方法，等这个函数执行结束了在调用close方法。事务的核心代码很短，只有五个方法，有兴趣的可以去看下。
结合上面setState连续调用的情况，我们可以大致猜出React的更新机制，例如执行handleClick的时候

```javascript
let updating = false;

setState = function() {
  if(updating){
    // 缓存数据
  }else {
    // 更新
  }
}

const transaction = Object.assign({}, Transaction.Mixin, {
  getTransactionWrappers() {
    return [{
      initialize() {
        updating = true;
      },
      close() {
        updating = false;
        // 更新
      }
    }];
  }
});
transaction.reinitializeTransaction();

transaction.perform(instance.handleClick);
```

我们再来深入一下setState的实现，看看是不是这么回事，下面是setState会调用到的方法

```javascript
function enqueueUpdate(component) {
  ensureInjected();

  if (!batchingStrategy.isBatchingUpdates) {
    batchingStrategy.batchedUpdates(enqueueUpdate, component);
    return;
  }

  dirtyComponents.push(component);
  if (component._updateBatchNumber == null) {
    component._updateBatchNumber = updateBatchNumber + 1;
  }
}
```

看变量名称我们也都能猜到大致功能，通过batchingStrategy.isBatchingUpdates来决定是否进行batchedUpdates（批量更新），还是dirtyComponents.push（缓存数据），结合事务，React的批量更新策略应该是这样的

```javascript
const transaction = Object.assign({}, Transaction.Mixin, {
  getTransactionWrappers() {
    return [{
      initialize() {
        batchingStrategy.isBatchingUpdates = true;
      },
      close() {
        batchingStrategy.isBatchingUpdates = false;
      }
    }];
  }
});
transaction.reinitializeTransaction();

transaction.perform(instance.handleClick);
transaction.perform(instance.componentDidMount);
```

## 小结

React通过setState感知到数据的变化，通过事务进行批量更新，通过Virtual DOM比较进行高效的DOM更新。

# Angular1

## Dirty Checking

![alt](/img/change-detection-and-batch-update/dirty-checking.svg)

Angular1通过脏值检测去更新UI，所谓的脏值检测其实指Angular1从$rootScope开始遍历所有scope的$$watchers数组，通过比较新老值来决定是否更新DOM。看个例子

```html
<div ng-controller="MyCtrl">{{val}}</div>
```

```javascript
angular.module('myApp', [])
  .controller('MyCtrl', function($scope) {
    $scope.val = 0;
  });
```

这个是一个很简单的数据渲染的例子，我们在控制台打印下scope，看下$$watchers的内容

![alt](/img/change-detection-and-batch-update/$$watchers.png)

因为只有val一个表达式所以$$watchers长度只有1

- eq 是否进行数据的深度比较
- exp 检测出错时log所用
- fn 更新DOM
- get 获取当前数据
- last 老的数据

那么Angular1是如何感知到数据变化的呢？

## $apply

Angular1通过调用$scope.$apply()进行脏值检测的，核心代码如下

![alt](/img/change-detection-and-batch-update/$digest.png)

遍历所有scope的$$watchers，通过get获取到最新值同last比较，值变化了则通过调用fn更新DOM。有人可能会疑惑了，我们在编码的时候并没有调用$apply，那么UI是怎么更新的呢？
实际上是Angular1帮我们调用了，我们看下ng事件的源码实现

```javascript
forEach(
  'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' '),
  function(eventName) {
    var directiveName = directiveNormalize('ng-' + eventName);
    ngEventDirectives[directiveName] = ['$parse', '$rootScope', function($parse, $rootScope) {
      return {
        restrict: 'A',
        compile: function($element, attr) {
          var fn = $parse(attr[directiveName], /* interceptorFn */ null, /* expensiveChecks */ true);
          return function ngEventHandler(scope, element) {
            element.on(eventName, function(event) {
              var callback = function() {
                fn(scope, {$event:event});
              };
              if (forceAsyncEvents[eventName] && $rootScope.$$phase) {
                scope.$evalAsync(callback);
              } else {
                scope.$apply(callback);
              }
            });
          };
        }
      };
    }];
  }
);

```

很明显调用了`$scope.$apply`，我们再看下$timeout的源码

```javascript
function timeout(fn, delay, invokeApply) {
  // ...
  
  timeoutId = $browser.defer(function() {
    try {
      deferred.resolve(fn.apply(null, args));
    } catch (e) {
      deferred.reject(e);
      $exceptionHandler(e);
    }
    finally {
      delete deferreds[promise.$$timeoutId];
    }

    if (!skipApply) $rootScope.$apply();
  }, delay);

  // ...
}
```

最后也调用了`$rootScope.$apply`，$http服务实际上也做了同样的处理，说到这，三种引起应用程序状态变化的情景，Angular1都做了封装，所以我们写代码的时候不需要手动去调用$apply了。
新手常碰到的一个问题就是为啥下面的代码不起作用

```javascript
$('#btn').on('click', function() {
  $scope.val = 1;
});
```

因为我们没有用Angular1提供的事件系统，所以Angular1没法自动帮我们调用$apply，这里我们只能手动调用$apply进行脏值检测了

```javascript
$('#btn').on('click', function() {
  $scope.val = 1;
  $scope.$apply();
});
```

## 小结

在Angular1中我们是直接操作数据的，这个过程Angular1是感知不到的，只能在某个点调用$apply进行脏值检测，所以默认就是批量更新。如果我们不使用Angular1提供的事件系统、定时器和$http，如在jQuery事件中进行数据更新时，我们需要手动调用$apply。

# Angular2

![alt](/img/change-detection-and-batch-update/ng2-change-detection.svg)

当数据变化时，Angular2从根节点往下遍历进行更新，默认Angular2深度遍历数据，进行新老数据的比较来决定是否更新UI，这点和Angular1的脏值检测有点像，但是Angular2的更新没有副作用，是单向数据流。
同时大家也不用担心性能问题

> It can perform hundreds of thousands of checks within a couple of milliseconds. This is mainly due to the fact that Angular generates VM friendly code — by Pascal Precht

Angular2也提供了不同的检测策略，例如

```javascript
@Component({
  selector: 'child',
  template: `
    <div>{{data.name}}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

![alt](/img/change-detection-and-batch-update/ng2-change-detection-onpush.svg)

设置了变化检测策略为`OnPush`的组件不走深度遍历，而是直接比较对象的引用来决定是否更新UI。

## Zone.js

Angular2同Angular1一样都是直接操作数据的，框架都无法直接感知数据的变化，只能在特定的时机去做批量更新。
Angular1是通过封装自动调用$apply，但是存在手动调用的场景，为了解决这个问题，Angular2没有采用1的实现机制，转而使用了Zone.js。

Zone.js最主要的功能就是可以获取到异步方法执行的上下文。什么是执行上下文？例如

```javascript
function foo() {
  bar();
}

foo();
baz();
```

同步的方法我们可以明确的知道`bar`什么时候执行和结束，可以在`bar`结束的时候调用`baz`。但是对于异步方法，例如

```javascript
function foo() {
  bar();
}

setTimeout(foo);
baz();
```

我们无法知道`foo`是什么时候开始执行和结束，因为它是异步的。如果调用改成这样

```javascript
function foo() {
  bar();
}

setTimeout(function() {
  foo();
  baz();
});
```

通过添加一层wrapper函数，不就可以保证在`foo`执行完调用`baz`了么。Zone.js主要重写了浏览器所有的异步实现，如setTimeout、XMLHttpRequest、addEventListener等等，然后提供钩子函数，

```javascript
new Zone().fork({
  beforeTask: function() {
    console.log('beforeTask');
  },
  afterTask: function() {
    console.log('afterTask');
  }
}).run(function mainFn() {
  console.log('main exec');
  setTimeout(function timeoutFn() {
    console.log('timeout exec');
  }, 2000);
});
```

打开控制台，你会发现打印如下

```bash
beforeTask
main exec
afterTask

beforeTask
timeout exec
afterTask
```

Zone.js捕获到了mainFn和timeoutFn执行的上下文，这样我们就可以在每个task执行结束后执行更新UI的操作了。Angular2更新机制大体如下

```javascript
class ApplicationRef {
  changeDetectorRefs:ChangeDetectorRef[] = [];

  constructor(private zone: NgZone) {
    this.zone.onTurnDone
      .subscribe(() => this.zone.run(() => this.tick());
  }

  tick() {
    this.changeDetectorRefs
      .forEach((ref) => ref.detectChanges());
  }
}
```

ngZone是对Zone.js的服务封装，Angular2会在每个task执行结束后触发更新。

## 小结

由于Zone.js的存在，我们可以在任何场景下更新数据而无需手动调用检测，Angular2也是批量更新。

# Vue

![alt](/img/change-detection-and-batch-update/vue.png)

Vue模板中每个指令/数据绑定都有一个对应的watcher对象，当数据变化时，会触发watcher重新计算并更新相应的DOM。

## setter

Vue通过Object.defineProperty将data转化为getter/setter，这样我们直接修改数据时，Vue就能够感知到数据的变化了，这个时候就可以进行UI更新了。
如果我们连续更新数据，Vue会立马更新DOM还是和React一样先缓存下来等待状态稳定进行批量更新呢？我们还是从应用程序状态改变的三种情景来看

```javascript
var vm = new Vue({
  el: '#app',
  data: {
    val: 0
  },
  methods: {
    onClick: function() {
      vm.val = 1;
      console.log(vm.$el.textContent);

      vm.val = 2;
      console.log(vm.$el.textContent);
    }
  }
});
```

打开控制台，点击按钮会发现打印`0 0`，说明Vue并不是立马更新的，走的是批量更新。由于事件系统用的Vue提供的，是可控的，我们再看下定时器下执行的情况

```javascript
var vm = new Vue({
  el: '#app',
  data: {
    val: 0
  }
});

setTimeout(function() {
  vm.val = 1;
  console.log(vm.$el.textContent);

  vm.val = 2;
  console.log(vm.$el.textContent);
});
```

打开控制台，点击按钮会发现依旧打印了`0 0`，有人可能就疑惑了Vue是不是跟Angular2一样也修改了异步方法的原生实现呢？
Vue并没有这么干，不用于React、Angular1/2捕获异步方法上下文去更新，Vue采用了不同的更新策略。

## 异步更新队列

> 每当观察到数据变化时，Vue就开始一个队列，将同一事件循环内所有的数据变化缓存起来。如果一个watcher被多次触发，只会推入一次到队列中。
等到下一次事件循环，Vue将清空队列，只进行必要的DOM更新。在内部异步队列优先使用MutationObserver，如果不支持则使用setTimeout(fn, 0) — vuejs.org

这是官方文档上的说明，抽象成代码就是这样的

```javascript
var waiting = false;
var queue = [];

function setter(val) {
  if(!waiting) {
    waiting = true;
    
    setTimeout(function() {
      queue.forEach(function(item) {
        // 更新DOM
      });
      
      waiting = false;
      queue = [];
    }, 0);
  } else {
    queue.push(val);
  }
}

setter(1);
setter(2);
```

Vue是通过JavaScript单线程的特性，利用事件队列进行批量更新的。

## config.async

我们可以通过将Vue.config.async设置为false，关闭异步更新机制，让它变成同步更新，看下面的例子

```javascript
Vue.config.async = false;

var vm = new Vue({
  el: '#app',
  data: {
    val: 0
  }
});

setTimeout(function() {
  vm.val = 1;
  console.log(vm.$el.textContent);

  vm.val = 2;
  console.log(vm.$el.textContent);
});
```

打开控制台你会发现打印了`1 2`，但是最好别这么干
 
> 如果关闭了异步模式，Vue 在检测到数据变化时同步更新 DOM。在有些情况下这有助于调试，但是也可能导致性能下降，并且影响 watcher 回调的调用顺序。async: false不推荐用在生产环境中 — vuejs.org

# 总结

自此我们分析了React、Angular1/2和Vue的变化检测以及批量更新的策略。
React和Angular1/2都是通过获取执行上下文来进行批量更新，但是React和Angular1支持的并不彻底，都有各自的问题。
Angular2可以适配任意情况，但是是通过篡改了原生方法实现的。Vue则通过ES5特性和JavaScript单线程的特性进行批量更新，无需特殊处理，可以满足任何情况。