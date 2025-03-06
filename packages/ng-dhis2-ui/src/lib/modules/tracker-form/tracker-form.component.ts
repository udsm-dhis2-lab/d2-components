import { Component, input, OnInit } from '@angular/core';
import {
  BaseTrackerQuery,
  D2Window,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import { FormMetaData, IFormMetadata } from '../form';

@Component({
  selector: 'ng-dhis2-ui-tracker-form',
  templateUrl: './tracker-form.component.html',
  standalone: false,
})
export class TrackerFormComponent implements OnInit {
  program = input.required<string>();
  d2 = (window as unknown as D2Window).d2Web;
  trackerQuery!: BaseTrackerQuery<TrackedEntityInstance>;
  formMetaData!: IFormMetadata;

  async ngOnInit() {
    this.trackerQuery = this.d2.trackerModule.trackedEntity.setProgram(
      this.program()
    );
    const program = await this.trackerQuery.getMetaData();

    if (program) {
      this.formMetaData = new FormMetaData({
        programs: [program],
      }).toJson();
    }
  }

  onSave(event: any) {}

  onCancel() {}
}
