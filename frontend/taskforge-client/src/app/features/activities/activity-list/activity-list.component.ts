import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  ProjectService,
  Project
} from '../../../core/services/project.service';

import {
  ActivityService,
  Activity
} from '../../../core/services/activity.service';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.css'
})
export class ActivityListComponent implements OnInit {

  projects: Project[] = [];
  activities: Activity[] = [];

  loading = false;
  errorMessage = '';
  activityLoadErrors = 0;

  userName = localStorage.getItem('userName') || 'User';
  userRole = localStorage.getItem('userRole') || 'User';

  constructor(
    public router: Router,
    private projectService: ProjectService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading = true;
    this.errorMessage = '';
    this.activityLoadErrors = 0;

    this.projectService.getProjects().subscribe({

      next: (projects) => {

        this.projects = projects;

        if (projects.length === 0) {
          this.activities = [];
          this.loading = false;
          return;
        }

        const requests = projects.map(project =>
          this.activityService
            .getProjectActivities(project.id)
            .pipe(
              catchError(() => {
                this.activityLoadErrors++;
                return of([]);
              })
            )
        );

        forkJoin(requests).subscribe({

          next: (results) => {

            this.activities = results
              .flat()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );

            this.loading = false;
          },

          error: () => {

            this.errorMessage =
              'Unable to load activities. Please try again.';

            this.loading = false;
          }

        });
      },

      error: () => {

        this.errorMessage =
          'Unable to load projects. Please try again.';

        this.loading = false;
      }

    });
  }

  getProjectName(projectId?: number): string {

    if (!projectId) {
      return 'General';
    }

    return (
      this.projects.find(
        project => project.id === projectId
      )?.name || 'Unknown Project'
    );
  }

  openIssue(issueId?: number): void {

    if (!issueId) {
      return;
    }

    this.router.navigate([
      '/issues',
      issueId
    ]);
  }

  formatDate(date: string): string {

    return new Date(date).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );
  }

  logout(): void {

    localStorage.clear();

    this.router.navigate(['/login']);
  }
}