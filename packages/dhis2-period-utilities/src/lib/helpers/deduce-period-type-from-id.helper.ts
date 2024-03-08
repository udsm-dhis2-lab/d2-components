import { PeriodTypeEnum } from '../constants/period-types.constant';

export function deducePeriodTypeFromId(periodId: string): string {
  let periodType: string;

  const numberLikePeriod = parseInt(periodId, 10);
  if (!isNaN(numberLikePeriod)) {
    if (periodId.length === 4) {
      periodType = PeriodTypeEnum.YEARLY;
    } else if (periodId.indexOf('B') !== -1) {
      periodType = PeriodTypeEnum.BI_MONTHLY;
    } else if (periodId.indexOf('Q') !== -1) {
      periodType = PeriodTypeEnum.QUARTERLY;
    } else if (periodId.indexOf('AprilS') !== -1) {
      periodType = PeriodTypeEnum.SIX_MONTHLY_APRIL;
    } else if (periodId.indexOf('April') !== -1) {
      periodType = PeriodTypeEnum.FINANCIAL_APRIL;
    } else if (periodId.indexOf('NovS') !== -1) {
      periodType = PeriodTypeEnum.SIX_MONTHLY_NOVEMBER;
    } else if (periodId.indexOf('S') !== -1) {
      periodType = PeriodTypeEnum.SIX_MONTHLY;
    } else if (periodId.indexOf('July') !== -1) {
      periodType = PeriodTypeEnum.FINANCIAL_JULY;
    } else if (periodId.indexOf('Oct') !== -1) {
      periodType = PeriodTypeEnum.FINANCIAL_OCTOBER;
    } else if (periodId.indexOf('Nov') !== -1) {
      periodType = PeriodTypeEnum.FINANCIAL_NOVEMBER;
    } else if (!isNaN(parseInt(periodId.slice(5), 10))) {
      periodType = PeriodTypeEnum.MONTHLY;
    }
  } else {
    if (periodId.indexOf('QUARTER') !== -1) {
      periodType = PeriodTypeEnum.RELATIVE_QUARTER;
    } else if (periodId.indexOf('WEEK') !== -1) {
      periodType = PeriodTypeEnum.RELATIVE_WEEK;
    } else if (periodId.indexOf('MONTH') !== -1) {
      if (periodId.indexOf('BIMONTH') !== -1) {
        periodType = PeriodTypeEnum.RELATIVE_BI_MONTH;
      } else if (periodId.indexOf('SIX_MONTH') !== -1) {
        periodType = PeriodTypeEnum.RELATIVE_SIX_MONTH;
      } else {
        periodType = PeriodTypeEnum.RELATIVE_MONTH;
      }
    } else if (periodId.indexOf('YEAR') !== -1) {
      if (periodId.indexOf('FINANCIAL_YEAR') !== -1) {
        periodType = PeriodTypeEnum.RELATIVE_FINANCIAL_YEAR;
      } else {
        periodType = PeriodTypeEnum.RELATIVE_YEAR;
      }
    }
  }

  return periodType!;
}
