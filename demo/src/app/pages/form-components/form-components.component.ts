/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { CommonModule } from '@angular/common';
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
import { CustomOrgUnitConfig } from 'packages/ng-dhis2-ui/src/lib/modules/form/components/org-unit-form-field.component';


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
     field: 'RKOZF4JJNYm',
     orgUnit: 'VCT80xbdFyD',
   },
 ];


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


 programEntryConfig = new ProgramEntryFormConfig({
   program: 'lw9fZTamYec',
   displayType: 'FLAT',
   formType: 'TRACKER',
   excludeProgramStages: true,
   // excludeInheritedAttributes: true,


   hideRegistrationUnit: false,
   hideEnrollmentDate: true,
   autoComplete: true,
   autoAssignedValues: [
     {
       field: 'batchNumber',
       value: 'ND_BATCH_62712406',
     },
   ],
   hideCustomAssignedFields: true,
   formFieldExtensions: [
     {
       id: 'seUJl7AEZtS',
       accept: ['.pdf', '.docx', '.zip'],
       sizeLimit: 2 * 1024 * 1024,
     },
   ],
   updateTeiOrgUnit: true,
 });


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
 }
 async onCancel() {
   console.log('cancel');
 }


 async onSaveComplete(reponse: any) {}
}


