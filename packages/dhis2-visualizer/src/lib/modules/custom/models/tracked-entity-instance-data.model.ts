import { flatten } from 'lodash';
import { TrackedEntityFilterUtil } from '../../../shared/utilities';
export class TrackedEntityInstanceData {
  private _attributes;
  constructor(private trackedEntityInstances: any[]) {
    this._attributes = this.getAttributes(trackedEntityInstances);
  }

  private getAttributes(trackedEntityInstances: any[]): any[] {
    return flatten(
      trackedEntityInstances.map(
        (trackedEntityInstance) => trackedEntityInstance.attributes
      )
    );
  }

  getEnrollmentCount(filter?: string): number {
    return (
      filter
        ? TrackedEntityFilterUtil.filterTrackedEntityInstancesByExpression(
            this.trackedEntityInstances,
            filter
          )
        : this.trackedEntityInstances || []
    ).reduce(
      (totalCount: number, trackerEntityInstance) =>
        totalCount + trackerEntityInstance.enrollments?.length,
      0
    );
  }

  getPercent(dataVariable: string, customFilter?: string) {
    const percentageVariable = dataVariable
      ?.replace(/(^PERCENT<)|(>$)/g, '')
      ?.replace(/\s/g, '');
    const numeratorVariable = (percentageVariable?.match(
      /(COUNT|SUM)<.+?(?=,COUNT|SUM)/g
    ) || [])[0];
    const denominatorVariable = (percentageVariable?.match(
      /(?=,COUNT|SUM).*/g
    ) || [])[0]?.substring(1);

    const numerator = this.getExpressionData(
      numeratorVariable as string,
      customFilter
    );
    const denominator = this.getExpressionData(
      denominatorVariable as string,
      customFilter
    );

    if (denominator === 0) {
      return 0;
    }
    return parseFloat(((numerator / denominator) * 100).toFixed(1));
  }

  getCount(dataVariable: string, customFilter?: string) {
    const splitedVariables = dataVariable
      .replace(/(^COUNT<)|(>$)/g, '')
      .split(',');

    switch (splitedVariables[0]) {
      case 'enrollment': {
        const enrollmentCountFilter = customFilter
          ? splitedVariables[1]
            ? splitedVariables[1] + '&&' + customFilter
            : customFilter
          : splitedVariables[1];
        return this.getEnrollmentCount(enrollmentCountFilter);
      }

      default:
        return 0;
    }
  }

  getExpressionData(dataVariable: string, customFilter?: string): number {
    /**
     * PERCENT EXPRESSION
     */
    if (dataVariable?.indexOf('PERCENT') === 0) {
      return this.getPercent(dataVariable, customFilter);
    }

    /**
     * COUNT EXPRESSION
     */
    if (dataVariable?.indexOf('COUNT') === 0) {
      return this.getCount(dataVariable, customFilter);
    }

    switch (dataVariable) {
      case 'COUNT<enrollment>': {
        const enrollmentCountFilter = customFilter
          ? dataVariable
            ? dataVariable + '&&' + customFilter
            : customFilter
          : dataVariable;
        return this.getEnrollmentCount(enrollmentCountFilter);
      }
      default:
        return 0;
    }
  }
}
