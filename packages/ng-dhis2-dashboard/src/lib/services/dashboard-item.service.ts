import { Injectable } from '@angular/core';
import { D2Window } from '@iapps/d2-web-sdk';
import { ErrorMessage } from '@iapps/ngx-dhis2-http-client';
import { catchError, from, map, of, zip } from 'rxjs';
import { DashboardConfig } from '../models';
import { DashboardConfigService } from './dashboard-config.service';

@Injectable()
export class DashboardItemService {
  constructor(private dashboardConfigService: DashboardConfigService) {}

  getItem(id: string, type: string, hasExtension = false) {
    switch (type) {
      case 'MAP':
        return this.getMap(id);

      default:
        return this.getVisualization(id, hasExtension);
    }
  }

  getVisualization(id: string, hasExtension = false) {
    const d2 = (window as unknown as D2Window).d2Web;
    return zip(
      from(
        d2.httpInstance.get(
          `visualizations/${id}.json?fields=id,name,title,subtitle,type,axes,hideEmptyColumns,rowSubTotals,cumulativeValues,showDimensionLabels,sortOrder,fontSize,topLimit,percentStackedValues,series,noSpaceBetweenColumns,showHierarchy,hideTitle,skipRounding,showData,hideEmptyRows,displayDensity,regressionType,colTotals,displayFormName,hideEmptyRowItems,aggregationType,hideSubtitle,hideLegend,colSubTotals,rowTotals,digitGroupSeparator,regression,columns[dimension,items[id,name,dimensionItem,dimensionItemType]],filters[dimension,items[id,name,dimensionItem,dimensionItemType]],rows[dimension,items[id,name,dimensionItem,dimensionItemType]],legendSet[id,name,legends[id,name,startValue,endValue,color]]`
        )
      ).pipe(map((res) => res.data)),
      hasExtension ? this.getVisualizationExtension(id) : of(null)
    ).pipe(
      map((visualizationResponse: any[]) => {
        return {
          ...visualizationResponse[0],
          ...(visualizationResponse[1] || {}),
        };
      })
    );
  }

  getMap(id: string) {
    const d2 = (window as unknown as D2Window).d2Web;
    return from(
      d2.httpInstance.get(
        `maps/${id}.json?fields=id,displayName~rename(name),user,longitude,latitude,zoom,basemap,mapViews[id,displayName~rename(name),displayDescription~rename(description),legendSet[id,name,legends[id,name,color,startValue,endValue]],columns[dimension,legendSet[id,name,legends[*]],filter,programStage,items[dimensionItem~rename(id),displayName~rename(name),dimensionItemType]],rows[dimension,legendSet[id,name,legends[*]],filter,programStage,items[dimensionItem~rename(id),displayName~rename(name),dimensionItemType]],filters[dimension,legendSet[id,name,legends[*]],filter,programStage,items[dimensionItem~rename(id),displayName~rename(name),dimensionItemType]],*,!attributeDimensions,!attributeValues,!category,!categoryDimensions,!categoryOptionGroupSetDimensions,!columnDimensions,!dataDimensionItems,!dataElementDimensions,!dataElementGroupSetDimensions,!filterDimensions,!itemOrganisationUnitGroups,!lastUpdatedBy,!organisationUnitGroupSetDimensions,!organisationUnitLevels,!organisationUnits,!programIndicatorDimensions,!relativePeriods,!reportParams,!rowDimensions,!translations,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren]`
      )
    ).pipe(
      map((mapResponse) => {
        return { ...(mapResponse.data || {}), type: 'MAP' };
      })
    );
  }

  getVisualizationExtension(id: string) {
    const d2 = (window as unknown as D2Window).d2Web;
    const config: DashboardConfig = this.dashboardConfigService.getConfig();
    return from(
      d2.httpInstance.get(
        `dataStore/${config?.dataStoreNamespace}-visualizations/${id}`
      )
    ).pipe(
      map((res) => res.data),
      catchError((error: ErrorMessage) => {
        console.warn(error.message);
        return of(null);
      })
    );
  }
}
