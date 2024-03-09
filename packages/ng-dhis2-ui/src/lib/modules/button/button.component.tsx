import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Button } from '@dhis2/ui';
import { ReactWrapperComponent } from '../react-wrapper';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

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

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

    this.component = () => (
      <Button
        onClick={(e: any) => {
          this.onButtonClick(e);
        }}
        primary={this.primary}
        secondary={this.secondary}
        destructive={this.destructive}
        disabled={this.disabled}
        small={this.small}
        large={this.large}
        {...this.props}
      >
        {this.label}
      </Button>
    );
    this.render();
  }

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
