import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataElement } from '@iapps/d2-web-sdk';
import { d2Web } from '@iapps/ng-dhis2-shell';

@Component({
  selector: 'app-web-sdk',
  templateUrl: './web-sdk.component.html',
  imports: [CommonModule],
})
export class WebSdkComponent {
  d2 = d2Web;

  async ngOnInit() {
    console.log(this.d2.appManifest);
    const programResponse = await this.d2.programModule.program
      .select(['id', 'name'])
      .get();

    console.log(programResponse);

    const result = await this.d2.trackerModule.trackedEntity
      .setProgram('oUiYTdbtOuh')
      .setTrackedEntity('cXEFO5RHN3B')
      .get();

    console.log('RESULT', result.data);
  }
}
