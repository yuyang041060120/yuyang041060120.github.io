import {Component,ViewChildren,AfterViewInit,QueryList} from 'angular2/core';
import {ChildComponent}         from './child';

@Component({
    selector: 'my-parent',
    template: `
       <div>Parent Component</div>
       <my-child></my-child>
       <my-child></my-child>
    `,
    directives: [ChildComponent]
})
export class ParentComponent implements AfterViewInit {
    @ViewChildren(ChildComponent)
    childs:QueryList<ChildComponent>;

    ngAfterViewInit() {
        console.log(this.childs)
    }
}