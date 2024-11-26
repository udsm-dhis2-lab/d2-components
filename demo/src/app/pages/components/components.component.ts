import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DictionaryVisualizer } from '../../../../../packages/dhis2-visualizer/src/lib/modules/dictionary/dictionary-visualizer';
import { Indicator } from '../../services/models/indicator';
import { MetaDataService } from '../../services/metadata.service';

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
    // Fetch indicators from DHIS2 and update dictionaryData
    this.metaDataService.fetchIndicators().subscribe(
      (indicators) => {
        this.indicators = indicators; // Store the fetched indicators
        console.log(this.indicators);

        // Now update dictionaryData based on the fetched indicators
        this.dictionaryData = {
          dictionary: this.indicators.reduce<{ [key: string]: string }>((acc, indicator) => {
            acc[indicator.displayName] = indicator.displayName; // Use indicator id as key, name as value
            return acc;
          }, {}),
        };

        console.log('dictionaryData',this.dictionaryData);

        // Manually trigger change detection to ensure the template updates
        this.cdRef.detectChanges();

        // Call the visualizer to render the updated dictionary data
        this.renderDictionaryVisualizer();
      },
    );
  }

  // Method to instantiate and render the dictionary visualizer with updated data
  renderDictionaryVisualizer() {
    const dictionaryVisualizer = new DictionaryVisualizer();

    // Ensure the container exists before trying to visualize
    const container = document.getElementById('dictionary-container');
    if (!container) {
      console.error('No container with id "dictionary-container" found');
      return;
    }

    // Set the data and the container id
    dictionaryVisualizer['_data'] = this.dictionaryData;  // Set the dictionary data
    dictionaryVisualizer['_id'] = 'dictionary-container';  // Set the container ID

    // Draw the dictionary
    dictionaryVisualizer.draw();
  }
}
