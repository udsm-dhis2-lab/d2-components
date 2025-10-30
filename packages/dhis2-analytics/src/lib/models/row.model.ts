import { DimensionItem } from '../interfaces';
import { AnalyticsMetaData } from './analytics-metadata.model';

/**
 * This represents the Analytics Results
 *
 */
export class Row {
  /**
   * Creates ana Analytics Object
   *
   * @param {Array} row - The analytics row
   * @param {Array} headers - The analytics headers
   * @param {AnalyticsMetaData} metaData - The analytics metadata
   */
  constructor(
    public row: Array<any>,
    public headers: Array<any>,
    public metaData: AnalyticsMetaData
  ) {}

  /**
   * Gets the dimension details of the analytics row
   * @param {string} id - The id of the dimension
   * @returns {DimensionItem} - The data object with name and id
   */
  dimension(id: string): DimensionItem {
    let i = -1,
      name = '';

    this.headers.forEach((header, index) => {
      if (header.name === id) {
        i = index;
      }
    });

    name = this.metaData.names[this.row[i]];

    return {
      id: this.row[i],
      name: name,
      path:
        this.metaData.ouHierarchy &&
        this.metaData.ouHierarchy[this.row[i]] !== undefined
          ? this.metaData.ouHierarchy[this.row[i]]
          : undefined,
    };
  }

  /**
   * Gets the data details of the analytics row
   *
   * @returns {DimensionItem} - The data object with name and id
   */
  get dx(): DimensionItem {
    return this.dimension('dx');
  }

  /**
   * Gets the period details of the analytics row
   *
   * @returns {DimensionItem} - The period object
   */
  get pe(): DimensionItem {
    return this.dimension('pe');
  }

  /**
   * Gets the organisation unit details of the analytics row
   *
   * @returns {DimensionItem} - The organisation unit object
   */
  get ou(): DimensionItem {
    return this.dimension('ou');
  }

  /**
   * Gets the value in a row
   *
   * @returns {string} - The value
   */
  get value(): string {
    return this.dimension('value').id;
  }
}
