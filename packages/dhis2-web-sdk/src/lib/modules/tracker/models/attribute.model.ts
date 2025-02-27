export interface Attribute {
  lastUpdated?: string;
  storedBy?: string;
  code?: string;
  displayName?: string;
  created?: string;
  valueType?: string;
  attribute: string;
  value: any;
}

export interface AttributeEntity {
  [attribute: string]: Attribute;
}

export interface AttributeValueEntity {
  [attribute: string]: string | number;
}
