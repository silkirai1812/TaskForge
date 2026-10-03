import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IssueService,
  CreateIssueRequest
} from '../../../core/services/issue.service';

import {
  UserService,
  User
} from '../../../core/services/user.service';

import {
  ProjectService,
  Project
} from '../../../core/services/project.service';

@Component({
  selector: 'app-create-issue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './create-issue.component.html',
  styleUrl: './create-issue.component.css'
})
export class CreateIssueComponent implements OnInit {

  // =====================================================
  // PROJECT
  // =====================================================

  projectId = 0;

  project: Project | null = null;

  loadingProject = false;


  // =====================================================
  // USERS
  // =====================================================

  users: User[] = [];

  loadingUsers = false;


  // =====================================================
  // CREATE STATE
  // =====================================================

  creating = false;

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // CURRENT USER
  // =====================================================

  userName =
    localStorage.getItem('userName') || 'User';

  userRole =
    localStorage.getItem('userRole') || 'User';


  // =====================================================
  // NEW ISSUE
  // =====================================================

  newIssue: CreateIssueRequest = {
    title: '',
    description: '',
    type: 1,
    priority: 2,
    assigneeId: undefined,
    dueDate: ''
  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private issueService: IssueService,
    private userService: UserService,
    private projectService: ProjectService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('projectId')
    );

    if (!id) {

      this.errorMessage =
        'Invalid project ID.';

      return;
    }

    this.projectId = id;

    this.loadProject();

    this.loadUsers();
  }


  // =====================================================
  // ROLE PERMISSION
  // =====================================================

  canCreateIssue(): boolean {

    return (
      this.userRole === 'Admin' ||
      this.userRole === 'ProjectManager' ||
      this.userRole === 'Developer'
    );
  }


  // =====================================================
  // LOAD PROJECT
  // =====================================================

  loadProject(): void {

    this.loadingProject = true;

    this.projectService
      .getProject(this.projectId)
      .subscribe({

        next: (project) => {

          this.project = project;

          this.loadingProject = false;

        },

        error: (error) => {

          console.error(
            'Failed to load project:',
            error
          );

          this.errorMessage =
            'Unable to load project.';

          this.loadingProject = false;

        }

      });
  }


  // =====================================================
  // LOAD USERS
  // =====================================================

  loadUsers(): void {

    this.loadingUsers = true;

    this.userService
      .getUsers()
      .subscribe({

        next: (users) => {

          this.users = users.filter(
            user => user.isActive
          );

          this.loadingUsers = false;

        },

        error: (error) => {

          console.error(
            'Failed to load users:',
            error
          );

          this.loadingUsers = false;

        }

      });
  }


  // =====================================================
  // CREATE ISSUE
  // =====================================================

  createIssue(): void {

    this.errorMessage = '';

    this.successMessage = '';


    // ===================================================
    // RBAC CHECK
    // ===================================================

    if (!this.canCreateIssue()) {

      this.errorMessage =
        'You do not have permission to create issues.';

      return;
    }


    // ===================================================
    // TITLE VALIDATION
    // ===================================================

    if (!this.newIssue.title.trim()) {

      this.errorMessage =
        'Issue title is required.';

      return;
    }


    // ===================================================
    // DESCRIPTION VALIDATION
    // ===================================================

    if (!this.newIssue.description?.trim()) {

      this.errorMessage =
        'Issue description is required.';

      return;
    }


    // ===================================================
    // DUE DATE VALIDATION
    // ===================================================

    if (this.newIssue.dueDate) {

      const selectedDate =
        new Date(this.newIssue.dueDate);

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {

        this.errorMessage =
          'Due date cannot be in the past.';

        return;
      }
    }


    // ===================================================
    // START CREATE
    // ===================================================

    this.creating = true;


    const request: CreateIssueRequest = {

      title:
        this.newIssue.title.trim(),

      description:
        this.newIssue.description?.trim() || '',

      type:
        Number(this.newIssue.type),

      priority:
        Number(this.newIssue.priority),

      assigneeId:
        this.newIssue.assigneeId
          ? Number(this.newIssue.assigneeId)
          : undefined,

      dueDate:
        this.newIssue.dueDate || undefined

    };


    // ===================================================
    // API CALL
    // ===================================================

    this.issueService
      .create(
        this.projectId,
        request
      )
      .subscribe({

        next: (issue) => {

          console.log(
            'Issue created successfully:',
            issue
          );

          this.creating = false;

          this.successMessage =
            'Issue created successfully.';


          // Go directly to Issue Details

          setTimeout(() => {

            this.router.navigate([
              '/issues',
              issue.id
            ]);

          }, 500);

        },

        error: (error) => {

          console.error(
            'Failed to create issue:',
            error
          );

          this.creating = false;


          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to create issues.';

          } else if (error.status === 400) {

            this.errorMessage =
              'Invalid issue information. Please check the form.';

          } else {

            this.errorMessage =
              'Unable to create issue. Please try again.';

          }

        }

      });
  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/projects',
      this.projectId
    ]);

  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  goToDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }


  // =====================================================
  // PROJECTS
  // =====================================================

  goToProjects(): void {

    this.router.navigate([
      '/projects'
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