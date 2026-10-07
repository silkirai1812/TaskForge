import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectMember {
  userId: number;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // GET ALL PROJECTS
  // GET /api/projects
  // ==========================================

  getProjects(): Observable<Project[]> {

    return this.http.get<Project[]>(
      this.apiUrl
    );
  }


  // ==========================================
  // GET PROJECT BY ID
  // GET /api/projects/{id}
  // ==========================================

  getProject(
    id: number
  ): Observable<Project> {

    return this.http.get<Project>(
      `${this.apiUrl}/${id}`
    );
  }


  getProjectMembers(projectId: number): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(
      `${this.apiUrl}/${projectId}/members`
    );
  }


  // ==========================================
  // CREATE PROJECT
  // POST /api/projects
  // ==========================================

  createProject(
    project: CreateProjectRequest
  ): Observable<Project> {

    return this.http.post<Project>(
      this.apiUrl,
      project
    );
  }


  // ==========================================
  // UPDATE PROJECT
  // PUT /api/projects/{id}
  // ==========================================

  updateProject(
    id: number,
    project: UpdateProjectRequest
  ): Observable<Project> {

    return this.http.put<Project>(
      `${this.apiUrl}/${id}`,
      project
    );
  }


  // ==========================================
  // DELETE PROJECT
  // DELETE /api/projects/{id}
  // ==========================================

  deleteProject(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}