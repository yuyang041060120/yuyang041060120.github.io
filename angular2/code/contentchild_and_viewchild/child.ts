import {Component} from 'angular2/core';

@Component({
    selector: 'my-child',
    template: `
        <div>Child Component</div>
    `
})
export class ChildComponent {
    name:string = 'childName';
}