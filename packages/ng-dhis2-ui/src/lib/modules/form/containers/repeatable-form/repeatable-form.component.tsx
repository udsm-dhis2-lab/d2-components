import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Input,
  model,
  NgZone,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { range } from 'lodash';
import { IFormFieldGroup } from '../../interfaces';
import { FormValue, FormField } from '../../models';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import React, { useEffect, useMemo, useState } from 'react';
import {
  DataTable,
  DataTableRow,
  TableHead,
  DataTableColumnHeader,
  TableBody,
  DataTableCell,
  TableFoot,
  IconAdd16,
  Button,
  ButtonStrip,
} from '@dhis2/ui';
import { FormUtil } from '../../utils';

@Component({
  selector: 'ng-dhis2-ui-repeatable-form',
  templateUrl: './repeatable-form.component.html',
  styleUrls: ['./repeatable-form.component.scss'],
  standalone: false,
})
export class RepeatableFormComponent implements OnInit {
  ngZone = inject(NgZone);
  @Input() formObject!: any;
  @Input() formData: any;
  fieldGroup = input.required<IFormFieldGroup>();
  @Input() form!: FormGroup;
  @Input() numberOfRows!: number | string;
  @Input() programRuleActions!: any[];
  // @Input() events?: any[] | unknown;
  events = model<Record<string, unknown>[] | unknown>();
  @Input() program!: string;
  @Input() programStage!: string;
  @Input() repeatDependentField!: string;
  dataEntities = input.required<Record<string, unknown>>();
  repeatableEvents: any[] = [];

  repeatableData: { [index: number]: FormValue } = {};

  @Output() repeatableStageUpdate = new EventEmitter<any>();

  repeatableFormEntities!: { [event: string]: FormGroup };

  eventForm!: FormGroup;
  eventFormValue = signal<FormValue | null>(null);
  #eventFormValue$: Observable<FormValue | null>;

  showForm = signal<boolean>(false);
  #showForm$: Observable<boolean>;

  #events$: Observable<any>;
  eventIndex = signal<number>(0);

  constructor() {
    this.#eventFormValue$ = toObservable(this.eventFormValue);
    this.#showForm$ = toObservable(this.showForm);
    this.#events$ = toObservable(this.events);
  }

  get isValid(): boolean {
    return !Object.keys(this.repeatableData).some((index: any) => {
      const formValue = this.repeatableData[index];

      return !formValue?.isValid;
    });
  }

  EventTable = computed(() => {
    return () => {
      const [showForm, setShowForm] = useState<boolean>(this.showForm());
      const [events, setEvents] = useState<any[]>(this.events() as any[]);
      const fields = useMemo(() => {
        return this.fieldGroup().fields || [];
      }, []);

      const colSpan = useMemo(() => {
        return fields.length;
      }, []);

      useEffect(() => {
        const showFormSubscription = this.#showForm$.subscribe((showForm) => {
          setShowForm(showForm);
        });

        return () => {
          showFormSubscription.unsubscribe();
        };
      }, []);

      useEffect(() => {
        const eventsSubscription = this.#events$.subscribe((events) => {
          setEvents(events);
        });

        return () => {
          eventsSubscription.unsubscribe();
        };
      }, []);

      return (
        <DataTable dense>
          <TableHead>
            <DataTableRow>
              {fields.map((field) => (
                <DataTableColumnHeader key={field.key}>
                  {field.label}
                </DataTableColumnHeader>
              ))}
            </DataTableRow>
          </TableHead>
          <TableBody>
            {(events || []).map((event, eventIndex) => (
              <DataTableRow key={eventIndex}>
                {fields.map((field) => (
                  <DataTableCell key={field.key}>
                    {event[field.key] || '-'}
                  </DataTableCell>
                ))}
              </DataTableRow>
            ))}
          </TableBody>
          {!showForm ? (
            <TableFoot>
              <DataTableRow>
                <DataTableCell colSpan={colSpan}>
                  <Button
                    icon={<IconAdd16 />}
                    small
                    onClick={() => {
                      this.ngZone.run(() => {
                        this.eventFormValue.set(null);
                        this.eventForm.reset();
                        this.showForm.set(true);
                        this.eventIndex.set((events || []).length);
                      });
                    }}
                  >
                    Add new
                  </Button>
                </DataTableCell>
              </DataTableRow>
            </TableFoot>
          ) : (
            <></>
          )}
        </DataTable>
      );
    };
  });

  FormActionButtons = () => {
    const [isValid, setIsValid] = useState<boolean>();
    useEffect(() => {
      const formValueSubscription = this.#eventFormValue$.subscribe(
        (formValue) => {
          setIsValid(formValue?.isValid);
        }
      );

      return () => {
        formValueSubscription.unsubscribe();
      };
    }, []);
    return (
      <ButtonStrip>
        <Button
          primary
          icon={<IconAdd16 />}
          disabled={!isValid}
          onClick={() => {
            this.ngZone.run(() => {
              const event = this.eventFormValue()?.getValues({
                valueOnly: true,
              });

              if (this.isValid) {
                this.repeatableStageUpdate.emit(this.repeatableData);
              }

              this.events.set([...((this.events() as any[]) || []), event]);
              this.showForm.set(false);
            });
          }}
        >
          Add
        </Button>
        <Button
          onClick={() => {
            this.ngZone.run(() => {
              this.eventFormValue.set(null);
              this.eventForm.reset();
              this.showForm.set(false);
            });
          }}
        >
          Cancel
        </Button>
      </ButtonStrip>
    );
  };

  ngOnInit(): void {
    this.eventForm = FormUtil.getFormGroup(this.fieldGroup().fields, {});
    this.eventFormValue.set(
      new FormValue(this.eventForm, this.fieldGroup().fields)
    );

    this.repeatableEvents = ((this.events() as any[]) || []).map(
      (event: any, index: number) => {
        const fieldControls = (this.fieldGroup().fields || []).reduce(
          (fieldObject: any, field: FormField<string>) => {
            const value = (event.dataValueEntities || {})[field.key] || '';

            return {
              ...fieldObject,
              [field.key]: new FormControl(
                value,
                field.required ? [Validators.required] : []
              ),
            };
          },
          {}
        );

        const form = new FormGroup(fieldControls);
        this.repeatableData[index] = new FormValue(
          form,
          this.fieldGroup().fields || []
        );
        return { ...event, form };
      }
    );

    this.repeatableStageUpdate.emit(this.repeatableData);
  }

  onFormUpdate(formValue: FormValue): void {
    this.eventFormValue.set(formValue);
    this.repeatableData = {
      ...this.repeatableData,
      [this.eventIndex()]: formValue,
    };
  }
}
