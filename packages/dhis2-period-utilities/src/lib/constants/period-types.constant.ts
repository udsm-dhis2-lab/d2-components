import { PeriodTypeInterface } from '../interfaces/period-type.interface';

export enum PeriodTypeEnum {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  BI_MONTHLY = 'BiMonthly',
  QUARTERLY = 'Quarterly',
  SIX_MONTHLY = 'SixMonthly',
  SIX_MONTHLY_APRIL = 'SixMonthlyApril',
  SIX_MONTHLY_NOVEMBER = 'SixMonthlyNovember',
  YEARLY = 'Yearly',
  FINANCIAL_APRIL = 'FinancialApril',
  FINANCIAL_JULY = 'FinancialJuly',
  FINANCIAL_OCTOBER = 'FinancialOctober',
  FINANCIAL_NOVEMBER = 'FinancialNovember',
  RELATIVE_WEEK = 'RelativeWeek',
  RELATIVE_MONTH = 'RelativeMonth',
  RELATIVE_BI_MONTH = 'RelativeBiMonth',
  RELATIVE_SIX_MONTH = 'RelativeSixMonth',
  RELATIVE_QUARTER = 'RelativeQuarter',
  RELATIVE_YEAR = 'RelativeYear',
  RELATIVE_FINANCIAL_YEAR = 'RelativeFinancialYear',
}

export const periodTypes: PeriodTypeInterface[] = [
  { id: PeriodTypeEnum.WEEKLY, name: PeriodTypeEnum.WEEKLY, rank: 2 },
  { id: PeriodTypeEnum.MONTHLY, name: PeriodTypeEnum.MONTHLY, rank: 3 },
  { id: PeriodTypeEnum.BI_MONTHLY, name: PeriodTypeEnum.BI_MONTHLY, rank: 4 },
  { id: PeriodTypeEnum.QUARTERLY, name: PeriodTypeEnum.QUARTERLY, rank: 5 },
  { id: PeriodTypeEnum.SIX_MONTHLY, name: PeriodTypeEnum.SIX_MONTHLY, rank: 6 },
  {
    id: PeriodTypeEnum.SIX_MONTHLY_APRIL,
    name: PeriodTypeEnum.SIX_MONTHLY_APRIL,
    rank: 6,
  },
  {
    id: PeriodTypeEnum.SIX_MONTHLY_NOVEMBER,
    name: PeriodTypeEnum.SIX_MONTHLY_NOVEMBER,
    rank: 6,
  },
  { id: PeriodTypeEnum.YEARLY, name: PeriodTypeEnum.YEARLY, rank: 7 },
  {
    id: PeriodTypeEnum.FINANCIAL_APRIL,
    name: PeriodTypeEnum.FINANCIAL_APRIL,
    rank: 7,
  },
  {
    id: PeriodTypeEnum.FINANCIAL_JULY,
    name: PeriodTypeEnum.FINANCIAL_JULY,
    rank: 7,
  },
  {
    id: PeriodTypeEnum.FINANCIAL_OCTOBER,
    name: PeriodTypeEnum.FINANCIAL_OCTOBER,
    rank: 7,
  },
  {
    id: PeriodTypeEnum.FINANCIAL_NOVEMBER,
    name: PeriodTypeEnum.FINANCIAL_NOVEMBER,
    rank: 7,
  },
  {
    id: PeriodTypeEnum.RELATIVE_WEEK,
    name: PeriodTypeEnum.RELATIVE_WEEK,
    rank: 2,
  },
  {
    id: PeriodTypeEnum.RELATIVE_MONTH,
    name: PeriodTypeEnum.RELATIVE_MONTH,
    rank: 3,
  },
  {
    id: PeriodTypeEnum.RELATIVE_BI_MONTH,
    name: PeriodTypeEnum.RELATIVE_BI_MONTH,
    rank: 3,
  },
  {
    id: PeriodTypeEnum.RELATIVE_SIX_MONTH,
    name: PeriodTypeEnum.RELATIVE_SIX_MONTH,
    rank: 6,
  },
  {
    id: PeriodTypeEnum.RELATIVE_QUARTER,
    name: PeriodTypeEnum.RELATIVE_QUARTER,
    rank: 5,
  },
  {
    id: PeriodTypeEnum.RELATIVE_YEAR,
    name: PeriodTypeEnum.RELATIVE_YEAR,
    rank: 7,
  },
  {
    id: PeriodTypeEnum.RELATIVE_FINANCIAL_YEAR,
    name: PeriodTypeEnum.RELATIVE_FINANCIAL_YEAR,
    rank: 7,
  },
];
