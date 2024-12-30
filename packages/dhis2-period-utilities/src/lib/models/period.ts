import { PeriodInstance } from '../utilities/period-instance.utility';
import { PeriodType } from './period-type';
import { PeriodInterface } from '../interfaces/period.interface';
import { deducePeriodTypeFromId } from '../helpers/deduce-period-type-from-id.helper';
import { getPeriodYearFromId } from '../helpers/get-period-year-from-id.helper';
import { find } from 'lodash';

/**
 * @description
 * Period class offers capabilities to get periods for different period types
 */
export class Period {
  private _calendarId: string;
  private _periodType: PeriodType;
  private _type!: string;
  private _year!: number;
  private _preferences: any;
  private _periods!: PeriodInterface[];
  private _currentYear!: number;
  constructor() {
    this._calendarId = 'gregorian';

    this._periodType = new PeriodType();

    if (!this._periodType) {
      throw new Error('Could not instantiate period type');
    }
  }

  /**
   * Set period type
   * @param {string} type
   */
  setType(type: string) {
    if (!this._periodType.isValid(type)) {
      throw new Error('Not a valid period type');
    }

    this._type = type;
    return this;
  }

  setYear(year: number) {
    this._year = year;
    return this;
  }

  setCalendar(calendarId: string) {
    this._calendarId = calendarId;
    return this;
  }

  setPreferences(preferences: any) {
    this._preferences = preferences;
    return this;
  }

  get() {
    if (this._type) {
      const periodInstance: PeriodInstance = new PeriodInstance(
        this._calendarId,
        this._type,
        this._preferences,
        this._year
      );

      this._periods = periodInstance.get();

      this._year = periodInstance.year();

      this._currentYear = periodInstance.currentYear();
    }
    return this;
  }

  getById(id: string): PeriodInterface | undefined {
    this._type = deducePeriodTypeFromId(id);
    this._year = getPeriodYearFromId(id) as number;

    const periodList = this.get().list();
    return find(periodList, ['id', id]);
  }

  type(): string {
    return this._type;
  }

  list(): PeriodInterface[] {
    return this._periods;
  }

  year(): number {
    return this._year;
  }

  currentYear(): number {
    return this._currentYear;
  }
}
