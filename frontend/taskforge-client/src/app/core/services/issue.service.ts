import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Issue {
  id: number;
  projectId: number;

  title: string;
  description?: string;

  type: number;
  priority: number;
  status: number;

  reporterId: number;
  reporterName: string;

  assigneeId?: number;
  assigneeName?: string;

  dueDate?: string;

  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  private apiUrl = `${environment.apiUrl}/issues`;

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // GET ISSUES BY PROJECT
  // GET /api/projects/{projectId}/issues
  // ==========================================

  getIssuesByProject(
    projectId: number
  ): Observable<Issue[]> {

    return this.http.get<Issue[]>(
      `${this.apiUrl}/projects/${projectId}/issues`
    );
  }


  // ==========================================
  // GET ISSUE BY ID
  // GET /api/issues/{id}
  // ==========================================

  getIssue(
    id: number
  ): Observable<Issue> {

    return this.http.get<Issue>(
      `${this.apiUrl}/issues/${id}`
    );
  }


  // ==========================================
  // CREATE ISSUE
  // POST /api/projects/{projectId}/issues
  // ==========================================

  create(
    projectId: number,
    issue: CreateIssueRequest
  ): Observable<Issue> {

    return this.http.post<Issue>(
      `${this.apiUrl}/projects/${projectId}/issues`,
      issue
    );
  }


  // ==========================================
  // UPDATE ISSUE
  // PUT /api/issues/{id}
  // ==========================================

  update(
    id: number,
    issue: UpdateIssueRequest
  ): Observable<Issue> {

    return this.http.put<Issue>(
      `${this.apiUrl}/issues/${id}`,
      issue
    );
  }


  // ==========================================
  // DELETE ISSUE
  // DELETE /api/issues/{id}
  // ==========================================

  delete(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/issues/${id}`
    );
  }
}


// ==========================================
// CREATE ISSUE REQUEST
// ==========================================

export interface CreateIssueRequest {

  title: string;

  description?: string;

  type: number;

  priority: number;

  assigneeId?: number;

  dueDate?: string;
}

export interface UpdateIssueRequest {

  title: string;

  description?: string;

  type: number;

  priority: number;

  status: number;

  assigneeId?: number;

  dueDate?: string;
}