import moment from 'moment';
import trimQuotes from './trim-quotes.util';

const momentFormat = 'YYYY-MM-DD';

const toTrimmedString = (value: unknown): string =>
  trimQuotes(value === null || value === undefined ? '' : String(value));

const between = (
  unit: any,
  firstRulesDate: unknown,
  secondRulesDate: unknown
) => {
  const firsRulesDateTrimmed = toTrimmedString(firstRulesDate);
  const secondRulesDateTrimmed = toTrimmedString(secondRulesDate);
  const firstDate = moment(firsRulesDateTrimmed, momentFormat);
  const secondDate = moment(secondRulesDateTrimmed, momentFormat);
  return secondDate.diff(firstDate, unit);
};

export const dateUtils = {
  getToday: () => {
    const todayMoment = moment();
    return todayMoment.format(momentFormat);
  },
  daysBetween: (firstRulesDate: unknown, secondRulesDate: unknown) =>
    between('days', firstRulesDate, secondRulesDate),
  weeksBetween: (firstRulesDate: unknown, secondRulesDate: unknown) =>
    between('weeks', firstRulesDate, secondRulesDate),
  monthsBetween: (firstRulesDate: unknown, secondRulesDate: unknown) =>
    between('months', firstRulesDate, secondRulesDate),
  yearsBetween: (firstRulesDate: unknown, secondRulesDate: unknown) =>
    between('years', firstRulesDate, secondRulesDate),
  addDays: (rulesDate: unknown, daysToAdd: unknown) => {
    const rulesDateTrimmed = toTrimmedString(rulesDate);
    const days = Number(toTrimmedString(daysToAdd));
    const dateMoment = moment(rulesDateTrimmed, momentFormat);
    const newDateMoment = dateMoment.add(days, 'days');
    const newRulesDate = newDateMoment.format(momentFormat);
    return `'${newRulesDate}'`;
  },
};

export default dateUtils;