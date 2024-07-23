export class VisualizerUtil {
  static getDimensionNames(dimensions: string[], metaData: any): string[] {
    return dimensions
      .map((dimension: any) => {
        return (metaData[dimension] || [])
          .map((item: any) => (metaData?.names || {})[item])
          .join(',');
      })
      .filter((item: any) => item);
  }

  static toCommaSeparated(value: number) {
    const valueString = value.toString().split('.');

    const numberPart = valueString[0];
    const decimalPart = valueString[1];
    const thousands = /\B(?=(\d{3})+(?!\d))/g;

    return (
      numberPart.replace(thousands, ',') +
      (decimalPart ? '.' + decimalPart : '')
    );
  }
}
