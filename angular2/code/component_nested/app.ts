import {Component}        from 'angular2/core';
import {ContentComponent} from './content';

@Component({
    selector: 'my-app',
    template: `
        <h1>{{title}}</h1>
        <content-component [content]="content" (save)="onSave($event)"></content-component>
    `,
    directives: [ContentComponent]
})
export class AppComponent {
    title:string = 'App Component';
    content:string = 'Content A';

    onSave(newContent) {
        alert(newContent);
    }
}