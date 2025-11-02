import { ChartAxisUtil } from '../utils';

export interface ChartXAxisStyle {
  color: string;
  fontWeight: string;
  fontStyle?: string;
  fontSize: string;
}

export interface ChartXAxisLabelStyle extends ChartXAxisStyle {
  wordBreak: string;
  textAlign: string;
  textOverflow: string;
}
export class ChartXAxisLabel {
  y = 10;
  rotation!: number;
  useHTML = true;
  allowOverlap = true;
  format?: string;
  style: ChartXAxisLabelStyle;

  constructor(config: any) {
    this.format = this.#getFormat(config);
    this.style = this.#getStyle(config);
  }

  #getFormat(config: any) {
    const allowDecimals = config?.decimals !== undefined;

    return allowDecimals ? `{value:.${config.decimals ?? 1}f}` : undefined;
  }

  #getStyle(config: any): ChartXAxisLabelStyle {
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

export class ChartXAxisTitle {
  text?: string;
  margin = 16;
  align: string;
  style: ChartXAxisStyle;

  constructor(config: any) {
    this.text = config?.title?.text;
    this.align = this.#getAlignment(config);
    this.style = this.#getStyle(config);
  }

  #getAlignment(config: any): string {
    return ChartAxisUtil.formatAxisTextAlignment(
      config?.title?.fontStyle?.textAlign
    );
  }

  #getStyle(config: any): ChartXAxisStyle {
    return {
      color: config?.title?.fontStyle?.textColor || '#000000',
      fontWeight: config?.title?.fontStyle?.bold ? 'bold' : 'normal',
      fontStyle: config?.title?.fontStyle?.italic ? 'italic' : 'normal',
      fontSize: config?.title?.fontStyle?.fontSize || '13px',
    };
  }
}
export class ChartXAxis {
  allowDecimals: boolean;
  categories!: string[];
  title!: ChartXAxisTitle;
  labels!: ChartXAxisLabel;

  constructor(config: any) {
    console.log(config.xAxisType);
    const xAxisConfig = config.axes?.find(
      (axis: Record<string, unknown>) => axis['type'] === 'DOMAIN'
    );

    this.allowDecimals = xAxisConfig?.decimals !== undefined;
    this.labels = new ChartXAxisLabel(xAxisConfig);
    this.title = new ChartXAxisTitle(xAxisConfig);
  }
}
