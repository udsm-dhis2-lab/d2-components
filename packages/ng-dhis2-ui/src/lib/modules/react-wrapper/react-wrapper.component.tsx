import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import parse from 'html-react-parser';
import * as React from 'react';
import { ComponentProps } from 'react';
import * as ReactDOM from 'react-dom/client';
(window as any).React = React;

@Directive({
  selector: 'ng-dhis2-ui-wrapper',
})
export class ReactWrapperModule implements OnDestroy, AfterViewInit {
  @Input() props?: ComponentProps<any>;
  @Input() component!: any;

  @ContentChild('ngDhis2UiContent') content!: ElementRef<HTMLElement>;
  protected reactDomRoot?: ReactDOM.Root;

  constructor(protected elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    this.render();
  }

  ngOnDestroy() {
    this.reactDomRoot?.unmount();
  }

  protected render() {
    if (!this.component) {
      console.warn('React component must be supplied');
    } else {
      if (!this.reactDomRoot) return;

      const jsxContent = this.content?.nativeElement?.outerHTML
        ? parse(this.content?.nativeElement?.outerHTML)
        : undefined;

      this.reactDomRoot.render(
        <this.component {...this.props}> {jsxContent || ''} </this.component>
      );
    }
  }
}
