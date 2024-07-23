import { PeriodInterface } from '../interfaces/period.interface';
import { getLastNthPeriods } from './get-last-nth-periods.helper';

describe('Given I supply current quarter and two years quarter periods including current', () => {
  const quarterPeriods: PeriodInterface[] = [
    {
      id: '2019Q1',
      type: 'Quarterly',
      name: 'January 2019 - March 2019',
      lastPeriod: { id: '2018Q4', name: 'October 2018 - December 2018' },
    },
    {
      id: '2019Q2',
      type: 'Quarterly',
      name: 'April 2019 - June 2019',
      lastPeriod: { id: '2019Q1', name: 'January 2019 - March 2019' },
    },
    {
      id: '2019Q3',
      type: 'Quarterly',
      name: 'July 2019 - September 2019',
      lastPeriod: { id: '2019Q2', name: 'April 2019 - June 2019' },
    },
    {
      id: '2019Q4',
      type: 'Quarterly',
      name: 'October 2019 - December 2019',
      lastPeriod: { id: '2019Q3', name: 'July 2019 - September 2019' },
    },
    {
      id: '2020Q1',
      type: 'Quarterly',
      name: 'January 2020 - March 2020',
      lastPeriod: { id: '2019Q4', name: 'October 2019 - December 2019' },
    },
    {
      id: '2020Q2',
      type: 'Quarterly',
      name: 'April 2020 - June 2020',
      lastPeriod: { id: '2020Q1', name: 'January 2020 - March 2020' },
    },
    {
      id: '2020Q3',
      type: 'Quarterly',
      name: 'July 2020 - September 2020',
      lastPeriod: { id: '2020Q2', name: 'April 2020 - June 2020' },
    },
    {
      id: '2020Q4',
      type: 'Quarterly',
      name: 'October 2020 - December 2020',
      lastPeriod: { id: '2020Q3', name: 'July 2020 - September 2020' },
    },
  ];

  const currentQuarter = {
    id: '2020Q3',
    type: 'Quarterly',
    name: 'July 2020 - September 2020',
    lastPeriod: { id: '2020Q2', name: 'April 2020 - June 2020' },
  };
  const lastFourQuarters = getLastNthPeriods(quarterPeriods, currentQuarter, 4);

  it('should return four last quarter periods previous to the current selected quarter', () => {
    expect(lastFourQuarters.length).toEqual(4);
    expect(lastFourQuarters.indexOf(currentQuarter)).toEqual(-1);
  });
});

describe('Given I supply current bi month and two years bi month periods including current', () => {
  const biMonthPeriods: PeriodInterface[] = [
    {
      id: '201901B',
      type: 'BiMonthly',
      name: 'January - February 2019',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '201806B', name: 'November - December 2018' },
    },
    {
      id: '201902B',
      type: 'BiMonthly',
      name: 'March - April 2019',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '201901B', name: 'January - February 2019' },
    },
    {
      id: '201903B',
      type: 'BiMonthly',
      name: 'May - June 2019',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '201902B', name: 'March - April 2019' },
    },
    {
      id: '201904B',
      type: 'BiMonthly',
      name: 'July - August 2019',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '201903B', name: 'May - June 2019' },
    },
    {
      id: '201905B',
      type: 'BiMonthly',
      name: 'September - October 2019',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '201904B', name: 'July - August 2019' },
    },
    {
      id: '201906B',
      type: 'BiMonthly',
      name: 'November - December 2019',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '201905B', name: 'September - October 2019' },
    },
    {
      id: '202001B',
      type: 'BiMonthly',
      name: 'January - February 2020',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '201906B', name: 'November - December 2019' },
    },
    {
      id: '202002B',
      type: 'BiMonthly',
      name: 'March - April 2020',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '202001B', name: 'January - February 2020' },
    },
    {
      id: '202003B',
      type: 'BiMonthly',
      name: 'May - June 2020',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '202002B', name: 'March - April 2020' },
    },
    {
      id: '202004B',
      type: 'BiMonthly',
      name: 'July - August 2020',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '202003B', name: 'May - June 2020' },
    },
    {
      id: '202005B',
      type: 'BiMonthly',
      name: 'September - October 2020',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '202004B', name: 'July - August 2020' },
    },
    {
      id: '202006B',
      type: 'BiMonthly',
      name: 'November - December 2020',
      daily: [],
      weekly: [],
      monthly: [[Object], [Object]],
      lastPeriod: { id: '202005B', name: 'September - October 2020' },
    },
  ];
  const currentBiMonthPeriod: PeriodInterface = {
    id: '202004B',
    type: 'BiMonthly',
    name: 'July - August 2020',
    daily: [],
    weekly: [],
    monthly: [[Object], [Object]],
    lastPeriod: { id: '202003B', name: 'May - June 2020' },
  };

  const lastSixBiMonths = getLastNthPeriods(
    biMonthPeriods,
    currentBiMonthPeriod,
    6
  );
  it('should return six last bi month periods previous to the current selected bi month', () => {
    expect(lastSixBiMonths.length).toEqual(6);
    expect(lastSixBiMonths.indexOf(currentBiMonthPeriod)).toEqual(-1);
  });
});

describe('Given I supply current six month and two years six month periods including current', () => {
  const sixMonthPeriods: PeriodInterface[] = [
    {
      id: '2019S1',
      type: 'SixMonthly',
      name: 'January - June 2019',

      lastPeriod: { id: '2018S2', name: 'July - December 2018' },
    },
    {
      id: '2019S2',
      type: 'SixMonthly',
      name: 'July - December 2019',
      lastPeriod: { id: '2019S1', name: 'January - June 2019' },
    },
    {
      id: '2020S1',
      type: 'SixMonthly',
      name: 'January - June 2020',
      lastPeriod: { id: '2019S2', name: 'July - December 2019' },
    },
    {
      id: '2020S2',
      type: 'SixMonthly',
      name: 'July - December 2020',
      lastPeriod: { id: '2020S1', name: 'January - June 2020' },
    },
  ];
  const currentSixMonthPeriod: PeriodInterface = {
    id: '2020S2',
    type: 'SixMonthly',
    name: 'July - December 2020',
    lastPeriod: { id: '2020S1', name: 'January - June 2020' },
  };
  const lastTwoSixMonths = getLastNthPeriods(
    sixMonthPeriods,
    currentSixMonthPeriod,
    2
  );
  it('should return two last six month periods previous to the current selected six month', () => {
    expect(lastTwoSixMonths.length).toEqual(2);
    expect(lastTwoSixMonths.indexOf(currentSixMonthPeriod)).toEqual(-1);
  });
});

describe('Given I supply current month and three years month periods including current', () => {
  const monthPeriods: PeriodInterface[] = [
    {
      id: '201801',
      type: 'Monthly',
      name: 'January 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201712', name: 'December 2017' },
    },
    {
      id: '201802',
      type: 'Monthly',
      name: 'February 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201801', name: 'January 2018' },
    },
    {
      id: '201803',
      type: 'Monthly',
      name: 'March 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201802', name: 'February 2018' },
    },
    {
      id: '201804',
      type: 'Monthly',
      name: 'April 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201803', name: 'March 2018' },
    },
    {
      id: '201805',
      type: 'Monthly',
      name: 'May 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201804', name: 'April 2018' },
    },
    {
      id: '201806',
      type: 'Monthly',
      name: 'June 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201805', name: 'May 2018' },
    },
    {
      id: '201807',
      type: 'Monthly',
      name: 'July 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201806', name: 'June 2018' },
    },
    {
      id: '201808',
      type: 'Monthly',
      name: 'August 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201807', name: 'July 2018' },
    },
    {
      id: '201809',
      type: 'Monthly',
      name: 'September 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201808', name: 'August 2018' },
    },
    {
      id: '201810',
      type: 'Monthly',
      name: 'October 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201809', name: 'September 2018' },
    },
    {
      id: '201811',
      type: 'Monthly',
      name: 'November 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201810', name: 'October 2018' },
    },
    {
      id: '201812',
      type: 'Monthly',
      name: 'December 2018',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201811', name: 'November 2018' },
    },
    {
      id: '201901',
      type: 'Monthly',
      name: 'January 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201812', name: 'December 2018' },
    },
    {
      id: '201902',
      type: 'Monthly',
      name: 'February 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201901', name: 'January 2019' },
    },
    {
      id: '201903',
      type: 'Monthly',
      name: 'March 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201902', name: 'February 2019' },
    },
    {
      id: '201904',
      type: 'Monthly',
      name: 'April 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201903', name: 'March 2019' },
    },
    {
      id: '201905',
      type: 'Monthly',
      name: 'May 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201904', name: 'April 2019' },
    },
    {
      id: '201906',
      type: 'Monthly',
      name: 'June 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201905', name: 'May 2019' },
    },
    {
      id: '201907',
      type: 'Monthly',
      name: 'July 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201906', name: 'June 2019' },
    },
    {
      id: '201908',
      type: 'Monthly',
      name: 'August 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201907', name: 'July 2019' },
    },
    {
      id: '201909',
      type: 'Monthly',
      name: 'September 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201908', name: 'August 2019' },
    },
    {
      id: '201910',
      type: 'Monthly',
      name: 'October 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201909', name: 'September 2019' },
    },
    {
      id: '201911',
      type: 'Monthly',
      name: 'November 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201910', name: 'October 2019' },
    },
    {
      id: '201912',
      type: 'Monthly',
      name: 'December 2019',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201911', name: 'November 2019' },
    },
    {
      id: '202001',
      type: 'Monthly',
      name: 'January 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '201912', name: 'December 2019' },
    },
    {
      id: '202002',
      type: 'Monthly',
      name: 'February 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202001', name: 'January 2020' },
    },
    {
      id: '202003',
      type: 'Monthly',
      name: 'March 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202002', name: 'February 2020' },
    },
    {
      id: '202004',
      type: 'Monthly',
      name: 'April 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202003', name: 'March 2020' },
    },
    {
      id: '202005',
      type: 'Monthly',
      name: 'May 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202004', name: 'April 2020' },
    },
    {
      id: '202006',
      type: 'Monthly',
      name: 'June 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202005', name: 'May 2020' },
    },
    {
      id: '202007',
      type: 'Monthly',
      name: 'July 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202006', name: 'June 2020' },
    },
    {
      id: '202008',
      type: 'Monthly',
      name: 'August 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202007', name: 'July 2020' },
    },
    {
      id: '202009',
      type: 'Monthly',
      name: 'September 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202008', name: 'August 2020' },
    },
    {
      id: '202010',
      type: 'Monthly',
      name: 'October 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202009', name: 'September 2020' },
    },
    {
      id: '202011',
      type: 'Monthly',
      name: 'November 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202010', name: 'October 2020' },
    },
    {
      id: '202012',
      type: 'Monthly',
      name: 'December 2020',
      daily: [],
      weekly: [],
      lastPeriod: { id: '202011', name: 'November 2020' },
    },
  ];
  const currentMonthPeriod: PeriodInterface = {
    id: '202007',
    type: 'Monthly',
    name: 'July 2020',
    daily: [],
    weekly: [],
    lastPeriod: { id: '202006', name: 'June 2020' },
  };
  const lastThreeMonths = getLastNthPeriods(
    monthPeriods,
    currentMonthPeriod,
    3
  );
  it('should return three last month periods previous to the current selected month', () => {
    expect(lastThreeMonths.length).toEqual(3);
    expect(lastThreeMonths.indexOf(currentMonthPeriod)).toEqual(-1);
  });

  const lastSixMonths = getLastNthPeriods(monthPeriods, currentMonthPeriod, 6);
  it('should return six month periods previous to the current selected month', () => {
    expect(lastSixMonths.length).toEqual(6);
    expect(lastSixMonths.indexOf(currentMonthPeriod)).toEqual(-1);
  });

  const lastTwelveMonths = getLastNthPeriods(
    monthPeriods,
    currentMonthPeriod,
    12
  );
  it('should return twelve month periods previous to the current selected month', () => {
    expect(lastTwelveMonths.length).toEqual(12);
    expect(lastTwelveMonths.indexOf(currentMonthPeriod)).toEqual(-1);
  });
});

describe('Given I supply current year and yearly periods including current', () => {
  const yearlyPeriods: PeriodInterface[] = [
    {
      id: '2011',
      type: 'Yearly',
      name: '2011',
      lastPeriod: { id: '2019', name: '2019' },
    },
    {
      id: '2012',
      type: 'Yearly',
      name: '2012',
      lastPeriod: { id: '2011', name: '2011' },
    },
    {
      id: '2013',
      type: 'Yearly',
      name: '2013',
      lastPeriod: { id: '2012', name: '2012' },
    },
    {
      id: '2014',
      type: 'Yearly',
      name: '2014',
      lastPeriod: { id: '2013', name: '2013' },
    },
    {
      id: '2015',
      type: 'Yearly',
      name: '2015',
      lastPeriod: { id: '2014', name: '2014' },
    },
    {
      id: '2016',
      type: 'Yearly',
      name: '2016',
      lastPeriod: { id: '2015', name: '2015' },
    },
    {
      id: '2017',
      type: 'Yearly',
      name: '2017',
      lastPeriod: { id: '2016', name: '2016' },
    },
    {
      id: '2018',
      type: 'Yearly',
      name: '2018',
      lastPeriod: { id: '2017', name: '2017' },
    },
    {
      id: '2019',
      type: 'Yearly',
      name: '2019',
      lastPeriod: { id: '2018', name: '2018' },
    },
    {
      id: '2020',
      type: 'Yearly',
      name: '2020',
      lastPeriod: { id: '2019', name: '2019' },
    },
  ];
  const currentYear: PeriodInterface = {
    id: '2020',
    type: 'Yearly',
    name: '2020',
    lastPeriod: { id: '2019', name: '2019' },
  };
  const lastFiveYears = getLastNthPeriods(yearlyPeriods, currentYear, 5);
  it('should return five year periods previous to the current selected year', () => {
    expect(lastFiveYears.length).toEqual(5);
    expect(lastFiveYears.indexOf(currentYear)).toEqual(-1);
  });
});
