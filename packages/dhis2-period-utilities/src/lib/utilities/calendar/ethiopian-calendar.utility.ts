import { BaseCalendar } from './base-calendar.utility';
import { CalendarEpoch, CalendarName } from '../../constants/calendar.constant';

export class EthiopianCalendar extends BaseCalendar {
  private _gregorianEpoch: number;
  private _quarterMonthOffset: number;
  constructor() {
    super();
    this._name = CalendarName.ETHIOPIAN;
    this._jdEpoch = CalendarEpoch.ETHIOPIAN;
    this._gregorianEpoch = CalendarEpoch.GREGORIAN;
    this._daysPerMonth = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5];
    this._quarterMonthOffset = -2;
    this._epochs = ['BEE', 'EE'];
    this._monthNames = [
      'Meskerem',
      'Tikemet',
      'Hidar',
      'Tahesas',
      'Tir',
      'Yekatit',
      'Megabit',
      'Miazia',
      'Genbot',
      'Sene',
      'Hamle',
      'Nehase',
      'Pagume',
    ];
    this._monthNamesShort = [
      'Mes',
      'Tik',
      'Hid',
      'Tah',
      'Tir',
      'Yek',
      'Meg',
      'Mia',
      'Gen',
      'Sen',
      'Ham',
      'Neh',
      'Pag',
    ];
    this._dayNames = [
      'Ehud',
      'Segno',
      'Maksegno',
      'Irob',
      'Hamus',
      'Arb',
      'Kidame',
    ];
    this._dayNamesShort = ['Ehu', 'Seg', 'Mak', 'Iro', 'Ham', 'Arb', 'Kid'];
    this._dayNamesMin = ['Eh', 'Se', 'Ma', 'Ir', 'Ha', 'Ar', 'Ki'];
    this._dateFormat = 'dd/mm/yyyy';
  }

  monthNames() {
    return this._monthNames;
  }

  override leapYear(year: any) {
    const validDate = this._validate(
      year,
      this._minMonth,
      this._minDay,
      this._invalids.invalidYear
    );
    const validYear = validDate.year() + (validDate.year() < 0 ? 1 : 0);

    return validYear % 4 === 3 || validYear % 4 === -1;
  }

  override monthsInYear(year: any) {
    this._validate(
      year,
      this._minMonth,
      this._minDay,
      this._invalids.invalidYear
    );
    return 13;
  }

  override weekOfYear(year: number, month: number, day: any) {
    var date = this.newDate(year, month, day);

    date.add(-date.dayOfWeek(), 'd');
    return Math.floor((date.dayOfYear() - 1) / 7) + 1;
  }

  override daysInMonth(a: any, b: any) {
    const validDate = this._validate(
      a,
      b,
      this._minDay,
      this._invalids.invalidMonth
    );

    return (
      this._daysPerMonth[validDate.month() - 1] +
      (validDate.month() === 13 && this.leapYear(validDate.year()) ? 1 : 0)
    );
  }
  weekDay(a: any, b: any, c: any) {
    return (this.dayOfWeek(a, b, c) || 7) < 6;
  }

  quarterMonthOffset() {
    return this._quarterMonthOffset;
  }

  override fromJSDate(date: any) {
    const newDate = this.newDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );

    return this.fromJD(
      this.toJD(newDate.year(), newDate.month(), newDate.day())
    );
  }

  override toJD(year: number, month: number, day: any) {
    const s =
      Math.floor(year / 4) -
      Math.floor((year - 1) / 4) -
      Math.floor(year / 100) +
      Math.floor((year - 1) / 100) +
      Math.floor(year / 400) -
      Math.floor((year - 1) / 400);
    const t = Math.floor((14 - month) / 12);
    const n =
      31 * t * (month - 1) +
      (1 - t) * (59 + s + 30 * (month - 3) + Math.floor((3 * month - 7) / 5)) +
      day -
      1;
    const j =
      this._gregorianEpoch +
      365 * (year - 1) +
      Math.floor((year - 1) / 4) -
      Math.floor((year - 1) / 100) +
      Math.floor((year - 1) / 400) +
      n;

    return j;
  }

  override fromJD(a: any) {
    const r = (a - this._jdEpoch) % 1461;
    const n = (r % 365) + 365 * Math.floor(r / 1460);

    const year =
      4 * Math.floor((a - this._jdEpoch) / 1461) +
      Math.floor(r / 365) -
      Math.floor(r / 1460);
    const month = Math.floor(n / 30) + 1;
    const day = (n % 30) + 1;

    return this.newDate(year, month, day);
  }
}
