//export type AttributeOperator = 'EQ' | 'GT' | 'LT' | 'LIKE';

export interface AttributeFilter {
  attribute: string; 
  operator: string; 
  value: string | number; 
}

export interface AttributeFilterGroup {
  logic: 'AND' | 'OR'; 
  filters: AttributeFilter[]; 
}
