import { D2Web } from '@iapps/d2-web-sdk';

export * from './lib/ng-dhis2-shell.module';
export * from './lib/ng-dhis2-shell.component';
export * from './lib/ng-dhis2-shell-wrapper.component';

const d2Web: D2Web = (window as any)?.d2Web;

export { d2Web };
