import { SingleSelectField, SingleSelectOption } from '@dhis2/ui';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@dhis2/d2-i18n';
import { filterPeriodTypesById, getRelativePeriodsOptions } from './utils';
import { spacers } from '@dhis2/ui';

export const RelativePeriodFilter = ({
  currentFilter,
  onSelectFilter,
  dataTest,
  excludedPeriodTypes,
}: any) => (
  <div className="leftSection">
    <SingleSelectField
      label={i18n.t('Period type')}
      onChange={({ selected }: any) => onSelectFilter(selected)}
      dense
      selected={currentFilter}
      className="filterElement"
      dataTest={dataTest}
    >
      {filterPeriodTypesById(
        getRelativePeriodsOptions() as any,
        excludedPeriodTypes
      ).map((option: any) => (
        <SingleSelectOption
          key={option.id}
          value={option.id}
          label={option.name}
          dataTest={`${dataTest}-option-${option.id}`}
        />
      ))}
    </SingleSelectField>
    <style jsx>{`
      .leftSection {
        flex-grow: 1;
      }
      .leftSection > :global(.filterElement),
      .rightSection > :global(.filterElement) {
        margin: 0;
      }
      .rightSection {
        width: 120px;
        margin-left: ${spacers.dp8};
      }
    `}</style>
  </div>
);

RelativePeriodFilter.propTypes = {
  currentFilter: PropTypes.string.isRequired,
  onSelectFilter: PropTypes.func.isRequired,
  dataTest: PropTypes.string,
  excludedPeriodTypes: PropTypes.arrayOf(PropTypes.string),
};
