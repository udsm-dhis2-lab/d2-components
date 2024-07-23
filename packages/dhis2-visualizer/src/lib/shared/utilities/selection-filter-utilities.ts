export class SelectionFilterUtil {
  static getCustomFilter(dataSelections: any[]) {
    return dataSelections
      .map((dataSelection: any) => {
        switch (dataSelection.dimension) {
          case 'tea':
            return dataSelection.items
              .map((item: any) => `A<${dataSelection.id}>=='${item.code}'`)
              .join('||');

          default:
            return '';
        }
      })
      .join('&&');
  }
}
