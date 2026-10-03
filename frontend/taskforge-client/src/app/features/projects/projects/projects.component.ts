import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ProjectService,
  Project,
  CreateProjectRequest,
} from '../../../core/services/project.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  // =====================================================
  // PROJECT DATA
  // =====================================================

  projects: Project[] = [];

  // =====================================================
  // STATE
  // =====================================================

  loading = false;
  creating = false;

  errorMessage = '';
  createErrorMessage = '';

  showCreateForm = false;

  // =====================================================
  // CURRENT USER
  // =====================================================

  userName = localStorage.getItem('userName') || 'User';
  userRole = localStorage.getItem('userRole') || 'User';

  // =====================================================
  // NEW PROJECT
  // =====================================================

  newProject: CreateProjectRequest = {
    name: '',
    description: '',
    status: 'Active',
    startDate: '',
    endDate: '',
  };

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    public router: Router,
    private projectService: ProjectService,
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadProjects();
  }

  // =====================================================
  // ROLE / RBAC CHECKS
  // =====================================================

  /**
   * Admin and Project Manager can create projects.
   */
  canCreateProject(): boolean {
    return (
      this.userRole === 'Admin' ||
      this.userRole === 'ProjectManager'
    );
  }

  /**
   * Admin and Project Manager can manage projects.
   */
  canManageProjects(): boolean {
    return (
      this.userRole === 'Admin' ||
      this.userRole === 'ProjectManager'
    );
  }

  /**
   * Check whether current user is Admin.
   */
  isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

  /**
   * Check whether current user is Developer.
   */
  isDeveloper(): boolean {
    return this.userRole === 'Developer';
  }

  // =====================================================
  // LOAD PROJECTS
  // =====================================================

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },

      error: (error) => {
        console.error(
          'Failed to load projects:',
          error
        );

        this.errorMessage =
          'Unable to load projects. Please try again.';

        this.loading = false;
      },
    });
  }

  // =====================================================
  // OPEN CREATE FORM
  // =====================================================

  openCreateForm(): void {
    // Frontend RBAC check
    if (!this.canCreateProject()) {
      this.createErrorMessage =
        'You do not have permission to create projects.';

      return;
    }

    this.createErrorMessage = '';

    this.newProject = {
      name: '',
      description: '',
      status: 'Active',
      startDate: '',
      endDate: '',
    };

    this.showCreateForm = true;
  }

  // =====================================================
  // CLOSE CREATE FORM
  // =====================================================

  closeCreateForm(): void {
    // Do not close while request is running
    if (this.creating) {
      return;
    }

    this.showCreateForm = false;
    this.createErrorMessage = '';
  }

  // =====================================================
  // CREATE PROJECT
  // =====================================================

  createProject(): void {
    this.createErrorMessage = '';

    // ===================================================
    // RBAC CHECK
    // ===================================================

    if (!this.canCreateProject()) {
      this.createErrorMessage =
        'You do not have permission to create projects. Admin or Project Manager access is required.';

      return;
    }

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!this.newProject.name.trim()) {
      this.createErrorMessage =
        'Project name is required.';

      return;
    }

    if (!this.newProject.description.trim()) {
      this.createErrorMessage =
        'Project description is required.';

      return;
    }

    // ===================================================
    // DATE VALIDATION
    // ===================================================

    if (
      this.newProject.startDate &&
      this.newProject.endDate &&
      this.newProject.startDate >
        this.newProject.endDate
    ) {
      this.createErrorMessage =
        'End date cannot be before start date.';

      return;
    }

    // ===================================================
    // START REQUEST
    // ===================================================

    this.creating = true;

    this.projectService
      .createProject(this.newProject)
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (project) => {
          console.log(
            'Project created successfully:',
            project
          );

          // Add new project to beginning of list
          this.projects = [
            project,
            ...this.projects,
          ];

          this.creating = false;

          this.showCreateForm = false;

          // Reset form
          this.newProject = {
            name: '',
            description: '',
            status: 'Active',
            startDate: '',
            endDate: '',
          };
        },

        // =================================================
        // ERROR
        // =================================================

        error: (error) => {
          console.error(
            'Failed to create project:',
            error
          );

          this.creating = false;

          // Unauthorized
          if (error.status === 401) {
            this.createErrorMessage =
              'Your session has expired. Please login again.';
          }

          // Forbidden
          else if (error.status === 403) {
            this.createErrorMessage =
              'You do not have permission to create projects. Admin or Project Manager access is required.';
          }

          // Bad request
          else if (error.status === 400) {
            this.createErrorMessage =
              'Invalid project information. Please check the form.';
          }

          // Other errors
          else {
            this.createErrorMessage =
              'Unable to create project. Please try again.';
          }
        },
      });
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
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

    this.router.navigate(['/login']);
  }
}