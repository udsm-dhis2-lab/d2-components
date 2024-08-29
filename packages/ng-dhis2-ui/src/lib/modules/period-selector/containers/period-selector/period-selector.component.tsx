import {
  Component,
  Input,
  ElementRef,
  Output,
  EventEmitter,
  NgZone,
} from '@angular/core';
import { DataProvider } from '@dhis2/app-runtime';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import React from 'react';
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
  selector: 'ng-dhis2-ui-period-selector',
  template: `<ng-container></ng-container>`,
  styles: [
    `
      ::ng-deep .content-container {
        z-index: 0 !important;
      }
    `,
  ],
})
export class PeriodSelectorComponent extends ReactWrapperComponent {
  @Input() selectedPeriods: any[] = [];

  @Output() selectPeriods = new EventEmitter();

  override props: Record<string, unknown> = {
    onSelect: (e: any) => {
      this.onSelectItems(e);
    },
  };

  constructor(
    elementRef: ElementRef<HTMLElement>,
    private httpClient: NgxDhis2HttpClientService,
    private ngZone: NgZone
  ) {
    super(elementRef);
  }

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    const systemInfo = await firstValueFrom(this.httpClient.systemInfo());
    const excludedPeriodTypes = this.getExcludedPeriodTypes(systemInfo);

    this.component = () => (
      <DataProvider>
        {
          <PeriodDimension
            selectedPeriods={this.selectedPeriods}
            onSelect={(selectionEvent: PeriodSelectionEvent) =>
              this.ngZone.run(() => {
                this.onSelectItems(selectionEvent);
              })
            }
            excludedPeriodTypes={excludedPeriodTypes}
            systemInfo={systemInfo}
          />
        }
      </DataProvider>
    );
    this.render();
  }

  onSelectItems(selectionEvent: PeriodSelectionEvent) {
    this.selectPeriods.emit(selectionEvent.items);
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
