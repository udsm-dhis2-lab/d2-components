import {
  DIMENSION_ID_ORGUNIT,
  dimensionGetItems,
  layoutGetDimension,
  layoutReplaceDimension,
} from '../../../../../shared';

import { ouIdHelper } from '../ouIdHelper';

const isOuLevelIntId = (id: string) =>
  ouIdHelper.hasLevelPrefix(id)
    ? Number.isInteger(parseInt(ouIdHelper.removePrefix(id), 10))
    : false;

const replaceNumericOuLevelWithUid = (ouLevels: any) => (item: any) => {
  if (!isOuLevelIntId(item.id)) {
    return item;
  }

  const ouIntId = parseInt(ouIdHelper.removePrefix(item.id), 10);
  const ouUid = ouLevels.find(
    (l: any) => parseInt(l.level, 10) === ouIntId
  )?.id;

  return ouUid
    ? Object.assign({}, item, { id: ouIdHelper.addLevelPrefix(ouUid) })
    : item;
};

export const convertOuLevelsToUids = (ouLevels: any, layout: any) => {
  const ouDimension = layoutGetDimension(layout, DIMENSION_ID_ORGUNIT);

  const hasNumericOuLevels =
    ouDimension &&
    dimensionGetItems(ouDimension).some((item: any) => isOuLevelIntId(item.id));

  if (hasNumericOuLevels) {
    const replaceNumericOuLevel = replaceNumericOuLevelWithUid(ouLevels);

    const updatedOuItems = dimensionGetItems(ouDimension).map(
      replaceNumericOuLevel
    );

    return layoutReplaceDimension(layout, DIMENSION_ID_ORGUNIT, updatedOuItems);
  }

  return layout;
};
