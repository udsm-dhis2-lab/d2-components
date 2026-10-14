import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';

export const DASHBOARD_ITEM_PREFETCH_MARGIN = '200px 0px';

@Directive({
  selector: '[ngDhis2UiViewportActivation]',
  standalone: true,
})
export class ViewportActivationDirective
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() viewportActivationKey = '';
  @Output() viewportActivate = new EventEmitter<void>();

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;
  private viewInitialized = false;
  private activated = false;
  private destroyed = false;
  private observationVersion = 0;

  ngOnInit(): void {
    if (typeof globalThis.IntersectionObserver === 'undefined') {
      this.activate();
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (typeof globalThis.IntersectionObserver === 'undefined') {
      return;
    }
    this.observe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['viewportActivationKey'] &&
      !changes['viewportActivationKey'].firstChange
    ) {
      this.activated = false;
      this.observationVersion += 1;
      this.observer?.disconnect();
      this.observer = undefined;
      if (this.viewInitialized) {
        this.observe();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.observationVersion += 1;
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private observe(): void {
    if (this.destroyed || this.activated) {
      return;
    }

    if (typeof globalThis.IntersectionObserver === 'undefined') {
      this.activate();
      return;
    }

    const version = this.observationVersion;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (version !== this.observationVersion || this.destroyed) {
          return;
        }

        if (entries.some((entry) => entry.isIntersecting)) {
          this.activate();
        }
      },
      {
        root: null,
        rootMargin: DASHBOARD_ITEM_PREFETCH_MARGIN,
        threshold: 0.01,
      }
    );
    this.observer.observe(this.elementRef.nativeElement);
  }

  private activate(): void {
    if (this.activated || this.destroyed) {
      return;
    }

    this.activated = true;
    this.observer?.disconnect();
    this.observer = undefined;
    this.viewportActivate.emit();
  }
}
