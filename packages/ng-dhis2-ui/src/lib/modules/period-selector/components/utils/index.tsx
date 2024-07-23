export const filterPeriodTypesById = (
  allPeriodTypes = [],
  excludedPeriodTypes = []
) =>
  allPeriodTypes.filter(
    (period: unknown) => !excludedPeriodTypes.includes((period as never)['id'])
  );

export * from './relativePeriods';
export * from './fixedPeriods';
export * from './periodTypes';
