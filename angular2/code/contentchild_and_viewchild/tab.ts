import {Component,Input} from 'angular2/core';

@Component({
    selector: 'tab',
    template: `
        <p [hidden]="!show">
            <ng-content></ng-content>
        </p>
    `
})
export class TabComponent {
    @Input()
    tabTitle:string;

    show:boolean = false;
}