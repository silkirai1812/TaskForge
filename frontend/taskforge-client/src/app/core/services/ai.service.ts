import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiIssueRequest {
  title: string;
  description: string;
}

export interface AiIssueResponse {
  improvedTitle: string;
  improvedDescription: string;
  suggestedType: string;
  suggestedPriority: string;
  acceptanceCriteria: string[];
  implementationSuggestions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5149/api/ai';

  analyzeIssue(
    request: AiIssueRequest
  ): Observable<AiIssueResponse> {

    return this.http.post<AiIssueResponse>(
      `${this.apiUrl}/analyze-issue`,
      request
    );
  }
}