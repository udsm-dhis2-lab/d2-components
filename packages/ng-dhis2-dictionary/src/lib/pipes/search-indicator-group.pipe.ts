import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchIndicatorGroup',
    standalone: false
})
export class SearchIndicatorGroupPipe implements PipeTransform {
  transform(indicatorGroups: any[], searchingTextForGroups: any): any {
    if (searchingTextForGroups !== undefined) {
      if (indicatorGroups.length > 0 && searchingTextForGroups != '') {
        let splittedText = searchingTextForGroups;
        [',', '[', ']', '(', ')', ',', '.', '-', '_'].forEach((char) => {
          splittedText = splittedText.split(char).join(' ');
        });
        return indicatorGroups.filter((indicatorGroup) => {
          let foundIndicatorGroupMatchingSearchingInput = true;
          splittedText.split(' ').forEach((partOfSearchingText: any) => {
            if (
              indicatorGroup.name
                .toLowerCase()
                .indexOf(partOfSearchingText.toLowerCase()) === -1
            ) {
              foundIndicatorGroupMatchingSearchingInput = false;
            }
          });
          return foundIndicatorGroupMatchingSearchingInput;
        });
      }
    }
    return indicatorGroups;
  }
}
