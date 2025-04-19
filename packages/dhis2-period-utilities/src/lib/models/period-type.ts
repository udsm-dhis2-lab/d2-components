import { periodTypes } from '../constants/period-types.constant';
import { PeriodTypeInterface } from '../interfaces/period-type.interface';

export class PeriodType {
  private _periodTypes: PeriodTypeInterface[];
  constructor() {
    this._periodTypes = periodTypes;
  }

  isValid(type: string): boolean {
    return this._periodTypes.some(
      (periodType: PeriodTypeInterface) => periodType.id === type
    );
  }

  get(): PeriodTypeInterface[] {
    return this._periodTypes;
  }
}
