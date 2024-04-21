import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { DictionaryListComponent } from './components/dictionary-list/dictionary-list.component';
import { DictionaryProgressComponent } from './components/dictionary-progress/dictionary-progress.component';
import { IndicatorPropertiesComponent } from './components/indicators-list/indicator-properties/indicator-properties.component';
import { IndicatorsListComponent } from './components/indicators-list/indicators-list.component';
import { FilterBySearchInputPipe } from './pipes/filter-by-search-input.pipe';
import { FilterIndicatorsByGroupIdPipe } from './pipes/filter-indicators-by-group-id.pipe';
import { SearchIndicatorGroupPipe } from './pipes/search-indicator-group.pipe';
import { IndicatorsService } from './services/indicators.service';
import { DictionaryEffects } from './store/effects/dictionary.effects';
import { IndicatorsEffects } from './store/effects/indicators.effects';
import { dictionaryReducer } from './store/reducers/dictionary.reducer';
import {
  allIndicatorsRedcuer,
  indicatorGroupsReducer,
  indicatorsListReducer,
} from './store/reducers/indicators.reducers';

import { NgxPaginationModule } from 'ngx-pagination';
import { ShortenNamePipe } from './pipes/shorten-name.pipe';
import { DictionaryHeaderComponent } from './components/dictionary-header/dictionary-header.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    StoreModule.forFeature('dictionary', dictionaryReducer),
    StoreModule.forFeature('indicatorsList', indicatorsListReducer),
    StoreModule.forFeature('allIndicators', allIndicatorsRedcuer),
    StoreModule.forFeature('indicatorGroups', indicatorGroupsReducer),
    EffectsModule.forFeature([DictionaryEffects]),
    EffectsModule.forFeature([IndicatorsEffects]),
  ],

  declarations: [
    DictionaryListComponent,
    DictionaryProgressComponent,
    DictionaryHeaderComponent,
    IndicatorsListComponent,
    IndicatorPropertiesComponent,
    SearchIndicatorGroupPipe,
    FilterBySearchInputPipe,
    FilterIndicatorsByGroupIdPipe,
    ShortenNamePipe,
  ],
  exports: [DictionaryListComponent],
  providers: [DatePipe, IndicatorsService],
})
export class NgxDhis2DictionaryModule {}
