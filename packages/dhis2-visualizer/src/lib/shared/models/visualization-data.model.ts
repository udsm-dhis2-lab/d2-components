import { Fn } from '@iapps/function-analytics';
export class VisualizationData {
  dataSelections!: any[];
  setSelections(dataSelections: any): any {
    this.dataSelections = dataSelections;
    return this;
  }

  private _getDimensionValue(dimension: string): string {
    return this.dataSelections
      .find((dataSelection) => dataSelection.dimension === dimension)
      ?.items?.map(
        (item: { dimensionItem: any; id: any }) => item.dimensionItem || item.id
      )
      .join(';');
  }

  async getAnalytics(): Promise<any> {
    const analyticPromise = new Fn.Analytics()
      .setData(this._getDimensionValue('dx'))
      .setPeriod(this._getDimensionValue('pe'))
      .setOrgUnit(this._getDimensionValue('ou'));

    // const dataSelections: any[] = this.config.dataSelections.filter(
    //   (dataSelection) => dataSelection.dimension !== 'tea'
    // );

    // analyticPromise.setDimension(
    //     dataSelection?.dimension,
    //     dataSelection.items.map((item: { id: any }) => item.id).join(';')
    //   );

    return await analyticPromise.get();
  }
}
