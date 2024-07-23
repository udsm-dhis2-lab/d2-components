import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import {
  AfterViewInit,
  ApplicationRef,
  ComponentFactoryResolver,
  Directive,
  Injector,
} from '@angular/core';
import { of, mergeMap, throwError, retry, Observable, delay } from 'rxjs';

@Directive({
  selector: 'ng-dhis2-shell-wrapper',
})
export abstract class NgDhis2ShellWrapper implements AfterViewInit {
  private host!: DomPortalOutlet;
  abstract componentPortal: ComponentPortal<any>;

  constructor(
    private cfr: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  ngAfterViewInit() {}

  onReady() {
    try {
      this.attachPortalOutlet();
    } catch (e) {
      console.error('Could not attach the portal to dom');
    }
  }

  private attachPortalOutlet() {
    this.host = new DomPortalOutlet(
      document.querySelector('#app_shell_content') as any,
      this.cfr,
      this.appRef,
      this.injector
    );

    if (!this.host?.hasAttached()) {
      this.host.attach(this.componentPortal);
    }
  }
}
