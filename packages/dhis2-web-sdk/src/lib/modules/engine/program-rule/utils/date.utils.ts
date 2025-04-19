// @flow

import moment from 'moment';
import trimQuotes from './trim-quotes.util';

const momentFormat = 'YYYY-MM-DD';

const between = (
  unit: any,
  firstRulesDate: string,
  secondRulesDate: string
) => {
  const firsRulesDateTrimmed = trimQuotes(firstRulesDate);
  const secondRulesDateTrimmed = trimQuotes(secondRulesDate);
  const firstDate = moment(firsRulesDateTrimmed, momentFormat);
  const secondDate = moment(secondRulesDateTrimmed, momentFormat);
  return secondDate.diff(firstDate, unit);
};

export const dateUtils = {
  getToday: () => {
    const todayMoment = moment();
    return todayMoment.format(momentFormat);
  },
  daysBetween: (firstRulesDate: string, secondRulesDate: string) =>
    between('days', firstRulesDate, secondRulesDate),
  weeksBetween: (firstRulesDate: string, secondRulesDate: string) =>
    between('weeks', firstRulesDate, secondRulesDate),
  monthsBetween: (firstRulesDate: string, secondRulesDate: string) =>
    between('months', firstRulesDate, secondRulesDate),
  yearsBetween: (firstRulesDate: string, secondRulesDate: string) =>
    between('years', firstRulesDate, secondRulesDate),
  addDays: (rulesDate: string, daysToAdd: string) => {
    const rulesDateTrimmed = trimQuotes(rulesDate);
    const daysToAddTrimmed = trimQuotes(daysToAdd);
    const dateMoment = moment(rulesDateTrimmed, momentFormat);
    const newDateMoment = dateMoment.add(daysToAddTrimmed, 'days');
    const newRulesDate = newDateMoment.format(momentFormat);
    return `'${newRulesDate}'`;
  },
};

export default dateUtils;
