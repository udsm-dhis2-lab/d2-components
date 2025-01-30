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

  static getTypeById(periodId: string): string {
    if (/^\d{8}$/.test(periodId)) return 'Daily';
    if (/^\d{4}W\d{2}$/.test(periodId)) return 'Weekly';
    if (/^\d{4}BiW\d{2}$/.test(periodId)) return 'Bi-Weekly';
    if (/^\d{6}$/.test(periodId)) return 'Monthly';
    if (/^\d{6}B$/.test(periodId)) return 'Bi-Monthly';
    if (/^\d{4}Q\d$/.test(periodId)) return 'Quarterly';
    if (/^\d{4}Tri\d$/.test(periodId)) return 'Tri-Annually';
    if (/^\d{4}S[1-2]$/.test(periodId)) return 'Six-Monthly';
    if (/^\d{4}$/.test(periodId)) return 'Yearly';
    if (/^\d{4}April$/.test(periodId)) return 'Financial Year (April - March)';
    if (/^\d{4}July$/.test(periodId)) return 'Financial Year (July - June)';
    if (/^\d{4}Oct$/.test(periodId)) return 'Financial Year (Oct - Sept)';
    return 'INVALID';
  }
}
