import { createSelector } from '@ngrx/store';
import { AppState } from '../reducers/indicators.reducers';

const indicatorsList = (state: AppState) => state.indicatorsList;
const allIndicators = (state: AppState) => state.allIndicators.indicators;
const indicatorGroups = (state: AppState) => state.indicatorGroups;

export const getListOfIndicators = createSelector(indicatorsList, (indicatorsListObject: any) => indicatorsListObject);

export const getAllIndicators = createSelector(allIndicators, (allIndicatorsObject: any) => allIndicatorsObject);

export const getIndicatorGroups = createSelector(indicatorGroups, (indicatorGroupsObj: any) => indicatorGroupsObj);
