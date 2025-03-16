import axios from 'axios';

export class MapGeoFeature {
  id!: string;
  code!: string;
  na!: string;
  hcd!: boolean;
  hcu!: boolean;
  le!: number;
  pg?: string;
  pi?: string;
  pn?: string;
  ty!: number;
  co!: string;
  dimensions: any;
  private _dataSelections!: any[];

  setDataSelections(dataSelections: any[]) {
    this._dataSelections = dataSelections;
    return this;
  }

  get orgUnitParams() {
    return this._dataSelections
      ?.filter((dataSelection) => dataSelection.dimension === 'ou')
      .map((dataSelection) =>
        dataSelection.items.map((item: any) => item.id).join(';')
      )
      .join('');
  }

  async get(baseUrl: string) {
    const url = `${baseUrl}/api/geoFeatures?ou=ou:${this.orgUnitParams}&displayProperty=NAME`;

    return (await axios.get(url))?.data;
  }
}
