import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-indicator-properties',
  templateUrl: './indicator-properties.component.html',
  styleUrls: ['./indicator-properties.component.css'],
})
export class IndicatorPropertiesComponent implements OnInit {
  @Input() indicator: any;
  @Input() listingIsSet!: boolean;
  @Input() metadataIdentifiers: any;
  @Input() routingConfiguration: any;
  @Output() selectedMetadata = new EventEmitter<string>();
  constructor() {}

  ngOnInit() {}

  getIndicatorType(indicatorType: any) {
    if (indicatorType.name.toLowerCase().indexOf('cent') > -1) {
      return 'Percentage indicator';
    } else {
      return 'Number indicator';
    }
  }

  addSelectedMetadata(e: any) {
    this.selectedMetadata.emit(e);
  }

  checkIfTheIndicatorIsAmongSelected(
    indicatorId: string,
    metadataIdentifiers: any
  ) {
    if (_.indexOf(metadataIdentifiers, indicatorId) > -1) {
      return true;
    } else {
      return false;
    }
  }
}
