import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as _ from 'lodash';
import { Observable, pipe } from 'rxjs';
import { MetadataDictionary } from '../../models/dictionary';

import { DomSanitizer } from '@angular/platform-browser';
import { InitializeDictionaryMetadataAction } from '../../store/actions/dictionary.actions';
import * as indicators from '../../store/actions/indicators.actions';
import { DictionaryState } from '../../store/reducers/dictionary.reducer';
import { AppState } from '../../store/reducers/indicators.reducers';
import { getDictionaryList } from '../../store/selectors/dictionary.selectors';
import {
  getAllIndicators,
  getIndicatorGroups,
  getListOfIndicators,
} from '../../store/selectors/indicators.selectors';
import { IndicatorGroupsState } from '../../store/state/indicators.state';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-dhis2-dictionary-list',
  templateUrl: './dictionary-list.component.html',
  styleUrls: ['./dictionary-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionaryListComponent implements OnInit {
  @Input() metadataIdentifiers!: Array<string>;
  @Output() dictionaryItemId = new EventEmitter<string>();
  @Input() selectedItem!: string;
  dictionaryList$!: Observable<MetadataDictionary[]>;
  indicatorGroups$!: Observable<IndicatorGroupsState>;
  activeItem!: number;
  indicators: any[] = [];
  newIndicators$!: Observable<any>;
  searchingText: string;
  currentPage: number = 1;
  indicatorsList$!: Observable<any>;
  allIndicators$!: Observable<any>;
  completedPercent = 0;
  selectedIndicator: any = null;
  totalAvailableIndicators: any = null;
  indicatorGroups: any[] = [];
  error: boolean;
  loading: boolean;

  constructor(
    private store: Store<DictionaryState>,
    private indicatorsStore: Store<AppState>,
    private sanitizer: DomSanitizer
  ) {
    this.searchingText = '';
    this.indicators = [];
    this.loading = true;
    this.error = false;
  }

  ngOnInit() {
    if (this.selectedItem) {
      this.selectedIndicator = this.selectedItem;
    } else {
      this.selectedItem = this.metadataIdentifiers[0];
    }
    if (
      this.metadataIdentifiers.length > 0 &&
      this.metadataIdentifiers[0] !== ''
    ) {
      this.store.dispatch(
        new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
      );

      this.dictionaryList$ = this.store.select(
        getDictionaryList(this.metadataIdentifiers)
      );
    } else if (this.selectedIndicator == 'all') {
      this.loadAllIndicators();
    } else {
    }
  }

  selectedMetadataIdentifier(identifier: any) {
    this.selectedIndicator = identifier;
    let identifiers = [];
    if (_.indexOf(this.metadataIdentifiers, identifier) < 0) {
      this.metadataIdentifiers.push(identifier);
    }
    identifiers = _.uniq(this.metadataIdentifiers);
    this.store.dispatch(
      new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
    );

    this.dictionaryList$ = this.store.select(getDictionaryList(identifiers));
    const url = this.metadataIdentifiers.join(',') + '/selected/' + identifier;
    this.dictionaryItemId.emit(url);
  }

  setActiveItem(index: any, e?: any, dictionaryItemId?: string) {
    if (e) {
      e.stopPropagation();
    }
    this.selectedIndicator = dictionaryItemId;
    this.activeItem = index;
    if (this.selectedIndicator == 'all') {
      this.loadAllIndicators();
      const url =
        this.metadataIdentifiers.join(',') + '/selected/' + dictionaryItemId;
      this.dictionaryItemId.emit(url);
    } else {
      const url =
        this.metadataIdentifiers.join(',') + '/selected/' + dictionaryItemId;
      this.dictionaryItemId.emit(url);
    }
  }

  getSafeHtml(html: string) {
    let safeHtml;
    safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    return safeHtml;
  }

  remove(item: any, allIdentifiers: any) {
    let identifiers: any[] = [];
    allIdentifiers.subscribe((identifiersInfo: any) => {
      identifiersInfo.forEach((identifier: any) => {
        if (
          item.id !== identifier.id &&
          identifier.name.indexOf('not found') < 0
        ) {
          identifiers.push(identifier.id);
        }
      });
    });
    this.metadataIdentifiers = _.uniq(identifiers);
    if (this.selectedIndicator == 'all') {
      this.loadAllIndicators();
      const url = this.metadataIdentifiers.join(',') + '/selected/' + item.id;
      this.dictionaryItemId.emit(url);
    } else {
      const url = this.metadataIdentifiers.join(',') + '/selected/' + item.id;
      this.dictionaryItemId.emit(url);
    }
    this.selectedIndicator =
      this.metadataIdentifiers[this.metadataIdentifiers.length - 1];
    if (this.selectedIndicator == 'all') {
      this.loadAllIndicators();
    }
    this.store.dispatch(
      new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
    );

    this.dictionaryList$ = this.store.select(
      getDictionaryList(this.metadataIdentifiers)
    );
  }

  loadAllIndicators() {
    this.indicatorsList$ = this.indicatorsStore.select(
      pipe(getListOfIndicators)
    );
    if (this.indicatorsList$) {
      this.indicatorsList$.subscribe((indicatorList) => {
        if (indicatorList) {
          this.totalAvailableIndicators = indicatorList['pager']['total'];
          this.allIndicators$ = this.indicatorsStore.select(
            pipe(getAllIndicators)
          );
          this.allIndicators$.subscribe((indicatorsLoaded) => {
            if (indicatorsLoaded) {
              this.indicators = [];
              _.map(indicatorsLoaded, (indicatorsByPage) => {
                this.indicators = [...this.indicators, ...indicatorsByPage];
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
          if (this.indicatorGroups$) {
            this.indicatorGroups$.subscribe((indicatorGroups) => {
              if (indicatorGroups) {
                this.indicatorGroups = indicatorGroups['indicatorGroups'];
              }
            });
          }
        }
      });
    }
  }

  getMetadataItemName(allItems: any, id: any) {
    _.map(allItems, (item: any) => {
      if (item.id == id) {
        return item.name;
      }
    });
  }
}
