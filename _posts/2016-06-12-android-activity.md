---
layout:     post
title:      "Android Activity"
date:       2016-06-11 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/android-activity/bg.jpg"
---

# 前言

最近正式开始学习Android开发，首先简单了解了下Activity，随手写下一些感受。

# 作用

Activity是Android开发的四大组件之一，也是Android应用的界面容器。
Activity本身是没有界面的，这个就有点类似于web开发当中的浏览器，通过加载HTML文件展示内容，Activity也需要指定布局文件。
我们在布局文件中添加各种控件、样式和交互，类似于往HTML文件当中添加控件、CSS样式并绑定交互事件。
web SPA开发和Android开发有很多共通之处，比如

- 路由组件的HTML，Activity的布局XML
- 路由组件的CSS，Activity的控件样式
- 路由组件的跳转，Activity的跳转
- 路由组件的生命周期，Activity的生命周期
- 路由组件组件之间的数据传递，Activity间的数据传递
- ...

通过类比的方式，Android的概念和设计理念对我来说会比较容易学习和理解。优秀的设计思想永远是共通的！

# 使用

添加一个Activity主要分为三步：

**添加一个类并继承Activity**

```java
public class MainActivity extends Activity {
}
```

**添加布局文件，并在OnCreate中指定**

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context="com.example.yyy.myapplication.MainActivity">
</LinearLayout>
```

```java
public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

**在AndroidManifest.xml中注册该Activity**

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.yyy.myapplication">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity android:name=".MainActivity"/>
    </application>
</manifest>
```

实际上我们添加Activity的时候没必要这么麻烦，IDE会帮我们自动去完成这些重复的工作。
如使用Android Studio，我们只需要新建一个Class，并进行相应的配置即可，十分方便。
优秀的程序员不应该进行重复且没有意义劳动，交给工具或者代码吧。

> 吐糟下Activity注册的方式，为啥不采用注解，而使用xml这种模式。

# 生命周期

![alt](/img/android-activity/1.png)

Activity主要有七个生命周期方法

- onCreate　初始状态，指定布局文件，为控件绑定交互事件
- onStart　可见状态，但是无法获取焦点
- onRestart　由stop状态重新激活时调用
- onResume　激活状态，获取焦点，可以同用户交互
- onPause　暂停状态，部分被遮盖，如弹出一个dialog
- onStop　停止状态，完全覆盖不可见，如跳转到另一个Activity后
- onDestroy　被销毁前调用

当Activity处于生命周期的不同阶段，我们可以进行不同的处理。
例如一个音乐播放器，当手机来电话时，播放Activity会处于stop状态，这个时候我们应该在`onStop`方法中停止音乐的播放，当打完电话，重新回到播放器的时候，我们可以在`onRestart`方法中重新启动播放程序。
当Activity被销毁时，我们应该在`onDestroy`方法中释放掉占用的资源。
如果你熟悉React的话，应该对其生命周期方法不陌生，可以进行一个简单的类比

```javascript
class Timer extends Component {
    state = {secondsElapsed: 0}

    tick() {
        this.setState({secondsElapsed: this.state.secondsElapsed + 1});
    }
    componentDidMount() {
        this.interval = setInterval(this.tick.bind(this), 1000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    render() {
        return (
            <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
        );
    }
}
```

# Intent

Intent是Activity之间跳转和数据传递的媒介。

## 跳转

### 显式

直接指定目标Activity的类或者类名

```java
// setClass
Intent intent = new Intent();
intent.setClass(MainActivity.this, FirstActivity.class);
startActivity(intent);

// setClassName
Intent intent = new Intent();
intent.setClassName(MainActivity.this, "com.example.yyy.myapplication.activity.FirstActivity");
startActivity(intent);

// setComponent
Intent intent = new Intent();
ComponentName componentName = new ComponentName(MainActivity.this, "com.example.yyy.myapplication.activity.FirstActivity");
intent.setComponent(componentName);
startActivity(intent);
```

也可以改成构造函数

```java
Intent intent = new Intent(MainActivity.this, FirstActivity.class);
startActivity(intent);
```

### 隐式

通过Activity注册时添加的`intent-filter`中的Action启动

```xml
<activity
    android:name=".activity.FirstActivity"
    android:label="First">
    <intent-filter>
        <action android:name="NNN" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>
```

```java
Intent intent = new Intent();
intent.setAction("NNN");
startActivity(intent);
```

一般调用系统的Activity采用隐式启动的方式，例如拨打电话，发送短信等

## 数据传递

通过Intent的`putExtra`，可以传递一些基本数据类型，如

```java
// 发送数据
Intent intent = new Intent();
intent.putExtra("id", 54864);

// 接收数据
Intent intent = getIntent();
System.out.println(intent.getIntExtra("id", 0));
```

传递复杂数据的时候需要使用到`Bundle`这个类，例如现在我们有一个`User`的实例数据需要传递，首先我们需要做的就是实现Serializable或Parcelable接口

### Serializable

```java
public class User implements Serializable {
    public String name;
    public int id;
}
```

### Parcelable

```java
public class User implements Parcelable {
    public String name;
    public int id;

    public User(){

    }

    protected User(Parcel in) {
        name = in.readString();
        id = in.readInt();
    }

    public static final Creator<User> CREATOR = new Creator<User>() {
        @Override
        public User createFromParcel(Parcel in) {
            return new User(in);
        }

        @Override
        public User[] newArray(int size) {
            return new User[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel parcel, int i) {
        parcel.writeString(name);
        parcel.writeInt(id);
    }
}
```

那么两者有什么区别

- Serializable编程简单；Parcelable复杂些，看上面的例子就知道了
- Serializable使用IO读写在硬盘上；Parcelable直接在内存中读写，效率更高

## Bundle和HashMap

Bundle在API操作上和HashMap有很多类似的地方，为啥不直接使用HashMap转而创建了一个新的类Bundle

- Activity之间一般都是小数据的传递。Bundle内部是通过ArrayMap实现的，而HashMap内部是链表+数组，Bundle查找更快，占用的内存更少。
- HashMap使用Serializable进行序列化，而Bundle则是使用Parcelable进行序列化，效率更高
- 专门的数据结构，封装性和针对性更好

## 数据回传

我们可以从Activity A跳转到Activity B并传递数据，反过来A也可以从B当中获取数据，典型的例子就是填写提交信息的时候选择省市县

```java
startActivityForResult(intent, 100);
```

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);

    if (RESULT_OK == resultCode && requestCode == 100) {
        // todo
    }
}
```

```java
Intent intent = new Intent();
intent.putExtra("province", "jiangsu");
setResult(RESULT_OK, intent);
```

# 启动模式

![alt](/img/android-activity/2.png)

通过AndroidManifest.xml可以指定Activity的启动模式

```xml
<activity
    android:name=".activity.FirstActivity"
    android:label="First" android:launchMode="singleTop"/>
```

- standard 默认的启动方式，每次都会新建一个Activity实例
- singleTop 查看当前task栈顶是否是该Activity实例，是的话则不创建新的实例，否则创建
- singleTask 查看当前task栈中是否有该Activity的实例，有的话将该Activity之上的其它Activity出栈
- singleInstance 创建一个新的task栈，同时创建新的Activity实例，并放入该task栈中

也可以在代码中指定启动模式

```java
Intent intent = new Intent();
intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
```

The End.