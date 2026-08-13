import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-dashboard-loader',
    templateUrl: './dashboard-loader.component.html',
    styleUrls: ['./dashboard-loader.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DashboardLoaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
