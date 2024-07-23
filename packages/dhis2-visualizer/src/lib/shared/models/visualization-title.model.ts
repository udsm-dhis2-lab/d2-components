export class VisualizationTitle {
  constructor(public configuration: any, public analytics: any) {}

  getTitle() {
    return this.configuration?.title || '';
  }

  getSubtitle() {
    if (this.configuration.hideTitle) {
      return null;
    }

    const metaData = this.analytics?.metaData || {};
    return (this.configuration?.filters || [])
      .map((filter: any) => {
        return (metaData[filter.dimension] || [])
          .map((item: any) => (metaData?.names || {})[item])
          .join(',');
      })
      .filter((item: any) => item)
      .join(' - ');
  }
}
