import {Component, ViewEncapsulation} from 'angular2/core';

@Component({
    selector: 'my-app',
    template: '<div>Component Div</div><p>Component P</p>',
    styleUrls: ['component_styles/app.css'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
}