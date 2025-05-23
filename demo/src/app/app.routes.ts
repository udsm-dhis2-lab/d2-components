import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'components',
    pathMatch: 'full',
  },
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
  {
    path: 'web-sdk',
    loadComponent: () =>
      import('./pages/web-sdk/web-sdk.component').then(
        (m) => m.WebSdkComponent
      ),
  },
  {
    path: 'form-components',
    loadComponent: () =>
      import('./pages/form-components/form-components.component').then(
        (m) => m.FormComponentsComponent
      ),
  },
  {
    path: 'visualizations',
    loadComponent: () =>
      import('./pages/visualizations/visualizations.component').then(
        (m) => m.VisualizationsComponent
      ),
  },
];
