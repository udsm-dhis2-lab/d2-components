/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  D2Window,
  DHIS2Event,
  OrgUnitField,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
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
import { format } from 'date-fns';
import {
  CustomOrgUnitConfig,
  FACILITY_KEYWORDS,
  GLOBAL_TYPE_RULES,
  LevelMatchMode,
  LevelSelectorMode,
  OrgUnitLevel,
} from 'packages/ng-dhis2-ui/src/lib/modules/form/models/org-unit.model';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-form-components',
  templateUrl: './form-components.component.html',
  imports: [
    D2FormModule,
    CommonModule,
    TrackerFormModule,
    EventFormModule,
    ProgramEntryFormModule,
  ],
})
export class FormComponentsComponent {
  d2 = (window as unknown as D2Window).d2Web;
  formConfig = [
    {
      id: 'l2VG173t0Vc',
      accept: ['.jpg', '.pdf'],
      sizeLimit: 2 * 1024 * 1024,
    },
    {
      id: 'cPpi2sVGaAe',
      accept: ['.pdf', '.jpg', '.png'],
      sizeLimit: 2 * 1024 * 1024,
    },
    {
      id: 'nVkXRei2umX',
      accept: ['.pdf', '.docx'],
      sizeLimit: 2 * 1024 * 1024,
    },
  ];

  customOrgUnitRoots: CustomOrgUnitConfig[] = [
    {
      field: 'tFZMAc73X6H',
      orgUnit: 'wsCWwNbLJNY',
      levelMatchMode: LevelMatchMode.STRICT,
      levelSelector: {
        mode: LevelSelectorMode.RELATIVE,
        offset: 3,
        maxOffset: 3,
      },
      // level: OrgUnitLevel.FACILITY,
      confidence: 95,
      typeRules: [
        {
          type: 'FACILITY',
          keywords: FACILITY_KEYWORDS,
          baseConfidence: 99,
        },
        // {
        //   type: 'HAMLET',
        //   keywords: ['Kitongoji', 'Hamlet'],
        //   baseConfidence: 99,
        // },
        // {
        //   type: 'WARD',
        //   keywords: ['Kata', 'Ward'],
        //   baseConfidence: 99,
        // },
        // {
        //   type: 'STREET',
        //   keywords: ['Mtaa', 'Street'],
        //   baseConfidence: 99,
        // },
        // {
        //   type: 'VILLAGE',
        //   keywords: ['Village', 'Kijiji'],
        //   baseConfidence: 80,
        // },
      ],
      // field: 'RKOZF4JJNYm',
      // orgUnit: 'lgZ6HfZaj3f',
      // level: OrgUnitLevel.FACILITY,
      // confidence: 90,
    },
    // {
    //   field: 'RKOZF4JJNYm',
    //   orgUnit: 'lgZ6HfZaj3f',
    //   confidence: 80,
    //   levelSelector: {
    //     mode: LevelSelectorMode.KEYWORD,
    //     keyword: 'Health Center',
    //   },
    //   typeRules: [
    //     {
    //       type: 'FACILITY',
    //       keywords: FACILITY_KEYWORDS,
    //       baseConfidence: 80,
    //     },
    // {
    //   type: 'HAMLET',
    //   keywords: ['Kitongoji', 'Hamlet'],
    //   baseConfidence: 80,
    // },
    // {
    //   type: 'WARD',
    //   keywords: ['Kata', 'Ward'],
    //   baseConfidence: 85,
    // },
    // {
    //   type: 'STREET',
    //   keywords: ['Mtaa', 'Street'],
    //   baseConfidence: 85,
    // },
    // {
    //   type: 'VILLAGE',
    //   keywords: ['Village', 'Kijiji'],
    //   baseConfidence: 80,
    // },
    //   ],
    // },
  ];

  // customOrgUnitRoots: CustomOrgUnitConfig[] = [
  //   {
  //     field: 'RKOZF4JJNYm',
  //     orgUnit: 'wsCWwNbLJNY',
  //     levelMatchMode: LevelMatchMode.STRICT,
  //     levelSelector: {
  //       mode: LevelSelectorMode.RELATIVE,
  //       offset: 3,
  //       maxOffset: 3,
  //     },
  //     // level: OrgUnitLevel.FACILITY,
  //     confidence: 95,
  //     typeRules: [
  //       {
  //         type: 'FACILITY',
  //         keywords: FACILITY_KEYWORDS,
  //         baseConfidence: 99,
  //       },
  //       // {
  //       //   type: 'HAMLET',
  //       //   keywords: ['Kitongoji', 'Hamlet'],
  //       //   baseConfidence: 99,
  //       // },
  //       // {
  //       //   type: 'WARD',
  //       //   keywords: ['Kata', 'Ward'],
  //       //   baseConfidence: 99,
  //       // },
  //       // {
  //       //   type: 'STREET',
  //       //   keywords: ['Mtaa', 'Street'],
  //       //   baseConfidence: 99,
  //       // },
  //       // {
  //       //   type: 'VILLAGE',
  //       //   keywords: ['Village', 'Kijiji'],
  //       //   baseConfidence: 80,
  //       // },
  //     ],
  //   },
  //   // {
  //   //   field: 'RKOZF4JJNYm',
  //   //   orgUnit: 'lgZ6HfZaj3f',
  //   //   confidence: 80,
  //   //   levelSelector: {
  //   //     mode: LevelSelectorMode.KEYWORD,
  //   //     keyword: 'Health Center',
  //   //   },
  //   //   typeRules: [
  //   //     {
  //   //       type: 'FACILITY',
  //   //       keywords: FACILITY_KEYWORDS,
  //   //       baseConfidence: 80,
  //   //     },
  //   // {
  //   //   type: 'HAMLET',
  //   //   keywords: ['Kitongoji', 'Hamlet'],
  //   //   baseConfidence: 80,
  //   // },
  //   // {
  //   //   type: 'WARD',
  //   //   keywords: ['Kata', 'Ward'],
  //   //   baseConfidence: 85,
  //   // },
  //   // {
  //   //   type: 'STREET',
  //   //   keywords: ['Mtaa', 'Street'],
  //   //   baseConfidence: 85,
  //   // },
  //   // {
  //   //   type: 'VILLAGE',
  //   //   keywords: ['Village', 'Kijiji'],
  //   //   baseConfidence: 80,
  //   // },
  //   //   ],
  //   // },
  // ];

  // [
  //   // {
  //   //   field: 'RKOZF4JJNYm',
  //   //   orgUnit: 'lgZ6HfZaj3f',
  //   //   level: OrgUnitLevel.COUNCIL,
  //   //   confidence: 90
  //   // },
  //   // { field: 'kvQrWGgmCCb', orgUnit: 'FZfTtWQJfry' },
  //   {
  //     field: 'RKOZF4JJNYm',
  //     orgUnit: 'lgZ6HfZaj3f',
  //     levelSelector: {
  //       mode: 'relative',
  //       offset: 2,
  //     },
  //     confidence: 90,
  //   },
  // ];

  fields = [
    new FormField<string>({
      id: 'RKOZF4JJNYm',
      code: 'RKOZF4JJNYm',
      key: 'RKOZF4JJNYm',
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
  // KFtSY86OJ5b

  //0152554093524
  //OhV3SJdy7HV == phone number
  //p5FAom9pPWw == acc/number
  // programEntryConfig = new ProgramEntryFormConfig({
  //   program: 'Gy65kx8gQv6',
  //   programStage: 'fUVVkgQZHN5',
  //   displayType: 'FLAT',
  //   formType: 'EVENT',
  //   excludeProgramStages: true,
  //   excludeInheritedAttributes: false,
  //   hideRegistrationUnit: true,
  //   hideEnrollmentDate: true,
  //   autoComplete: true,
  //   formFieldExtensions: [
  //     // {
  //     //   id: 'seUJl7AEZtS',
  //     //   accept: ['.pdf', '.docx', '.zip'],
  //     //   sizeLimit: 2 * 1024 * 1024,
  //     // },
  //     {
  //       id: 'OhV3SJdy7HV',
  //       isDataElementUnique: true,
  //       // accept: ['.pdf', '.docx', '.zip'],
  //       // sizeLimit: 2 * 1024 * 1024,
  //     },
  //     {
  //       id: 'p5FAom9pPWw',
  //       isDataElementUnique: true,
  //       // accept: ['.pdf', '.docx', '.zip'],
  //       // sizeLimit: 2 * 1024 * 1024,
  //     },
  //   ],
  // });

  // programEntryConfig = new ProgramEntryFormConfig({
  //   program: 'UelF2YAJLli',
  //   programStage: 'KZ352r6pzo6',
  //   hideRegistrationUnit: true,
  //   formType: 'EVENT',
  //   displayType: 'FLAT',
  //   autoComplete: true,
  //   hideEnrollmentDate: true,
  //   autoAssignedValues: [
  //     {
  //       field: 'occurredAt',
  //       value: '2025-09-19',
  //     },
  //     {
  //       field: 'orgUnit',
  //       value: 'BIzrwoknkg5',
  //     },
  //   ],
  //   formFieldExtensions: [
  //     {
  //       id: 'gdKi4BcnrhR',
  //      optionsSourceCode: 'District',
  //     },
  //   ],
  // });

  mcn = new ProgramEntryFormConfig({
    program: 'GNRIrbL5o0n',
    hideRegistrationUnit: false,
    hideActionButtons: false,
    formType: 'TRACKER',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [
      {
        // OabCFumWtKz | reporterPhoneNumber
        field: 'OabCFumWtKz',
        value: '777777778',
      },
      {
        // Eg8qx9O2nRk | referenceInOpdRegister
        field: 'Eg8qx9O2nRk',
        value: '123',
      },
    ],
    formFieldExtensions: [],
  });

  programEntryConfig = new ProgramEntryFormConfig({
    program: 'Gy65kx8gQv6',
    programStage: 'edx4DaMDAyo',
    hideRegistrationUnit: true,
    formType: 'EVENT',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [
      {
        field: 'orgUnit',
        value: "'jsYgaCu4556'",
      },
      {
        field: 'occurredAt',
        value: format(new Date(), 'yyyy-MM-dd'),
      },
    ],
    formFieldExtensions: [
      {
        id: 'seUJl7AEZtS',
        accept: ['.pdf'],
        sizeLimit: 2 * 1024 * 1024,
      },
    ],
  });

  // beforeSave = ({
  //   instance,
  // }: {
  //   instance: TrackedEntityInstance | DHIS2Event;
  // }) => {
  //   console.log('Preprocessing before save', instance);
  //   if ('updateDataValues' in instance) {
  //     instance.program = 'hello';
  //     console.log('Updating data value before save', instance);
  //     instance.updateDataValues({
  //       seUJl7AEZtS: 'New Value',
  //     });
  //   }
  // };

  beforeSave = ({
    instance,
  }: {
    instance: TrackedEntityInstance | DHIS2Event;
  }) => {
    // console.log('Original instance inside form:', instance);

    // Make changes here
    if ('updateDataValues' in instance) {
      instance.updateDataValues({
        seUJl7AEZtS: 'New Value',
      });

      instance.program = 'hello';
    }

    // IMPORTANT: return the mutated instance
    return instance;
  };

  // new ProgramEntryFormConfig({
  //   program: 'lw9fZTamYec',
  //   displayType: 'FLAT',
  //   formType: 'TRACKER',
  //   excludeProgramStages: true,
  //   // excludeInheritedAttributes: true,

  //   hideRegistrationUnit: false,
  //   hideEnrollmentDate: true,
  //   autoComplete: true,
  //   autoAssignedValues: [
  //     {
  //       field: 'batchNumber',
  //       value: 'ND_BATCH_62712406',
  //     },
  //   ],
  //   hideCustomAssignedFields: true,
  //   formFieldExtensions: [
  //     {
  //       id: 'seUJl7AEZtS',
  //       accept: ['.pdf', '.docx', '.zip'],
  //       sizeLimit: 2 * 1024 * 1024,
  //     },
  //   ],
  //   updateTeiOrgUnit: true,
  // });

  //   programEntryConfig =  ProgramEntryFormConfig({
  //     program: 'Gy65kx8gQv6',
  //     programStage: 'edx4DaMDAyo',
  //     hideRegistrationUnit: true,
  //     formType: 'EVENT',
  //     displayType: 'FLAT',
  //     autoAssignedValues: [
  //       {
  //         field: 'orgUnit',
  //         value: currentApplicant.latestEnrollment?.orgUnit,
  //       },
  //     ],
  //   });
  // });

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
    //code: District
  }
  async onCancel() {
    console.log('cancel');
  }

  async onSaveComplete(reponse: any) {}
  paymentInformationFormConfig = new ProgramEntryFormConfig({
    program: 'Gy65kx8gQv6',
    programStage: 'fUVVkgQZHN5',
    hideRegistrationUnit: true,
    formType: 'EVENT',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [
      {
        field: 'orgUnit',
        value: 'F1NIWhnD69w',
      },
      {
        field: 'occurredAt',
        value: format(new Date(), 'yyyy-MM-dd'),
      },
    ],
    formFieldExtensions: [
      {
        id: 'OhV3SJdy7HV',
        isDataElementUnique: true,
      },
      {
        id: 'p5FAom9pPWw',
        isDataElementUnique: true,
      },
    ],
  });

  malariaCaseNotification = new ProgramEntryFormConfig({
    program: 'GNRIrbL5o0n',
    hideRegistrationUnit: true,
    hideActionButtons: true,
    formType: 'TRACKER',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [],
    formFieldExtensions: [],
  });

  householdMembers = new ProgramEntryFormConfig({
    program: 'GNRIrbL5o0n',
    programStage: 'tgs4pBEHiYo',
    hideRegistrationUnit: true,
    hideActionButtons: false,
    hideGeometryField: false,
    hideEventDate: false,
    formType: 'EVENT',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [],
    formFieldExtensions: [],
  });

  incidentManagement = new ProgramEntryFormConfig({
    program: 'zyBObUsin0Q',
    programStage: 'M62TM9ZPu8m',
    hideRegistrationUnit: true,
    formType: 'EVENT',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [
      {
        field: 'occurredAt',
        value: format(new Date(), 'yyyy-MM-dd'),
      },
    ],
    formFieldExtensions: [],
  });
}
