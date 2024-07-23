import { AnalyticsObject, AnalyticsMetadata } from '../interfaces';
import { AnalyticsResult, Fetcher } from '../utilities';

/**
 * @description
 * This represents the Analytics Fetcher for processing for making Web API calls
 * @example
 * const analytics = Fn.Analytics();
 * @extends Fetcher
 */
export class Analytics extends Fetcher {
  /**
   * @description
   * Creates an analytics fethcer
   *
   * @param {Number} version - The version of dhis analytics structure to use
   */
  constructor(version: number = 25) {
    super();
    if (typeof version === 'boolean') {
      if (version) {
        version = 25;
      } else {
        version = 26;
      }
    }
    this.parameters['dimension'] = {};
    this.postProcess((data) => {
      return this.standardizeAnalytics(data, version);
    });
  }

  /**
   * Sets the data for the fetch
   * @param {string} dx The id of the data to get
   * @returns {Analytics} - Object with the analytics interaction properties
   */
  setData(dx: string): Analytics {
    this.setDimension('dx', dx);
    return this;
  }

  /**
   * Sets the period for the fetch
   * @param {string} pe The id of the period to get data from
   * @returns {Analytics} Object with the analytics interaction properties
   */
  setPeriod(pe: string): Analytics {
    this.setDimension('pe', pe);
    return this;
  }

  /**
   * Sets the organisation unit for the fetching of the analytics
   * @param {string} ou - Organisation unit
   * @returns {Analytics} Object with the analytics interaction properties
   */
  setOrgUnit(ou: string): Analytics {
    this.setDimension('ou', ou);
    return this;
  }

  /**
   * Sets the data,period and organisation unit from function input parameters object for the fetching of the analytics
   * @param {string} parameters - Rule parameters
   * @returns {Analytics} Object with the analytics interaction properties
   */
  setSelections(parameters: {
    pe: string;
    ou: string;
    rule: { json: { data: string } };
    dimensions: any[];
  }): Analytics {
    this.setPeriod(parameters.pe);
    this.setOrgUnit(parameters.ou);
    // Set data Selection
    if (parameters.rule.json.data !== undefined) {
      // @TODO add support for only fetching 11char long uids, and joining them
      // into a comma separated string, so in future, parameters.rule.json.data
      // could simply be an indicator expresssion with unary operators and javascript
      // functions inside to be executed the express parameters.rule.json.data
      this.setData(parameters.rule.json.data);
    }
    // Set dynamic dimension
    if (
      parameters.dimensions !== undefined &&
      Array.isArray(parameters.dimensions)
    ) {
      parameters.dimensions.forEach((dimension) => {
        if (Array.isArray(dimension.items)) {
          let dimensionItems = '';

          dimension.items.forEach(function (item: string) {
            dimensionItems.length > 0
              ? (dimensionItems += ';' + item)
              : (dimensionItems += item);
          });

          this.setDimension(dimension.id, dimensionItems);
        }
      });
    }
    return this;
  }

  /**
   * Sets the dimension for the fetching of the analytics
   * @param {string} dim - Dynamic Dimension identifier
   * @param {string} value - Dynamic dimension options identifiers
   * @returns {Analytics} Object with the analytics interaction properties
   */
  setDimension(dim: string, value: string): Analytics {
    this.parameters['dimension'][dim] = value ? value : '';
    return this;
  }

  /**
   * Standardizes the analytics object
   *
   * @param {Object} analyticsObject - The analytics object
   * @param {Number} version - The version of dhis analytics structure to use
   * @returns {AnalyticsResult} - Object with the analytics results
   */
  standardizeAnalytics(
    analyticsObject: AnalyticsObject,
    version: number = 25
  ): AnalyticsResult {
    if (typeof version === 'boolean') {
      if (version) {
        version = 25;
      } else {
        version = 26;
      }
    }
    // if Serverside Event clustering do nothing
    if (analyticsObject.count) {
      return new AnalyticsResult(analyticsObject);
    }
    let sanitizedAnalyticsObject: AnalyticsObject = {
      headers: [],
      metaData: {
        dimensions: {},
        names: {},
        dx: [],
        pe: [],
        ou: [],
        co: [],
      },
      rows: [],
    };

    if (analyticsObject) {
      /**
       * Check headers
       */
      if (analyticsObject.headers) {
        analyticsObject.headers.forEach((header) => {
          try {
            let newHeader = header;

            sanitizedAnalyticsObject.headers.push(newHeader);
          } catch (e) {
            console.warn('Invalid header object');
          }
        });
      }

      /**
       * Check metaData
       */
      if (analyticsObject.metaData) {
        try {
          let sanitizedMetadata = this.getSanitizedAnalyticsMetadata(
            analyticsObject.metaData,
            version
          );

          sanitizedAnalyticsObject.metaData = sanitizedMetadata;
        } catch (e) {
          console.warn('Invalid metadata object');
        }
      }

      /**
       * Check rows
       */
      if (analyticsObject.rows) {
        sanitizedAnalyticsObject.rows = analyticsObject.rows;
      }
    }
    sanitizedAnalyticsObject.height = analyticsObject.height;
    sanitizedAnalyticsObject.width = analyticsObject.width;
    return new AnalyticsResult(sanitizedAnalyticsObject);
  }

  /**
   * Standardizes the analytics metadata object
   *
   * @param {Object} analyticMetadata - The analytics metadata object
   * @param {Number} version - The version of dhis analytics structure to use
   * @returns {Object} - Object with the analytics metadata
   */
  getSanitizedAnalyticsMetadata(
    analyticMetadata: AnalyticsMetadata,
    version: number
  ): object {
    let sanitizedMetadata: AnalyticsMetadata = {};

    if (analyticMetadata) {
      if (analyticMetadata.ouHierarchy) {
        sanitizedMetadata.ouHierarchy = analyticMetadata.ouHierarchy;
      }
      if (version < 26) {
        // Get old structure
        sanitizedMetadata.names = {};
        if (analyticMetadata.names) {
          sanitizedMetadata.names = analyticMetadata.names;
        } else if (analyticMetadata.items) {
          Object.keys(analyticMetadata.items).forEach((nameKey) => {
            sanitizedMetadata.names[nameKey] =
              analyticMetadata.items[nameKey].name;
          });
        }

        if (analyticMetadata.dimensions) {
          Object.keys(analyticMetadata.dimensions).forEach((nameKey) => {
            sanitizedMetadata[nameKey] = analyticMetadata.dimensions[nameKey];
          });
        }
      } else {
        // Get new structure
        sanitizedMetadata.items = {};
        if (analyticMetadata.items) {
          sanitizedMetadata.items = analyticMetadata.items;
        } else if (analyticMetadata.names) {
          Object.keys(analyticMetadata.items).forEach((nameKey) => {
            analyticMetadata.items[nameKey] = {
              name: analyticMetadata.names[nameKey],
            };
          });
        }

        if (!analyticMetadata.dimensions) {
          sanitizedMetadata.dimensions = {};
          Object.keys(analyticMetadata).forEach((nameKey) => {
            if (['names', 'items', 'dimensions'].indexOf(nameKey) === -1) {
              sanitizedMetadata.dimensions[nameKey] = analyticMetadata[nameKey];
            }
          });
        } else {
          sanitizedMetadata.dimensions = analyticMetadata.dimensions;
        }
      }
    }
    return sanitizedMetadata;
  }

  /**
   * Gets the url for fetching
   * @returns {string}
   */
  override get url(): string {
    return 'analytics?' + this._urlParameters;
  }
}
