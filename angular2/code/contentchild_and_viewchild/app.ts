import {Component,ContentChildren,QueryList} from 'angular2/core';
import {TabsComponent} from './tabs';
import {TabComponent} from './tab';

@Component({
    selector: 'my-app',
    template: `
        <h2>App Component</h2>
        <tabs>
            <tab tabTitle="First">
                <p>This Tab Content 1</p>
            </tab>
            <tab tabTitle="Second">
                <p>This Tab Content 2</p>
            </tab>
            <tab tabTitle="third">
                <p>This Tab Content 3</p>
            </tab>
        </tabs>
    `,
    directives: [TabsComponent,TabComponent]
})
export class AppComponent {
}