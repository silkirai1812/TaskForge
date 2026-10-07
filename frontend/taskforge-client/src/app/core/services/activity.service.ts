import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Activity {
  id: number;
  userId: number;
  userName: string;
  projectId?: number;
  issueId?: number;
  action: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private apiUrl = `${environment.apiUrl}/activities`;

  constructor(
    private http: HttpClient
  ) {}

  getIssueActivities(
    issueId: number
  ): Observable<Activity[]> {

    return this.http.get<Activity[]>(
      `${this.apiUrl}/issues/${issueId}/activities`
    );
  }

  getProjectActivities(
    projectId: number
  ): Observable<Activity[]> {

    return this.http.get<Activity[]>(
      `${this.apiUrl}/projects/${projectId}/activities`
    );
  }
}