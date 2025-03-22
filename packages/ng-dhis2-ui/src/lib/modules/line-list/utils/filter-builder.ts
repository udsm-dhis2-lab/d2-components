import { AttributeFilter } from '../models/attribute-filter.model';
import { FilterConfig } from '../models/filter-config.model';
import { Enrollment, TrackedEntityInstance } from '../models/line-list.models';

// export function buildFilters(filters: AttributeFilter[]): string {
//   return filters
//     .map(({ attribute, operator, value }) => `filter=${attribute}:${operator}:${value}`)
//     .join('&');
// }

export function buildFilters(filters: AttributeFilter[]): string {
  return filters
    .map(({ attribute, dataElement, operator, value }) => {
      // Check if attribute is defined, otherwise use dataElement
      const field = attribute || dataElement;
      return field ? `filter=${field}:${operator}:${value}` : '';
    })
    .filter(Boolean) // Remove any empty strings
    .join('&');
}

const matchesCondition = (
  eventValue: string | number,
  operator: string,
  filterValue: string | number
): boolean => {
  if (typeof eventValue === 'number' && typeof filterValue === 'number') {
      switch (operator) {
          case '=':
              return eventValue === filterValue;
          case '!=':
              return eventValue !== filterValue;
          case '>':
              return eventValue > filterValue;
          case '<':
              return eventValue < filterValue;
          case '>=':
              return eventValue >= filterValue;
          case '<=':
              return eventValue <= filterValue;
          default:
              return false;
      }
  }

  const strEventValue = String(eventValue);
  const strFilterValue = String(filterValue);

  switch (operator) {
      case '=':
          return strEventValue === strFilterValue;
      case '!=':
          return strEventValue !== strFilterValue;
      case 'contains':
          return strEventValue.includes(strFilterValue);
      case 'startsWith':
          return strEventValue.startsWith(strFilterValue);
      case 'endsWith':
          return strEventValue.endsWith(strFilterValue);
      case 'regex':
          return new RegExp(strFilterValue).test(strEventValue);
      default:
          return false;
  }
};

//w.v impl
// export const getFilteredTrackedEntityInstances = (
//   trackedEntityInstance: TrackedEntityInstance[],
//   filters: FilterConfig[]
// ): TrackedEntityInstance[] => {
//   return trackedEntityInstance.filter(
//       (trackedEntityInstance: TrackedEntityInstance) =>
//           trackedEntityInstance.enrollments.some((enrollment) =>
//               enrollment.events.some((event) =>
//                   filters.every(
//                       (filter) =>
//                           event.programStage === filter.programStage &&
//                           event.dataValues.some(
//                               (dataValue) =>
//                                   dataValue.dataElement === filter.dataElement &&
//                                   matchesCondition(
//                                       dataValue.value,
//                                       filter.operator,
//                                       filter.value
//                                   )
//                           )
//                   )
//               )
//           )
//   );
// };


export const getFilteredTrackedEntityInstances = (
    trackedEntityInstances: TrackedEntityInstance[],
    filters: FilterConfig[]
  ): TrackedEntityInstance[] => {
    if (!filters.length) return trackedEntityInstances;
  
    return trackedEntityInstances.filter((tei) =>
      filters.every((filter) =>
        tei.enrollments?.some((enrollment) =>
          enrollment.events?.some(
            (event) =>
              event.programStage === filter.programStage &&
              event.dataValues?.some(
                (dataValue) =>
                  dataValue.dataElement === filter.dataElement &&
                  matchesCondition(dataValue.value, filter.operator, filter.value)
              )
          )
        )
      )
    );
  };

export const getFilteredEnrollments = (
  enrollments: Enrollment[], 
  filters: FilterConfig[]
): Enrollment[] => {
  if (!filters.length) return enrollments;

  return enrollments.filter((enrollment) =>
    filters.every((filter) =>
      enrollment.events?.some(
        (event) =>
          event.programStage === filter.programStage &&
          event.dataValues?.some(
            (dataValue) =>
              dataValue.dataElement === filter.dataElement &&
              matchesCondition(dataValue.value, filter.operator, filter.value)
          )
      )
    )
  );
};
