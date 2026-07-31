/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @angular-eslint/use-lifecycle-interface */

import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  CascadeKind,
  ParentMatchMode,
  OptionPathField,
  ParentValueType,
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
// import {
//   CascadeKind,
//   OptionPathField,
//   ParentMatchMode,
//   ParentValueType,
// } from 'packages/ng-dhis2-ui/src/lib/modules/form/types/field-cascade.types';
import { Polygon } from 'react-leaflet';

const SHEHIA_KEYWORDS = [
  'shehia', // EN
  'sheia', // common typo
  'shehiya', // variant
  // add any local naming patterns you actually see in OU names
];

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-form-components',
  templateUrl: './form-components.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    D2FormModule,
    TrackerFormModule,
    EventFormModule,
    ProgramEntryFormModule
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

  contract = new ProgramEntryFormConfig({
    program: 'zyBObUsin0Q',
    programStage: 'HmW9AEBtQnj',
    hideRegistrationUnit: true,
    formType: 'EVENT',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [],
    formFieldExtensions: [],
  });

  customOrgUnitRoots: CustomOrgUnitConfig[] = [
    {
      field: 'fQQ6z8JqoyP',
      orgUnit: 'eCeku5fUWg8',
      levelMatchMode: LevelMatchMode.SOFT,
      confidence: 60,
      typeRules: [
        {
          type: 'SHEHIA',
          keywords: SHEHIA_KEYWORDS,
          baseConfidence: 95,
        },
      ],
    },
  ];

  // customOrgUnitRoots: CustomOrgUnitConfig[] = [
  //   {
  //     field: 'tFZMAc73X6H',
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
  //     // field: 'RKOZF4JJNYm',
  //     // orgUnit: 'lgZ6HfZaj3f',
  //     // level: OrgUnitLevel.FACILITY,
  //     // confidence: 90,
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

  demoForm = new ProgramEntryFormConfig({
    program: 'QAFsf0A8XrR',
    hideRegistrationUnit: true,
    hideActionButtons: true,
    hideEnrollmentDate: false,
    disabledIncidentDate: false,
    disableEnrollmentDate: true,
    disableRegistrationUnit: true,
    formType: 'TRACKER',
    displayType: 'FLAT',
    autoComplete: false,
    autoAssignedValues: [],
    optionCascadeConfigs: [
      {
        kind: CascadeKind.OPTIONS_PATH,
        fieldId: 'qy2OxnGk4vx',
        parentFieldId: 'gSn6wIflIWZ',
        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.CONTAINS,
        childPathField: OptionPathField.VALUE,
        parentValueType: ParentValueType.CODE,
        disableUntilParentSelected: true,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
      },
    ],

    formFieldExtensions: [],
  });

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
    optionCascadeConfigs: [
      {
        kind: CascadeKind.OPTIONS_PATH,
        fieldId: 'OEK5CV1ks8U',
        parentFieldId: 'ps5rF1JLB1r',
        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.CONTAINS,
        childPathField: OptionPathField.VALUE,
        parentValueType: ParentValueType.CODE,
        disableUntilParentSelected: true,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
      },
      {
        kind: CascadeKind.OPTIONS_PATH,
        fieldId: 'h3hWLuqLNVj',
        parentFieldId: 'hCMZRFLKvoY',
        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.CONTAINS,
        childPathField: OptionPathField.VALUE,
        parentValueType: ParentValueType.CODE,
        disableUntilParentSelected: true,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
      },
      {
        kind: CascadeKind.OPTIONS_PATH,
        fieldId: 'w0l2y9H3Be9',
        parentFieldId: 'SrOIGB0MIk6',
        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.CONTAINS,
        childPathField: OptionPathField.VALUE,
        parentValueType: ParentValueType.CODE,
        disableUntilParentSelected: false,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
      },
      {
        kind: CascadeKind.OPTIONS_PATH,
        fieldId: 'keqqmeJcIFf',
        parentFieldId: 'w0l2y9H3Be9',
        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.CONTAINS,
        childPathField: OptionPathField.VALUE,
        parentValueType: ParentValueType.CODE,
        disableUntilParentSelected: false,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
      },
    ],
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
    optionCascadeConfigs: [
      {
        kind: CascadeKind.OPTIONS_PATH,
        fieldId: 'OEK5CV1ks8U',
        parentFieldId: 'ps5rF1JLB1r',
        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.PREFIX,
        childPathField: OptionPathField.VALUE,
        parentValueType: ParentValueType.CODE,
        disableUntilParentSelected: true,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
      },
      {
        kind: CascadeKind.OPTIONS_PATH,
        fieldId: 'h3hWLuqLNVj',
        parentFieldId: 'hCMZRFLKvoY',
        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.CONTAINS,
        childPathField: OptionPathField.VALUE,
        parentValueType: ParentValueType.CODE,
        disableUntilParentSelected: true,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
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

  async onSaveComplete(reponse: any) {
    console.log("RESPONSE::: ", JSON.stringify(reponse));
  }
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

  verification = new ProgramEntryFormConfig({
    program: 'GNRIrbL5o0n',
    programStage: 'cIXQE5ZOvjz',
    hideRegistrationUnit: true,
    hideActionButtons: false,
    hideEventDate: false,
    formType: 'EVENT',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [],
    formFieldExtensions: [],
    optionCascadeConfigs: [
      {
        kind: CascadeKind.OPTIONS_PATH,

        // ✅ Child field to filter
        fieldId: 'eZo79zu9PwO',

        // ✅ Parent field controlling filtering
        parentFieldId: 'bPQceJcTrN0',

        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.PREFIX,
        childPathField: OptionPathField.CODE,

        // parent stores code/path in the control value
        parentValueType: ParentValueType.CODE,

        disableUntilParentSelected: true,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
      },
    ],
  });

  geoFencing = {
    type: 'Polygon',
    coordinates: [
      [39.193195530311584, -6.164133265196621],
      [39.19314118472547, -6.164266513866446],
      [39.19306923125444, -6.164442934789666],
      [39.19295441546196, -6.164724448517926],
      [39.192783050984346, -6.165117746488832],
      [39.192652299704484, -6.165445904223441],
      [39.19263275659239, -6.165494953216869],
      [39.19260796091053, -6.165557185013195],
      [39.19249776677867, -6.1658301475382515],
      [39.19227672588108, -6.166374156034244],
      [39.192235417215585, -6.166479352447185],
      [39.192153360243346, -6.166686082260486],
      [39.19211716052738, -6.166777281776489],
      [39.192013212817315, -6.1670423776950445],
      [39.19128346846617, -6.168750144667338],
      [39.19117162272486, -6.168961289236365],
      [39.19188598357528, -6.169660014433977],
      [39.19118152385674, -6.17047642478865],
      [39.191131659246096, -6.170523292601115],
      [39.19110295107494, -6.170494581214318],
      [39.191101743326655, -6.170461073011082],
      [39.191087390529205, -6.1704503075275845],
      [39.19106347263008, -6.170441938949103],
      [39.19105389938487, -6.170421597853842],
      [39.191029972917136, -6.170389294536291],
      [39.19101202688995, -6.170361776020997],
      [39.190979744780485, -6.170370164756706],
      [39.19094625321859, -6.170340258338886],
      [39.19093667955141, -6.170318720504339],
      [39.190921128875054, -6.1703019717602885],
      [39.1909127466717, -6.170268466127701],
      [39.190899589627705, -6.170257700210202],
      [39.190873276825734, -6.1702397585848106],
      [39.1908481563452, -6.170212242634342],
      [39.19082183455837, -6.170169169531406],
      [39.19080268938125, -6.170132077541336],
      [39.190789516080336, -6.170075835618475],
      [39.19077277095546, -6.170062677508647],
      [39.1907512458502, -6.170057898269541],
      [39.190724921512185, -6.170007644739544],
      [39.19070817382441, -6.1699873062060115],
      [39.190693815486995, -6.169960983131121],
      [39.190659129078504, -6.169933470595442],
      [39.19066868305407, -6.169899958537458],
      [39.19063040899222, -6.169871250546863],
      [39.190616049379216, -6.169841337258729],
      [39.1905885430012, -6.169829379730652],
      [39.19057657316893, -6.169794678637898],
      [39.19055503568115, -6.169755194019267],
      [39.19053350674381, -6.169739644138369],
      [39.190508394423375, -6.169734866172064],
      [39.19048087993559, -6.169700170636154],
      [39.19048565094587, -6.169666660291258],
      [39.190479667102885, -6.169652301585843],
      [39.19045934117725, -6.169657095802317],
      [39.19040790756333, -6.169610441443119],
      [39.19036246121274, -6.169587719681134],
      [39.190334951438054, -6.1695661882435475],
      [39.1903122161004, -6.169520720356343],
      [39.19028709867051, -6.169501581535597],
      [39.190277519497656, -6.169464486106666],
      [39.19024403613931, -6.169457317643239],
      [39.19019379915922, -6.169413056308722],
      [39.19017226896649, -6.169393916201374],
      [39.1901232239031, -6.1693388837999565],
      [39.190110063060494, -6.169317347228415],
      [39.19008256098359, -6.169317357042667],
      [39.19008254478352, -6.169271881036983],
      [39.190044269519305, -6.16923958279029],
      [39.189988059830604, -6.169212077885752],
      [39.18996532453809, -6.169166609981762],
      [39.18994379351151, -6.169145076390438],
      [39.18993541181546, -6.169112767475599],
      [39.18991746461074, -6.169081658707972],
      [39.18991746205515, -6.169074478285883],
      [39.18993044213334, -6.169063135307224],
      [39.18984129890308, -6.16889323040307],
      [39.18982097576671, -6.168905803385266],
      [39.18980302666044, -6.168869309296444],
      [39.18978328990312, -6.1688495701642925],
      [39.18959549981849, -6.168684487295942],
      [39.189591316850574, -6.168690472470561],
      [39.18939274737596, -6.168475130398527],
      [39.18939693140636, -6.168472137068084],
      [39.189328746593446, -6.168394373382808],
      [39.1891511142376, -6.168211335677341],
      [39.188905886919315, -6.167927197577197],
      [39.18889632227442, -6.167930791179953],
      [39.188597750004, -6.16760346961835],
      [39.1884748288334, -6.167436388742941],
      [39.1881976059949, -6.166953603198602],
      [39.18805474338785, -6.166693722270777],
      [39.18794929937943, -6.166750484821749],
      [39.187848743540336, -6.166494515148245],
      [39.18784911497291, -6.16648739808461],
      [39.187840326642636, -6.166470444070344],
      [39.187874757276454, -6.16645176283006],
      [39.1878666195318, -6.166432617899964],
      [39.187861352733606, -6.166416822822587],
      [39.187853213473986, -6.166393369638064],
      [39.1878412455017, -6.166363216073269],
      [39.18783597179939, -6.166327794504121],
      [39.18782496429198, -6.166308650584646],
      [39.18781778027713, -6.166281367502939],
      [39.18781251230316, -6.166262221560495],
      [39.18779576459286, -6.166241164883192],
      [39.18777614577126, -6.166216279657116],
      [39.1877751784069, -6.166185643519504],
      [39.18778378029468, -6.166164577909854],
      [39.1877699068998, -6.166156444983213],
      [39.187777552704034, -6.166136815795408],
      [39.18776941176908, -6.1661085756599565],
      [39.18776127336033, -6.166087515948146],
      [39.187748833166864, -6.166074595566089],
      [39.1877363923006, -6.166059760404115],
      [39.18772729797903, -6.1660406158082255],
      [39.187720596138526, -6.166024342539469],
      [39.1877110279001, -6.1660176441796635],
      [39.18769619691223, -6.16600663941823],
      [39.18769045351246, -6.165995631456286],
      [39.18767418882134, -6.165987978063941],
      [39.18766605361539, -6.165976013553905],
      [39.187660309375254, -6.165962612116931],
      [39.18766292391435, -6.165942593138903],
      [39.18757399050345, -6.165517079920864],
      [39.1872725668578, -6.165235952593718],
      [39.18737297865673, -6.16515094894378],
      [39.18732752735482, -6.165112669317797],
      [39.18718639013642, -6.164996635357328],
      [39.18708713004096, -6.1649559811269095],
      [39.18696924052249, -6.164881276905902],
      [39.18721654726093, -6.16483601662621],
      [39.18754325380902, -6.164665034996018],
      [39.187923627806214, -6.1650375650984435],
      [39.18801834806689, -6.165089230756647],
      [39.18822348949663, -6.165247078599197],
      [39.18825007729753, -6.165267673381421],
      [39.188318796376514, -6.1653220147924435],
      [39.18875255272735, -6.1650061301290195],
      [39.18891571332172, -6.16484511114794],
      [39.189242036123446, -6.164528458359867],
      [39.18942613573278, -6.164406924129948],
      [39.189467983363784, -6.164398532097284],
      [39.18948701234744, -6.164397234117099],
      [39.18959644495896, -6.164331620719592],
      [39.189614330014976, -6.164278024457909],
      [39.18981230090822, -6.16415923766105],
      [39.190076305008304, -6.16412180539663],
      [39.19028857935195, -6.164010528838339],
      [39.190331454908545, -6.163970942217097],
      [39.19050403222216, -6.163852230055338],
      [39.19052659752072, -6.163592110128773],
      [39.190523847170404, -6.163424029347541],
      [39.19052957121251, -6.16338779562313],
      [39.19081702881802, -6.1633809708101515],
      [39.1917870444811, -6.163492637400047],
      [39.19226350419565, -6.16371793110503],
      [39.19255766511005, -6.163749418811947],
      [39.193195530311584, -6.164133265196621],
    ],
  } as any;

  household = new ProgramEntryFormConfig({
    program: 'GNRIrbL5o0n',
    programStage: 'IQJg9wIEkya',
    hideRegistrationUnit: true,
    hideActionButtons: false,
    hideGeometryField: false,
    hideEventDate: false,
    formType: 'EVENT',
    displayType: 'FLAT',
    autoComplete: true,
    autoAssignedValues: [],
    formFieldExtensions: [],
    optionCascadeConfigs: [
      {
        kind: CascadeKind.OPTIONS_PATH,

        // ✅ Child field to filter
        fieldId: 'eZo79zu9PwO',

        // ✅ Parent field controlling filtering
        parentFieldId: 'bPQceJcTrN0',

        optionPathSeparator: '/',
        parentMatchMode: ParentMatchMode.PREFIX,
        childPathField: OptionPathField.VALUE,

        // parent stores code/path in the control value
        parentValueType: ParentValueType.CODE,

        disableUntilParentSelected: true,
        clearOnParentChange: true,
        allowAllIfParentMissing: false,
      },
    ],
    coordinatePickerGeoConfig: {
      allowedAreaGeoJson: this.geoFencing,
      allowedAreaName: 'Shehia boundary',
      requireWithinArea: false,

      captureAccuracy: true,
      accuracyKmValue: 5,
      accuracySource: 'DEVICE',
      maxAccuracyKm: 50,

      outsideAreaPolicyText:
        'This point is outside the Shehia boundary. Saving it may cause incorrect reporting.',
      onOutsideAreaSelected: (info) => console.log('Outside boundary', info),
    },
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
