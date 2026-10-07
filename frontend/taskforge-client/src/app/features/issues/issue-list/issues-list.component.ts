import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  IssueService,
  Issue
} from '../../../core/services/issue.service';

import {
  ProjectService,
  Project
} from '../../../core/services/project.service';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issues-list.component.html',
  styleUrl: './issues-list.component.css'
})
export class IssuesListComponent implements OnInit {

  projects: Project[] = [];
  issues: Issue[] = [];

  loading = false;
  errorMessage = '';
  issueLoadErrors = 0;

  userName = localStorage.getItem('userName') || 'User';
  userRole = localStorage.getItem('userRole') || 'User';

  constructor(
    public router: Router,
    private projectService: ProjectService,
    private issueService: IssueService
  ) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.loading = true;
    this.errorMessage = '';
    this.issueLoadErrors = 0;

    this.projectService.getProjects().subscribe({
      next: (projects) => {

        this.projects = projects;

        if (projects.length === 0) {
          this.issues = [];
          this.loading = false;
          return;
        }

        /*
         * IMPORTANT:
         * We need all issues belonging to each project.
         *
         * Do NOT use getIssue(project.id) here.
         * project.id is a project ID, not an issue ID.
         */
        const requests = projects.map(project =>
          this.issueService.getIssuesByProject(project.id)
        );

        /*
         * Load each project's issues independently.
         * If one project fails, keep the issues from the
         * other projects instead of breaking the whole page.
         */
        let completedRequests = 0;
        const allIssues: Issue[] = [];

        requests.forEach(request => {

          request.subscribe({
            next: (issues) => {

              allIssues.push(...issues);

              completedRequests++;

              if (completedRequests === requests.length) {
                this.finishLoadingIssues(allIssues);
              }

            },

            error: (error) => {

              console.error(
                'Failed to load issues for a project:',
                error
              );

              this.issueLoadErrors++;

              completedRequests++;

              if (completedRequests === requests.length) {
                this.finishLoadingIssues(allIssues);
              }
            }
          });

        });
      },

      error: (error) => {

        console.error(
          'Failed to load projects:',
          error
        );

        this.errorMessage =
          'Unable to load projects. Please try again.';

        this.loading = false;
      }
    });
  }

  private finishLoadingIssues(issues: Issue[]): void {

    this.issues = issues.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    this.loading = false;
  }

  openIssue(issueId: number): void {
    this.router.navigate(['/issues', issueId]);
  }

  openProject(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
  }

  goToIssues(): void {
    this.router.navigate(['/issues']);
  }

  goToActivities(): void {
    this.router.navigate(['/activities']);
  }

  getProjectName(projectId: number): string {
    return (
      this.projects.find(p => p.id === projectId)?.name ||
      'Unknown Project'
    );
  }

  getStatusName(status: number): string {
    switch (Number(status)) {
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

  getPriorityName(priority: number): string {
    switch (Number(priority)) {
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

  getTypeName(type: number): string {
    switch (Number(type)) {
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

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}