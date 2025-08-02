import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DataProvider } from '@dhis2/app-runtime';
import {
  Button,
  ButtonStrip,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
} from '@dhis2/ui';
import { D2Window } from '@iapps/d2-web-sdk';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperModule } from '../../../react-wrapper/react-wrapper.component';
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
  standalone: false,
})
export class PeriodSelectorModalComponent extends ReactWrapperModule {
  d2 = (window as unknown as D2Window).d2Web;
  @Input() selectedPeriods: any[] = [];

  @Output() cancel = new EventEmitter();
  @Output() confirm = new EventEmitter();

  constructor(elementRef: ElementRef<HTMLElement>) {
    super(elementRef);
  }

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    const systemInfo = this.d2.systemInfo;
    const excludedPeriodTypes = this.getExcludedPeriodTypes(systemInfo);

    this.component = () => {
      const [selected, setSelected] = useState(this.selectedPeriods);
      return React.createElement(
        DataProvider,
        null,
        React.createElement(
          Modal,
          { position: 'middle', large: true },
          React.createElement(ModalTitle, null, 'Period'),
          React.createElement(
            ModalContent,
            null,
            React.createElement(PeriodDimension, {
              selectedPeriods: selected,
              onSelect: (selectionEvent: PeriodSelectionEvent) =>
                setSelected(selectionEvent.items),
              excludedPeriodTypes: excludedPeriodTypes,
              systemInfo: systemInfo,
            })
          ),
          React.createElement(
            ModalActions,
            null,
            React.createElement(
              ButtonStrip,
              { end: true },
              React.createElement(
                Button,
                {
                  onClick: () => {
                    this.onCancel();
                  },
                },
                'Cancel'
              ),
              React.createElement(
                Button,
                {
                  primary: true,
                  disabled: selected.length === 0,
                  onClick: () => {
                    this.onConfirm(selected);
                  },
                },
                'Confirm'
              )
            )
          )
        )
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
