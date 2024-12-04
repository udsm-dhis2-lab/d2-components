import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CurrentDashboardComponent } from './containers';
import { D2DashboardComponent } from './d2-dashboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dhis-dashboard-view',
    pathMatch: 'full',
  },
  {
    path: 'dhis-dashboard-view',
    component: D2DashboardComponent,
    children: [
      {
        path: ':id',
        component: CurrentDashboardComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class D2DashboardRoutingModule {}
