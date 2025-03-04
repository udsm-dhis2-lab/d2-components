import { Component } from '@angular/core';
import { FormField, FormFieldModule, FormUtil } from '@iapps/ng-dhis2-ui';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-form-components',
  templateUrl: './form-components.component.html',
  imports: [FormFieldModule],
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
