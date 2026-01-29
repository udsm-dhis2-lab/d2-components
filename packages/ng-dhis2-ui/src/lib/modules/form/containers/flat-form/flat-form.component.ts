import { Component, input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseFormWrapperComponent } from '../../shared/components/base-form-wrapper.component';
import { FormUtil } from '../../utils/form.util';
import { OptionsPathCascadeConfig } from '../../models/field-cascade.types';
import { CoordinatePickerGeoConfig } from '../../components/coordinate-field-component';

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
  collapsibleSections = input<boolean>(false);
  programEntryFormConfig = input.required<any>();
  optionCascadeConfigs = input<OptionsPathCascadeConfig[]>([]);    

  ngOnInit(): void {
    this.formGroup = FormUtil.getFormGroup(this.fields(), this.dataValues());
    this.onFormUpdate();
  }

  onFormUpdate() {
    this.updateDataValues(this.formGroup.getRawValue());
    this.updateFormValidity(this.formGroup.valid);
  }
}
