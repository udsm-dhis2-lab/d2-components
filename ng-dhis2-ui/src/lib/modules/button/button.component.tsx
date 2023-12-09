import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Button } from '@dhis2/ui';
import { ReactWrapperComponent } from '../../shared/components';

@Component({
  selector: 'ng-dhis2-ui-button',
  template: '<ng-content></ng-content>',

})
export class ButtonComponent extends ReactWrapperComponent {
  @Input() label!: string;
  @Input() primary?: boolean;
  @Input() secondary?: boolean;
  @Input() destructive?: boolean;
  @Input() disabled?: boolean;
  @Input() small?: boolean;
  @Input() large?: boolean;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter();

  override props: Record<string, unknown> = {
    onClick: (e: any) => {
      this.onButtonClick(e);
    },
  };

  override component = Button;


  ngOnInit() {
    this.props = {
      ...this.props,
      primary: this.primary,
      secondary: this.secondary,
      destructive: this.destructive,
      small: this.small,
      large: this.large,
    };
  }

  onButtonClick(event: any) {
    this.buttonClick.emit(event);
  }
}
