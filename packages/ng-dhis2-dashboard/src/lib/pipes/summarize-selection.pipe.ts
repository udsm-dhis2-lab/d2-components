import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'summarizeSelection',
})
export class SummarizeSelectionPipe implements PipeTransform {
  transform(
    selectionList: any[],
    dimension: string,
    maxToShow: number = 2
  ): any {
    switch (dimension) {
      case 'ou': {
        const levelOrGroupSection = this._getSelectionNames(
          this._getLevelOrGroupList(selectionList)
        ).join(', ');

        const orgUnitSection = this._updateWithMaxToShow(
          this._getSelectionNames(this._getOrgUnitList(selectionList)),
          maxToShow
        );

        return levelOrGroupSection !== ''
          ? `${levelOrGroupSection} in ${orgUnitSection}`
          : orgUnitSection;
      }

      default:
        return this._updateWithMaxToShow(
          this._getSelectionNames(selectionList),
          maxToShow
        );
    }
  }

  private _getLevelOrGroupList(selectionList: any[]) {
    return (selectionList || []).filter(
      (item: any) =>
        item.type.indexOf('LEVEL') !== -1 || item.type.indexOf('GROUP') !== -1
    );
  }

  private _getOrgUnitList(selectionList: any[]) {
    return (selectionList || []).filter(
      (item: any) =>
        item.type.indexOf('LEVEL') === -1 && item.type.indexOf('GROUP') === -1
    );
  }

  private _getSelectionNames(selectionList: any[]): string[] {
    return (selectionList || []).map((selection: any) => selection.name || '');
  }

  private _updateWithMaxToShow(
    selectionNames: string[],
    maxToShow: number = -1
  ) {
    if (maxToShow === -1 || selectionNames.length <= maxToShow) {
      return selectionNames.join(', ');
    }

    const moreSection = ` and ${selectionNames.length - maxToShow} more`;

    return (selectionNames || []).slice(0, maxToShow).join(', ') + moreSection;
  }
}
