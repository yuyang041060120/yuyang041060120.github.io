import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div>{{content}}</div>
        <input type="text" bindon-ngModel="content">
    `
})
export class AppComponent {
    content:string = 'init';
}