import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { d2Web } from '@iapps/ng-dhis2-shell';

@Component({
  selector: 'app-web-sdk',
  templateUrl: './web-sdk.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class WebSdkComponent {
  d2 = d2Web;

  async ngOnInit() {
    const programResponse = await this.d2.programModule.program
      .select(['id', 'name'])
      .get();

    console.log(programResponse);
  }
}
