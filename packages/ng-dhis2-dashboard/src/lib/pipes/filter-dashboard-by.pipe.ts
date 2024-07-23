import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterDashboardBy',
})
export class FilterDashboardByPipe implements PipeTransform {
  transform(
    dataList: any[],
    attributeName: string,
    value?: string,
    minMatchingPercentage = 100
  ): any[] {
    if (!dataList) {
      return dataList;
    }
    const splittedValue = value?.split(/[\.\-_,; ]/) || [];
    return splittedValue.length > 0
      ? dataList.filter(
          (item: any) =>
            this.getMatchingPercentage(splittedValue, item[attributeName]) >=
            minMatchingPercentage
        )
      : dataList;
  }

  getMatchingPercentage(valueList: string[], dataValue: string) {
    if (!valueList || valueList?.length === 0) {
      return 0;
    }

    return (
      (valueList.reduce((matchSum: number, valueString: string) => {
        const match =
          dataValue.toLowerCase().indexOf(valueString.toLowerCase()) !== -1
            ? 1
            : 0;
        return matchSum + match;
      }, 0) /
        valueList.length) *
      100
    );
  }
}
