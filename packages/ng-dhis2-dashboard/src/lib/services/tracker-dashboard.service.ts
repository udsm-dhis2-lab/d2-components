import { Injectable } from '@angular/core';
import { D2Window } from '@iapps/d2-web-sdk';
import { Period } from '@iapps/period-utilities';
import { catchError, from, map, Observable, of, switchMap, zip } from 'rxjs';
import { VisualizationDataSelection } from '../models';
import { DashboardConfigService } from './dashboard-config.service';

@Injectable()
export class TrackerDashboardService {
  constructor(private dashboardConfigService: DashboardConfigService) {}

  getTrackedEntityInstances(
    program: string,
    periodType: string,
    dataSelections?: VisualizationDataSelection[]
  ): Observable<any> {
    const period = this._getPeriod(periodType as string, dataSelections);
    const d2 = (window as unknown as D2Window).d2Web;

    return this._getOrgUnit(dataSelections).pipe(
      switchMap((orgUnit) =>
        zip(
          from(
            d2.httpInstance.get(
              `trackedEntityInstances.json?fields=attributes[attribute,code,value],enrollments[enrollment,enrollmentDate,incidentDate,orgUnit,orgUnitName,geometry,events[event,programStage,dataValues[dataElement,value]]]&ou=${
                orgUnit.id
              }&ouMode=DESCENDANTS&&order=created:desc&program=${program}&skipPaging=true&programStartDate=${
                period.startDate || period.startdate
              }&programEndDate=${period.endDate || period.enddate}`
            )
          ).pipe(map((res) => res?.data?.['trackedEntityInstances'] || [])),
          from(
            d2.httpInstance.get(
              `programs/${program}.json?fields=id,name,enrollmentDateLabel,incidentDateLabel,programTrackedEntityAttributes[displayInList,sortOrder,trackedEntityAttribute[id,name,formName,optionSet[id,name,options[id,code,name,style]]]]`
            )
          ).pipe(map((res) => res.data))
        )
      ),
      map((results: any[]) => {
        return { trackedEntityInstances: results[0], program: results[1] };
      }),
      catchError(() => of(undefined))
    );
  }

  private _getPeriod(
    periodType: string,
    dataSelections?: VisualizationDataSelection[]
  ) {
    const periodSelection: any = (dataSelections?.find(
      ({ dimension }) => dimension === 'pe'
    )?.items || [])[0];

    const selectedPeriodInstance = periodSelection?.id
      ? new Period()
          .setPreferences({ openFuturePeriods: 2 }) // TODO: Find best way to manage this
          .getById(periodSelection?.id)
      : undefined;

    if (selectedPeriodInstance) {
      const splitedStartDate = (selectedPeriodInstance.startDate || '').split(
        '-'
      );

      const startDate =
        splitedStartDate[0].length < 4
          ? splitedStartDate.reverse().join('-')
          : selectedPeriodInstance.startDate;

      const splitedEndDate = (selectedPeriodInstance.endDate || '').split('-');

      const endDate =
        splitedEndDate[0].length < 4
          ? splitedEndDate.reverse().join('-')
          : selectedPeriodInstance.endDate;

      return {
        ...periodSelection,
        startDate,
        endDate,
      };
    }

    const date = new Date().toISOString();

    const periodInstance = (new Period()
      .setType(periodType)
      .setPreferences({ openFuturePeriods: 1 })
      .get()
      .list() || [])[0];

    if (!periodInstance) {
      return {
        startDate: date,
        endDate: date,
      };
    }

    const splitedStartDate = (periodInstance.startDate || '').split('-');

    const startDate =
      splitedStartDate[0].length < 4
        ? splitedStartDate.reverse().join('-')
        : periodInstance.startDate;

    const splitedEndDate = (periodInstance.endDate || '').split('-');

    const endDate =
      splitedEndDate[0].length < 4
        ? splitedEndDate.reverse().join('-')
        : periodInstance.endDate;

    return { ...periodInstance, startDate, endDate };
  }

  private _getOrgUnit(
    dataSelections?: VisualizationDataSelection[]
  ): Observable<any> {
    const d2 = (window as unknown as D2Window).d2Web;
    const orgUnitSelection: any = (dataSelections?.find(
      ({ dimension }) => dimension === 'ou'
    )?.items || [])[0];

    return orgUnitSelection
      ? of(orgUnitSelection)
      : of(d2.currentUser).pipe(map((me) => me?.organisationUnits[0]));
  }
}
