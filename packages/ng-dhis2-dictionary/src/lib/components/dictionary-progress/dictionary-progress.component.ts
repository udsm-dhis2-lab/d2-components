import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-dictionary-progress',
    templateUrl: './dictionary-progress.component.html',
    styleUrls: ['./dictionary-progress.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DictionaryProgressComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
