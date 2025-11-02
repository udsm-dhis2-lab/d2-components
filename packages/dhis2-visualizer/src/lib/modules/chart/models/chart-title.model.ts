import { AnalyticsMetaData } from '@iapps/function-analytics';

export class ChartTitle {
  text: string;
  align: 'center' | 'left' | 'right' = 'center';
  fontWeight = 400;
  fontSize = '11px';

  constructor(
    public config: { hideTitle: boolean; zAxisType: string[] },
    public metaData: AnalyticsMetaData
  ) {
    this.text = this.#getTitleText(config, metaData);
  }

  #getTitleText(config: any, metaData: AnalyticsMetaData): any | null {
    if (config.hideTitle) {
      return null;
    }

    return config.zAxisType
      .map((dimension: any) => {
        return ((metaData as any)[dimension] || [])
          .map((item: any) => (this.metaData?.names || {})[item])
          .join(',');
      })
      .filter((item: any) => item)
      .join(' - ');
  }

  get title() {
    return {
      text: this.text,
      align: this.align,
      style: {
        fontWeight: this.fontWeight,
        fontSize: this.fontSize,
      },
    };
  }
}
