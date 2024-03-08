import { PeriodTypeEnum } from '../constants/period-types.constant';
import { deducePeriodTypeFromId } from './deduce-period-type-from-id.helper';
describe('Given I set period iso id of monthly period type', () => {
  it('should return monthly period type', () => {
    expect(deducePeriodTypeFromId('201002')).toEqual(PeriodTypeEnum.MONTHLY);
  });
});

describe('Given I set period iso id of quarterly period type', () => {
  it('should return quarterly period type', () => {
    expect(deducePeriodTypeFromId('2010Q2')).toEqual(PeriodTypeEnum.QUARTERLY);
  });
});

describe('Given I set period iso id of relative year period type', () => {
  it('should return quarterly period type', () => {
    expect(deducePeriodTypeFromId('LAST_YEAR')).toEqual(
      PeriodTypeEnum.RELATIVE_YEAR
    );
  });
});
