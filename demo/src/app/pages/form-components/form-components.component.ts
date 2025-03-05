import { Component } from '@angular/core';
import {
  D2FormModule,
  DateField,
  FormField,
  FormUtil,
} from '@iapps/ng-dhis2-ui';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-form-components',
  templateUrl: './form-components.component.html',
  imports: [D2FormModule],
})
export class FormComponentsComponent {
  fields = [
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

  form = FormUtil.getFormGroup(this.fields, {});
}
