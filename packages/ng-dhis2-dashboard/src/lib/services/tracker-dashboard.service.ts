import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Period } from '@iapps/period-utilities';
import { catchError, map, Observable, of, switchMap, zip } from 'rxjs';
import { VisualizationDataSelection } from '../models';
import { DashboardConfigService } from './dashboard-config.service';

@Injectable()
export class TrackerDashboardService {
  constructor(
    private httpClient: NgxDhis2HttpClientService,
    private dashboardConfigService: DashboardConfigService
  ) {}

  getTrackedEntityInstances(
    program: string,
    periodType: string,
    dataSelections?: VisualizationDataSelection[]
  ): Observable<any> {
    const period = this._getPeriod(periodType as string, dataSelections);

    return this._getOrgUnit(dataSelections).pipe(
      switchMap((orgUnit) =>
        zip(
          this.httpClient
            .get(
              `trackedEntityInstances.json?fields=attributes[attribute,code,value],enrollments[enrollment,enrollmentDate,incidentDate,orgUnit,orgUnitName,geometry,events[event,programStage,dataValues[dataElement,value]]]&ou=${
                orgUnit.id
              }&ouMode=DESCENDANTS&&order=created:desc&program=${program}&skipPaging=true&programStartDate=${
                period.startDate || period.startdate
              }&programEndDate=${period.endDate || period.enddate}`
            )
            .pipe(map((res) => res?.trackedEntityInstances || [])),
          this.httpClient.get(
            `programs/${program}.json?fields=id,name,enrollmentDateLabel,incidentDateLabel,programTrackedEntityAttributes[displayInList,sortOrder,trackedEntityAttribute[id,name,formName,optionSet[id,name,options[id,code,name,style]]]]`
          )
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

    if (periodSelection) {
      const splitedStartDate = (periodSelection.startDate || '').split('-');

      const startDate =
        splitedStartDate[0].length < 4
          ? splitedStartDate.reverse().join('-')
          : periodSelection.startDate;

      const splitedEndDate = (periodSelection.endDate || '').split('-');

      const endDate =
        splitedEndDate[0].length < 4
          ? splitedEndDate.reverse().join('-')
          : periodSelection.endDate;

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
    const orgUnitSelection: any = (dataSelections?.find(
      ({ dimension }) => dimension === 'ou'
    )?.items || [])[0];

    return orgUnitSelection
      ? of(orgUnitSelection)
      : this.httpClient.me().pipe(map((me) => me.organisationUnits[0]));
  }
}
