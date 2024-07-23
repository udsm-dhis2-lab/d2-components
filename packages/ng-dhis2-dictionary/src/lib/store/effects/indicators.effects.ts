import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { IndicatorsService } from '../../services/indicators.service';
import * as indicators from '../actions/indicators.actions';
import { IndicatorGroupsState } from '../state/indicators.state';

@Injectable()
export class IndicatorsEffects {
  indicatorsList$: Observable<any> = createEffect(() =>
    this.actions$.pipe(
      ofType<indicators.IndicatorsAction>(
        indicators.IndicatorsActions.LoadIndicators
      ),
      switchMap(() =>
        this.httpClient.get('indicators.json').pipe(
          map(
            (indicatorsListObject: any) =>
              new indicators.loadIndicatorsSuccessAction(indicatorsListObject)
          ),
          catchError((error) =>
            of(new indicators.loadIndicatorsFailAction(error))
          )
        )
      )
    )
  );

  // @Effect()
  // programIndicatorsList$: Observable<any> = this.actions$
  // .pipe(ofType<indicators.IndicatorsAction>(indicators.IndicatorsActions.LoadIndicators),
  //     switchMap(() => this.httpClient.get('programIndicators.json').pipe(
  //       map((indicatorsListObject: any) =>
  //         new indicators.loadIndicatorsSuccessAction(indicatorsListObject)),
  //       catchError((error) => of(new indicators.loadIndicatorsFailAction(error)))
  //     ))
  // );

  indicatorGroups$: Observable<any> = createEffect(() =>
    this.actions$.pipe(
      ofType<indicators.IndicatorsAction>(
        indicators.IndicatorsActions.LoadIndicatorGroups
      ),
      switchMap(() =>
        this.httpClient
          .get(
            'indicatorGroups.json?fields=id,name,description,indicators[id]&paging=false'
          )
          .pipe(
            map(
              (indicatorGroupsObject: IndicatorGroupsState) =>
                new indicators.LoadIndicatorGroupsSuccessAction(
                  indicatorGroupsObject
                )
            ),
            catchError((error) =>
              of(new indicators.LoadIndicatorGroupsFailAction(error))
            )
          )
      )
    )
  );

  indicatorsListSuccess$: Observable<any> = createEffect(
    () =>
      this.actions$.pipe(
        ofType<indicators.IndicatorsAction>(
          indicators.IndicatorsActions.LoadIndicatorsSuccess
        ),
        tap((action: any) => {
          let indicatorsArr: any[] = [];
          this.indicatorService
            ._loadAllIndicators(action.payload['pager'])
            .subscribe((allIndicators) => {
              indicatorsArr = [
                ...indicatorsArr,
                ...allIndicators['indicators'],
              ];
              this.store.dispatch(
                new indicators.LoadIndicatorsByPagesSuccessAction(indicatorsArr)
              );
            });
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private httpClient: NgxDhis2HttpClientService,
    private indicatorService: IndicatorsService
  ) {}
}
