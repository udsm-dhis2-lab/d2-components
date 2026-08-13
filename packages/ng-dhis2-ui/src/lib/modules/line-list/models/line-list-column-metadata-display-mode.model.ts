export enum LineListColumnMetadataDisplayMode {
  ALL_ATTRIBUTES = 'ALL_ATTRIBUTES',
  ALL_ATTRIBUTES_AND_DATA_ELEMENTS = 'ALL_ATTRIBUTES_AND_DATA_ELEMENTS',
}

export type LineListColumnMetadataDisplayModeValue =
  | LineListColumnMetadataDisplayMode
  | 'ALL_ATTRIBUTES'
  | 'ALL_ATTRIBUTES_AND_DATA_ELEMENTS';
