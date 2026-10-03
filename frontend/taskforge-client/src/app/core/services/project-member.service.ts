import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectMember {
  userId: number;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectMemberService {

  private apiUrl = 'http://localhost:5149/api/projects';

  constructor(private http: HttpClient) {}

  getMembers(
    projectId: number
  ): Observable<ProjectMember[]> {

    return this.http.get<ProjectMember[]>(
      `${this.apiUrl}/${projectId}/members`
    );
  }

  addMember(
    projectId: number,
    userId: number
  ): Observable<void> {

    return this.http.post<void>(
      `${this.apiUrl}/${projectId}/members/${userId}`,
      {}
    );
  }

  removeMember(
    projectId: number,
    userId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${projectId}/members/${userId}`
    );
  }
}