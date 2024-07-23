import i18n from '@dhis2/d2-i18n';
import {
  InputField,
  SingleSelectField,
  SingleSelectOption,
  spacers,
} from '@dhis2/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { filterPeriodTypesById, getFixedPeriodsOptions } from './utils';

const FixedPeriodFilter = ({
  allowedPeriodTypes,
  excludedPeriodTypes,
  currentPeriodType,
  currentYear,
  onSelectPeriodType,
  onSelectYear,
  dataTest,
}: any) => {
  const onlyAllowedTypeIsSelected =
    Array.isArray(allowedPeriodTypes) &&
    allowedPeriodTypes.length === 1 &&
    allowedPeriodTypes[0] === currentPeriodType;

  return (
    <>
      <div className="leftSection">
        <SingleSelectField
          label={i18n.t('Period type')}
          onChange={({ selected }: any) => onSelectPeriodType(selected)}
          dense
          selected={currentPeriodType}
          disabled={onlyAllowedTypeIsSelected}
          className="filterElement"
          dataTest={`${dataTest}-period-type`}
        >
          {(allowedPeriodTypes
            ? getFixedPeriodsOptions().filter((option: any) =>
                allowedPeriodTypes.some((type: any) => type === option.id)
              )
            : filterPeriodTypesById(
                getFixedPeriodsOptions() as any,
                excludedPeriodTypes
              )
          ).map((option) => (
            <SingleSelectOption
              key={option.id}
              value={option.id}
              label={option.name}
              dataTest={`${dataTest}-period-type-option-${option.id}`}
            />
          ))}
        </SingleSelectField>
      </div>
      <div className="rightSection">
        <InputField
          label={i18n.t('Year')}
          className="filterElement"
          type="number"
          placeholder={i18n.t('Select year')}
          value={currentYear}
          onChange={({ value }: any) => onSelectYear(value)}
          dense
          dataTest={`${dataTest}-year`}
        ></InputField>
      </div>
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
    </>
  );
};

FixedPeriodFilter.defaultProps = {
  excludedPeriodTypes: [],
};

FixedPeriodFilter.propTypes = {
  currentPeriodType: PropTypes.string.isRequired,
  currentYear: PropTypes.string.isRequired,
  onSelectPeriodType: PropTypes.func.isRequired,
  onSelectYear: PropTypes.func.isRequired,
  allowedPeriodTypes: PropTypes.arrayOf(PropTypes.string),
  dataTest: PropTypes.string,
  excludedPeriodTypes: PropTypes.arrayOf(PropTypes.string),
};

export default FixedPeriodFilter;
