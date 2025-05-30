import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseFormWrapperComponent } from '../../shared';
import { FormUtil } from '../../utils';

@Component({
  selector: 'ng-dhis2-ui-flat-form',
  templateUrl: './flat-form.component.html',
  standalone: false,
})
export class FlatFormComponent
  extends BaseFormWrapperComponent
  implements OnInit
{
  formGroup!: FormGroup;
  ngOnInit(): void {
    this.formGroup = FormUtil.getFormGroup(this.fields(), this.dataValues());
    this.onFormUpdate();
  }

  onFormUpdate() {
    console.log('WE ARE UPDATING HERE');
    this.updateDataValues(this.formGroup.getRawValue());
    this.updateFormValidity(this.formGroup.valid);
  }
}
