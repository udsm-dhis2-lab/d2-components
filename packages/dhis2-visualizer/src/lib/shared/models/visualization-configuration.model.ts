import {
  getCustomTemplateDataSelections,
  getSelectionDimensionsFromFavorite,
} from '../helpers';
import { VisualizationDataSelection } from './visualization-data-selection.model';
import { VisualizationLayout } from './visualization-layout.model';
import { VisualizationType } from './visualization-type.model';
import * as _ from 'lodash';
import { TableConfiguration } from '../../modules/table/models/table-config.model';
import { CustomVisualizationTemplate } from '../../modules/custom/models/custom-visualization-template.model';
import { DEFAULT_ORG_UNIT_SELECTIONS } from '../constants/default-data-selections.constant';

export class VisualizationConfiguration {
  dataSelections: VisualizationDataSelection[];
  layout?: VisualizationLayout;
  constructor(public config: any) {
    this.dataSelections = getSelectionDimensionsFromFavorite(this.config);

    if (this.type?.toUpperCase() === 'CUSTOM') {
      this.dataSelections = getCustomTemplateDataSelections(
        this.customTemplate.html,
        _.unionBy(this.dataSelections, DEFAULT_ORG_UNIT_SELECTIONS)
      );
    }

    this.layout = VisualizationLayout.getLayout(this.dataSelections);
  }

  get renderId(): string {
    return this.config?.id;
  }
  get title(): string {
    return this.config?.title || this.config?.displayName || this.config?.name;
  }

  get subTitle(): string {
    return this.config?.subTitle;
  }

  get type(): VisualizationType {
    return this.config?.type;
  }

  get hideEmptyColumns(): boolean {
    return this.config?.hideEmptyColumns;
  }

  get rowSubTotals(): boolean {
    return this.config?.rowSubTotals;
  }

  get cumulativeValues(): boolean {
    return this.config?.cumulativeValues;
  }

  get showDimensionLabels(): boolean {
    return this.config?.showDimensionLabels;
  }

  get sortOrder(): number {
    return this.config?.sortOrder;
  }

  get fontSize(): string {
    return this.config?.fontSize;
  }

  get topLimit(): number {
    return this.config?.topLimit;
  }

  get percentStackedValues(): boolean {
    return this.config?.percentStackedValues;
  }

  get noSpaceBetweenColumns(): boolean {
    return this.config?.noSpaceBetweenColumns;
  }

  get showHierarchy(): boolean {
    return this.config?.showHierarchy;
  }

  get hideTitle(): boolean {
    return this.config?.hideTitle;
  }

  get colorSet(): string {
    return this.config?.colorSet;
  }

  get skipRounding(): boolean {
    return this.config?.skipRounding;
  }

  get showData(): boolean {
    return this.config?.showData;
  }

  get fixRowHeaders(): boolean {
    return this.config?.fixRowHeaders;
  }

  get numberType(): number {
    return this.config?.numberType;
  }

  get hideEmptyRows(): boolean {
    return this.config?.hideEmptyRows;
  }

  get displayDensity(): boolean {
    return this.config?.displayDensity;
  }

  get regressionType(): boolean {
    return this.config?.regressionType;
  }

  get colTotals(): boolean {
    return this.config?.colTotals;
  }

  get hideEmptyRowItems(): string {
    return this.config?.hideEmptyRowItems;
  }

  get aggregationType(): string {
    return this.config?.aggregationType;
  }

  get hideSubtitle(): boolean {
    return this.config?.hideSubtitle;
  }

  get hideLegend(): boolean {
    return this.config?.hideLegend;
  }

  get fixColumnHeaders(): boolean {
    return this.config?.fixColumnHeaders;
  }

  get colSubTotals(): boolean {
    return this.config?.colSubTotals;
  }

  get rowTotals(): boolean {
    return this.config?.rowTotals;
  }

  get digitGroupSeparator(): boolean {
    return this.config?.digitGroupSeparator;
  }

  get regression(): boolean {
    return this.config?.regression;
  }

  get multiAxisTypes(): string[] {
    return (
      this.config.selectedChartTypes ||
      (this.config?.series || []).map((series: any) => {
        return {
          id: series.dimensionItem,
          type: series.type?.toLowerCase() || this.type,
        };
      })
    );
  }

  get axes(): any[] {
    return this.config.axes || [];
  }

  get seriesOptions(): any[] {
    return this.config.series;
  }

  get xAxisType(): string[] {
    return this.layout?.rows || ['dx'];
  }

  get yAxisType(): string {
    return this.layout?.columns && this.layout?.columns.length > 0
      ? (this.layout?.columns[0] as string)
      : 'ou';
  }

  get zAxisType(): string[] {
    return this.layout?.filters || ['pe'];
  }

  get zoom(): number {
    return this.config?.zoom;
  }

  get fillColor(): string {
    return this.config?.fillColor;
  }

  get latitude(): string {
    return this.config?.latitude;
  }

  get longitude(): string {
    return this.config?.longitude;
  }

  get height(): string {
    return this.config?.height;
  }

  get width(): string {
    return this.config?.width;
  }

  get mapboxApiKey(): string {
    return this.config?.mapboxApiKey;
  }

  get mapboxStyle(): string {
    return this.config?.mapboxStyle;
  }

  get legendSet(): any {
    return this.config?.legendSet;
  }

  get symbols(): any {
    return this.config?.symbols;
  }

  get mapCenter(): number[] {
    return this.config?.center;
  }

  get popUpTemplate(): string {
    return this.config?.popUpTemplate;
  }

  get customTemplate(): CustomVisualizationTemplate {
    return new CustomVisualizationTemplate(this.config?.template);
  }

  get customTemplateDataSelections(): any {
    return [];
  }

  get trackerSelectionExist(): any {
    return this.dataSelections.some(
      (dataSelection) => dataSelection.domain === 'TRACKER'
    );
  }

  mergeDataSelections(dataSelections: any[]): void {
    this.dataSelections = _.unionBy(
      dataSelections,
      this.dataSelections,
      'dimension'
    );
  }

  toTableConfig(): TableConfiguration {
    return {
      id: this.renderId,
      title: this.title,
      subtitle: this.subTitle,
      showColumnTotal: this.colTotals,
      showColumnSubtotal: this.colSubTotals,
      showRowTotal: this.rowTotals,
      showRowSubtotal: this.rowSubTotals,
      showDimensionLabels: this.showDimensionLabels,
      hideEmptyRows: this.hideEmptyRows,
      showHierarchy: this.showHierarchy,
      rows: this.config?.rows,
      columns: this.config?.columns,
      filters: this.config?.filters,
      legendDisplayStrategy: '',
      displayList: false,
      legendSet: this.legendSet,
      styles: [],
      style: '',
      // TODO: This seems like a specific implementation, Need to find a best way to generically handle what that this is
      isConsecutivePeDiff: false,
    };
  }
}
