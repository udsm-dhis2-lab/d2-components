import {
  Component,
  EventEmitter,
  input,
  OnInit,
  Output,
  signal,
  WritableSignal,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { IconArrowRight16 } from "@dhis2/ui";
import React from "react";
//import { DateField, FieldConfig } from "src/app/libs/form-models/models";
import { DateField, FieldConfig } from '../../../form-models/models';
import { FormUtil } from "../../utils";

@Component({
  selector: "date-range-field",
  templateUrl: "./date-range-field.component.html",
  styleUrls: ["./date-range-field.component.scss"],
})
export class DateRangeFieldComponent implements OnInit {
  NextIcon = () => <IconArrowRight16 />;
  fieldConfig = input(
    new FieldConfig({
      inputWidth: "200px",
      hideLabel: true,
    }),
    {
      transform: (config: FieldConfig) =>
        new FieldConfig({ ...config, inputWidth: "200px" }),
    }
  );
  dateRangeLabel = input<{ startDate: string; endDate: string }>();
  dateValues = input<{ startDate?: string; endDate?: string }>({});
  startDateField!: WritableSignal<DateField>;
  endDateField!: WritableSignal<DateField>;
  form!: FormGroup;

  @Output() dateChange = new EventEmitter<{
    startDate: string;
    endDate: string;
  }>();

  ngOnInit(): void {
    this.startDateField = signal(
      new DateField({
        label: this.dateRangeLabel()?.startDate || "Start date",
        key: "startDate",
        id: "startDate",
      })
    );

    this.endDateField = signal(
      new DateField({
        label: this.dateRangeLabel()?.endDate || "End date",
        key: "endDate",
        id: "endDate",
      })
    );

    this.form = FormUtil.getFormGroup(
      [this.startDateField(), this.endDateField()],
      this.dateValues()
    );
  }

  onDateChange(dateType: string) {
    const value = this.form.get(dateType)?.value;
    switch (dateType) {
      case "startDate":
        this.endDateField.set(
          new DateField({ ...this.endDateField(), min: value })
        );
        break;
      case "endDate":
        this.startDateField.set(
          new DateField({ ...this.startDateField(), max: value })
        );
        break;

      default:
        break;
    }

    this.dateChange.emit({
      startDate: this.form.get("startDate")?.value,
      endDate: this.form.get("endDate")?.value,
    });
  }
}
