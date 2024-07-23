import { CalendarDate } from './calendar-date.utility';

export abstract class BaseCalendar {
  _validateLevel: number;
  _name: string;
  _hasYearZero: boolean;
  _minMonth: number;
  _minDay: number;
  _epochs: string[];
  _firstMonth: number;
  _invalids: {
    invalidCalendar: string;
    invalidDate: string;
    invalidMonth: string;
    invalidYear: string;
    differentCalendars: string;
  };
  _jdEpoch!: number;
  _daysPerMonth!: number[];
  _monthNames!: string[];
  _dayNames!: string[];
  _monthNamesShort!: string[];
  _dayNamesShort!: string[];
  _dayNamesMin!: string[];
  _dateFormat!: string;
  _firstDay: number;
  _isRTL: boolean;
  constructor() {
    this._validateLevel = 0;
    this._name = '';
    this._hasYearZero = false;
    this._minMonth = 1;
    this._minDay = 1;
    this._epochs = ['BCE', 'CE'];
    this._firstMonth = 1;
    this._firstDay = 0;
    this._isRTL = false;
    this._invalids = {
      invalidCalendar: 'Calendar {0} not found',
      invalidDate: 'Invalid {0} date',
      invalidMonth: 'Invalid {0} month',
      invalidYear: 'Invalid {0} year',
      differentCalendars: 'Cannot mix {0} and {1} dates',
    };
  }
  _validate(yearOrDate: any, month: number, day: number, invalidText: string) {
    if (yearOrDate.year) {
      return yearOrDate;
    }

    try {
      this._validateLevel++;
      if (this._validateLevel === 1 && !this.isValid(yearOrDate, month, day)) {
        throw invalidText.replace(/\{0\}/, this._name);
      }
      const date = this.newDate(yearOrDate, month, day);

      this._validateLevel--;
      return date;
    } catch (e) {
      this._validateLevel--;
      throw e;
    }
  }

  isValid(yearOrDate: any, month: number, day: number) {
    this._validateLevel++;
    let valid = this._hasYearZero || yearOrDate !== 0;

    if (valid) {
      const e = this.newDate(yearOrDate, month, this._minDay);

      valid =
        month >= this._minMonth &&
        month - this._minMonth < this.monthsInYear(e) &&
        day >= this._minDay &&
        day - this._minDay <= this.daysInMonth(e);
    }
    this._validateLevel--;
    return valid;
  }

  abstract monthNames(): string[];
  abstract quarterMonthOffset(): number;

  newDate(yearOrDate: any, month: number, day: number): CalendarDate {
    if (!yearOrDate) {
      return this.today();
    }

    if (yearOrDate.year) {
      this._validate(yearOrDate, month, day, this._invalids.invalidDate);
      day = yearOrDate.day();
      month = yearOrDate.month();
      yearOrDate = yearOrDate.year();
    }

    return new CalendarDate(this, yearOrDate, month, day);
  }

  today() {
    return this.fromJSDate(new Date());
  }

  fromJSDate(date: any): any {
    return this.fromJD(this.fromJSDate(date).toJD());
  }

  toJSDate(yearOrDate: any, month: number, day: number) {
    const valid = this._validate(
      yearOrDate,
      month,
      day,
      this._invalids.invalidDate
    );

    return this.fromJD(this.toJD(valid)).toJSDate();
  }

  pad(a: any, b: any) {
    a = '' + a;
    return '000000'.substring(0, b - a.length) + a;
  }

  formatYear(year: number) {
    const validDate = this._validate(
      year,
      this._minMonth,
      this._minDay,
      this._invalids.invalidYear
    );

    return (
      (validDate.year() < 0 ? '-' : '') +
      this.pad(Math.abs(validDate.year()), 4)
    );
  }

  epoch(a: any) {
    var validDate = this._validate(
      a,
      this._minMonth,
      this._minDay,
      this._invalids.invalidYear
    );

    return validDate.year() < 0 ? this._epochs[0] : this._epochs[1];
  }

  monthsInYear(date: any) {
    this._validate(
      date,
      this._minMonth,
      this._minDay,
      this._invalids.invalidYear
    );
    return 12;
  }

  monthOfYear(year: number, month: number) {
    var date = this._validate(
      year,
      month,
      this._minDay,
      this._invalids.invalidMonth
    );

    return (
      ((date.month() + this.monthsInYear(date) - this._firstMonth) %
        this.monthsInYear(date)) +
      this._minMonth
    );
  }

  fromMonthOfYear(year: number, month: number) {
    var m =
      ((month + this._firstMonth - 2 * this._minMonth) %
        this.monthsInYear(year)) +
      this._minMonth;

    this._validate(year, m, this._minDay, this._invalids.invalidMonth);

    return m;
  }

  leapYear(a: any) {
    const b = this._validate(
      a,
      this._minMonth,
      this._minDay,
      this._invalids.invalidYear
    );

    a = b.year() + (b.year() < 0 ? 1 : 0);

    return a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0);
  }

  daysInYear(year: number) {
    var date = this._validate(
      year,
      this._minMonth,
      this._minDay,
      this._invalids.invalidYear
    );

    return this.leapYear(date) ? 366 : 365;
  }

  weekOfYear(year: number, month: number, day: any) {
    const date = this.newDate(year, month, day);

    date.add(4 - (date.dayOfWeek() || 7), 'd');
    return Math.floor((date.dayOfYear() - 1) / 7) + 1;
  }

  daysInMonth(a: any, b?: any) {
    return 30;
  }

  dayOfYear(yearOrDate: any, month: number, day: number) {
    var validDate = this._validate(
      yearOrDate,
      month,
      day,
      this._invalids.invalidDate
    );

    return (
      validDate.toJD() -
      this.newDate(
        validDate.year(),
        this.fromMonthOfYear(validDate.year(), this._minMonth),
        this._minDay
      ).toJD() +
      1
    );
  }

  daysInWeek() {
    return 7;
  }

  dayOfWeek(yearOrDate: any, month: number, day: number) {
    var validDate = this._validate(
      yearOrDate,
      month,
      day,
      this._invalids.invalidDate
    );

    return (Math.floor(this.toJD(validDate)) + 2) % this.daysInWeek();
  }

  extraInfo(yearOrDate: any, month: number, day: number) {
    this._validate(yearOrDate, month, day, this._invalids.invalidDate);
    return {};
  }

  add(yearOrDate: any, month: number, day: string) {
    this._validate(
      yearOrDate,
      this._minMonth,
      this._minDay,
      this._invalids.invalidDate
    );

    return this._correctAdd(
      yearOrDate,
      this._add(yearOrDate, month, day),
      month,
      day
    );
  }

  _add(yearOrDate: any, month: number, day: string) {
    this._validateLevel++;
    if (day === 'd' || day === 'w') {
      const d = yearOrDate.fromJD(
        yearOrDate.toJD() + month * (day === 'w' ? this.daysInWeek() : 1)
      );

      this._validateLevel--;

      return [d.year(), d.month(), d.day()];
    }

    try {
      let y = yearOrDate.year() + (day === 'y' ? month : 0);
      let m = yearOrDate.monthOfYear() + (day === 'm' ? month : 0);
      let d = yearOrDate.day();

      const i = (a: any) => {
        while (m < a.minMonth) {
          y--;
          m += a.monthsInYear(y);
        }
        let b = a.monthsInYear(y);

        while (m > b - 1 + a.minMonth) {
          y++;
          m -= b;
          b = a.monthsInYear(y);
        }
      };

      if (day === 'y') {
        if (yearOrDate.month() !== this.fromMonthOfYear(y, m)) {
          m = this.newDate(y, yearOrDate.month(), this._minDay).monthOfYear();
        }
        m = Math.min(m, this.monthsInYear(y));
        d = Math.min(d, this.daysInMonth(y, this.fromMonthOfYear(y, m)));
      } else if (day === 'm') {
        i(this);
        d = Math.min(d, this.daysInMonth(y, this.fromMonthOfYear(y, m)));
      }
      const j = [y, this.fromMonthOfYear(y, m), d];

      this._validateLevel--;
      return j;
    } catch (e) {
      this._validateLevel--;
      throw e;
    }
  }
  _correctAdd(a: any, b: any, c: any, d: any) {
    if (!this._hasYearZero && (d === 'y' || d === 'm')) {
      if (b[0] === 0 || a.year() > 0 !== b[0] > 0) {
        const e: any = {
          y: [1, 1, 'y'],
          m: [1, this.monthsInYear(-1), 'm'],
          w: [this.daysInWeek(), this.daysInYear(-1), 'd'],
          d: [1, this.daysInYear(-1), 'd'],
        };

        const f = e[d];

        const g = c < 0 ? -1 : +1;

        b = this._add(a, c * f[0] + g * f[1], f[2]);
      }
    }
    return a.date(b[0], b[1], b[2]);
  }
  set(a: any, b: any, c: any) {
    this._validate(a, this._minMonth, this._minDay, this._invalids.invalidDate);

    const y = c === 'y' ? b : a.year();
    const m = c === 'm' ? b : a.month();
    let d = c === 'd' ? b : a.day();

    if (c === 'y' || c === 'm') {
      d = Math.min(d, this.daysInMonth(y, m));
    }

    return a.date(y, m, d);
  }

  toJD(c: any, d?: any, e?: any) {
    const f = this._validate(c, d, e, this._invalids.invalidDate);

    c = f.year();
    d = f.month();
    e = f.day();
    if (c < 0) {
      c++;
    }
    if (d < 3) {
      d += 12;
      c--;
    }
    const a = Math.floor(c / 100);
    const b = 2 - a + Math.floor(a / 4);

    return (
      Math.floor(365.25 * (c + 4716)) +
      Math.floor(30.6001 * (d + 1)) +
      e +
      b -
      1524.5
    );
  }
  fromJD(f: any) {
    const z = Math.floor(f + 0.5);
    let a = Math.floor((z - 1867216.25) / 36524.25);

    a = z + 1 + a - Math.floor(a / 4);
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const g = b - d - Math.floor(e * 30.6001);
    const h = e - (e > 13.5 ? 13 : 1);
    let i = c - (h > 2.5 ? 4716 : 4715);

    if (i <= 0) {
      i--;
    }
    return this.newDate(i, h, g);
  }
}
