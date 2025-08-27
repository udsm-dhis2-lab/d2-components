import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  NgZone,
  Output,
} from '@angular/core';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BreadcrumbItem } from '../models';
import { BreadcrumbItemComponent } from '../components/breadcrumb-item.component';
import { useDynamicStyles } from '../../../shared';
import { colors, IconChevronRight16 } from '@dhis2/ui';

@Component({
  selector: 'ng-dhis2-ui-breadcrumb',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class BreadcrumbComponent extends ReactWrapperModule {
  #ngZone = inject(NgZone);
  breadcrumbs = input.required<BreadcrumbItem[]>();
  @Output() selectBreadcrumb = new EventEmitter<BreadcrumbItem>();
  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

    const breadcrumbStyles = {
      container: {
        display: 'flex',
        alignItems: 'center',
      },
    };

    this.component = () => {
      const classes = useDynamicStyles(breadcrumbStyles);
      return React.createElement(
        'div',
        { className: classes.container },
        this.breadcrumbs().map((breadcrumb, index) =>
          React.createElement(
            React.Fragment,
            { key: index },
            React.createElement(BreadcrumbItemComponent, {
              key: index,
              breadcrumb: breadcrumb,
              onClick: () => {
                this.#ngZone.run(() => {
                  this.selectBreadcrumb.emit(breadcrumb);
                });
              },
            }),
            index < this.breadcrumbs().length - 1 &&
              React.createElement(IconChevronRight16, { color: colors.grey800 })
          )
        )
      );
    };
    this.render();
  }
}
