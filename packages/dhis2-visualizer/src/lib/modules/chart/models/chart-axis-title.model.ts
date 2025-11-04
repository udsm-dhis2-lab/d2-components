import { ChartAxisUtil } from '../utils';

export interface ChartAxisStyle {
  color: string;
  fontWeight: string;
  fontStyle?: string;
  fontSize: string;
}

export class ChartAxisTitle {
  text?: string;
  margin = 16;
  align: string;
  style: ChartAxisStyle;

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

  #getStyle(config: any): ChartAxisStyle {
    return {
      color: config?.title?.fontStyle?.textColor || '#000000',
      fontWeight: config?.title?.fontStyle?.bold ? 'bold' : 'normal',
      fontStyle: config?.title?.fontStyle?.italic ? 'italic' : 'normal',
      fontSize: config?.title?.fontStyle?.fontSize || '13px',
    };
  }
}
