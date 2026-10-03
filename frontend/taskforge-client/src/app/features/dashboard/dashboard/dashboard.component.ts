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
  IssueService,
  Issue
} from '../../../core/services/issue.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  // =====================================================
  // USER
  // =====================================================

  userName =
    localStorage.getItem('userName') || 'User';

  userRole =
    localStorage.getItem('userRole') || 'User';


  // =====================================================
  // DATA
  // =====================================================

  projects: Project[] = [];

  issues: Issue[] = [];

  recentIssues: Issue[] = [];


  // =====================================================
  // LOADING / ERROR
  // =====================================================

  loading = false;

  errorMessage = '';

  issueLoadErrors = 0;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    public router: Router,
    private projectService: ProjectService,
    private issueService: IssueService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadDashboard();

  }


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  loadDashboard(): void {

    this.loading = true;

    this.errorMessage = '';

    this.issueLoadErrors = 0;


    this.projectService
      .getProjects()
      .subscribe({

        next: (projects) => {

          this.projects = projects;

          this.loadAllIssues();

        },

        error: (error) => {

          console.error(
            'Failed to load projects:',
            error
          );

          this.errorMessage =
            'Unable to load dashboard data. Please try again.';

          this.loading = false;

        }

      });

  }


  // =====================================================
  // LOAD ISSUES FROM ALL PROJECTS
  // =====================================================

  loadAllIssues(): void {

    if (this.projects.length === 0) {

      this.issues = [];
      this.recentIssues = [];

      this.loading = false;

      return;

    }


    const requests = this.projects.map(
      project =>
        this.issueService
          .getIssuesByProject(project.id)
          .pipe(
            catchError(error => {

              console.error(
                `Failed to load issues for project ${project.id}:`,
                error
              );

              this.issueLoadErrors++;

              return of([] as Issue[]);

            })
          )
    );


    forkJoin(requests)
      .subscribe({

        next: (issueLists) => {

          this.issues =
            issueLists.flat();

          this.recentIssues =
            [...this.issues]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 5);

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Failed to load dashboard issues:',
            error
          );

          this.loading = false;

        }

      });

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  get totalProjects(): number {

    return this.projects.length;

  }


  get totalIssues(): number {

    return this.issues.length;

  }


  get openIssues(): number {

    return this.issues.filter(
      issue =>
        issue.status !== 4
    ).length;

  }


  get completedIssues(): number {

    return this.issues.filter(
      issue =>
        issue.status === 4
    ).length;

  }


  // =====================================================
  // STATUS COUNTS
  // =====================================================

  get todoCount(): number {

    return this.issues.filter(
      issue =>
        issue.status === 1
    ).length;

  }


  get inProgressCount(): number {

    return this.issues.filter(
      issue =>
        issue.status === 2
    ).length;

  }


  get inReviewCount(): number {

    return this.issues.filter(
      issue =>
        issue.status === 3
    ).length;

  }


  get doneCount(): number {

    return this.issues.filter(
      issue =>
        issue.status === 4
    ).length;

  }


  // =====================================================
  // PRIORITY COUNTS
  // =====================================================

  get lowPriorityCount(): number {

    return this.issues.filter(
      issue =>
        issue.priority === 1
    ).length;

  }


  get mediumPriorityCount(): number {

    return this.issues.filter(
      issue =>
        issue.priority === 2
    ).length;

  }


  get highPriorityCount(): number {

    return this.issues.filter(
      issue =>
        issue.priority === 3
    ).length;

  }


  get criticalPriorityCount(): number {

    return this.issues.filter(
      issue =>
        issue.priority === 4
    ).length;

  }


  // =====================================================
  // PROJECT NAME
  // =====================================================

  getProjectName(
    projectId: number
  ): string {

    const project =
      this.projects.find(
        item =>
          item.id === projectId
      );

    return project?.name || 'Unknown Project';

  }


  // =====================================================
  // STATUS
  // =====================================================

  getStatusName(
    status: any
  ): string {

    if (
      typeof status === 'string'
    ) {

      return status;

    }


    switch (status) {

      case 1:
        return 'Todo';

      case 2:
        return 'In Progress';

      case 3:
        return 'In Review';

      case 4:
        return 'Done';

      default:
        return 'Unknown';

    }

  }


  // =====================================================
  // PRIORITY
  // =====================================================

  getPriorityName(
    priority: any
  ): string {

    if (
      typeof priority === 'string'
    ) {

      return priority;

    }


    switch (priority) {

      case 1:
        return 'Low';

      case 2:
        return 'Medium';

      case 3:
        return 'High';

      case 4:
        return 'Critical';

      default:
        return 'Unknown';

    }

  }


  // =====================================================
  // TYPE
  // =====================================================

  getTypeName(
    type: any
  ): string {

    if (
      typeof type === 'string'
    ) {

      return type;

    }


    switch (type) {

      case 1:
        return 'Task';

      case 2:
        return 'Bug';

      case 3:
        return 'Story';

      case 4:
        return 'Feature';

      default:
        return 'Unknown';

    }

  }


  // =====================================================
  // ISSUE NAVIGATION
  // =====================================================

  openIssue(
    issueId: number
  ): void {

    this.router.navigate([
      '/issues',
      issueId
    ]);

  }


  // =====================================================
  // PROJECT NAVIGATION
  // =====================================================

  openProject(
    projectId: number
  ): void {

    this.router.navigate([
      '/projects',
      projectId
    ]);

  }


  // =====================================================
  // CREATE PROJECT
  // =====================================================

  createProject(): void {

    this.router.navigate([
      '/projects'
    ]);

  }


  // =====================================================
  // CREATE ISSUE
  // =====================================================

  createIssue(): void {

    if (
      this.projects.length === 0
    ) {

      this.router.navigate([
        '/projects'
      ]);

      return;

    }


    this.router.navigate([
      '/projects',
      this.projects[0].id,
      'issues',
      'create'
    ]);

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');

    this.router.navigate([
      '/login'
    ]);

  }

}