import { Component, OnInit } from '@angular/core';
import { FilterService, PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig, private filterService: FilterService) { }

    ngOnInit() {
        this.primengConfig.ripple = true;

        const customFilterName = 'intersects';
        this.filterService.register(customFilterName, (value: any, filter: any): boolean => {
            if (filter == null || filter.length == 0) {
                return true;
            }

            console.log(value, filter);
            return value.some((r) => filter.includes(r));
        });
    }
}
