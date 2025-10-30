export interface AnalyticsMetaDataItem {
  [x: string]: string;
}

export class AnalyticsMetaData {
  dx!: string[];
  ou!: string[];
  pe!: string[];
  co!: string[];
  ouHierarchy?: any;
  names!: Record<string, string>;
  [x: string]: unknown;

  constructor(metaData: {
    items: Record<string, AnalyticsMetaDataItem>;
    ouHierarchy: any;
    dimensions: Record<string, string[]>;
  }) {
    this.#setNames(metaData.items);
    this.#setDimensions(metaData.dimensions);
    this.ouHierarchy = metaData.ouHierarchy;
  }

  #setNames(metaDataItems: Record<string, AnalyticsMetaDataItem>): void {
    this.names = Object.keys(metaDataItems || {}).reduce(
      (itemEntity, itemKey) => {
        return {
          ...itemEntity,
          [itemKey]: metaDataItems?.[itemKey]?.['name'],
        };
      },
      {}
    );
  }

  #setDimensions(metaDataDimensions: Record<string, string[]>) {
    Object.keys(metaDataDimensions).forEach((dimensionKey) => {
      this[dimensionKey] = metaDataDimensions[dimensionKey];
    });
  }
}
