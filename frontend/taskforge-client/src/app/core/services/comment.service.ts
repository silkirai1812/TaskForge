import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  id: number;
  issueId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private apiUrl = 'http://localhost:5149/api';

  constructor(private http: HttpClient) {}

  getComments(issueId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.apiUrl}/issues/${issueId}/comments`
    );
  }

  createComment(
    issueId: number,
    comment: CreateCommentRequest
  ): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/issues/${issueId}/comments`,
      comment
    );
  }

  updateComment(
    id: number,
    comment: UpdateCommentRequest
  ): Observable<Comment> {
    return this.http.put<Comment>(
      `${this.apiUrl}/comments/${id}`,
      comment
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/comments/${id}`
    );
  }
}