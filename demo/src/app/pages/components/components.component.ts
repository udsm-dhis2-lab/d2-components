import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DictionaryVisualizer } from '../../../../../packages/dhis2-visualizer/src/lib/modules/dictionary/dictionary-visualizer';
import { Indicator } from '../../services/models/indicator';
import { MetaDataService } from '../../services/metadata.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
})
export class ComponentsComponent implements AfterViewInit {
  selectedPeriods = [
    { id: 'THIS_MONTH', name: 'This month' },
    { id: 'LAST_MONTH', name: 'Last month' },
    { id: 'LAST_3_MONTHS', name: 'Last 3 months' },
  ];

  selectedOrgUnits = [];
  onSelectPeriods(periods: any) {
    console.log(periods);
  }

  onSelectOrgUnits(orgUnits: any) {
    this.selectedOrgUnits = orgUnits;
    console.log(this.selectedOrgUnits);
  }

  // This will hold the fetched indicators
  indicators: Indicator[] = [];

  // This will hold the dynamically updated dictionary data
  dictionaryData: { dictionary: { [key: string]: string } } = {
    dictionary: {},
  };

  constructor(
    private metaDataService: MetaDataService,
    private cdRef: ChangeDetectorRef  // Inject ChangeDetectorRef to trigger change detection
  ) {}

  ngAfterViewInit() {
    this.metaDataService.fetchIndicators().subscribe(
      (indicators) => {
        this.indicators = indicators;
        this.dictionaryData = {
          dictionary: this.indicators.reduce<{ [key: string]: string }>((acc, indicator) => {
            acc[indicator.id] = indicator.displayName;
            return acc;
          }, {}),
        };
  
        this.cdRef.detectChanges();
        this.renderDictionaryVisualizer();
      }
    );
  }
  
  renderDictionaryVisualizer() {
    const dictionaryVisualizer = new DictionaryVisualizer();
    dictionaryVisualizer['_data'] = this.dictionaryData;
    dictionaryVisualizer['_id'] = 'dictionary-container';
  
    // Update onFetchDetails to use lastValueFrom instead of toPromise
    dictionaryVisualizer.onFetchDetails = async (id: string) => {
      return await firstValueFrom(this.metaDataService.fetchIndicatorById(id));
    };
  
    dictionaryVisualizer.draw();
  }
}
