import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { sharedComponents } from './components';

@NgModule({
  imports: [CommonModule],
  declarations: [...sharedComponents],
  exports: [...sharedComponents],
})
export class SharedDhis2UiModule {}
