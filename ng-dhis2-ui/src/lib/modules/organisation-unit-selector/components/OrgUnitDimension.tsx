import { useDataEngine } from '@dhis2/app-runtime';
import i18n from '@dhis2/d2-i18n';
import {
  Button,
  Checkbox,
  colors,
  IconWarningFilled16,
  MultiSelect,
  MultiSelectOption,
  OrganisationUnitTree,
} from '@dhis2/ui';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { DIMENSION_ID_ORGUNIT, formatList } from '../../../shared';
import {
  ouIdHelper,
  USER_ORG_UNIT,
  USER_ORG_UNIT_CHILDREN,
  USER_ORG_UNIT_GRANDCHILDREN,
} from '../components';
import { styles } from './styles/OrgUnitDimension.style';

const DYNAMIC_ORG_UNITS = [
  USER_ORG_UNIT,
  USER_ORG_UNIT_CHILDREN,
  USER_ORG_UNIT_GRANDCHILDREN,
];

const OrgUnitDimension = ({
  roots,
  selected,
  onSelect,
  hideGroupSelect,
  hideLevelSelect,
  hideUserOrgUnits,
  warning,
  orgUnitGroupPromise,
  orgUnitLevelPromise,
}: any) => {
  const [ouLevels, setOuLevels] = useState([]);
  const [ouGroups, setOuGroups] = useState([]);
  const [selectedItems, setSelectedItems] = useState(selected);
  const dataEngine = useDataEngine();

  const onSelectItems = (selectedItem: any) => {
    const { id, checked, displayName, path } = selectedItem;
    let result = [...selectedItems];

    console.log(DYNAMIC_ORG_UNITS);

    if (checked && DYNAMIC_ORG_UNITS.includes(id)) {
      result = [
        ...result.filter((item) => DYNAMIC_ORG_UNITS.includes(item.id)),
        { id, displayName },
      ];
    } else if (checked) {
      result.push({ id, path, name: displayName });
    } else {
      result = [...result.filter((item) => item.id !== id)];
    }

    setSelectedItems(result as any);

    onSelect({
      dimensionId: DIMENSION_ID_ORGUNIT,
      items: result,
    });
  };

  const clearSelection = () => {
    setSelectedItems([]);
    onSelect({
      dimensionId: DIMENSION_ID_ORGUNIT,
      items: [],
    });
  };

  useEffect(() => {
    const doFetchOuLevels = async () => {
      const result = await orgUnitLevelPromise;
      result.sort((a: any, b: any) => (a.level > b.level ? 1 : -1));
      setOuLevels(result);
    };
    const doFetchOuGroups = async () => {
      const result = await orgUnitGroupPromise;
      setOuGroups(result);
    };

    !hideLevelSelect && doFetchOuLevels();
    !hideGroupSelect && doFetchOuGroups();
  }, [dataEngine, hideLevelSelect, hideGroupSelect]);

  const onLevelChange = (ids: string[]) => {
    const items = ids.map((id: string) => ({
      id: ouIdHelper.addLevelPrefix(id),
      name: (ouLevels?.find((level: any) => level.id === id) as any)
        ?.displayName,
    }));

    setSelectedItems([
      ...selectedItems.filter((ou: any) => !ouIdHelper.hasLevelPrefix(ou.id)),
      ...items,
    ]);

    onSelect({
      dimensionId: DIMENSION_ID_ORGUNIT,
      items: selectedItems,
    });
  };

  const onGroupChange = (ids: string[]) => {
    const items = ids.map((id: string) => ({
      id: ouIdHelper.addGroupPrefix(id),
      name: ((ouGroups?.find((group: any) => group.id === id) || {}) as any)
        .displayName,
    }));

    setSelectedItems([
      ...selectedItems.filter((ou: any) => !ouIdHelper.hasGroupPrefix(ou.id)),
      ...items,
    ]);

    onSelect({
      dimensionId: DIMENSION_ID_ORGUNIT,
      items: selectedItems,
    });
  };

  const getSummary = () => {
    let summary;
    if (selectedItems.length) {
      const numberOfOrgUnits = selectedItems.filter(
        (item: any) =>
          !DYNAMIC_ORG_UNITS.includes(item.id) &&
          !ouIdHelper.hasLevelPrefix(item.id) &&
          !ouIdHelper.hasGroupPrefix(item.id)
      ).length;

      const numberOfLevels = selectedItems.filter((item: any) =>
        ouIdHelper.hasLevelPrefix(item.id)
      ).length;
      const numberOfGroups = selectedItems.filter((item: any) =>
        ouIdHelper.hasGroupPrefix(item.id)
      ).length;
      const userOrgUnits = selectedItems.filter((item: any) =>
        DYNAMIC_ORG_UNITS.includes(item.id)
      );

      const parts = [];

      if (numberOfOrgUnits) {
        parts.push(
          i18n.t('{{count}} org units', {
            count: numberOfOrgUnits,
            defaultValue: '{{count}} org unit',
            defaultValue_plural: '{{count}} org units',
          })
        );
      }
      if (numberOfLevels) {
        parts.push(
          i18n.t('{{count}} levels', {
            count: numberOfLevels,
            defaultValue: '{{count}} level',
            defaultValue_plural: '{{count}} levels',
          })
        );
      }
      if (numberOfGroups) {
        parts.push(
          i18n.t('{{count}} groups', {
            count: numberOfGroups,
            defaultValue: '{{count}} group',
            defaultValue_plural: '{{count}} groups',
          })
        );
      }
      userOrgUnits.forEach((orgUnit: any) => {
        parts.push(orgUnit.name || orgUnit.displayName);
      });
      summary = i18n.t('Selected: {{commaSeparatedListOfOrganisationUnits}}', {
        keySeparator: '>',
        nsSeparator: '|',
        commaSeparatedListOfOrganisationUnits: formatList(parts),
      });
    } else {
      summary = i18n.t('Nothing selected');
    }

    return summary;
  };

  return (
    <div className="container">
      {!hideUserOrgUnits && (
        <div className="userOrgUnitsWrapper">
          <Checkbox
            label={i18n.t('User organisation unit')}
            checked={selectedItems.some(
              (item: any) => item.id === USER_ORG_UNIT
            )}
            onChange={({ checked }: any) =>
              onSelectItems({
                id: USER_ORG_UNIT,
                checked,
                displayName: i18n.t('User organisation unit'),
              })
            }
            dense
          />
          <Checkbox
            label={i18n.t('User sub-units')}
            checked={selectedItems.some(
              (item: any) => item.id === USER_ORG_UNIT_CHILDREN
            )}
            onChange={({ checked }: any) =>
              onSelectItems({
                id: USER_ORG_UNIT_CHILDREN,
                checked,
                displayName: i18n.t('User sub-units'),
              })
            }
            dense
          />
          <Checkbox
            label={i18n.t('User sub-x2-units')}
            checked={selectedItems.some(
              (item: any) => item.id === USER_ORG_UNIT_GRANDCHILDREN
            )}
            onChange={({ checked }: any) =>
              onSelectItems({
                id: USER_ORG_UNIT_GRANDCHILDREN,
                checked,
                displayName: i18n.t('User sub-x2-units'),
              })
            }
            dense
          />
        </div>
      )}
      <div
        className={cx('orgUnitTreeWrapper', {
          disabled: selectedItems.some((item: any) =>
            DYNAMIC_ORG_UNITS.includes(item.id)
          ),
        })}
      >
        <OrganisationUnitTree
          roots={roots}
          initiallyExpanded={[
            ...(roots.length === 1 ? [`/${roots[0]}`] : []),
            ...selectedItems
              .filter(
                (item: any) =>
                  !DYNAMIC_ORG_UNITS.includes(item.id) &&
                  !ouIdHelper.hasLevelPrefix(item.id) &&
                  !ouIdHelper.hasGroupPrefix(item.id)
              )
              .map((item: any) =>
                item.path.substring(0, item.path.lastIndexOf('/'))
              )
              .filter((path: any) => path),
          ]}
          selected={selectedItems
            .filter(
              (item: any) =>
                !DYNAMIC_ORG_UNITS.includes(item.id) &&
                !ouIdHelper.hasLevelPrefix(item.id) &&
                !ouIdHelper.hasGroupPrefix(item.id)
            )
            .map((item: any) => item.path)}
          onChange={onSelectItems}
          dataTest={'org-unit-tree'}
        />
      </div>
      <div
        className={cx('selectsWrapper', {
          disabled: selectedItems.some((item: any) =>
            DYNAMIC_ORG_UNITS.includes(item.id)
          ),
          hidden: hideLevelSelect && hideGroupSelect,
        })}
      >
        {!hideLevelSelect && (
          <MultiSelect
            selected={
              ouLevels.length
                ? selectedItems
                    .filter((item: any) => ouIdHelper.hasLevelPrefix(item.id))
                    .map((item: any) => ouIdHelper.removePrefix(item.id))
                : []
            }
            onChange={({ selected }: any) => onLevelChange(selected)}
            placeholder={i18n.t('Select a level')}
            loading={!ouLevels.length}
            dense
            dataTest={'org-unit-level-select'}
          >
            {ouLevels.map((level: any) => (
              <MultiSelectOption
                key={level.id}
                value={level.id}
                label={level.displayName}
                dataTest={`org-unit-level-select-option-${level.id}`}
              />
            ))}
          </MultiSelect>
        )}
        {!hideGroupSelect && (
          <MultiSelect
            selected={
              ouGroups.length
                ? selectedItems
                    .filter((item: any) => ouIdHelper.hasGroupPrefix(item.id))
                    .map((item: any) => ouIdHelper.removePrefix(item.id))
                : []
            }
            onChange={({ selected }: any) => onGroupChange(selected)}
            placeholder={i18n.t('Select a group')}
            loading={!ouGroups.length}
            dense
            dataTest={'org-unit-group-select'}
          >
            {ouGroups.map((group: any) => (
              <MultiSelectOption
                key={group.id}
                value={group.id}
                label={group.displayName}
                dataTest={`org-unit-group-select-option-${group.id}`}
              />
            ))}
          </MultiSelect>
        )}
      </div>
      <div className="summaryWrapper">
        {warning ? (
          <div className="warningWrapper">
            <IconWarningFilled16 color={colors.red500} />
            <span className="warningText">{warning}</span>
          </div>
        ) : (
          <span className="summaryText">{getSummary()}</span>
        )}
        <div className="deselectButton">
          <Button
            secondary
            small
            onClick={clearSelection}
            disabled={!selectedItems.length}
          >
            {i18n.t('Deselect all')}
          </Button>
        </div>
      </div>
      <style jsx>{styles}</style>
    </div>
  );
};

OrgUnitDimension.defaultProps = {
  hideGroupSelect: false,
  hideLevelSelect: false,
  hideUserOrgUnits: false,
};

OrgUnitDimension.propTypes = {
  hideGroupSelect: PropTypes.bool,
  hideLevelSelect: PropTypes.bool,
  hideUserOrgUnits: PropTypes.bool,
  roots: PropTypes.arrayOf(PropTypes.string),
  selected: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
    })
  ),
  warning: PropTypes.string,
  onSelect: PropTypes.func,
  orgUnitGroupPromise: PropTypes.any,
  orgUnitLevelPromise: PropTypes.any,
};

export default OrgUnitDimension;
