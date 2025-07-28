import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import AppAdapter from '@dhis2/app-adapter';
import {
  Center,
  CircularLoader,
  CssReset,
  CssVariables,
  Layer,
} from '@dhis2/ui';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { firstValueFrom } from 'rxjs';
import { AppShellConfig, AppShellConfigService } from './models';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ng-dhis2-shell',
  template: '<ng-content></ng-content>',
  standalone: false,
})
export class NgDhis2ShellComponent implements AfterViewInit, OnDestroy {
  @ContentChild('appShellContent', { static: true })
  content!: ElementRef<HTMLElement>;

  @Output() setConfig = new EventEmitter<AppShellConfig>();
  @Output() shellHasLoaded = new EventEmitter<boolean>();
  private reactDomRoot?: ReactDOM.Root;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private appConfigService: AppShellConfigService
  ) {}

  ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');

    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

    this.render();

    const isShellLoaded = async (selector: string) => {
      while (document.querySelector(selector) === null) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return document.querySelector(selector);
    };

    isShellLoaded('#app_shell_content').then(() => {
      this.shellHasLoaded.emit(true);
    });
  }

  ngOnDestroy() {
    this.reactDomRoot?.unmount();
  }

  protected async render() {
    if (!this.reactDomRoot) return;

    const config = await firstValueFrom(this.appConfigService.getConfig());

    this.setConfig.emit(config);

    // Create the React element tree using createElement instead of JSX
    const fallbackContent = React.createElement(
      Layer,
      null,
      React.createElement(
        Center,
        null,
        React.createElement(CircularLoader, null)
      )
    );

    // Main application content
    const appContent = React.createElement(
      React.Fragment,
      null,
      React.createElement(CssReset, null),
      React.createElement(CssVariables, {
        colors: true,
        spacers: true,
        theme: true,
      }),
      React.createElement('div', { id: 'app_shell_content' })
    );

    const suspenseElement = React.createElement(
      React.Suspense,
      { fallback: fallbackContent },
      appContent
    );

    const appElement = React.createElement(
      AppAdapter,
      { ...config },
      suspenseElement
    );

    this.reactDomRoot.render(appElement);
  }
}
