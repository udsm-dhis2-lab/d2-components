import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  D2Web,
  D2Window,
  DataElement,
  ITrackedEntityInstance,
  ModelBaseTrackerQuery,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import { d2Web } from '@iapps/ng-dhis2-shell';

class NeedDistribution
  extends TrackedEntityInstance
  implements ITrackedEntityInstance
{
  batchNumber!: string;
}

class NeedQuery extends ModelBaseTrackerQuery<NeedDistribution> {
  constructor() {
    super(
      (window as unknown as D2Window).d2Web.httpInstance,
      NeedDistribution as any
    );
  }
}

@Component({
  selector: 'app-web-sdk',
  templateUrl: './web-sdk.component.html',
  imports: [CommonModule],
})
export class WebSdkComponent {
  d2 = d2Web;

  async ngOnInit() {
    // console.log(this.d2.appManifest);
    // const programResponse = await this.d2.programModule.program
    //   .select(['id', 'name'])
    //   .get();

    // console.log(programResponse);

    const needQuery = new NeedQuery();

    const result = (
      await needQuery.byId('cXEFO5RHN3B').setProgram('oUiYTdbtOuh').get()
    ).data as NeedDistribution;

    console.log('RESULT', result.batchNumber);
  }
}
