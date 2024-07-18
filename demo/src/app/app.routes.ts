import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  // {
  //   path: '',
  //   redirectTo: 'dashboard',
  //   pathMatch: 'full',
  // },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@iapps/d2-dashboard').then((m) => m.D2DashboardModule),
  },
  {
    path: 'components',
    loadChildren: () =>
      import('./pages/components/components.module').then(
        (m) => m.ComponentsModule
      ),
  },
];
