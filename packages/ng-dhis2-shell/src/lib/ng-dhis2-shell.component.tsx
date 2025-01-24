import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Output,
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
  selector: 'ng-dhis2-shell',
  template: '<ng-content></ng-content>',
  standalone: false,
})
export class NgDhis2ShellComponent {
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

    const App = (
      <AppAdapter {...config}>
        <React.Suspense
          fallback={
            <Layer>
              <Center>
                <CircularLoader />
              </Center>
            </Layer>
          }
        >
          <>
            <CssReset />
            <CssVariables colors spacers theme />
            <div id="app_shell_content"></div>
          </>
        </React.Suspense>
      </AppAdapter>
    );

    this.reactDomRoot.render(App);
  }
}
