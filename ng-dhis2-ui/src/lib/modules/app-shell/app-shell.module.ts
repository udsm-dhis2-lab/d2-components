import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { AppShellComponent } from './app-shell.component';

@NgModule({
  declarations: [AppShellComponent],
  imports: [CommonModule, SharedDhis2UiModule],
  exports: [AppShellComponent],
})
export class AppShellModule {}
