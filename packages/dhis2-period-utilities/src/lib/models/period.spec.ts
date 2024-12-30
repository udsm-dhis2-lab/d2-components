import { Period } from './period';
import { PeriodSortOrder } from '../constants/period.constant';
import { PeriodInterface } from '../interfaces/period.interface';
import { PeriodTypeEnum } from '../constants/period-types.constant';
import { getWeek } from 'date-fns';

describe('Given and instance of period class', () => {
  const period = new Period();
  it('should be instantiated', () => {
    expect(period).toBeInstanceOf(Period);
  });
});

describe('Given I set period type', () => {
  const period = new Period();
  period.setType('Monthly');

  it('should return set period type', () => {
    expect(period.type()).toEqual('Monthly');
  });
});

describe('Given I set monthly period type for ethiopian calendar', () => {
  const period = new Period();
  period.setCalendar('ethiopian').setType('Monthly').get();

  const periodResult = period.list();

  it('should return monthly period list for the current year', () => {
    expect(periodResult.length <= 12).toEqual(true);
  });
});

describe('Given I set monthly period type for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Monthly').get();

  const periodResult = period.list();

  it('should return monthly period list for the current year', () => {
    expect(periodResult.length <= 12).toEqual(true);
  });
});

describe('Given I set month of January for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Monthly').get();

  const periodResult = period.getById('202001');

  it('should return correct start date and end date for January', () => {
    expect(periodResult.startDate).toEqual('01-01-2020');
    expect(periodResult.endDate).toEqual('31-01-2020');
  });
});

describe('Given I set month of February for gregorian calendar and for leap year', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Monthly').get();

  const periodResult = period.getById('202002');

  it('should return correct start date and end date for February', () => {
    expect(periodResult.startDate).toEqual('01-02-2020');
    expect(periodResult.endDate).toEqual('29-02-2020');
  });
});

describe('Given I set month of February for gregorian calendar and for non leap year', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Monthly').get();

  const periodResult = period.getById('201902');

  it('should return correct start date and end date for February', () => {
    expect(periodResult.startDate).toEqual('01-02-2019');
    expect(periodResult.endDate).toEqual('28-02-2019');
  });
});

describe('Given I set month of April for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Monthly').get();

  const periodResult = period.getById('202004');

  it('should return correct start date and end date for April', () => {
    expect(periodResult.startDate).toEqual('01-04-2020');
    expect(periodResult.endDate).toEqual('30-04-2020');
  });
});

describe('Given I set quarter Jan-March 2020 for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Quarterly').get();

  const periodResult = period.getById('2020Q1');

  it('should return correct start date and end date for Jan-March 2020', () => {
    expect(periodResult.startDate).toEqual('01-01-2020');
    expect(periodResult.endDate).toEqual('31-03-2020');
  });
});

describe('Given I set quarter April-June 2020 for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Quarterly').get();

  const periodResult = period.getById('2020Q2');

  it('should return correct start date and end date for April-June 2020', () => {
    expect(periodResult.startDate).toEqual('01-04-2020');
    expect(periodResult.endDate).toEqual('30-06-2020');
  });
});

describe('Given I set year 2020 for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Yearly').get();

  const periodResult = period.getById('2020');

  it('should return correct start date and end date for 2020', () => {
    expect(periodResult.startDate).toEqual('01-01-2020');
    expect(periodResult.endDate).toEqual('31-12-2020');
  });
});

describe('Given I set financial april year 2020 for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType(PeriodTypeEnum.FINANCIAL_APRIL).get();

  const periodResult = period.getById('2020April');

  it('should return correct start date and end date for financial april 2020', () => {
    expect(periodResult.startDate).toEqual('01-04-2020');
    expect(periodResult.endDate).toEqual('31-03-2020');
  });
});

describe('Given I set six monthly 2020 for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType(PeriodTypeEnum.SIX_MONTHLY).get();

  const periodResult = period.getById('2020S1');

  it('should return correct start date and end date for six monthly 2020', () => {
    expect(periodResult.startDate).toEqual('01-01-2020');
    expect(periodResult.endDate).toEqual('30-06-2020');
  });
});

describe('Given I set six monthly april 2020 for gregorian calendar', () => {
  const period = new Period();
  period
    .setCalendar('gregorian')
    .setType(PeriodTypeEnum.SIX_MONTHLY_APRIL)
    .get();

  const periodResult = period.getById('2020AprilS1');

  it('should return correct start date and end date for six monthly april 2020', () => {
    expect(periodResult.startDate).toEqual('01-04-2020');
    expect(periodResult.endDate).toEqual('30-09-2020');
  });
});

describe('Given I set six monthly april 2020 for gregorian calendar', () => {
  const period = new Period();
  period
    .setCalendar('gregorian')
    .setType(PeriodTypeEnum.SIX_MONTHLY_APRIL)
    .get();

  const periodResult = period.getById('2020AprilS2');

  it('should return correct start date and end date for six monthly april 2020', () => {
    expect(periodResult.startDate).toEqual('01-10-2020');
    expect(periodResult.endDate).toEqual('31-03-2021');
  });
});

describe('Given I set six monthly november 2020 for gregorian calendar', () => {
  const period = new Period();
  period
    .setCalendar('gregorian')
    .setType(PeriodTypeEnum.SIX_MONTHLY_NOVEMBER)
    .get();

  const periodResult = period.getById('2020NovS1');

  it('should return correct start date and end date for six monthly november 2020', () => {
    expect(periodResult.startDate).toEqual('01-11-2020');
    expect(periodResult.endDate).toEqual('30-04-2021');
  });
});

describe('Given I set six monthly november 2020 for gregorian calendar', () => {
  const period = new Period();
  period
    .setCalendar('gregorian')
    .setType(PeriodTypeEnum.SIX_MONTHLY_NOVEMBER)
    .get();

  const periodResult = period.getById('2020NovS2');

  it('should return correct start date and end date for six monthly november 2020', () => {
    expect(periodResult.startDate).toEqual('01-05-2021');
    expect(periodResult.endDate).toEqual('31-10-2021');
  });
});

describe('Given I set monthly period type for gregorian calendar and previous year', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Monthly').get();
  const previousYear = period.currentYear() - 1;

  period.setYear(previousYear).get();

  const periodResult = period.list();

  it('should return monthly period list for 12 months', () => {
    expect(periodResult.length === 12).toEqual(true);
  });
});

describe('Given I set monthly period type for ethiopian calendar and previous year', () => {
  const ethiopianPeriod = new Period();
  ethiopianPeriod.setCalendar('ethiopian').setType('Monthly').get();

  const previousYear = ethiopianPeriod.currentYear() - 1;

  ethiopianPeriod.setYear(previousYear).get();

  const periodResult = ethiopianPeriod.list();

  it('should return monthly period list for 12 months', () => {
    expect(periodResult.length === 12).toEqual(true);
  });
});

describe('Given I set quarterly period type for gregorian calendar', () => {
  const period = new Period();
  period
    .setType('Quarterly')
    .setCalendar('gregorian')
    .setYear(2022)
    .setPreferences({
      openFuturePeriods: 1,
      childrenPeriodSortOrder: PeriodSortOrder.ASCENDING,
    })
    .get();
  const periodResult = period.list();

  it('should return quarterly period list for the current year', () => {
    expect(periodResult.length > 0).toEqual(true);
  });

  it('should return quarterly period list including one future quarter', () => {
    expect(periodResult.length).toEqual(4);
  });
});

describe('Given I set relative quarter period type for gregorian calendar', () => {
  const period = new Period();
  period
    .setCalendar('gregorian')
    .setType(PeriodTypeEnum.RELATIVE_QUARTER)
    .get();

  const periodResult = period.list();

  it('should return relative quarter period list for the current year', () => {
    expect(periodResult.length > 0).toEqual(true);
  });
});

describe('Given I set relative six month period type for gregorian calendar', () => {
  const period = new Period();
  period
    .setCalendar('gregorian')
    .setType(PeriodTypeEnum.RELATIVE_SIX_MONTH)
    .get();

  const periodResult = period.list();

  it('should return relative six month period list for the current year', () => {
    expect(periodResult.length > 0).toEqual(true);
  });
});

describe('Given I set relative bi month period type for gregorian calendar', () => {
  const period = new Period();
  period
    .setCalendar('gregorian')
    .setType(PeriodTypeEnum.RELATIVE_BI_MONTH)
    .get();

  const periodResult = period.list();

  it('should return relative bi month period list for the current year', () => {
    expect(periodResult.length > 0).toEqual(true);
  });
});

describe('Given I set relative month period type for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType(PeriodTypeEnum.RELATIVE_MONTH).get();

  const periodResult = period.list();

  it('should return relative month period list for the current year', () => {
    expect(periodResult.length > 0).toEqual(true);
  });
});

describe('Given I set relative year period type for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType(PeriodTypeEnum.RELATIVE_YEAR).get();

  const periodResult = period.list();

  it('should return relative year period list', () => {
    expect(periodResult.length > 0).toEqual(true);
  });
});

describe('Given I set a monthly valid period id', () => {
  const period = new Period();
  const periodObject: PeriodInterface = period.getById('201001');

  it('should return month period details for the supplied id', () => {
    expect(periodObject.id).toEqual('201001');
  });
});

describe('Given I set a relative monthly valid period id', () => {
  const period = new Period();
  const periodObject: PeriodInterface = period.getById('LAST_MONTH');

  it('should return relative month period details for the supplied id', () => {
    expect(periodObject.id).toEqual('LAST_MONTH');
  });

  it('should return iso formatted for supplied relative monthly id', () => {
    expect(periodObject.iso).toBeDefined();
  });
});

describe('Given I set a relative ten years period', () => {
  const period = new Period();
  const periodObject: PeriodInterface = period.getById('LAST_10_YEARS');

  it('should return ten iso formated periods', () => {
    expect(periodObject.iso.length).toEqual(10);
  });
});

describe('Given a period with allow future period set', () => {
  const period = new Period().setPreferences({ openFuturePeriods: 1 });
  const periodObject: PeriodInterface = period.getById(
    new Date().getFullYear().toString()
  );

  it('should return last period', () => {
    expect(periodObject.lastPeriod).toBeDefined();
  });
});

describe('Given I set weekly period type for gregorian calendar', () => {
  const period = new Period();
  period.setCalendar('gregorian').setType('Weekly').get();
  const periodResult = period.list();

  it('should return weekly period list for the current month', () => {
    expect(periodResult.length > 0).toEqual(true);
  });
});

describe('Given I set weekly period type and open for future period for gregorian calendar', () => {
  const period = new Period();
  period
    .setType('Weekly')
    .setCalendar('gregorian')
    .setPreferences({
      openFuturePeriods: 1,
      childrenPeriodSortOrder: PeriodSortOrder.ASCENDING,
    })
    .get();
  const periodResult = period.list();

  it('should return weekly period list including one future week', () => {
    expect(periodResult.length).toEqual(getWeek(new Date()));
  });
});

describe('Given I set weekly period type for a specific year for gregorian calendar', () => {
  const period = new Period();
  period.setType('Weekly').setCalendar('gregorian').setYear(2021).get();
  const periodResult = period.list();

  it('should return weekly period list for the set year', () => {
    expect(periodResult.length).toEqual(52);
  });
});
