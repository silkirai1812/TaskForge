import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AiService, AiIssueResponse } from '../../../core/services/ai.service';

import {
  IssueService,
  Issue,
  UpdateIssueRequest,
} from '../../../core/services/issue.service';

import { UserService, User } from '../../../core/services/user.service';

import {
  CommentService,
  Comment,
  CreateCommentRequest,
} from '../../../core/services/comment.service';

import {
  ActivityService,
  Activity,
} from '../../../core/services/activity.service';

@Component({
  selector: 'app-issue-details',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './issue-details.component.html',

  styleUrl: './issue-details.component.css',
})
export class IssueDetailsComponent implements OnInit {
  // =====================================================

  aiLoading = false;
  aiError = '';
  aiResult: AiIssueResponse | null = null;
  showAiAssistant = false;

  // ISSUE

  // =====================================================

  issueId = 0;

  issue: Issue | null = null;

  loading = false;

  errorMessage = '';

  // =====================================================

  // EDIT

  // =====================================================

  showEditForm = false;

  updating = false;

  editErrorMessage = '';

  editIssue: UpdateIssueRequest = {
    title: '',

    description: '',

    type: 1,

    priority: 2,

    status: 1,

    assigneeId: undefined,

    dueDate: '',
  };

  // =====================================================

  // DELETE

  // =====================================================

  showDeleteConfirm = false;

  deleting = false;

  // =====================================================

  // USERS

  // =====================================================

  users: User[] = [];

  loadingUsers = false;

  // =====================================================

  // COMMENTS

  // =====================================================

  comments: Comment[] = [];

  loadingComments = false;

  addingComment = false;

  newComment = '';

  editingCommentId: number | null = null;

  editingCommentText = '';

  commentError = '';

  // =====================================================

  // ACTIVITY

  // =====================================================

  activities: Activity[] = [];

  loadingActivities = false;

  // =====================================================

  // CURRENT USER

  // =====================================================

  userName = localStorage.getItem('userName') || 'User';

  userRole = localStorage.getItem('userRole') || 'User';

  // =====================================================
  // ROLE-BASED ACCESS CONTROL
  // =====================================================

  userId = Number(localStorage.getItem('userId') || 0);

  canEditIssue(): boolean {
    return (
      this.userRole === 'Admin' ||
      this.userRole === 'ProjectManager' ||
      this.userRole === 'Developer'
    );
  }

  canDeleteIssue(): boolean {
    return this.userRole === 'Admin';
  }

  canAddComment(): boolean {
    return (
      this.userRole === 'Admin' ||
      this.userRole === 'ProjectManager' ||
      this.userRole === 'Developer'
    );
  }

  canEditComment(comment: Comment): boolean {
    return comment.userId === this.userId;
  }

  canDeleteComment(comment: Comment): boolean {
    return comment.userId === this.userId;
  }

  constructor(
    private route: ActivatedRoute,

    public router: Router,

    private issueService: IssueService,

    private userService: UserService,

    private commentService: CommentService,

    private activityService: ActivityService,
    private aiService: AiService,
  ) {}

  // =====================================================

  // INIT

  // =====================================================

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid issue ID.';

      return;
    }

    this.issueId = id;

    this.loadIssue();

    this.loadUsers();

    this.loadComments();

    this.loadActivities();
  }

  // =====================================================

  // LOAD ISSUE

  // =====================================================

  loadIssue(): void {
    this.loading = true;

    this.errorMessage = '';

    this.issueService

      .getIssue(this.issueId)

      .subscribe({
        next: (issue) => {
          this.issue = issue;

          this.loading = false;
        },

        error: (error) => {
          console.error(
            'Failed to load issue:',

            error,
          );

          this.errorMessage = 'Unable to load issue. Please try again.';

          this.loading = false;
        },
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
          this.users = users;

          this.loadingUsers = false;
        },

        error: (error) => {
          console.error(
            'Failed to load users:',

            error,
          );

          this.loadingUsers = false;
        },
      });
  }

  // =====================================================

  // LOAD COMMENTS

  // =====================================================

  loadComments(): void {
    this.loadingComments = true;

    this.commentError = '';

    this.commentService

      .getComments(this.issueId)

      .subscribe({
        next: (comments) => {
          this.comments = comments;

          this.loadingComments = false;
        },

        error: (error) => {
          console.error(
            'Failed to load comments:',

            error,
          );

          this.commentError = 'Unable to load comments.';

          this.loadingComments = false;
        },
      });
  }

  // =====================================================

  // LOAD ACTIVITIES

  // =====================================================

  loadActivities(): void {
    this.loadingActivities = true;

    this.activityService

      .getIssueActivities(this.issueId)

      .subscribe({
        next: (activities) => {
          this.activities = activities;

          this.loadingActivities = false;
        },

        error: (error) => {
          console.error(
            'Failed to load activities:',

            error,
          );

          this.loadingActivities = false;
        },
      });
  }

  // =====================================================

  // OPEN EDIT

  // =====================================================

  openEditForm(): void {
    if (!this.issue) {
      return;
    }

    this.editErrorMessage = '';

    this.editIssue = {
      title: this.issue.title,

      description: this.issue.description || '',

      type: Number(this.issue.type),

      priority: Number(this.issue.priority),

      status: Number(this.issue.status),

      assigneeId: this.issue.assigneeId,

      dueDate: this.issue.dueDate ? this.issue.dueDate.substring(0, 10) : '',
    };

    this.showEditForm = true;
  }

  // =====================================================

  // CLOSE EDIT

  // =====================================================

  closeEditForm(): void {
    if (this.updating) {
      return;
    }

    this.showEditForm = false;

    this.editErrorMessage = '';
  }

  // =====================================================

  // UPDATE ISSUE

  // =====================================================

  updateIssue(): void {
    this.editErrorMessage = '';

    if (!this.editIssue.title.trim()) {
      this.editErrorMessage = 'Issue title is required.';

      return;
    }

    this.updating = true;

    this.issueService

      .update(
        this.issueId,

        this.editIssue,
      )

      .subscribe({
        next: (updatedIssue) => {
          this.issue = updatedIssue;

          this.updating = false;

          this.showEditForm = false;

          // Refresh activity after update

          this.loadActivities();
        },

        error: (error) => {
          console.error(
            'Failed to update issue:',

            error,
          );

          this.updating = false;

          if (error.status === 401) {
            this.editErrorMessage =
              'Your session has expired. Please login again.';
          } else if (error.status === 403) {
            this.editErrorMessage =
              'You do not have permission to update this issue.';
          } else if (error.status === 400) {
            this.editErrorMessage = 'Invalid issue information.';
          } else {
            this.editErrorMessage = 'Unable to update issue. Please try again.';
          }
        },
      });
  }

  // =====================================================

  // DELETE

  // =====================================================

  openDeleteConfirm(): void {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    if (this.deleting) {
      return;
    }

    this.showDeleteConfirm = false;
  }

  deleteIssue(): void {
    this.deleting = true;

    this.issueService

      .delete(this.issueId)

      .subscribe({
        next: () => {
          this.deleting = false;

          this.showDeleteConfirm = false;

          this.goToProject();
        },

        error: (error) => {
          console.error(
            'Failed to delete issue:',

            error,
          );

          this.deleting = false;

          this.showDeleteConfirm = false;

          if (error.status === 401) {
            this.errorMessage = 'Your session has expired. Please login again.';
          } else if (error.status === 403) {
            this.errorMessage =
              'You do not have permission to delete this issue.';
          } else {
            this.errorMessage = 'Unable to delete issue. Please try again.';
          }
        },
      });
  }

  // =====================================================

  // ADD COMMENT

  // =====================================================

  addComment(): void {
    this.commentError = '';

    const content = this.newComment.trim();

    if (!content) {
      this.commentError = 'Comment cannot be empty.';

      return;
    }

    const request: CreateCommentRequest = {
      content,
    };

    this.addingComment = true;

    this.commentService

      .createComment(
        this.issueId,

        request,
      )

      .subscribe({
        next: (comment) => {
          this.comments = [...this.comments, comment];

          this.newComment = '';

          this.addingComment = false;

          // Refresh activity after comment

          this.loadActivities();
        },

        error: (error) => {
          console.error(
            'Failed to add comment:',

            error,
          );

          this.addingComment = false;

          this.commentError = 'Unable to add comment. Please try again.';
        },
      });
  }

  // =====================================================

  // EDIT COMMENT

  // =====================================================

  startEditComment(comment: Comment): void {
    this.editingCommentId = comment.id;

    this.editingCommentText = comment.content;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;

    this.editingCommentText = '';
  }

  saveCommentEdit(comment: Comment): void {
    const content = this.editingCommentText.trim();

    if (!content) {
      return;
    }

    this.commentService

      .updateComment(
        comment.id,

        { content },
      )

      .subscribe({
        next: (updatedComment) => {
          this.comments = this.comments.map((c) =>
            c.id === updatedComment.id ? updatedComment : c,
          );

          this.cancelEditComment();

          // Refresh activity

          this.loadActivities();
        },

        error: (error) => {
          console.error(
            'Failed to update comment:',

            error,
          );

          this.commentError = 'Unable to update comment.';
        },
      });
  }

  // =====================================================

  // DELETE COMMENT

  // =====================================================

  deleteComment(comment: Comment): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this comment?',
    );

    if (!confirmed) {
      return;
    }

    this.commentService

      .deleteComment(comment.id)

      .subscribe({
        next: () => {
          this.comments = this.comments.filter((c) => c.id !== comment.id);

          // Refresh activity

          this.loadActivities();
        },

        error: (error) => {
          console.error(
            'Failed to delete comment:',

            error,
          );

          this.commentError = 'Unable to delete comment.';
        },
      });
  }

  // =====================================================

  // STATUS

  // =====================================================

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

  // =====================================================

  // PRIORITY

  // =====================================================

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

  // =====================================================

  // TYPE

  // =====================================================

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

  analyzeIssueWithAI(): void {
    if (!this.issue) {
      return;
    }

    if (!this.issue.title?.trim() || !this.issue.description?.trim()) {
      this.aiError = 'Issue title and description are required.';
      return;
    }

    this.aiLoading = true;
    this.aiError = '';
    this.aiResult = null;
    this.showAiAssistant = true;

    this.aiService
      .analyzeIssue({
        title: this.issue.title,
        description: this.issue.description,
      })
      .subscribe({
        next: (result) => {
          this.aiResult = result;
          this.aiLoading = false;
        },
        error: (error) => {
          console.error('AI analysis failed:', error);

          this.aiError =
            error?.error?.message || 'AI analysis failed. Please try again.';

          this.aiLoading = false;
        },
      });
  }

  applyAiSuggestions(): void {
    if (!this.issue || !this.aiResult) {
      return;
    }

    this.editIssue = {
      title: this.aiResult.improvedTitle,
      description: this.aiResult.improvedDescription,
      type: this.getTypeNumber(this.aiResult.suggestedType),
      priority: this.getPriorityNumber(this.aiResult.suggestedPriority),
      status: Number(this.issue.status),
      assigneeId: this.issue.assigneeId,
      dueDate: this.issue.dueDate ? this.issue.dueDate.substring(0, 10) : '',
    };

    this.editErrorMessage = '';

    this.showEditForm = true;

    this.showAiAssistant = false;
  }

  getTypeNumber(type: string): number {
    switch (type?.toLowerCase()) {
      case 'bug':
        return 2;

      case 'story':
        return 3;

      case 'feature':
        return 4;

      case 'task':
      default:
        return 1;
    }
  }

  getPriorityNumber(priority: string): number {
    switch (priority?.toLowerCase()) {
      case 'low':
        return 1;

      case 'high':
        return 3;

      case 'critical':
        return 4;

      case 'medium':
      default:
        return 2;
    }
  }

  // =====================================================

  // NAVIGATION

  // =====================================================

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToProject(): void {
    if (!this.issue) {
      return;
    }

    this.router.navigate(['/projects', this.issue.projectId]);
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
