import { BaseCalendar } from './base-calendar.utility';
import { CalendarEpoch, CalendarName } from '../../constants/calendar.constant';

export class GregorianCalendar extends BaseCalendar {
  constructor() {
    super();
    this._name = CalendarName.GREGORIAN;
    this._jdEpoch = CalendarEpoch.GREGORIAN;
    this._daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    this._monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this._dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    this._monthNamesShort = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    this._dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this._dayNamesMin = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    this._dateFormat = 'mm/dd/yyyy';
  }

  monthNames() {
    return this._monthNames;
  }

  override leapYear(a: number) {
    const b = this._validate(
      a,
      this._minMonth,
      this._minDay,
      this._invalids.invalidYear
    );

    a = b.year() + (b.year() < 0 ? 1 : 0);

    return a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0);
  }

  override weekOfYear(year: number, month: number, day: any) {
    const date = this.newDate(year, month, day);

    date.add(4 - (date.dayOfWeek() || 7), 'd');
    return Math.floor((date.dayOfYear() - 1) / 7) + 1;
  }

  override daysInMonth(a: any, b: any) {
    const c = this._validate(a, b, this._minDay, this._invalids.invalidMonth);

    return (
      this._daysPerMonth[c.month() - 1] +
      (c.month() === 2 && this.leapYear(c.year()) ? 1 : 0)
    );
  }
  weekDay(a: any, b: any, c: any) {
    return (this.dayOfWeek(a, b, c) || 7) < 6;
  }

  quarterMonthOffset() {
    return 0;
  }

  override toJD(c: any, d: any, e: any) {
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
  override fromJD(f: any) {
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
  override toJSDate(a: any, b: any, c: any) {
    const d = this._validate(a, b, c, this._invalids.invalidDate);
    const e = new Date(d.year(), d.month() - 1, d.day());

    e.setHours(0);
    e.setMinutes(0);
    e.setSeconds(0);
    e.setMilliseconds(0);
    e.setHours(e.getHours() > 12 ? e.getHours() + 2 : 0);
    return e;
  }

  override fromJSDate(a: any) {
    return this.newDate(a.getFullYear(), a.getMonth() + 1, a.getDate());
  }
}
