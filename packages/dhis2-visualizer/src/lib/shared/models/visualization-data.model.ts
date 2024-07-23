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
    const dx = this._getDimensionValue('dx');

    if (!dx) {
      return null;
    }

    const analyticPromise = new Fn.Analytics()
      .setData(dx)
      .setPeriod(this._getDimensionValue('pe'))
      .setOrgUnit(this._getDimensionValue('ou'));

    return await analyticPromise.get();
  }
}
