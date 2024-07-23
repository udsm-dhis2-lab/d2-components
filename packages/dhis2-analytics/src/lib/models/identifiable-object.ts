import { Fetcher } from '../utilities/fetcher';

/**
 * Represents Identifiable Object
 *@extends Fetcher
 */
export class IdentifiableObject extends Fetcher {
  private _filters: any[];
  private _objectName: string;
  /**
   * Creates a identifiable object fetcher
   *
   * @constructor
   *
   * @param {string} objectName - The name of the identifiable object as used in the web api
   *
   * @example
   * const identifiableObject = new Fn.IdentifiableObject('organisationUnits'); // Organisation Unit fetcher
   */
  constructor(objectName: string) {
    super();
    this._filters = [];
    this._objectName = objectName;
  }

  /**
   * Gets the name of the identifiable object
   *
   * @return {string} - The name of the Identifibale Object
   */
  get name(): string {
    return this._objectName;
  }

  /**
   * Sets the where clause for filtering of data
   * @param {string} right - Right expression
   * @param {string} operator - Expression operator
   * @param {string|array} left - Right expression
   * @returns {IdentifiableObject} IdentifiableObject Identifiable object with where clause appended
   *
   * @example
   * const organisationUnit = new Fn.IdentifiableObject('organisationUnits');
   * organisationUnit.where('level','==',4); //Will set to fetch organisation units at level 4
   * organisationUnit.where('children','empty'); //Will set to fetch organisation units with no children
   */
  where(
    right: string,
    operator?: string,
    left?: string | Array<any>
  ): IdentifiableObject {
    this._filters.push({
      right: right,
      operator: operator,
      left: left,
    });
    return this;
  }

  /**
   * Gets the url for fetching
   * @returns {string}
   */
  override get url(): string {
    var url = this._urlParameters;

    this._filters.forEach((filter) => {
      if (url !== '') {
        url += '&';
      }
      url += 'filter=' + filter.right;
      if (filter.operator === '==') {
        url += ':eq:' + filter.left;
      } else if (filter.operator === '<') {
        url += ':lt:' + filter.left;
      } else if (filter.operator === '<=') {
        url += ':le:' + filter.left;
      } else if (filter.operator === '>') {
        url += ':gt:' + filter.left;
      } else if (filter.operator === '>=') {
        url += ':ge:' + filter.left;
      } else if (filter.operator === '<>') {
        url += ':!eq:' + filter.left;
      } else if (filter.operator === 'in' || filter.operator === '!in') {
        url += ':' + filter.operator + ':[' + filter.left + ']';
      } else if (!filter.left) {
        url += ':' + filter.operator;
      } else {
        url += ':' + filter.operator + ':' + filter.left;
      }
    });
    return this.name + '.json?' + url;
  }
}
