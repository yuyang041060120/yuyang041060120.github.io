# 数据展示
通过展示一组学生数据，来更好的理解组件，如果你还不清楚组件是什么，请参考[Simple Component](simple_component.md)

*app.ts*

首先定义一组学生数据，有id和姓名，然后定义我们的组件，包含一个标题和学生的集合

    var students = [
        {
            id: 1,
            name: 'Mary'
        },
        {
            id: 2,
            name: 'Helen'
        },
        {
            id: 3,
            name: 'Jack'
        }
    ];

    @Component({
        selector: 'my-app',
        templateUrl: 'displaying_data/app.html'
    })
    export class AppComponent {
        title:string = 'Students List';
        students:any;
    }

然后我们在组件的构造函数中，给students赋值

    export class AppComponent {
        title:string = 'Students List';
        students:any;
    
        constructor() {
            this.students = students;
        }
    }

*app.html*

在组件模板中添加我们的渲染逻辑

    <h3>{{title}}</h3>
    <ul>
        <li *ngFor="#stu of students;#i = index">
            {{i + 1}}-{{stu.name}}
        </li>
    </ul>

## ngFor
ngFor是angular2内置的指令，用来循环列表数据，通过**#**的方式来声明一个变量，很明显stu用来接收单个循环的数据，i用来获取循环的index

> 千万不要忘了ngFor前面的*号

*bootstrap.ts*

初始化完成后，需要启动我们的应用程序

    import {bootstrap}    from 'angular2/platform/browser';
    import {AppComponent} from './app';
    
    bootstrap(AppComponent);

*index.html*

在HTML中调用组件

    <body>
    <my-app>loading...</my-app>
    
    <script src="node_modules/systemjs/dist/system.js"></script>
    <script src="node_modules/typescript/lib/typescript.js"></script>
    
    <script src="node_modules/angular2/bundles/angular2-polyfills.js"></script>
    <script src="node_modules/rxjs/bundles/Rx.js"></script>
    <script src="node_modules/angular2/bundles/angular2.dev.js"></script>
    <script>
        System.config({
            transpiler: 'typescript',
            typescriptOptions: {emitDecoratorMetadata: true},
            packages: {
                displaying_data: {
                    defaultExtension: 'ts'
                }
            }
        });
        System.import('displaying_data/bootstrap')
                .then(null, console.error.bind(console));
    </script>
    </body>

最后在浏览器中访问index.html（注意是以服务器的形式打开），看到效果如下

![alt](images/displaying_data/1.png)

# 面向对象
上述示例的代码中，我们只能了解到了ngFor这个知识点，因为真实的开发中，没有人会像上面那样编码，没有任何的组织逻辑，数据也不可能写死在代码中。
Angular2的代码组织是以类为单位的，下面我们带着面向对象的思想对整个代码进行重构，尽量模拟真实的开发环境。

*student.ts*

首先我们将学生抽象一个类，有id和name两个属性

    export class Student {
        id:number;
        name:string;
    }

*students.json*

学生的数据从服务端获取，我们可以新建一个json文件来模拟数据库

    [
      {
        "id": 1,
        "name": "Mary"
      },
      {
        "id": 2,
        "name": "Helen"
      },
      {
        "id": 3,
        "name": "Jack"
      }
    ]
    
*student.service.ts*

对学生数据的操作封装成一个服务类

    export class StudentService{}

从服务端获取数据就需要我们使用Angular2的Http模块了，首先需要我们引入http.dev.js

    ...
    <script src="node_modules/angular2/bundles/angular2.dev.js"></script>
    <script src="node_modules/angular2/bundles/http.dev.js"></script>    

在服务中添加获取学生数据的代码

    import {Injectable} from 'angular2/core';
    import {Http}       from 'angular2/http';
    
    @Injectable()
    export class StudentService {
        constructor(private http:Http) {
        }
    
        getStudents() {
            return this.http.get('displaying_data/students.json');
        }
    }

这里涉及到依赖注入的知识点，暂时我们可以不关注

*app.ts*

然后在组件初始化的时候调用服务获取数据

    import {Component}      from 'angular2/core';
    import {HTTP_PROVIDERS}       from 'angular2/http';
    import {Student}        from './student';
    import {StudentService} from './student.service';
    
    @Component({
        selector: 'my-app',
        templateUrl: 'displaying_data/app.html',
        providers: [HTTP_PROVIDERS,StudentService]
    })
    export class AppComponent {
        title:string = 'Students List';
        students:Student;
    
        constructor(studentService:StudentService) {
            studentService.getStudents().subscribe((res)=> {
                this.students = res.json();
            })
        }
    }

# 小结
上述内容基本描述了从获取数据到渲染的整个流程。Angular2是以类为单位进行模块的划分，依赖注入帮我们管理类，无需我们手动new，Angular2的开发已经很接近Java了。

[示例代码参考](https://github.com/yuyang041060120/yuyang041060120.github.io/tree/master/angular2/code/displaying_data)