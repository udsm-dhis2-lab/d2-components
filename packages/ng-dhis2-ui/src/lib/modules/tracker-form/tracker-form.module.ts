import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TrackerFormComponent } from './tracker-form.component';
import { D2FormModule } from '../form';

@NgModule({
  imports: [CommonModule, D2FormModule],
  declarations: [TrackerFormComponent],
  exports: [TrackerFormComponent],
})
export class TrackerFormModule {}
