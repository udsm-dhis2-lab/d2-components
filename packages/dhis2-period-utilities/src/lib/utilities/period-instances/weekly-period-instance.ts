import moment from 'moment';
import { Calendar } from '../calendar/calendar.utility';

export class WeeklyPeriodInstance {
  constructor(private calendar: Calendar) {}
  get(openFuturePeriod: number = 0, year?: number): any {
    let periods: any[] = [];
    const openFuturePeriodOffset = (openFuturePeriod ?? 0) - 1;
    const startingWeek = this.getStartingWeek(openFuturePeriodOffset, year);
    for (let weekNo = startingWeek; weekNo > 0; weekNo--) {
      const offset = (startingWeek - weekNo) * 7;
      const date: any = this.getDate(openFuturePeriodOffset, year);

      const weekDate = date.subtract(offset, 'days');
      const startDate = weekDate.startOf('isoWeek').format('YYYY-MM-DD');
      const endDate = weekDate.endOf('isoWeek').format('YYYY-MM-DD');

      periods = [
        ...periods,
        {
          id: `${year ?? weekDate.format('YYYY')}W${weekNo}`,
          week: weekNo,
          startDate,
          endDate,
          name: `Week ${weekNo} - ${startDate} - ${endDate}`,
        },
      ];
    }

    return periods;
  }

  getDate(futurePeriodOffset: number, year?: number) {
    const date = moment(
      new Date(
        year ?? this.calendar.getCurrentYear(),
        this.calendar.getCurrentMonth() - 1,
        this.calendar.getCurrentDay()
      )
    ).add((futurePeriodOffset ?? 0) * 7, 'days');
    if (year) {
      if (year === this.calendar.getCurrentYear()) {
        return date;
      }

      return moment(new Date(year, 11, 31));
    }
    return date;
  }

  getStartingWeek(futurePeriodOffset: number, year?: number) {
    const currentWeek = this.calendar.geCurrentWeek() + futurePeriodOffset;
    const weekNumber = currentWeek > 52 ? currentWeek - 52 : currentWeek;
    if (year) {
      if (year === this.calendar.getCurrentYear()) {
        return weekNumber;
      }

      return 52;
    }

    return weekNumber;
  }
}
