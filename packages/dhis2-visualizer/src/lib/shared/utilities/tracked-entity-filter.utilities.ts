import { flatten } from 'lodash';
export class TrackedEntityFilterUtil {
  static filterTrackedEntityInstancesByExpression(
    trackedEntityInstances: any[],
    filter: string
  ) {
    return (trackedEntityInstances || []).filter((trackedEntityInstance) => {
      const isAttributeFilter = filter?.match(/A<[a-zA-Z0-9]{11}>/g)?.length;
      return isAttributeFilter
        ? TrackedEntityFilterUtil.evaluateAttributeFilterExpression(
            filter,
            trackedEntityInstance.attributes
          )
        : TrackedEntityFilterUtil.evaluateDataElementFilterExpression(
            filter,
            trackedEntityInstance.enrollments
          );
    });
  }

  static evaluateAttributeFilterExpression(filter: string, attributes: any[]) {
    let result = false;
    try {
      let newFilter = filter;
      const attributeVariables = filter?.match(/A<[a-zA-Z0-9]{11}>/g);

      attributeVariables?.forEach((attributeVariable) => {
        const attributeId = attributeVariable?.match(/\<([^{^)]+)>/g)?.join();

        const availableAttributeValue = (attributes || []).find(
          (attribute: any) => `<${attribute.attribute}>` === attributeId
        );

        if (availableAttributeValue) {
          newFilter = newFilter?.replace(
            new RegExp(attributeVariable, 'g'),
            `'${availableAttributeValue.value}'`
          );
        }
      });

      result = Function('return ' + newFilter)();
    } catch (e) {
      console.warn('FILTER ERROR::', e);
    }

    return result;
  }

  static evaluateDataElementFilterExpression(
    filter: string,
    enrollments: any[]
  ) {
    let result = false;
    try {
      let newFilter = filter;
      const dataElementVariables = filter?.match(/D<[a-zA-Z0-9]{11}>/g);

      const dataValues = flatten(
        flatten(
          enrollments.map((enrollment) =>
            enrollment.events.map((event: any) => event.dataValues)
          )
        )
      );

      dataElementVariables?.forEach((dataElementVariable) => {
        const dataElementId = dataElementVariable
          ?.match(/\<([^{^)]+)>/g)
          ?.join();

        const availableDataElementValue = (dataValues || []).find(
          (dataValue: any) => `<${dataValue.dataElement}>` === dataElementId
        );

        if (availableDataElementValue) {
          newFilter = newFilter?.replace(
            new RegExp(dataElementVariable, 'g'),
            `'${availableDataElementValue.value}'`
          );
        }
      });

      result = Function('return ' + newFilter)();
    } catch (e) {
      console.warn('FILTER ERROR::', e);
    }

    return result;
  }
}
