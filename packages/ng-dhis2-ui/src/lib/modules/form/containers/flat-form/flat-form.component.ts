import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OptionsPathCascadeConfig } from '../../models/field-cascade.types';
import { BaseFormWrapperComponent } from '../../shared/components/base-form-wrapper.component';
import { FormUtil } from '../../utils/form.util';

@Component({
  selector: 'ng-dhis2-ui-flat-form',
  templateUrl: './flat-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    this.onFormUpdate(this.dataValues());
  }

  onFormUpdate(dataValues?: Record<string, unknown>) {
    // Controls can be omitted from a FLAT form when their fields are hidden.
    // Keep their initial values while letting rendered controls override them,
    // including intentional clears (null or empty string).
    const updatedValues = dataValues ?? this.formGroup.getRawValue();
    this.updateDataValues({
      ...this.dataValues(),
      ...updatedValues,
    });
    this.updateFormValidity(this.formGroup.valid);
  }
}
