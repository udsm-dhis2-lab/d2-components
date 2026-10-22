import { DownloadFormat } from '../models/download-format.model';
import { VisualizationType } from '../models/visualization-type.model';

export interface VisualizationTarget {
  id: string;
  element?: HTMLElement;
}

export interface VisualizationRendererConfiguration {
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  options?: Readonly<Record<string, unknown>>;
}

export interface VisualizationRequest<
  TConfiguration = VisualizationRendererConfiguration,
  TData = unknown
> {
  type: VisualizationType;
  target: VisualizationTarget;
  configuration: TConfiguration;
  data?: TData;
}

export interface VisualizationDownloadRequest {
  format: DownloadFormat;
  filename?: string;
}

export interface VisualizationDownloadResult {
  filename: string;
  format: DownloadFormat;
}

export interface VisualizationRenderer<TRequest = VisualizationRequest> {
  render(request: TRequest): Promise<void> | void;
  resize?(): Promise<void> | void;
  download?(
    request: VisualizationDownloadRequest
  ):
    | Promise<VisualizationDownloadResult | void>
    | VisualizationDownloadResult
    | void;
  dispose(): Promise<void> | void;
}

export type VisualizationIssueCode =
  | 'INVALID_CONFIGURATION'
  | 'MISSING_DATA'
  | 'RENDER_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'UNSUPPORTED_VISUALIZATION';

export interface VisualizationIssue {
  code: VisualizationIssueCode;
  message: string;
  details?: Readonly<Record<string, unknown>>;
  cause?: unknown;
}

export interface VisualizationWarning extends VisualizationIssue {
  severity: 'warning';
}

export interface VisualizationFailure extends VisualizationIssue {
  severity: 'error';
}

export interface VisualizationResult {
  warnings: readonly VisualizationWarning[];
  error?: VisualizationFailure;
}
