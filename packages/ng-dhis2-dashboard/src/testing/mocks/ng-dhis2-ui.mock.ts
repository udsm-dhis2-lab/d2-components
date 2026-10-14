import { Component, NgModule } from '@angular/core';

@Component({ selector: 'ng-dhis2-ui-wrapper', template: '', standalone: true })
export class ReactWrapperComponent {}

@Component({
  selector: 'ng-dhis2-ui-period-selector-modal',
  template: '',
  standalone: true,
})
export class PeriodSelectorComponent {}

@Component({
  selector: 'ng-dhis2-ui-org-unit-selector-modal',
  template: '',
  standalone: true,
})
export class OrganisationUnitSelectorComponent {}

@NgModule({ imports: [ReactWrapperComponent], exports: [ReactWrapperComponent] })
export class ReactWrapperModule {}

@NgModule({
  imports: [PeriodSelectorComponent],
  exports: [PeriodSelectorComponent],
})
export class PeriodSelectorModule {}

@NgModule({
  imports: [OrganisationUnitSelectorComponent],
  exports: [OrganisationUnitSelectorComponent],
})
export class OrganisationUnitSelectorModule {}
