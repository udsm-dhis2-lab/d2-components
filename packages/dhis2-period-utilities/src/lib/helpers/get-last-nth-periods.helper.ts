import { PeriodInterface } from '../interfaces/period.interface';
import { sortBy } from 'lodash';

export function getLastNthPeriods(
  periods: PeriodInterface[],
  currentPeriod: PeriodInterface,
  periodCount: number
): PeriodInterface[] {
  if (!currentPeriod) {
    return [];
  }

  return sortBy(periods, 'id')
    .filter((period: PeriodInterface) => period.id < currentPeriod.id)
    .slice(-periodCount);
}
