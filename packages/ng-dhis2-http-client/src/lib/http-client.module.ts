import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';

import {
    IndexDbService,
    IndexDbServiceConfig,
} from './services/index-db.service';

export function initializeDb(indexDbServiceConfig: IndexDbServiceConfig) {
    return () => new IndexDbService(indexDbServiceConfig);
}

// @dynamic
@NgModule({
    imports: [HttpClientModule],
})
export class NgxDhis2HttpClientModule {
    static forRoot(config: IndexDbServiceConfig): ModuleWithProviders<NgxDhis2HttpClientModule> {
        return {
            ngModule: NgxDhis2HttpClientModule,
            providers: [
                { provide: IndexDbServiceConfig, useValue: config },
                {
                    provide: APP_INITIALIZER,
                    useFactory: initializeDb,
                    deps: [IndexDbServiceConfig],
                    multi: true,
                },
            ],
        };
    }
}
