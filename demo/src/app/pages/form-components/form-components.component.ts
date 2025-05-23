import { Component } from '@angular/core';
import { D2Window, OrgUnitField } from '@iapps/d2-web-sdk';
import {
  D2FormModule,
  DateField,
  FormField,
  FormUtil,
  FormValue,
  TrackerFormModule,
  EventFormModule,
  ProgramEntryFormModule,
  ProgramEntryFormConfig,
} from '@iapps/ng-dhis2-ui';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-form-components',
  templateUrl: './form-components.component.html',
  imports: [
    D2FormModule,
    TrackerFormModule,
    EventFormModule,
    ProgramEntryFormModule,
  ],
})
export class FormComponentsComponent {
  d2 = (window as unknown as D2Window).d2Web;
  fields = [
    new FormField<string>({
      id: 'orgUnit',
      code: 'orgUnit',
      key: 'orgUnit',
      label: 'Organisation Unit',
      controlType: 'org-unit',
    }),
    new FormField<string>({
      id: 'name',
      code: 'name',
      key: 'name',
      label: 'Name',
      controlType: 'textbox',
      type: 'text',
      required: true,
    }),
    new FormField<string>({
      id: 'bio',
      code: 'bio',
      key: 'bio',
      label: 'Bio',
      controlType: 'textarea',
      required: false,
    }),
    new DateField({
      id: 'dob',
      key: 'dob',
      label: 'Date of birth',
      controlType: 'date',
    }),
    new FormField<string>({
      id: 'gender',
      code: 'gender',
      key: 'gender',
      label: 'Gender',
      controlType: 'dropdown',
      options: [
        { label: 'Male', key: 'male', value: 'male' },
        { label: 'Female', key: 'female', value: 'female' },
      ],
      required: true,
    }),
    new FormField<string>({
      id: 'attachment',
      code: 'attachment',
      key: 'attachment',
      label: 'Attachment',
      controlType: 'file',
      required: false,
    }),
    new FormField<string>({
      id: 'Is new item',
      code: 'newItem',
      key: 'newItem',
      label: 'Is new item',
      controlType: 'checkbox',
      required: true,
    }),
  ];

  form = FormUtil.getFormGroup(this.fields, {
    name: 'Rajabu',
  });

  programEntryConfig = new ProgramEntryFormConfig({
    program: 'lw9fZTamYec',
    programStage: 'NtZXBym2KfD',
    displayType: 'FLAT',
    formType: 'EVENT',
    excludeProgramStages: true,
    excludeInheritedAttributes: false,
    hideRegistrationUnit: true,
    hideEnrollmentDate: true,
    autoComplete: true,
  });

  onUpdate(event: FormValue) {
    console.log('Form updated', event.form);
  }

  async ngOnInit() {
    // const result = await this.d2.trackerModule.trackedEntity
    //   .setProgram('lw9fZTamYec')
    //   .setTrackedEntity('i9h2cFraNvL')
    //   .get();
    // console.log(result.data);
    // const eventResult = await this.d2.eventModule.event
    //   .setProgramStage('k4ZFqYqRNDF')
    //   .setEvent('ctmcl4b26Mk')
    //   .get();
    // console.log(eventResult.data);
  }
}
