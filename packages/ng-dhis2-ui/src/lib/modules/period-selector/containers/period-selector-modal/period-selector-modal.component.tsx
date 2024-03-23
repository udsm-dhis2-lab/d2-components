import {
  Component,
  Input,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { DataProvider } from '@dhis2/app-runtime';
import {
  Modal,
  ModalContent,
  ModalActions,
  ButtonStrip,
  Button,
  ModalTitle,
} from '@dhis2/ui';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { firstValueFrom } from 'rxjs';
import { PeriodDimension } from '../../components/PeriodDimension';
import {
  BIMONTHLY,
  BIWEEKLY,
  DAILY,
  MONTHLY,
  WEEKLY,
  WEEKLYSAT,
  WEEKLYSUN,
  WEEKLYTHU,
  WEEKLYWED,
} from '../../components/utils';
import { ReactWrapperComponent } from '../../../react-wrapper/react-wrapper.component';

type PeriodSelectionEvent = {
  dimensionId: string;
  items: Record<string, unknown>[];
};

@Component({
  selector: 'ng-dhis2-ui-period-selector-modal',
  template: `<ng-container></ng-container>`,
  styles: [
    `
      ::ng-deep .layer {
        z-index: 2 !important;
      }
    `,
  ],
})
export class PeriodSelectorModalComponent extends ReactWrapperComponent {
  @Input() selectedPeriods: any[] = [];

  @Output() cancel = new EventEmitter();
  @Output() confirm = new EventEmitter();

  constructor(
    elementRef: ElementRef<HTMLElement>,
    private httpClient: NgxDhis2HttpClientService
  ) {
    super(elementRef);
  }

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    const systemInfo = await firstValueFrom(this.httpClient.systemInfo());
    const excludedPeriodTypes = this.getExcludedPeriodTypes(systemInfo);

    this.component = () => {
      const [selected, setSelected] = useState(this.selectedPeriods);
      return (
        <DataProvider>
          {
            <Modal position="middle" large>
              <ModalTitle>Period</ModalTitle>
              <ModalContent>
                <PeriodDimension
                  selectedPeriods={selected}
                  onSelect={(selectionEvent: PeriodSelectionEvent) =>
                    setSelected(selectionEvent.items)
                  }
                  excludedPeriodTypes={excludedPeriodTypes}
                  systemInfo={systemInfo}
                />
              </ModalContent>
              <ModalActions>
                <ButtonStrip end>
                  <Button
                    onClick={() => {
                      this.onCancel();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    primary
                    onClick={() => {
                      this.onConfirm(selected);
                    }}
                  >
                    Confirm
                  </Button>
                </ButtonStrip>
              </ModalActions>
            </Modal>
          }
        </DataProvider>
      );
    };
    this.render();
  }

  onCancel() {
    this.cancel.emit();
  }

  onConfirm(selectedItems: any[]) {
    this.confirm.emit(selectedItems);
  }

  getExcludedPeriodTypes = (systemSettings: any = {}) => {
    const types = [];
    if (systemSettings['hideDailyPeriods']) {
      types.push(DAILY);
    }
    if (systemSettings['hideWeeklyPeriods']) {
      types.push(WEEKLY, WEEKLYWED, WEEKLYTHU, WEEKLYSAT, WEEKLYSUN);
    }
    if (systemSettings['hideBiWeeklyPeriods']) {
      types.push(BIWEEKLY);
    }
    if (systemSettings['hideMonthlyPeriods']) {
      types.push(MONTHLY);
    }
    if (systemSettings['hideBiMonthlyPeriods']) {
      types.push(BIMONTHLY);
    }
    return types;
  };
}
