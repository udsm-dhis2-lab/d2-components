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
    const instance = await this.trackerQuery.create();

    const testData = {
      orgUnit: 'DzT1EohjekM',
      enrollmentDate: '2025-03-05',
      incidentDate: '2025-03-06',
      batchNumber: '',
      firstName: 'Rajabu',
      middleName: 'Waziri',
      surname: 'Mkomwa',
      sex: 'Male',
      disabilityStatus: 'Not disabled',
      specifyDisability: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: '2025-03-13',
      maritalStatus: '',
      nextOfKinRelationship: '',
      nextOfKinName: '',
      nextOfKinAddress: '',
      photograph: '',
      physicalAddress: '',
      districtOfDomicile: '',
      numberOfChildren: '',
      ethnicity: '',
      nationality: '',
      nationalIdentificationNumber: '',
      formFourIndexNumber: '',
      applicationId: '',
      applicationDate: '',
      nativeLanguageFluency: '',
      acknowledgedByCommunity: '',
      criminalRecord: '',
      hardWorkMorale: '',
      readinessToWork: '',
      attachmentLetterFromVeo: '',
      formIvLeavingCertificate: '',
      shortlistingDate: '',
      applicationStatus: '',
      reasonForApplicationRejection: '',
      dateForAppeal: '',
      reasonForAppeal: '',
      appealStatus: '',
      reasonForAppealRejection: '',
      j7AD2bjz0j0: [
        {
          approvalDate: '2025-03-05',
          approvalOfficerName: 'Name',
          approvingLevel: 'RAS',
          statusOfApproval: 'Approved',
          reasonForRejection: null,
        },
      ],
    };

    instance.updateDataValues(testData);

    console.log(instance.toObject());

    if (program) {
      this.formMetaData = new FormMetaData({
        programs: [program],
      }).toJson();
    }
  }

  onSave(event: any) {}

  onCancel() {}
}
