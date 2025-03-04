import { AttributeFilter } from '../models/attribute-filter.model';

export function buildFilters(filters: AttributeFilter[]): string {
  return filters
    .map(({ attribute, operator, value }) => `filter=${attribute}:${operator}:${value}`)
    .join('&');
}
