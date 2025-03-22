import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ProgramEntryFormConfig } from './models';

@Component({
  selector: 'ng-dhis2-ui-program-entry-form',
  templateUrl: './program-entry-form.component.html',

  imports: [CommonModule],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ProgramEntryFormModule {
  config = input.required<ProgramEntryFormConfig>();
  trackedEntity = input<string>();
  event = input<string>();

  ngOnInit(): void {}
}
