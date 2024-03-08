import { PeriodType } from './period-type';

let periodType = new PeriodType();

describe('Given and instance of period type class', () => {
  it('should be instantiated', () => {
    expect(periodType).toBeInstanceOf(PeriodType);
  });
});

describe('Given I have a valid period type', () => {
  let isValid = periodType.isValid('Monthly');

  it('should return true if period type is valid', () => {
    expect(isValid).toEqual(true);
  });
});

describe('Given I have invalid period type', () => {
  let isValid = periodType.isValid('Month');

  it('should return false if period type is valid', () => {
    expect(isValid).toEqual(false);
  });
});

describe('Given I have an instance of period Type', () => {
  let periodTypes = periodType.get();

  it('should return a defined period types', () => {
    expect(periodTypes).toBeDefined();
  });
});
