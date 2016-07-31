---
layout:     post
title:      "React的几点疑问"
date:       2016-07-31 12:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/questions-about-react/bg.jpg"
---

# No Directive

如果你熟悉Angular的话,对指令这个概念应该不陌生。指令可以赋予DOM元素特殊的行为,看个简单的例子

```javascript
angular.module('app', [])
  .directive('highlight', function () {
    return {
      scope: {
        highlight: '@'
      },
      link: function (scope, element) {
        element.on('mouseenter', function () {
          element.css('background-color', scope.highlight);
        }).on('mouseleave', function () {
          element.css('background-color', '');
        });
      }
    }
  });
```

然后我们就可以给不同的元素赋予这个高亮特性了

```html
<div highlight="green">This is div.</div>
<p highlight="red">This is p.</p>
<span highlight="blue">This is span.</span>
```

接下来我们在React当中实现同样的功能

```javascript
class Highlight extends React.Component {
  static props = {
    color: ''
  }

  handleMouseEnter = (e) => {
    e.target.style.backgroundColor = this.props.color;
  }

  handleMouseLeave = (e) => {
    e.target.style.backgroundColor = '';
  }

  render() {
    return <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>{this.props.children}</div>
  }
}

const ComponentA = () => <span>Component A</span>;
const ComponentB = () => <p>Component B</p>;
````

```html
<Highlight color="red">
  <ComponentA/>
</Highlight>
<Highlight color="green">
  <ComponentB/>
</Highlight>
```

为了不侵入每个组件内部,我抽象了一个Highlight组件来实现这个功能,很明显结构上还是有所冗余,外层包了div,要做到无结构侵入
还需要在Highlight中做一些额外处理,将事件绑定到children上。除此之外,声明结构的复杂度增加,如果我在告诉你需要添加一个tooltip的功能呢?

为什么我纠结于此?先说一下我对于组件和指令的理解

## 我眼中的组件&&指令

### 组件

HTML是一门声明式的语言,组件就类似于div、p等结构式的标签,通过添加组件我们可以构建我们的页面基础,例如原生的HTML是不支持Dialog
特性的,通过拓展让我们可以在页面中声明式的使用,相比命令式的使用Dialog而言,组件的可读性、复用性更强。
为什么目前App的开发倾向于HyBird,因为原生App组件的创建还是以命令式为主,增加了开发和维护的难度,所以需要结合原生性能的优势和WEB开发声明式的特点。

### 指令

指令我更愿意称之为属性拓展,最典型的一个例子就是title,可以无侵入的拓展我们组件的行为,例如

```html
<div title="This is div.">div</div>
<p title="This is p.">p</p>
<span title="This is span.">span</span>
```

然而React并没有该方面的支持,所有类似的功能只能靠组件去堆叠。就像这样

```html
<Highlight color="red">
  <Tooltip title="This is component A.">
    <ComponentA/>
  </Tooltip>
</Highlight>
<Highlight color="green">
  <Tooltip title="This is component B.">
    <ComponentB/>
  </Tooltip>
</Highlight>
```

WHY?

# Change Detection of 1/3

当数据改变时,MVVM框架或者React这种View库会自动帮我们更新UI,这里有一个很重要的点,框架或库是怎么知道数据改变了?
实际上数据改变有三种情况

- 事件: click, submit...
- 异步请求
- 定时器: setTimeout/setInterval

先看看Angular是怎么处理的

- ng-event
- $http
- $timeout/$interval

Angular对三种情况都进行了封装,所以可以等到`函数`执行完了再触发$digest,如果我们不使用Angular的封装,Angular直接懵逼
例如不使用$timeout

```javascript
angular.module('app', [])
  .controller('MyCtrl', function ($scope) {
    $scope.name = 'xxx';

    setTimeout(function () {
      $scope.name = 'yyy';
    }, 1000);
  });
```

我们再来看看React的处理

- onEvent
- no
- no

除了事件以外,另外两个没有任何处理,看个简单例子先

```javascript
class App extends React.Component {
  state = {
    val: 0
  }

  handleReactEvent = () => {
    this.setState({val: this.state.val + 1});
    console.log(this.state.val);

    this.setState({val: this.state.val + 1});
    console.log(this.state.val);
  }

  componentDidMount() {
    this.setState({val: this.state.val + 1});
    console.log(this.state.val);

    this.setState({val: this.state.val + 1});
    console.log(this.state.val);
          
    fetch('/data').then(() => {
      this.setState({val: this.state.val + 1});
      console.log(this.state.val);

      this.setState({val: this.state.val + 1});
      console.log(this.state.val);
    });

    this.refs.btn.addEventListener('click', () => {
      this.setState({val: this.state.val + 1});
      console.log(this.state.val);

      this.setState({val: this.state.val + 1});
      console.log(this.state.val);
    });

  }

  render() {
    return (
      <div>
        <button onClick={this.handleReactEvent}>React Event</button>
        <button ref="btn">DOM Event</button>
      </div>

    )
  }
}
```

先点击React Event在点击DOM Event,然后打开控制台输出如下

```
0
0
2
3
3
3
5
6
```

仔细观察你会发现处于React生命周期和封装事件当中时,不会立马更新state,而处于其他范围,如xhr请求和定时器当中时,就会立马更新state。
总说setState是一个异步操作,不会立马更新UI,这里要加一个限制条件,只有处于React的生命周期函数和事件函数当中才会,否则就是一个同步的操作。
所以我说React的Change Detection只有三分之一。即使React有Virtual DOM,有diff判断,但是这样的设计初衷在哪?

# Syntactic Sugar

直接上代码

```javascript
render() {
  var aClassNames, bClassNames;
  var renderComponent = null;

  if (this.state.activeA) {
    aClassNames = 'classA active';
  } else {
    aClassNames = 'classA';
  }

  if (this.state.activeB) {
    aClassNames = 'classB active';
  } else {
    aClassNames = 'classB';
  }
  
  if (this.state.condition) {
    renderComponent = <ComponentA />
  } else {
    renderComponent = <ComponentB />
  }

  return (
    <div className={aClassNames}>
      <p className={bClassNames}>pa</p>
      <p>pb</p>
      {renderComponent}
    </div>

  )
}
```

```javascript
render() {
  return (
    <div style={{display: this.state.data ? 'block' : 'none'}}>
      <p>{this.state.data ? this.state.data.id : ''}</p>
      <p>{this.state.data ? this.state.data.name : ''}</p>
      <p>...</p>
    </div>

  )
}
```

特别是上述display的处理,写起来真心烦。还有糟糕的表单,某种程度上React增加很多重复的代码,内部代码偏命令式。虽然说React可以让我们纯粹的写JavaScript,不加限制。
但是JavaScript当中的糟粕也一并留下来了,作为一个框架也好,View库也好,难道不应该简化程序员的工作吗?

The End.