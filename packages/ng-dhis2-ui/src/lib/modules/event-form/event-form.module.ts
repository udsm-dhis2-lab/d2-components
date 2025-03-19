import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EventFormComponent } from './event-form.component';
import { D2FormModule } from '../form';

@NgModule({
  imports: [CommonModule, D2FormModule],
  declarations: [EventFormComponent],
  exports: [EventFormComponent],
})
export class EventFormModule {}
