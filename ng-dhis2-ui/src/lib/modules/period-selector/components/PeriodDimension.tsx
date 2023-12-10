import { useDataQuery } from '@dhis2/app-runtime';
import PropTypes from 'prop-types';
import React from 'react';
import { DIMENSION_ID_PERIOD } from '../../../shared/utils/predefinedDimensions';
import PeriodTransfer from './PeriodTransfer';

const userSettingsQuery = {
  userSettings: {
    resource: 'userSettings',
    params: {
      key: ['keyUiLocale'],
    },
  },
};

export const PeriodDimension = ({
  onSelect,
  selectedPeriods,
  rightFooter,
  excludedPeriodTypes,
  systemInfo,
}: any) => {
  const result = useDataQuery(userSettingsQuery);

  const { calendar = 'gregory' } = systemInfo as any;
  // const { data: { userSettings: { keyUiLocale: locale } = {} } = {} } =
  //   result as any;

  const locale =
    result.data && result.data['userSettings']
      ? (result.data['userSettings'] as any)['keyUiLocale']
      : '';

  const periodsSettings = { calendar, locale };

  const selectPeriods = (periods: any[]) => {
    onSelect({
      dimensionId: DIMENSION_ID_PERIOD,
      items: periods,
    });
  };
  return (
    <PeriodTransfer
      onSelect={selectPeriods}
      initialSelectedPeriods={selectedPeriods}
      rightFooter={rightFooter}
      dataTest={'period-dimension'}
      excludedPeriodTypes={excludedPeriodTypes}
      periodsSettings={periodsSettings}
    />
  );
};

PeriodDimension.propTypes = {
  onSelect: PropTypes.func.isRequired,
  excludedPeriodTypes: PropTypes.arrayOf(PropTypes.string),
  rightFooter: PropTypes.node,
  selectedPeriods: PropTypes.array,
  systemInfo: PropTypes.object,
};

PeriodDimension.defaultProps = {
  selectedPeriods: [],
};
