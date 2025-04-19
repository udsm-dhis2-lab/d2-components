import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Observable, pipe } from 'rxjs';
import { IndicatorGroupsState } from '../../store/state/indicators.state';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../store/reducers/indicators.reducers';
import {
  getListOfIndicators,
  getAllIndicators,
  getIndicatorGroups,
} from '../../store/selectors/indicators.selectors';
import * as indicators from '../../store/actions/indicators.actions';
import { DictionaryState } from '../../store/reducers/dictionary.reducer';

@Component({
    selector: 'app-indicators-list',
    templateUrl: './indicators-list.component.html',
    styleUrls: ['./indicators-list.component.css'],
    standalone: false
})
export class IndicatorsListComponent implements OnInit {
  // @Input() indicators: any;
  // @Input() completedPercent: number;
  // @Input() totalAvailableIndicators: number;
  @Input() metadataIdentifiers: any;
  // @Input() indicatorGroups: any;
  @Input() routingConfiguration: any;
  @Output() selectedMetadataIdentifier = new EventEmitter<string>();
  error: boolean = false;
  loading: boolean = true;
  hoverState = 'notHovered';
  selectedIndicator: any = null;
  searchText: string;
  currentPage: number = 1;
  searchingTextForIndicatorGroup: string;
  indicatorGroupsForSearching: any[] = [];
  showIndicatorGroups = false;
  groupToFilter: any[] = [];
  listingIsSet: boolean;
  indicatorGroups$!: Observable<IndicatorGroupsState>;
  activeItem!: number;
  newIndicators$!: Observable<any>;
  searchingText!: string;
  indicatorsList$!: Observable<any>;
  allIndicators$!: Observable<any>;
  indicators: any[] = [];
  completedPercent = 0;
  totalAvailableIndicators: any = null;
  indicatorGroups: any[] = [];
  constructor(
    private store: Store<DictionaryState>,
    private indicatorsStore: Store<AppState>
  ) {
    this.searchText = '';
    this.searchingTextForIndicatorGroup = '';
    this.listingIsSet = false;
    if (this.completedPercent >= 100) {
      this.loading = false;
      this.error = false;
    }
  }

  ngOnInit() {
    this.loadAllIndicators();
  }

  toggleListingOfItems() {
    this.listingIsSet = !this.listingIsSet;
  }

  selectedMetadata(e: any) {
    this.selectedMetadataIdentifier.emit(e);
  }

  mouseEnter(indicator: any, hoverState: any) {
    this.selectedIndicator = indicator.id;
    this.hoverState = hoverState;
  }

  mouseLeave() {
    this.selectedIndicator = null;
    this.hoverState = 'notHovered';
  }

  showGroups() {
    this.showIndicatorGroups = !this.showIndicatorGroups;
  }

  inGroupToFilter(id: string) {
    return _.find(this.groupToFilter, { id: id });
  }

  groupNames() {
    if (this.indicatorGroupsForSearching.length < 5) {
      return this.indicatorGroupsForSearching
        .map((g: any) => g.name)
        .join(', ');
    } else {
      const diff = this.indicatorGroupsForSearching.length - 4;
      return (
        this.indicatorGroupsForSearching
          .slice(0, 4)
          .map((g: any) => g.name)
          .join(', ') +
        ' and ' +
        diff +
        ' More'
      );
    }
  }

  updateIndicatorGroupsForSearch(group: any, event: any) {
    const checked = event.target?.checked;
    if (checked) {
      this.indicatorGroupsForSearching.push(group);
    } else {
      let index: number = this.indicatorGroupsForSearching.indexOf(group);
      this.indicatorGroupsForSearching.splice(index, 1);
    }
  }

  loadAllIndicators() {
    this.indicatorsList$ = this.indicatorsStore.select(
      pipe(getListOfIndicators)
    );
    this.allIndicators$ = this.indicatorsStore.select(pipe(getAllIndicators));
    this.indicatorGroups$ = this.indicatorsStore.pipe(
      select(getIndicatorGroups)
    );
    if (this.indicatorsList$) {
      this.indicatorsList$.subscribe((indicatorList) => {
        if (indicatorList) {
          this.totalAvailableIndicators = indicatorList['pager']['total'];
          this.allIndicators$.subscribe((indicatorsLoaded) => {
            if (indicatorsLoaded) {
              this.indicators = [];
              _.map(indicatorsLoaded, (indicatorsByPage) => {
                this.indicators = [
                  ...this.indicators,
                  ...indicatorsByPage['indicators'],
                ];
                this.completedPercent =
                  100 *
                  (this.indicators.length / this.totalAvailableIndicators);
                if (this.completedPercent === 100) {
                  this.loading = false;
                  this.error = false;
                }
              });
            }
          });
        } else {
          this.store.dispatch(new indicators.loadIndicatorsAction());
          this.store.dispatch(new indicators.LoadIndicatorGroupsAction());
          this.indicatorsList$ = this.indicatorsStore.select(
            pipe(getListOfIndicators)
          );
          this.allIndicators$ = this.indicatorsStore.select(
            pipe(getAllIndicators)
          );
          if (this.indicatorsList$) {
            this.indicatorsList$.subscribe((indicatorList) => {
              if (indicatorList) {
                this.totalAvailableIndicators = indicatorList['pager']['total'];
                this.allIndicators$.subscribe((indicatorsLoaded) => {
                  if (indicatorsLoaded) {
                    this.indicators = [];
                    _.map(indicatorsLoaded, (indicatorsByPage) => {
                      this.indicators = [
                        ...this.indicators,
                        ...indicatorsByPage['indicators'],
                      ];
                      this.completedPercent =
                        100 *
                        (this.indicators.length /
                          this.totalAvailableIndicators);
                      if (this.completedPercent === 100) {
                        this.loading = false;
                        this.error = false;
                      }
                    });
                  }
                });
              }
            });
          }
          this.indicatorGroups$ = this.indicatorsStore.pipe(
            select(getIndicatorGroups)
          );
        }
      });
    }
  }
}
