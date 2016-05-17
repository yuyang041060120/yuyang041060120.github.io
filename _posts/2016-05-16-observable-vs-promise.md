---
layout:     post
title:      "Promise vs Observable"
date:       2016-05-16 17:30:00 GMT+8
author:     "YanYang Yu"
header-img: "img/observable-vs-promise/bg.png"
---

# 前言

学习Angular2的过程当中，发现Angular2并没有沿用1当中的$q，继续使用Promise来处理异步流程，转而拥抱了Rxjs的Observable。
为什么Angular2的开发团队作出了这样的选择？这要对Promise和Observable适用场景作出比较。

# Promise/A+

Promise通过链式调用让我们能够以同步的形式编写异步流程，当然了要多写一些额外的代码，例如

```javascript
promise.then(getData).then(getNextData).then(getNextNextData).catch(fail)...
```

基本上就是不停的添加then，额外的代码多多少少会影响整个逻辑的可读性，没有格式化的代码就更难阅读和理解了。
Promise/A+是在Promise的基础上作出的一些规范和约定，详细的内容见[这里](https://promisesaplus.com/)。
Promise主要是通过内部缓存和函数队列来实现的，[这里](https://www.promisejs.org/implementing/)有一个详细的教程，有兴趣的可以看下。
目前大部分主流浏览器都已经支持Promise了

![alt](/img/observable-vs-promise/1.png)

上面我说额外的代码会影响可读性，这都不是重点，我们可以通过优雅的代码组织来提高可读性，但是Promise的设计缺陷就不是那么好规避的了。

## 延迟

图片懒加载相信大家都很熟悉，滚动到特定区域才会加载该区域的图片。这样可以大量减少HTTP的请求数目，有效的提高首屏的加载速度。
那么Promise是不是也会等到我们添加then的时候才会执行呢？看个例子

```javascript
var promise = new Promise((resolve,reject)=> {
  console.log('promise exec');
  resolve(5);
});
```

我们没有添加then，控制台仍然打印了`promise exec`，这说明Promise是立即执行的，跟你添不添加链式调用没有任何关系。
实际上Promise调用`resolve`的时候，内部缓存了这个值，当我们添加调用`then`的时候，将这个值传递给函数并执行。
如果我们先添加的`then`后执行的`resolve`，那么Promise内部会缓存`then`添加的函数，等到`resolve`执行的时候，在将参数传递给之前缓存的函数并执行。
所以说，Promise不存在什么延迟执行。当然了，基本上不存在调用Promise而不添加then的情况，一般我们都是这样使用Promise的

```javascript
function getProdList(){
  return new Promise((resolve,reject)=> {
    // http
  });
}

getProdList().then(res => {
  // handle res
});
```

## 取消

看个简单的例子：点击按钮，向后端发起一个请求

```javascript
function getProdList() {
    return new Promise((resolve, reject)=> {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ()=> {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            }
        };

        xhr.open('GET', 'package.json', true);
        xhr.send();
    });
}

$fetch.click(()=> {
    getProdList().then(res => {
        console.log(res);
    });
});
```

现在需求变更，添加一个取消按钮，点击后取消发送

```javascript
$cancel.click(()=> {
    // todo
});
```

不知道怎么去编码了，因为Promise压根就没有提供这样的接口，我们也没办法拿到内部的xhr调用`xhr.abort()`。

## 重试

接着上面的例子，请求数据失败后在重试两次。不好意思Promise不提供这样的功能，需要我们自己开发

```javascript
function retry(fn, times) {
    return fn().catch(err => {
        if (times <= 0) return Promise.reject(err);
        return retry(fn, times--);
    });
}

retry(getProdList, 2);
```

## 小结

实际上开发中，我们很少有上述的需求，一是网络够快，没还点取消结果已经返回了。
而且请求很少有失败的需要重试，只有像淘宝这种访问量比较大，首屏加载需要重试机制，但是背后需要大量服务器的支持。
Promise基本能满足我们开发的需求，但是可控性太差，这还远远不够。

# Observable

[RxJS](https://github.com/Reactive-Extensions/RxJS)（Reactive Extensions for javascript），响应式的思路是把随时间不断变化的数据、状态、事件等等转成可被观察的序列(Observable Sequence)，然后订阅序列中那些Observable对象的变化。

![alt](/img/observable-vs-promise/2.png)

Observable可以同我们数组操作进行类比，例如有这样一个数组

```javascript
var arr = [1, 2, 3, 4];
```

我们将每个元素平方，然后过滤掉大于10的数据

```javascript
var newArr = arr.map(x => x * x).filter(x => x <= 10);
```

我们来看看Observable是怎么处理的

```javascript
Rx.Observable.from(arr)
        .map(x => x * x)
        .filter(x => x <= 10)
        .subscribe(x => console.log(x));
```

是不是跟数组的操作很像，异步操作同样可以当做序列

```javascript
Rx.Observable.fromEvent($fetch, 'click')
        .subscribe(e => console.log(e.target === $fetch[0]));
```

这里有个[视频](https://egghead.io/lessons/rxjs-reactive-programming-what-is-rxjs)，比较详细的介绍了什么是RxJS。
使用Observable可以很好的解决Promise的短板，Observable是可控的。

## 延迟

```javascript
var source = Rx.Observable.create(observer=> {
    console.log('observable exec');
    observer.onNext(5);
    observer.onCompleted();
});
```

我们创建了一个Observable，但是没有添加订阅，这时候控制台没有输出任何内容，现在我们添加上订阅

```javascript
source.subscribe(x => console.log(x));
```

打开控制台你会发现输出了相应的内容，通过这个例子可以说明Observable是延迟执行的。

## 取消

拿Promise的例子修改

```javascript
var source = Rx.Observable.create(observer=> {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = ()=> {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                observer.onNext(xhr.responseText);
            } else {
                observer.onError(new Error(xhr.responseText));
            }
            observer.onCompleted();
        }
    };

    xhr.open('GET', 'package.json', true);
    xhr.send();

    return function () {
        xhr.abort();
    }
});

var subscription;

Rx.Observable.fromEvent($fetch, 'click')
        .subscribe(e => {
            subscription = source.subscribe(
                    res => console.log(res),
                    err => console.log(err)
            );
        });

Rx.Observable.fromEvent($cancel, 'click')
        .subscribe(e => {
            if (subscription) {
                subscription.dispose();
            }
        });
```

## 重试

同样拿Promise的例子修改

```javascript
var source = Rx.Observable.create(observer=> {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = ()=> {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                observer.onNext(xhr.responseText);
            } else {
                observer.onError(new Error(xhr.responseText));
            }
            observer.onCompleted();
        }
    };

    xhr.open('GET', 'package.gjson', true);
    xhr.send();

    return function () {
        xhr.abort();
    }
}).retry(3);
```

添加`.retry(3)`即可，为什么是3，因为这里包括本身发送的一次。
Observable有很多操作API，参见[这里](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/libraries/main/rx.complete.md)。

## 小结

Rx.Observable提供了丰富的API供我们使用，十分方便。但是有时候写法会比较复杂，例如事件绑定

```javascript
Rx.Observable.fromEvent($fetch, 'click')
        .subscribe(e => {

        });
```

RxJS是函数式编程的衍生物，所以我们要以函数式编程的思想去看待，不要想着什么OOP了。

# 函数式编程

函数式编程是一种编程范式，指用函数嵌套来操作我们的输入输出，函数也可以作为参数和返回值。这里的函数是指纯函数：相同的输入获取到相同的输出。例如

```javascript
function add(x, y){
    return x + y;
}
```

add函数就是一个纯函数，固定的输入获得固定的输出，如`add(1,2)`输出永远是3。

```javascript
function random(x){
    return x + Math.random();
}
```

random函数就不是纯函数，因为输出是随机的。

## 组合

Observable的链式调用实际上运用了函数式编程当中的组合：通过函数的结合产生新的函数

```javascript
var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};
```

当然也可以添加多个参数

```javascript
var compose = function(e,f,g) {
  return function(x) {
    return e(f(g(x)));
  };
};
```

[ramda](http://ramdajs.com/0.21.0/#)是一个javascript函数式编程库，提供了如curry、compose等等方法。
上面先map后filter的例子利用ramda改成函数式写法

```javascript
function pow2(x) {
    return x * x;
}

function lt10(x) {
    return x <= 10;
}

var resultFn = R.compose(R.filter(lt10), R.map(pow2));
resultFn(arr);
```

是不是觉得很难理解，换成Observable的链式调用对我们来说会更容易理解点。函数式编程博大精深，我也是处于一知半解的状态。

# 总结

接触的越多越无知，学海无涯啊！