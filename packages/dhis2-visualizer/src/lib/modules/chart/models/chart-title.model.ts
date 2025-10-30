import { AnalyticsMetaData } from '@iapps/function-analytics';

export class ChartTitle {
  constructor(
    public config: { hideTitle: boolean; zAxisType: string[] },
    public metaData: AnalyticsMetaData
  ) {}

  title(): any | null {
    if (this.config.hideTitle) {
      return null;
    }

    const title = this.config.zAxisType
      .map((dimension: any) => {
        return ((this.metaData as any)[dimension] || [])
          .map((item: any) => (this.metaData?.names || {})[item])
          .join(',');
      })
      .filter((item: any) => item)
      .join(' - ');

    return {
      text: title,
      align: 'center',
      style: {
        fontWeight: '400',
        fontSize: '11px',
      },
    };
  }
}
