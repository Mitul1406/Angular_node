import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/jobs', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'jobs',
    loadChildren: () =>
      import('./features/jobs/jobs.routes').then(m => m.jobsRoutes)
  },
  {
    path: 'my-applications',
    loadComponent: () =>
      import('./features/applications/my-applications/my-applications.component').then(m => m.MyApplicationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'post-job',
        loadComponent: () =>
          import('./features/admin/post-job/post-job.component').then(m => m.PostJobComponent)
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/admin/manage-applications/manage-applications.component').then(m => m.ManageApplicationsComponent)
      },
      { path: '', redirectTo: 'applications', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/jobs' }
];
