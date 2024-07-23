import {Action} from '@ngrx/store';
import { IndicatorGroupsState } from '../state/indicators.state';


export enum IndicatorsActions {
    LoadIndicators = '[Indicators] Load indicators',
    LoadIndicatorsSuccess = '[Indicators] Load indicators success',
    LoadIndicatorsFail = '[Indicators] Load indicators fail',
    LoadIndicatorsByPages = '[Indicators] Load indicators by pages',
    LoadIndicatorsByPagesSuccess = '[Indicators] Load indicators by pages success',
    LoadIndicatorsByPagesFail = '[Indicators] Load indicators by pages fail',
    ProgressLoadingIndicators = '[Progress bar] progress bar for loaded indicators',
    LoadIndicatorProperties = '[Indicator properties] Load indicator properties',
    LoadIndicatorPropertiesFail = '[Indicator properties] Load indicator properties fail',
    LoadIndicatorPropertiesSuccess = '[Indicator properties] Load indicator properties success',
    LoadIndicatorGroups = '[Indicator Groups] Load indicator Groups',
    LoadIndicatorGroupsSuccess = '[Indicator Groups] Load indicator Groups success',
    LoadIndicatorGroupsFail = '[Indicator Groups] Load indicator Groups fail',
}

export class loadIndicatorsAction implements Action {
    readonly type = IndicatorsActions.LoadIndicators;
}

export class loadIndicatorsSuccessAction implements Action {
    readonly type = IndicatorsActions.LoadIndicatorsSuccess;

    constructor(public payload: any) {}
}

export class loadIndicatorsFailAction implements Action {
    readonly type = IndicatorsActions.LoadIndicatorsFail;

    constructor(public payload: any) {}
}


export class LoadIndicatorsByPagesAction implements Action {
    readonly type = IndicatorsActions.LoadIndicatorsByPages;

    constructor(public payload: any) {}
}

export class LoadIndicatorsByPagesSuccessAction implements Action {
    readonly type = IndicatorsActions.LoadIndicatorsByPagesSuccess;

    constructor(public payload: any) {}
}

export class LoadIndicatorsByPagesFailAction implements Action {
    readonly type = IndicatorsActions.LoadIndicatorsByPagesFail;

    constructor(public payload: any) {}
}


export class LoadIndicatorGroupsAction implements Action {
    readonly type = IndicatorsActions.LoadIndicatorGroups;
}

export class LoadIndicatorGroupsSuccessAction implements Action {
    readonly type = IndicatorsActions.LoadIndicatorGroupsSuccess;

    constructor(public payload: IndicatorGroupsState) {}
}

export class LoadIndicatorGroupsFailAction implements Action {
    readonly type = IndicatorsActions.LoadIndicatorsByPagesFail;

    constructor(public payload: any) {}
}

export type IndicatorsAction = loadIndicatorsAction
    | loadIndicatorsFailAction
    | loadIndicatorsSuccessAction
    | LoadIndicatorsByPagesAction
    | LoadIndicatorsByPagesFailAction
    | LoadIndicatorsByPagesSuccessAction
    | LoadIndicatorGroupsAction
    | LoadIndicatorGroupsSuccessAction
    | LoadIndicatorGroupsFailAction;