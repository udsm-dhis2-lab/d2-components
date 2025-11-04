import { ChartAxisStyle } from './chart-axis-title.model';

export interface ChartAxisLabelStyle extends ChartAxisStyle {
  wordBreak: string;
  textAlign: string;
  textOverflow: string;
}
export class ChartAxisLabel {
  y = 10;
  rotation!: number;
  useHTML = true;
  allowOverlap = true;
  format?: string;
  style: ChartAxisLabelStyle;

  constructor(config: any) {
    this.format = this.#getFormat(config);
    this.style = this.#getStyle(config);
  }

  #getFormat(config: any) {
    const allowDecimals = config?.decimals !== undefined;

    return allowDecimals ? `{value:.${config.decimals ?? 1}f}` : undefined;
  }

  #getStyle(config: any): ChartAxisLabelStyle {
    return {
      color: config?.title?.fontStyle?.textColor || '#000000',
      fontWeight: config?.label?.fontStyle?.bold ? 'bold' : 'normal',
      fontSize: config?.label?.fontStyle?.fontSize || '11px',
      wordBreak: 'break-all',
      textAlign: 'center',
      textOverflow: 'allow',
    };
  }
}
