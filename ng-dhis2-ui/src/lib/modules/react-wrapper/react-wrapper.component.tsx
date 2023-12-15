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
export class ReactWrapperComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @Input() props?: ComponentProps<any>;
  @Input() component!: React.ElementType;

  @ContentChild('ngDhis2UiContent') content!: ElementRef<HTMLElement>;
  protected reactDomRoot?: ReactDOM.Root;

  constructor(protected elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    this.render();
  }

  ngOnChanges(): void {
    if (this.elementRef) this.render();
  }

  ngOnDestroy() {
    this.reactDomRoot?.unmount();
  }

  protected render() {
    if (!this.component) throw new Error('React component must be supplied');

    if (!this.reactDomRoot) return;

    const jsxContent = this.content?.nativeElement?.outerHTML
      ? parse(this.content?.nativeElement?.outerHTML)
      : undefined;

    this.reactDomRoot.render(
      <this.component {...this.props}> {jsxContent || ''} </this.component>
    );
  }
}
