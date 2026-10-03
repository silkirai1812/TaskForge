import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
  ProjectService,
  Project,
  UpdateProjectRequest
} from '../../../core/services/project.service';

import {
  IssueService,
  Issue
} from '../../../core/services/issue.service';

import {
  UserService,
  User
} from '../../../core/services/user.service';

import {
  ProjectMemberService,
  ProjectMember
} from '../../../core/services/project-member.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent implements OnInit {

  // =====================================================
  // PROJECT
  // =====================================================

  projectId = 0;

  project: Project | null = null;

  loadingProject = false;

  errorMessage = '';

  // =====================================================
  // ISSUES
  // =====================================================

  issues: Issue[] = [];

  loadingIssues = false;

  issueErrorMessage = '';

  // =====================================================
  // MEMBERS
  // =====================================================

  members: ProjectMember[] = [];

  users: User[] = [];

  loadingMembers = false;

  loadingUsers = false;

  addingMember = false;

  removingMemberId: number | null = null;

  memberErrorMessage = '';

  showAddMemberForm = false;

  selectedUserId: number | null = null;

  // =====================================================
  // DELETE PROJECT
  // =====================================================

  deletingProject = false;

  deleteErrorMessage = '';

  // =====================================================
  // EDIT PROJECT
  // =====================================================

  showEditForm = false;

  savingProject = false;

  editErrorMessage = '';

  editProject: UpdateProjectRequest = {
    name: '',
    description: '',
    status: 'Active',
    startDate: '',
    endDate: ''
  };

  // =====================================================
  // CURRENT USER
  // =====================================================

  userName =
    localStorage.getItem('userName') || 'User';

  userRole =
    localStorage.getItem('userRole') || 'User';

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private issueService: IssueService,
    private userService: UserService,
    private projectMemberService: ProjectMemberService
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.errorMessage = 'Invalid project ID.';
      return;
    }

    this.projectId = id;

    this.loadProject();
    this.loadIssues();
    this.loadMembers();
    this.loadUsers();
  }

  // =====================================================
  // ROLE PERMISSIONS
  // =====================================================

  canEditProject(): boolean {
    return (
      this.userRole === 'Admin' ||
      this.userRole === 'ProjectManager'
    );
  }

  canDeleteProject(): boolean {
    return this.userRole === 'Admin';
  }

  canManageMembers(): boolean {
    return (
      this.userRole === 'Admin' ||
      this.userRole === 'ProjectManager'
    );
  }

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
    this.errorMessage = '';

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
            'Unable to load project. Please try again.';

          this.loadingProject = false;
        }

      });
  }

  // =====================================================
  // EDIT PROJECT
  // =====================================================

  openEditProject(): void {

    if (
      !this.project ||
      !this.canEditProject()
    ) {
      return;
    }

    this.editErrorMessage = '';

    this.editProject = {

      name: this.project.name,

      description:
        this.project.description,

      status:
        this.project.status,

      startDate:
        this.formatDateForInput(
          this.project.startDate
        ),

      endDate:
        this.formatDateForInput(
          this.project.endDate
        )

    };

    this.showEditForm = true;
  }

  closeEditProject(): void {

    if (this.savingProject) {
      return;
    }

    this.showEditForm = false;

    this.editErrorMessage = '';
  }

  formatDateForInput(
    date?: string
  ): string {

    if (!date) {
      return '';
    }

    return date.substring(0, 10);
  }

  saveProject(): void {

    if (
      !this.project ||
      !this.canEditProject()
    ) {
      return;
    }

    this.editErrorMessage = '';

    if (!this.editProject.name.trim()) {

      this.editErrorMessage =
        'Project name is required.';

      return;
    }

    if (
      this.editProject.startDate &&
      this.editProject.endDate &&
      this.editProject.startDate >
      this.editProject.endDate
    ) {

      this.editErrorMessage =
        'End date cannot be before start date.';

      return;
    }

    this.savingProject = true;

    this.projectService
      .updateProject(
        this.projectId,
        this.editProject
      )
      .subscribe({

        next: (updatedProject) => {

          this.project = updatedProject;

          this.savingProject = false;

          this.showEditForm = false;
        },

        error: (error) => {

          console.error(
            'Failed to update project:',
            error
          );

          this.savingProject = false;

          if (error.status === 400) {

            this.editErrorMessage =
              'Invalid project information. Please check your input.';

          } else if (error.status === 401) {

            this.editErrorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.editErrorMessage =
              'You do not have permission to edit this project.';

          } else {

            this.editErrorMessage =
              'Unable to update project. Please try again.';
          }
        }

      });
  }

  // =====================================================
  // DELETE PROJECT
  // =====================================================

  deleteProject(): void {

    if (
      !this.project ||
      !this.canDeleteProject() ||
      this.deletingProject
    ) {
      return;
    }

    const projectName =
      this.project.name;

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${projectName}"?\n\n` +
        `This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    this.deleteErrorMessage = '';

    this.deletingProject = true;

    this.projectService
      .deleteProject(this.projectId)
      .subscribe({

        next: () => {

          this.deletingProject = false;

          this.router.navigate([
            '/projects'
          ]);
        },

        error: (error) => {

          console.error(
            'Failed to delete project:',
            error
          );

          this.deletingProject = false;

          if (error.status === 401) {

            this.deleteErrorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.deleteErrorMessage =
              'You do not have permission to delete this project.';

          } else if (error.status === 404) {

            this.deleteErrorMessage =
              'Project was not found.';

          } else {

            this.deleteErrorMessage =
              'Unable to delete project. Please try again.';
          }
        }

      });
  }

  // =====================================================
  // ISSUES
  // =====================================================

  loadIssues(): void {

    this.loadingIssues = true;
    this.issueErrorMessage = '';

    this.issueService
      .getIssuesByProject(this.projectId)
      .subscribe({

        next: (issues) => {

          this.issues = issues;

          this.loadingIssues = false;
        },

        error: (error) => {

          console.error(
            'Failed to load project issues:',
            error
          );

          this.issueErrorMessage =
            'Unable to load issues. Please try again.';

          this.loadingIssues = false;
        }

      });
  }

  openIssue(issueId: number): void {

    this.router.navigate([
      '/issues',
      issueId
    ]);
  }

  createIssue(): void {

    if (!this.canCreateIssue()) {
      return;
    }

    this.router.navigate([
      '/projects',
      this.projectId,
      'issues',
      'create'
    ]);
  }

  // =====================================================
  // MEMBERS
  // =====================================================

  loadMembers(): void {

    this.loadingMembers = true;
    this.memberErrorMessage = '';

    this.projectMemberService
      .getMembers(this.projectId)
      .subscribe({

        next: (members) => {

          this.members = members;

          this.loadingMembers = false;
        },

        error: (error) => {

          console.error(
            'Failed to load project members:',
            error
          );

          this.memberErrorMessage =
            'Unable to load project members.';

          this.loadingMembers = false;
        }

      });
  }

  loadUsers(): void {

    this.loadingUsers = true;

    this.userService
      .getUsers()
      .subscribe({

        next: (users) => {

          this.users =
            users.filter(
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

  getAvailableUsers(): User[] {

    const memberIds =
      new Set(
        this.members.map(
          member => member.userId
        )
      );

    return this.users.filter(
      user => !memberIds.has(user.id)
    );
  }

  openAddMemberForm(): void {

    if (!this.canManageMembers()) {
      return;
    }

    this.memberErrorMessage = '';

    this.selectedUserId = null;

    this.showAddMemberForm = true;
  }

  closeAddMemberForm(): void {

    if (this.addingMember) {
      return;
    }

    this.showAddMemberForm = false;

    this.selectedUserId = null;

    this.memberErrorMessage = '';
  }

  addMember(): void {

    if (!this.canManageMembers()) {
      return;
    }

    this.memberErrorMessage = '';

    if (this.selectedUserId === null) {

      this.memberErrorMessage =
        'Please select a user.';

      return;
    }

    this.addingMember = true;

    this.projectMemberService
      .addMember(
        this.projectId,
        this.selectedUserId
      )
      .subscribe({

        next: () => {

          this.addingMember = false;

          this.showAddMemberForm = false;

          this.selectedUserId = null;

          this.loadMembers();
        },

        error: (error) => {

          console.error(
            'Failed to add member:',
            error
          );

          this.addingMember = false;

          if (error.status === 400) {

            this.memberErrorMessage =
              'This user is already a member or the project/user is invalid.';

          } else if (error.status === 401) {

            this.memberErrorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.memberErrorMessage =
              'You do not have permission to add members.';

          } else {

            this.memberErrorMessage =
              'Unable to add member. Please try again.';
          }
        }

      });
  }

  removeMember(
    member: ProjectMember
  ): void {

    if (!this.canManageMembers()) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${member.name} from this project?`
      );

    if (!confirmed) {
      return;
    }

    this.removingMemberId =
      member.userId;

    this.memberErrorMessage = '';

    this.projectMemberService
      .removeMember(
        this.projectId,
        member.userId
      )
      .subscribe({

        next: () => {

          this.members =
            this.members.filter(
              item =>
                item.userId !== member.userId
            );

          this.removingMemberId = null;
        },

        error: (error) => {

          console.error(
            'Failed to remove member:',
            error
          );

          this.removingMemberId = null;

          if (error.status === 401) {

            this.memberErrorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.memberErrorMessage =
              'You do not have permission to remove members.';

          } else {

            this.memberErrorMessage =
              'Unable to remove member. Please try again.';
          }
        }

      });
  }

  // =====================================================
  // DISPLAY HELPERS
  // =====================================================

  getStatusName(status: any): string {

    if (typeof status === 'string') {
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

  getPriorityName(priority: any): string {

    if (typeof priority === 'string') {
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

  getTypeName(type: any): string {

    if (typeof type === 'string') {
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
  // NAVIGATION
  // =====================================================

  goToProjects(): void {

    this.router.navigate([
      '/projects'
    ]);
  }

  goToDashboard(): void {

    this.router.navigate([
      '/dashboard'
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