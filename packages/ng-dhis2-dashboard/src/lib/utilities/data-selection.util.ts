import { Period } from '@iapps/period-utilities';
import { DashboardSelectionConfig } from '../models';

export class DataSelectionUtil {
  static getStartUpSelections(selectionConfig: DashboardSelectionConfig) {
    if (!selectionConfig?.allowSelectionOnStartUp) {
      return [];
    }

    const periodInstance = (new Period()
      .setType(selectionConfig.startUpPeriodType)
      .setPreferences({
        openFuturePeriods:
          selectionConfig?.periodConfig?.openFuturePeriods || 0,
      })
      .get()
      .list() || [])[0];

    return [
      {
        dimension: 'pe',
        items: [periodInstance],
      },
    ];
  }
}
