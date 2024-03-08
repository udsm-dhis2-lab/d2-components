import { DownloadFormat } from './download-format.model';
import { VisualizationType } from './visualization-type.model';
export interface VisualizationDownloadOption {
  label: string;
  icon: string;
  format: DownloadFormat;
  allowedVisualizations: VisualizationType[];
}
export const VISUALIZATION_DOWNLOAD_OPTIONS: VisualizationDownloadOption[] = [
  {
    label: 'Download in PNG',
    icon: '',
    format: 'PNG',
    allowedVisualizations: [
      'COLUMN',
      'AREA',
      'BAR',
      'DOTTED',
      'LINE',
      'PIE',
      'SOLIDGAUGE',
      'STACKED_BAR',
      'STACKED_COLUMN',
    ],
  },
  {
    label: 'Download data in CSV',
    icon: '',
    format: 'CSV',
    allowedVisualizations: [
      'PIVOT_TABLE',
      'COLUMN',
      'AREA',
      'BAR',
      'DOTTED',
      'LINE',
      'PIE',
      'SOLIDGAUGE',
      'STACKED_BAR',
      'STACKED_COLUMN',
    ],
  },
  {
    label: 'Download data in XLS',
    icon: '',
    format: 'XLS',
    allowedVisualizations: ['PIVOT_TABLE'],
  },
];
export class VisualizationDownloadOptionUtil {
  static get(
    visualizationType: VisualizationType
  ): VisualizationDownloadOption[] {
    return VISUALIZATION_DOWNLOAD_OPTIONS.filter(
      (visualizationDownloadOption) =>
        visualizationDownloadOption.allowedVisualizations.includes(
          visualizationType
        )
    );
  }
}
