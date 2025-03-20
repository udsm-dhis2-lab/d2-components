import { Component, input, OnInit } from '@angular/core';
import {
  BaseEventQuery,
  BaseTrackerQuery,
  D2Window,
  DHIS2Event,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import { FormMetaData, IFormMetadata } from '../form';

@Component({
  selector: 'ng-dhis2-ui-event-form',
  templateUrl: './event-form.component.html',
  standalone: false,
})
export class EventFormComponent implements OnInit {
  program = input.required<string>();
  programStage = input.required<string>();
  eventId = input<string | undefined>();
  enrollment = input<string | undefined>();
  trackedEntity = input<string | undefined>();
  d2 = (window as unknown as D2Window).d2Web;
  eventQuery!: BaseEventQuery<DHIS2Event>;
  formMetaData!: IFormMetadata;
  instance!: DHIS2Event;

  async ngOnInit() {
    this.eventQuery = this.d2.eventModule.event
      .setProgram(this.program())
      .setProgramStage(this.programStage())
      .setEnrollment(this.enrollment() as string)
      .setTrackedEntity(this.trackedEntity() as string);

    const program = await this.eventQuery.getMetaData();

    this.instance = this.eventId()
      ? ((await this.eventQuery.setEvent(this.eventId() as string).get())
          .data as DHIS2Event) || (await this.eventQuery.create())
      : await this.eventQuery.create();

    console.log('EVENT RESULT', this.instance);

    if (program) {
      this.formMetaData = new FormMetaData({
        programs: [program],
        programStage: this.programStage(),
      }).toJson();
    }
  }

  onSave(event: any) {}

  onCancel() {}
}
