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