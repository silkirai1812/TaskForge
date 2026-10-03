import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

        const requests = projects.map(project =>
          this.issueService.getIssue(project.id).pipe(
            catchError(() => {
              this.issueLoadErrors++;
              return of([]);
            })
          )
        );

        forkJoin(requests).subscribe({
          next: (results) => {
            this.issues = results
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
              'Unable to load issues. Please try again.';
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

  openIssue(issueId: number): void {
    this.router.navigate(['/issues', issueId]);
  }

  openProject(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
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