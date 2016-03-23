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