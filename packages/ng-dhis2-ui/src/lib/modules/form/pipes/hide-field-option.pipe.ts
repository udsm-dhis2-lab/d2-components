import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hideFieldOption',
})
export class HideFieldOptionPipe implements PipeTransform {
  transform(options: any[], rules: any): any {
    return (options || []).filter((option) => {
      if (
        rules.some(
          (rule: any) =>
            rule?.programRuleActionType === 'HIDEOPTION' &&
            (rule?.option?.id === option.key || rule?.option?.id === option.id)
        )
      ) {
        return false;
      }
      return true;
    });
  }
}
