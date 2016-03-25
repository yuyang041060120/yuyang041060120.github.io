import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: `
        <div [style.backgroundColor]="backgroundColor">App Component</div>
        <button on-click="addBgColor($event)">添加背景色</button>
    `
})
export class AppComponent {
    backgroundColor:string;

    addBgColor(e) {
        this.backgroundColor = 'red';
        e.target.textContent = '文字改变了';
    }
}