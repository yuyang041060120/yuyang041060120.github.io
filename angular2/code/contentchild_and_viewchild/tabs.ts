import {Component,ContentChildren,QueryList,AfterContentInit} from 'angular2/core';
import {TabComponent} from './tab';

@Component({
    selector: 'tabs',
    template: `
       <ul class="tab-list">
           <li *ngFor="#tab of tabs" [class.active]="selectedTab===tab" (click)="onSelect(tab)">{{tab.tabTitle}}</li>
       </ul>
       <ng-content></ng-content>
    `,
    styles: [`
        .tab-list{
            list-style:none;
            overflow:hidden;
            padding:0;
        }

        .tab-list li{
            cursor:pointer;
            float:left;
            width:60px;
            height:30px;
            line-height:30px;
            text-align:center;
            background-color:gray;
        }

        .tab-list li.active{
            background-color:red;
        }
    `]
})
export class TabsComponent implements AfterContentInit {
    @ContentChildren(TabComponent)
    tabs:QueryList<TabComponent>;

    selectedTab:TabComponent;

    ngAfterContentInit() {
        this.select(this.tabs.first);
    }

    onSelect(tab) {
        this.select(tab);
    }

    select(tab) {
        this.tabs.forEach((item)=>{
            item.show = false;
        });

        this.selectedTab = tab;
        this.selectedTab.show = true;
    }
}