import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { ApplicationRef, Directive, Injector } from '@angular/core';

@Directive({
  standalone: false,
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class NgDhis2ShellWrapper {
  private host!: DomPortalOutlet;
  abstract componentPortal: ComponentPortal<any>;

  constructor(private appRef: ApplicationRef, private injector: Injector) {}

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
      this.appRef,
      this.injector
    );

    if (!this.host?.hasAttached()) {
      this.host.attach(this.componentPortal);
    }
  }
}
