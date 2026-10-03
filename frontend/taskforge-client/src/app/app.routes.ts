import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { IssuesListComponent } from './features/issues/issue-list/issues-list.component';
import { ActivityListComponent } from './features/activities/activity-list/activity-list.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },

  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/projects/projects.component').then(
        (m) => m.ProjectsComponent,
      ),
  },

  {
    path: 'issues',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/issues/issue-list/issues-list.component').then(
        (m) => m.IssuesListComponent,
      ),
  },

  {
    path: 'activities',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activities/activity-list/activity-list.component').then(
        (m) => m.ActivityListComponent,
      ),
  },

  {
    path: 'projects/:projectId/issues/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/issues/create-issue/create-issue.component').then(
        (m) => m.CreateIssueComponent,
      ),
  },

  {
    path: 'projects/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/project-details/project-details.component').then(
        (m) => m.ProjectDetailsComponent,
      ),
  },

  {
    path: 'issues/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/issues/issue-details/issue-details.component').then(
        (m) => m.IssueDetailsComponent,
      ),
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
