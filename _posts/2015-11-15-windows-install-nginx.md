---
layout:     post
title:      "Windows Install Nginx"
date:       2015-11-15 21:00:00 GMT+8
author:     "YanYang Yu"
header-img: "img/windows-install-nginx/bg.png"
---
# 安装

## 下载

先上[官网](http://nginx.org/en/download.html)上下载，注意点击红色圈出的链接，不要点左边的的哦。

![](/img/windows-install-nginx/1.PNG)

比如我下载了1.8.0版本的，下载完成后解压文件，这里我解压到了E盘的根目录下。

![](/img/windows-install-nginx/2.PNG)

## 启动

通过命令行进入nginx的根目录下，然后敲命令start nginx

![](/img/windows-install-nginx/3.PNG)

在浏览器访问localhost，可以看到下面的东东，那么恭喜你启动成功。

![](/img/windows-install-nginx/4.PNG)

通过命令nginx -s stop可以彻底关闭nginx

![](/img/windows-install-nginx/5.PNG)

# 作为服务启动

关机后，nginx也会关闭。每次开机后要想启动nginx都得这样操作一遍，太蛋疼了，能不能让nginx能够开机自启动呢？

## Windows Service Wrapper

先去[Windows Service Wrapper](http://repo.jenkins-ci.org/releases/com/sun/winsw/winsw/)下载exe文件，我这里选择了1.10版本。

![](/img/windows-install-nginx/6.PNG)

![](/img/windows-install-nginx/7.PNG)

下载完成后拷贝到nginx的根目录下，名字太长，我顺便改个名字。

![](/img/windows-install-nginx/8.PNG)

然后新建一个nsw.xml的文件，注意了文件名称一定要和这个exe文件同名，然后输入以下内容，里面的路径替换成你自己的。

```xml
<service>
  <id>nginx</id>
  <name>nginx</name>
  <description>nginx</description>
  <executable>E:\nginx-1.8.0\nginx.exe</executable>
  <logpath>E:\nginx-1.8.0\</logpath>
  <logmode>roll</logmode>
  <depend></depend>
  <startargument>-p E:\nginx-1.8.0</startargument>
  <stopargument>-p E:\nginx-1.8.0 -s stop</stopargument>
</service>
```

命令行进入nginx根目录下运行nsw.exe install

![](/img/windows-install-nginx/9.PNG)

然后查看windows服务

![](/img/windows-install-nginx/10.PNG)

![](/img/windows-install-nginx/11.PNG)

如果服务没有启动，可以右键启动它。nginx从此就作为服务自启动了哦。当然了这种方法失败了话，可以试试下面的方法。

## NSSM

先去[NSSM](http://nssm.cc/download)下载后解压到任意目录，这里我解压到E盘根目录下。

![](/img/windows-install-nginx/12.PNG)

![](/img/windows-install-nginx/13.PNG)

命令行进入nssm的根目录下，进入相应的版本里，如我是64位系统，进入win64。然后运行nssm.exe install.

![](/img/windows-install-nginx/14.PNG)

然后选择nginx.exe路径即可,Service name也就是服务名称了，这里我输入nginx。然后Install service。

![](/img/windows-install-nginx/15.PNG)

最后查看我们的服务里是否有nginx。

![](/img/windows-install-nginx/16.PNG)