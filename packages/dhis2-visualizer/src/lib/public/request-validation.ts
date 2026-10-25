import {
  SupportedVisualizationType,
  VisualizationRequest,
} from './visualization-request';

export type VisualizationRequestIssueCode =
  | 'INVALID_REQUEST'
  | 'UNSUPPORTED_VISUALIZATION'
  | 'INVALID_TARGET'
  | 'INVALID_CONFIGURATION'
  | 'INVALID_SELECTIONS'
  | 'MISSING_TRACKER_DATA'
  | 'INVALID_PROVIDER_CONFIGURATION';

export class VisualizationRequestValidationError extends Error {
  constructor(
    public readonly code: VisualizationRequestIssueCode,
    message: string,
    public readonly path?: string
  ) {
    super(message);
    this.name = 'VisualizationRequestValidationError';
  }
}

const supportedTypes: readonly SupportedVisualizationType[] = [
  'CHART','COLUMN','LINE','BAR','DOTTED','PIE','STACKED_COLUMN','STACKED_BAR',
  'AREA','RADAR','SOLIDGAUGE','YEAR_OVER_YEAR_LINE','REPORT_TABLE',
  'PIVOT_TABLE','SINGLE_VALUE','MAP','CUSTOM','TRACKED_ENTITY_LAYER',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateVisualizationRequest(
  input: unknown
): VisualizationRequest {
  if (!isRecord(input))
    throw new VisualizationRequestValidationError('INVALID_REQUEST','Visualization request must be an object');
  if (typeof input['type'] !== 'string' || !supportedTypes.includes(input['type'] as SupportedVisualizationType))
    throw new VisualizationRequestValidationError('UNSUPPORTED_VISUALIZATION',`Unsupported visualization type: ${String(input['type'])}`,'type');
  const target=input['target'];
  if (!isRecord(target)||typeof target['id']!=='string'||!target['id'].trim())
    throw new VisualizationRequestValidationError('INVALID_TARGET','A non-empty target.id is required','target.id');
  if (!isRecord(input['configuration']))
    throw new VisualizationRequestValidationError('INVALID_CONFIGURATION','configuration must be an object','configuration');
  const selections=input['selections'];
  if (selections!==undefined&&(!Array.isArray(selections)||selections.some(selection=>!isRecord(selection)||typeof selection['dimension']!=='string'||!Array.isArray(selection['items']))))
    throw new VisualizationRequestValidationError('INVALID_SELECTIONS','selections must contain dimensions and item arrays','selections');
  if (input['type']==='TRACKED_ENTITY_LAYER') {
    if (!Array.isArray(input['trackedEntityInstances'])||!isRecord(input['program']))
      throw new VisualizationRequestValidationError('MISSING_TRACKER_DATA','Tracker maps require trackedEntityInstances and program');
    validateProvider(input['provider']);
  }
  if (input['type']==='MAP'&&input['provider']!==undefined) validateProvider(input['provider']);
  return input as unknown as VisualizationRequest;
}

function validateProvider(value: unknown): void {
  if (!isRecord(value)||(typeof value['style']!=='string'&&!isRecord(value['style'])))
    throw new VisualizationRequestValidationError('INVALID_PROVIDER_CONFIGURATION','provider.style must be a string or style object','provider.style');
  if (value['accessToken']!==undefined&&typeof value['accessToken']!=='string')
    throw new VisualizationRequestValidationError('INVALID_PROVIDER_CONFIGURATION','provider.accessToken must be a string','provider.accessToken');
}
