import {Component,Input,Output,EventEmitter} from 'angular2/core';

@Component({
    selector: 'content-component',
    template: `
       <input type="text" [(ngModel)]="content">
       <button (click)="onClick()">保存</button>
    `
})
export class ContentComponent {
    @Input() content:string;
    @Output() save:EventEmitter = new EventEmitter();

    onClick(){
        this.save.emit(this.content);
    }
}