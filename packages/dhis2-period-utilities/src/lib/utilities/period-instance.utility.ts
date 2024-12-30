import {
  endOfISOWeek,
  format,
  getISOWeeksInYear,
  startOfISOWeek,
} from 'date-fns';
import { chunk, find, head, last, pick, range, sortBy } from 'lodash';
import { PeriodTypeEnum } from '../constants/period-types.constant';
import { getLastNthPeriods } from '../helpers/get-last-nth-periods.helper';
import { PeriodPreferencesInterface } from '../interfaces/period-preferences.interface';
import { PeriodInterface } from '../interfaces/period.interface';
import { Calendar } from './calendar/calendar.utility';

export class PeriodInstance {
  private _type: string;
  private _preferences: PeriodPreferencesInterface;
  private _periods: any[];
  private _calendar!: Calendar;
  private _year: number;
  private _week: number;
  private _month: number;
  private _quarter: number;
  private _biMonth: number;
  private _sixMonth: number;
  private _sixMonthApril: number;
  private _sixMonthNovember: number;
  private _monthNames: string[];
  private _quarterMonthOffset: number;

  constructor(
    calendarId: string,
    type: string,
    preferences: any,
    year: number
  ) {
    this._type = type;
    this._preferences = preferences;
    this._periods = [];

    this._calendar = new Calendar(calendarId || 'gregorian');

    if (!this._calendar) {
      throw new Error('Calendar could not be set');
    }

    this._year = year || this._calendar.getCurrentYear();
    this._month = this._calendar.getCurrentMonth();
    this._week = this._calendar.getCurrentWeek();
    this._quarter = this._calendar.getCurrentQuarter();
    this._biMonth = this._calendar.getCurrentBiMonth();
    this._sixMonth = this._calendar.getCurrentSixMonth();
    this._sixMonthApril = this._calendar.getCurrentSixMonthApril();
    this._sixMonthNovember = this._calendar.getCurrentSixMonthNovember();
    this._monthNames = this._calendar.getMonths();
    this._quarterMonthOffset = this._calendar.getQuarterMonthOffset();
  }

  get() {
    this._periods = this.getPeriods(this._type, this._year);
    const periodsInDescendingOrder = [
      ...this._periods.sort((a, b) => {
        const dateA: any = new Date(a.startDate);
        const dateB: any = new Date(b.startDate);
        return dateB - dateA;
      }),
    ];

    if (this._type.indexOf('Relative') !== -1) {
      return periodsInDescendingOrder;
    }

    //! Omit weekly future period
    // if (this._type === 'Weekly') {
    //   const weeklyInstance = new WeeklyPeriodInstance(this._calendar);

    //   return weeklyInstance.get(
    //     this._preferences?.openFuturePeriods ?? 0,
    //     this._year
    //   );
    // }

    const previousPeriods = this.omitFuturePeriods(
      this.includeLastPeriods(this._periods, this._type, this._year),
      this._type
    ).sort((a, b) => {
      const dateA: any = new Date(a.startDate);
      const dateB: any = new Date(b.startDate);
      return dateB - dateA;
    });

    if (this._preferences && this._preferences.openFuturePeriods > 0) {
      const futurePeriods = this.includeLastPeriods(
        periodsInDescendingOrder,
        this._type,
        this._year
      )
        .filter(
          (period) =>
            !previousPeriods.some(
              (previousPeriod) => previousPeriod.id === period.id
            )
        )
        .slice(-this._preferences.openFuturePeriods);

      return [...futurePeriods, ...previousPeriods];
    }

    return previousPeriods;
  }

  year() {
    return this._year;
  }

  currentYear() {
    return this._calendar.getCurrentYear();
  }

  getPeriods(type: string, year: number, offset = 0): any[] {
    let periods;

    switch (type) {
      case 'Weekly': {
        periods = this.getWeeklyPeriods(year);

        break;
      }
      case 'Monthly': {
        periods = this.getMonthlyPeriods(year, offset);
        break;
      }

      case 'Quarterly': {
        periods = this.getQuarterlyPeriods(year);
        break;
      }

      case 'BiMonthly': {
        periods = this.getBiMonthlyPeriods(year);
        break;
      }

      case 'SixMonthly': {
        periods = this.getSixMonthlyPeriods(year);
        break;
      }

      case 'SixMonthlyApril': {
        periods = this.getSixMonthlyAprilPeriods(year);
        break;
      }

      case 'SixMonthlyNovember': {
        periods = this.getSixMonthlyNovemberPeriods(year);
        break;
      }

      case 'Yearly': {
        periods = this.getYearlyPeriods(year, 'Yearly');
        break;
      }

      case 'FinancialApril': {
        periods = this.getYearlyPeriods(year, 'FinancialApril', 'April', 3);
        break;
      }

      case 'FinancialJuly': {
        periods = this.getYearlyPeriods(year, 'FinancialJuly', 'July', 6);
        break;
      }

      case 'FinancialOctober': {
        periods = this.getYearlyPeriods(year, 'FinancialOctober', 'Oct', 9);
        break;
      }

      case 'FinancialNovember': {
        periods = this.getYearlyPeriods(year, 'FinancialNovember', 'Nov', 10);
        break;
      }

      case 'RelativeMonth':
      case 'RelativeBiMonth':
      case 'RelativeQuarter':
      case 'RelativeSixMonth':
      case 'RelativeYear':
      case 'RelativeFinancialYear':
      case 'RelativeWeek': {
        periods = this.getRelativePeriods(type);
        break;
      }

      default:
        periods = [];
        break;
    }
    return periods;
  }

  includeLastPeriods(periods: any[], type: string, year: number) {
    const lastYearPeriods = this.getPeriods(type, year - 1);

    return (periods || [])
      .sort((a, b) => {
        const dateA: any = new Date(a.startDate);
        const dateB: any = new Date(b.startDate);
        return dateB - dateA;
      })
      .map((period, periodIndex) => {
        const lastPeriod = periods[periodIndex + 1] || last(lastYearPeriods);

        return {
          ...period,
          lastPeriod: pick(lastPeriod, [
            'id',
            'name',
            'startDate',
            'endDate',
            'type',
          ]),
        };
      });
  }

  getRelativePeriods(type: string) {
    switch (type) {
      case 'RelativeBiMonth': {
        const biMonthlyPeriods = this.includeLastPeriods(
          this.getBiMonthlyPeriods(this._year),
          PeriodTypeEnum.BI_MONTHLY,
          this._year
        );

        const lastBiMonthlyPeriods = this.includeLastPeriods(
          this.getBiMonthlyPeriods(this._year - 1),
          PeriodTypeEnum.BI_MONTHLY,
          this._year - 1
        );

        const currentBiMonthlyPeriod: PeriodInterface = find(
          biMonthlyPeriods || [],
          ['id', this.getBiMonthlyPeriodId(this._year, this._biMonth)]
        );
        return [
          {
            id: 'THIS_BIMONTH',
            type,
            name: 'This Bi-month',
            iso: currentBiMonthlyPeriod,
          },
          {
            id: 'LAST_BIMONTH',
            type,
            name: 'Last Bi-month',
            iso: currentBiMonthlyPeriod
              ? currentBiMonthlyPeriod.lastPeriod
              : null,
          },
          {
            id: 'LAST_6_BIMONTHS',
            type,
            name: 'Last 6 bi-month',
            iso: getLastNthPeriods(
              [...lastBiMonthlyPeriods, ...biMonthlyPeriods],
              currentBiMonthlyPeriod,
              6
            ),
          },
        ];
      }

      case 'RelativeMonth': {
        const monthlyPeriods = this.includeLastPeriods(
          this.getMonthlyPeriods(this._year),
          PeriodTypeEnum.MONTHLY,
          this._year
        );

        const lastMonthlyPeriods = this.includeLastPeriods(
          this.getMonthlyPeriods(this._year - 1),
          PeriodTypeEnum.MONTHLY,
          this._year - 1
        );

        const lastLastMonthlyPeriods = this.includeLastPeriods(
          this.getMonthlyPeriods(this._year - 2),
          PeriodTypeEnum.MONTHLY,
          this._year - 2
        );

        const currentMonthlyPeriod: PeriodInterface = find(
          monthlyPeriods || [],
          ['id', this.getMonthPeriodId(this._year, this._month)]
        );

        return [
          {
            id: 'THIS_MONTH',
            type,
            name: 'This Month',
            iso: currentMonthlyPeriod,
          },
          {
            id: 'LAST_MONTH',
            type,
            name: 'Last Month',
            iso: currentMonthlyPeriod ? currentMonthlyPeriod.lastPeriod : null,
          },
          {
            id: 'LAST_3_MONTHS',
            type,
            name: 'Last 3 Months',
            iso: getLastNthPeriods(
              [...lastMonthlyPeriods, ...monthlyPeriods],
              currentMonthlyPeriod,
              3
            ),
          },
          {
            id: 'LAST_6_MONTHS',
            type,
            name: 'Last 6 Months',
            iso: getLastNthPeriods(
              [...lastMonthlyPeriods, ...monthlyPeriods],
              currentMonthlyPeriod,
              6
            ),
          },
          {
            id: 'LAST_12_MONTHS',
            type,
            name: 'Last 12 Months',
            iso: getLastNthPeriods(
              [
                ...lastLastMonthlyPeriods,
                ...lastMonthlyPeriods,
                ...monthlyPeriods,
              ],
              currentMonthlyPeriod,
              12
            ),
          },
        ];
      }

      case 'RelativeQuarter': {
        const quarterPeriods = this.includeLastPeriods(
          this.getQuarterlyPeriods(this._year),
          PeriodTypeEnum.QUARTERLY,
          this._year
        );

        const lastYearQuarterPeriods = this.includeLastPeriods(
          this.getQuarterlyPeriods(this._year - 1),
          PeriodTypeEnum.QUARTERLY,
          this._year - 1
        );

        const currentQuarter: PeriodInterface = find(quarterPeriods || [], [
          'id',
          this.getQuarterPeriodId(this._year, this._quarter),
        ]);

        return [
          {
            id: 'THIS_QUARTER',
            type,
            name: 'This Quarter',
            iso: currentQuarter,
          },
          {
            id: 'LAST_QUARTER',
            type,
            name: 'Last Quarter',
            iso: currentQuarter ? currentQuarter.lastPeriod : null,
          },
          {
            id: 'LAST_4_QUARTERS',
            type,
            name: 'Last 4 Quarters',
            iso: getLastNthPeriods(
              [...lastYearQuarterPeriods, ...quarterPeriods],
              currentQuarter,
              4
            ),
          },
        ];
      }

      case 'RelativeSixMonth': {
        const sixMonthlyPeriods = this.includeLastPeriods(
          this.getSixMonthlyPeriods(this._year),
          PeriodTypeEnum.SIX_MONTHLY,
          this._year
        );

        const lastSixMonthlyPeriods = this.includeLastPeriods(
          this.getSixMonthlyPeriods(this._year - 1),
          PeriodTypeEnum.SIX_MONTHLY,
          this._year - 1
        );

        const currentSixMonthly: PeriodInterface = find(
          sixMonthlyPeriods || [],
          ['id', this.getSixMonthlyPeriodId(this._year, this._sixMonth)]
        );
        return [
          {
            id: 'THIS_SIX_MONTH',
            type,
            name: 'This Six-month',
            iso: currentSixMonthly,
          },
          {
            id: 'LAST_SIX_MONTH',
            type,
            name: 'Last Six-month',
            iso: currentSixMonthly ? currentSixMonthly.lastPeriod : null,
          },
          {
            id: 'LAST_2_SIXMONTHS',
            type,
            name: 'Last 2 Six-month',
            iso: getLastNthPeriods(
              [...lastSixMonthlyPeriods, ...sixMonthlyPeriods],
              currentSixMonthly,
              2
            ),
          },
        ];
      }

      case 'RelativeYear': {
        const yearPeriods = this.includeLastPeriods(
          this.getYearlyPeriods(this._year, PeriodTypeEnum.YEARLY, '', -1, 20),
          PeriodTypeEnum.YEARLY,
          this._year
        );

        const currentYear: PeriodInterface = find(yearPeriods || [], [
          'id',
          this._year.toString(),
        ]);

        return [
          { id: 'THIS_YEAR', type, name: 'This Year', iso: currentYear },
          {
            id: 'LAST_YEAR',
            type,
            name: 'Last Year',
            iso: currentYear ? currentYear.lastPeriod : null,
          },
          {
            id: 'LAST_5_YEARS',
            type,
            name: 'Last 5 Years',
            iso: getLastNthPeriods(yearPeriods, currentYear, 5),
          },
          {
            id: 'LAST_10_YEARS',
            type,
            name: 'Last 10 Years',
            iso: getLastNthPeriods(yearPeriods, currentYear, 10),
          },
        ];
      }

      case 'RelativeFinancialYear': {
        return [
          { id: 'THIS_FINANCIAL_YEAR', type, name: 'This Financial Year' },
          {
            id: 'LAST_FINANCIAL_YEAR',
            type,
            name: 'Last Financial Year',
          },
          {
            id: 'LAST_5_FINANCIAL_YEARS',
            type,
            name: 'Last 5 Financial Years',
          },
        ];
      }

      case 'RelativeWeek': {
        return [
          { id: 'THIS_WEEK', type, name: 'This Week' },
          { id: 'LAST_WEEK', type, name: 'Last Week' },
          {
            id: 'LAST_4_WEEKS',
            type,
            name: 'Last 4 Weeks',
          },
          { id: 'LAST_12_WEEKS', type, name: 'last 12 Weeks' },
          { id: 'LAST_52_WEEKS', type, name: 'Last 52 weeks' },
        ];
      }

      default:
        return [];
    }
  }

  getMonthlyPeriods(year: number, offset = 0) {
    const monthPeriods = (this._monthNames || []).map(
      (monthName: string, monthIndex: number) => {
        const monthOffset = monthIndex + 1 - offset;
        const monthYear = monthOffset > 12 ? year - 1 : year;
        const id = this.getMonthPeriodId(monthYear, monthIndex + 1);

        return {
          id,
          startDate: this.getDate(monthYear, monthIndex + 1, 1),
          endDate: this.getDate(
            monthYear,
            monthIndex + 1,
            this._calendar.getDaysInMonth(monthYear, monthIndex + 1) as number
          ),
          type: 'Monthly',
          name: `${monthName} ${monthYear}`,
          daily: this.getChildrenPeriods(
            id,
            'Monthly',
            'Daily',
            this._preferences
          ),
          weekly: this.getChildrenPeriods(
            id,
            'Monthly',
            'Weekly',
            this._preferences
          ),
        };
      }
    );

    return this.getMonthsByOffset(monthPeriods, offset);
  }

  getQuarterlyPeriods(year: number) {
    return chunk(
      this.getMonthsByOffset(
        this.getMonthWithYears(
          this._monthNames,
          year,
          this._quarterMonthOffset
        ),
        this._quarterMonthOffset
      ),
      3
    ).map((quarterMonths, quarterIndex) => {
      const id = this.getQuarterPeriodId(year, quarterIndex + 1);
      const startMonth = head(quarterMonths || []);
      const endMonth = last(quarterMonths || []);

      return {
        id,
        startDate: this.getDate(year, startMonth.index + 1, 1),
        endDate: this.getDate(
          year,
          endMonth.index + 1,
          this._calendar.getDaysInMonth(year, endMonth.index + 1) as number
        ),
        type: 'Quarterly',
        name: this.getPeriodNameByRange(startMonth, endMonth, year),
        daily: this.getChildrenPeriods(
          id,
          'Quarterly',
          'Daily',
          this._preferences
        ),
        weekly: this.getChildrenPeriods(
          id,
          'Quarterly',
          'Weekly',
          this._preferences
        ),
        monthly: this.getChildrenPeriods(
          id,
          'Quarterly',
          'Monthly',
          this._preferences
        ),
      };
    });
  }

  getPeriodNameByRange(startMonth: any, endMonth: any, year: number) {
    return `${[startMonth.name + ` ${startMonth.year}`, endMonth.name].join(
      ' - '
    )} ${endMonth.year}`;
  }

  getMonthsByOffset(months: any[], offset: number) {
    if (offset === 0) {
      return months;
    }

    return [
      ...months.slice(offset),
      ...months.slice(0, months.length + offset),
    ];
  }

  getMonthWithYears(monthNames: string[], year: number, offset: number) {
    return (monthNames || []).map((name, index) => {
      const monthOffset = index + 1 - offset;

      return { name, index, year: monthOffset > 12 ? year - 1 : year };
    });
  }

  getBiMonthlyPeriods(year: number) {
    return (chunk(this._monthNames || [], 2) || []).map(
      (biMonths, biMonthIndex) => {
        const id = this.getBiMonthlyPeriodId(year, biMonthIndex + 1);

        return {
          id,
          type: 'BiMonthly',
          name: `${[head(biMonths || []), last(biMonths || [])].join(
            ' - '
          )} ${year}`,
          daily: this.getChildrenPeriods(
            id,
            'BiMonthly',
            'Daily',
            this._preferences
          ),
          weekly: this.getChildrenPeriods(
            id,
            'BiMonthly',
            'Weekly',
            this._preferences
          ),
          monthly: this.getChildrenPeriods(
            id,
            'BiMonthly',
            'Monthly',
            this._preferences
          ),
        };
      }
    );
  }

  getSixMonthlyPeriods(year: number) {
    return (chunk(this._monthNames || [], 6) || []).map(
      (sixMonths, sixMonthIndex) => {
        const id = this.getSixMonthlyPeriodId(year, sixMonthIndex + 1);

        return {
          id,
          startDate: this.getDate(year, sixMonthIndex > 0 ? 6 : 1, 1),
          endDate: this.getDate(
            year,
            sixMonthIndex + 6,
            this._calendar.getDaysInMonth(year, sixMonthIndex + 6) as number
          ),
          type: 'SixMonthly',
          name: `${[head(sixMonths || []), last(sixMonths || [])].join(
            ' - '
          )} ${year}`,
          daily: this.getChildrenPeriods(
            id,
            'SixMonthly',
            'Daily',
            this._preferences
          ),
          weekly: this.getChildrenPeriods(
            id,
            'SixMonthly',
            'Weekly',
            this._preferences
          ),
          monthly: this.getChildrenPeriods(
            id,
            'SixMonthly',
            'Monthly',
            this._preferences
          ),
        };
      }
    );
  }

  getSixMonthlyAprilPeriods(year: number) {
    const months = this.getMonthWithYears(this._monthNames, year + 1, -9);

    return (
      chunk([...months.slice(3), ...months.slice(0, 3)] || [], 6) || []
    ).map((sixMonthApril, sixMonthAprilIndex) => {
      const id = this.getSixMonthlyPeriodId(
        year,
        sixMonthAprilIndex + 1,
        'April'
      );

      const month = (sixMonthAprilIndex + 1) * 6 - 2;
      const nextEndMonth = month + 5;
      const endMonth = nextEndMonth > 12 ? nextEndMonth - 12 : nextEndMonth;

      return {
        id,
        startDate: this.getDate(year, month, 1),
        endDate: this.getDate(
          nextEndMonth > 12 ? year + 1 : year,
          endMonth,
          this._calendar.getDaysInMonth(year, endMonth) as number
        ),
        type: 'SixMonthlyApril',
        name: this.getPeriodNameByRange(
          head(sixMonthApril || []),
          last(sixMonthApril || []),
          year
        ),
        daily: this.getChildrenPeriods(
          id,
          'SixMonthlyApril',
          'Daily',
          this._preferences
        ),
        weekly: this.getChildrenPeriods(
          id,
          'SixMonthlyApril',
          'Weekly',
          this._preferences
        ),
        monthly: this.getChildrenPeriods(
          id,
          'SixMonthlyApril',
          'Monthly',
          this._preferences
        ),
      };
    });
  }

  getSixMonthlyNovemberPeriods(year: number) {
    return chunk(
      sortBy(
        this.getMonthsByOffset(
          this.getMonthWithYears(this._monthNames, year + 1, -2),
          this._quarterMonthOffset
        ),
        ['year', 'index']
      ),
      6
    ).map((sixMonthNovember, sixMonthNovemberIndex) => {
      const id = this.getSixMonthlyPeriodId(
        year,
        sixMonthNovemberIndex + 1,
        'Nov'
      );

      const startMonth = (sixMonthNovemberIndex + 1) * 6 + 5;
      const month = startMonth > 12 ? startMonth - 12 : startMonth;
      const nextEndMonth = month + 5;
      const endMonth = nextEndMonth > 12 ? nextEndMonth - 12 : nextEndMonth;

      return {
        id,
        startDate: this.getDate(startMonth > 12 ? year + 1 : year, month, 1),
        endDate: this.getDate(
          year + 1,
          endMonth,
          this._calendar.getDaysInMonth(year, endMonth) as number
        ),
        type: 'SixMonthlyNovember',
        name: this.getPeriodNameByRange(
          head(sixMonthNovember || []),
          last(sixMonthNovember || []),
          year
        ),
        daily: this.getChildrenPeriods(
          id,
          'SixMonthlyNovember',
          'Daily',
          this._preferences
        ),
        weekly: this.getChildrenPeriods(
          id,
          'SixMonthlyNovember',
          'Weekly',
          this._preferences
        ),
        monthly: this.getChildrenPeriods(
          id,
          'SixMonthlyNovember',
          'Monthly',
          this._preferences
        ),
      };
    });
  }

  getYearlyPeriods(
    year: any,
    type: string,
    idSuffix = '',
    monthIndex = -1,
    yearRange: number = 10
  ) {
    return range(yearRange)
      .map((yearIndex) => {
        const periodYear = parseInt(year, 10) - yearIndex;
        const id = this.getYearlyPeriodId(periodYear, idSuffix);
        const name = this.getYearlyPeriodName(periodYear, monthIndex);

        const endMonth = monthIndex + 13 > 12 ? monthIndex : monthIndex + 13;

        return {
          id,
          startDate: this.getDate(
            periodYear,
            monthIndex + (monthIndex < 0 ? 2 : 1),
            1
          ),
          endDate: this.getDate(
            periodYear,
            endMonth,
            this._calendar.getDaysInMonth(periodYear, endMonth) as number
          ),
          type,
          name,
          daily: this.getChildrenPeriods(id, type, 'Daily', this._preferences),
          weekly: this.getChildrenPeriods(
            id,
            type,
            'Weekly',
            this._preferences
          ),
          monthly: this.getChildrenPeriods(
            id,
            type,
            'Monthly',
            this._preferences
          ),
          quarterly: this.getChildrenPeriods(
            id,
            type,
            'Quarterly',
            this._preferences
          ),
        };
      })
      .reverse();
  }

  omitFuturePeriods(periods: any[], type: string) {
    return periods.filter(
      (period) => period.id < this.getCurrentPeriodId(type)
    );
  }

  getCurrentPeriodId(type: string) {
    switch (type) {
      case 'Monthly': {
        return this.getMonthPeriodId(
          this._calendar.getCurrentYear(),
          this._month
        );
      }
      case 'Weekly': {
        return this.getWeeklyPeriodId(
          this._calendar.getCurrentYear(),
          this._week
        );
      }
      case 'Quarterly': {
        return this.getQuarterPeriodId(
          this._calendar.getCurrentYear(),
          this._quarter
        );
      }

      case 'BiMonthly': {
        return this.getBiMonthlyPeriodId(
          this._calendar.getCurrentYear(),
          this._biMonth
        );
      }

      case 'SixMonthly': {
        return this.getSixMonthlyPeriodId(
          this._calendar.getCurrentYear(),
          this._sixMonth
        );
      }

      case 'SixMonthlyApril': {
        return this.getSixMonthlyPeriodId(
          this._calendar.getCurrentYear(),
          this._sixMonthApril,
          'April'
        );
      }

      case 'SixMonthlyNovember': {
        return this.getSixMonthlyPeriodId(
          this._calendar.getCurrentYear(),
          this._sixMonthNovember,
          'Nov'
        );
      }

      case 'Yearly': {
        return this._calendar.getCurrentYear();
      }

      case 'FinancialApril': {
        const currentYear = this._calendar.getCurrentYear();

        return this.getYearlyPeriodId(
          this._month >= 4 ? currentYear : currentYear - 1,
          'FinancialApril'
        );
      }

      case 'FinancialJuly': {
        const currentYear = this._calendar.getCurrentYear();

        return this.getYearlyPeriodId(
          this._month >= 7 ? currentYear : currentYear - 1,
          'FinancialJuly'
        );
      }

      case 'FinancialOctober': {
        const currentYear = this._calendar.getCurrentYear();

        return this.getYearlyPeriodId(
          this._month >= 10 ? currentYear : currentYear - 1,
          'FinancialOctober'
        );
      }

      case 'FinancialNovember': {
        const currentYear = this._calendar.getCurrentYear();

        return this.getYearlyPeriodId(
          this._month >= 11 ? currentYear : currentYear - 1,
          'FinancialNovember'
        );
      }

      default:
        return undefined;
    }
  }

  getWeeklyPeriodId(year: number, weekNumber: number) {
    return `${year + (this._month === 12 ? 1 : 0)}W${
      weekNumber < 10 ? `0${weekNumber}` : weekNumber
    }`;
  }

  getMonthPeriodId(year: number, monthNumber: number) {
    return (
      year + (monthNumber < 10 ? `0${monthNumber}` : monthNumber).toString()
    );
  }

  getDate(year: number, monthNumber: number, day: number) {
    const month = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
    const date = day < 10 ? `0${day}` : day;
    return `${date}-${month}-${year}`;
  }

  getQuarterPeriodId(year: number, quarterNumber: number) {
    return `${year}Q${quarterNumber}`;
  }

  getBiMonthlyPeriodId(year: number, biMonthNumber: number) {
    return `${year}0${biMonthNumber}B`;
  }

  getSixMonthlyPeriodId(
    year: number,
    sixMonthNumber: number,
    sixMonthType = ''
  ) {
    return `${year}${sixMonthType}S${sixMonthNumber}`;
  }

  getYearlyPeriodId(year: number, suffix = '') {
    return `${year}${suffix}`;
  }

  getYearlyPeriodName(year: number, monthIndex = -1) {
    if (monthIndex === -1) {
      return year.toString();
    }

    return `${this._monthNames[monthIndex]} ${year} - ${
      this._monthNames[monthIndex - 1]
    } ${year + 1}`;
  }

  getYearlyMonthIndex(type: string) {}

  getChildrenPeriods(
    parentId: string,
    parentType: string,
    childrenType: string,
    preferences: any
  ) {
    let periods = [];

    switch (parentType) {
      case 'Yearly': {
        const year = parseInt(parentId.slice(0, 4), 10);

        if (!isNaN(year)) {
          periods = this.getPeriods(childrenType, year).reverse();
        }
        break;
      }

      // TODO Have a common method to handle children generation for combined periods
      case 'Quarterly': {
        const year = parseInt(parentId.slice(0, 4), 10);

        if (!isNaN(year)) {
          switch (childrenType) {
            case 'Monthly': {
              const quarterNumber = parseInt(parentId.slice(-1), 10);

              const monthPeriods = this.getPeriods(
                childrenType,
                year,
                this._quarterMonthOffset
              );

              periods = [
                ...(monthPeriods || [])
                  .filter(({}, periodIndex) => {
                    const max = quarterNumber * 3;
                    const min = max - 3;

                    return periodIndex >= min && periodIndex < max;
                  })
                  .reverse(),
              ];
              break;
            }

            default:
              break;
          }
        }

        break;
      }

      case 'BiMonthly': {
        const year = parseInt(parentId.slice(0, 4), 10);

        if (!isNaN(year)) {
          switch (childrenType) {
            case 'Monthly': {
              const biMonthlyNumber = parseInt(parentId.slice(4), 10);

              const monthPeriods = this.getPeriods(childrenType, year, 0);

              periods = [
                ...(monthPeriods || [])
                  .filter(({}, periodIndex) => {
                    const max = biMonthlyNumber * 2;
                    const min = max - 2;

                    return periodIndex >= min && periodIndex < max;
                  })
                  .reverse(),
              ];
              break;
            }

            default:
              break;
          }
        }

        break;
      }

      case 'SixMonthly': {
        const year = parseInt(parentId.slice(0, 4), 10);

        if (!isNaN(year)) {
          switch (childrenType) {
            case 'Monthly': {
              const sixMonthlyNumber = parseInt(parentId.slice(-1), 10);

              const monthPeriods = this.getPeriods(childrenType, year, 0);

              periods = [
                ...(monthPeriods || [])
                  .filter(({}, periodIndex) => {
                    const max = sixMonthlyNumber * 6;
                    const min = max - 6;

                    return periodIndex >= min && periodIndex < max;
                  })
                  .reverse(),
              ];
              break;
            }

            default:
              break;
          }
        }

        break;
      }

      default:
        break;
    }

    if (preferences && preferences.childrenPeriodSortOrder === 'ASC') {
      return [...periods.reverse()];
    }

    return periods;
  }
  getWeekNumber(d: any) {
    d = new Date(+d);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart: any = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return [d.getFullYear(), weekNo];
  }

  getDateOfWeek(weekNo: any, year: any) {
    let startdate = new Date(year, 0, 1 + (weekNo - 1 - 1) * 7);
    startdate.setDate(startdate.getDate() + (1 - startdate.getDay()));
    let enddate = new Date(startdate);
    enddate.setDate(enddate.getDate() + 6); // plus more 6 days
    return {
      id: `${year}W${weekNo}`,
      week: weekNo,
      name: `Week ${weekNo} ${this.sanitizeDateString(
        startdate
      )} - ${this.sanitizeDateString(enddate)}`,
      startdate: this.sanitizeDateString(startdate),
      enddate: this.sanitizeDateString(enddate),
    };
  }

  sanitizeDateString(dateString: any) {
    const currentDateValue = new Date(dateString);
    const day = currentDateValue.getDate();
    const month = currentDateValue.getMonth() + 1;
    const formattedDate =
      currentDateValue.getFullYear() +
      '-' +
      ((month < 10 ? '0' : '') + month) +
      '-' +
      ((day < 10 ? '0' : '') + day);
    return formattedDate;
  }

  weeksInYear(year: any) {
    const d = new Date(year, 11, 31);
    const week = this.getWeekNumber(d)[1];
    const currentYear = new Date().getFullYear();
    const todayWeekNo = this.getWeekNumber(new Date())[1];
    const totalWeeks = week == 1 ? 52 : week;
    const lastyear = year - 1;
    const lastYeard = new Date(lastyear, 11, 31);
    let periods = [];
    if (currentYear === year) {
      for (let week = 1; week <= todayWeekNo; week++) {
        const periodItem = this.getDateOfWeek(week, year);
        periods.push({
          ...periodItem,
          id: `${year}W${week - 1}`,
          week: week - 1,
          name: `Week ${week - 1} ${periodItem.startdate} - ${
            periodItem.enddate
          }`,
        });
      }
    }

    if (currentYear !== year) {
      for (let week = 1; week <= totalWeeks + 1; week++) {
        const periodItem = this.getDateOfWeek(week, year);
        periods.push({
          ...periodItem,
          id: `${year}W${week - 1}`,
          week: week - 1,
          name: `Week ${week - 1} ${periodItem.startdate} - ${
            periodItem.enddate
          }`,
        });
      }
    }

    return periods.filter((item) => item.week).sort((a, b) => b.week - a.week);
  }

  getWeeklyPeriods(year: number) {
    const totalWeeks = getISOWeeksInYear(new Date(year, 0, 1));
    const weeksArray = Array.from({ length: totalWeeks }, (_, i) => i + 1);

    return weeksArray.map((week) => {
      const startDate = format(
        startOfISOWeek(new Date(year, 0, (week - 1) * 7 + 4)),
        'yyyy-MM-dd'
      );
      const endDate = format(
        endOfISOWeek(new Date(year, 0, (week - 1) * 7 + 4)),
        'yyyy-MM-dd'
      );

      return {
        id: `${year}W${String(week).padStart(2, '0')}`,
        week,
        name: `Week ${week} (${startDate} - ${endDate})`,
        startDate,
        endDate,
      };
    });
  }

  getCurrentISOWeek() {
    const today = new Date();
    const startOfYear = startOfISOWeek(new Date(today.getFullYear(), 0, 1));
    const daysPassed = Math.floor(
      (today.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.ceil((daysPassed + 1) / 7);
  }

  computePeriods(targetPeriod: any) {
    const targetPeriodWeeks = this.getWeeklyPeriods(targetPeriod);
    const firstWeekOfTargetPeriod = targetPeriodWeeks.slice(-1)[0];
    const lastyearPeriodWeeks = this.getWeeklyPeriods(targetPeriod - 1);
    const lastWeekItemLastYear = lastyearPeriodWeeks[0];
    if (
      firstWeekOfTargetPeriod &&
      lastWeekItemLastYear &&
      firstWeekOfTargetPeriod.startDate === lastWeekItemLastYear.startDate &&
      firstWeekOfTargetPeriod.endDate === lastWeekItemLastYear.endDate
    ) {
      const trimmedCurrentYearWeeks = targetPeriodWeeks.slice(0, -1);
      const updatedWeeks = (trimmedCurrentYearWeeks.reverse() || []).map(
        (weekItem, index) => ({
          id: `${targetPeriod}W${index + 1}`,
          week: index + 1,
          name: `Week ${index + 1} ${weekItem.startDate} - ${weekItem.endDate}`,
          startDate: weekItem.startDate,
          endDate: weekItem.endDate,
        })
      );

      return updatedWeeks.reverse();
    } else {
      return targetPeriodWeeks;
    }
  }

  targetFinalPeriod(targetPeriod: any) {
    const targetPeriodWeeks = this.getWeeklyPeriods(targetPeriod);
    const lastyearPeriodWeeks = this.getWeeklyPeriods(targetPeriod - 1);
    const lastWeekItemLastYear = lastyearPeriodWeeks[0];
    const firstWeekOfTargetPeriod = targetPeriodWeeks.slice(-1)[0];
    if (
      firstWeekOfTargetPeriod &&
      lastWeekItemLastYear &&
      firstWeekOfTargetPeriod.startDate === lastWeekItemLastYear.startDate &&
      firstWeekOfTargetPeriod.endDate === lastWeekItemLastYear.endDate
    ) {
      const trimmedCurrentYearWeeks = targetPeriodWeeks.slice(0, -1);
      const updatedWeeks = (trimmedCurrentYearWeeks.reverse() || []).map(
        (weekItem, index) => ({
          id: `${targetPeriod}W${index + 1}`,
          week: index + 1,
          name: `Week ${index + 1} ${weekItem.startDate} - ${weekItem.endDate}`,
          startdate: weekItem.startDate,
          enddate: weekItem.endDate,
        })
      );

      return updatedWeeks.reverse();
    } else {
      return targetPeriodWeeks;
    }
  }
}
