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
  programStage = input<string>();
  trackedEntity = input<string | undefined>();
  d2 = (window as unknown as D2Window).d2Web;
  trackerQuery!: BaseTrackerQuery<TrackedEntityInstance>;
  formMetaData!: IFormMetadata;
  instance!: TrackedEntityInstance;

  async ngOnInit() {
    this.trackerQuery = this.d2.trackerModule.trackedEntity.setProgram(
      this.program()
    );
    const program = await this.trackerQuery.getMetaData();

    this.instance = this.trackedEntity()
      ? ((
          await this.trackerQuery
            .setTrackedEntity(this.trackedEntity() as string)
            .get()
        ).data as TrackedEntityInstance) || (await this.trackerQuery.create())
      : await this.trackerQuery.create();

    if (program) {
      this.formMetaData = new FormMetaData({
        programs: [program],
        programStage: this.programStage(),
        disableEnrollmentDate: true,
        excludeInheritedAttributes: false,
      }).toJson();
    }
  }

  onFormUpdate(values: any) {
    const instance = this.instance as TrackedEntityInstance;
    console.log(instance);
    instance?.updateDataValues(values);
  }

  onSave(event: any) {}

  onCancel() {}
}
