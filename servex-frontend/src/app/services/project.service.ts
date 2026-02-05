// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import {
  Project,
  ProjectRequest,
  ProjectResponse,
} from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  // Create new project
  createProject(data: ProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.apiUrl, data);
  }

  // Get all user's projects
  getMyProjects(): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(this.apiUrl);
  }

  // Get single project
  getProject(id: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${id}`);
  }

  // Update project status (admin only)
  updateStatus(id: string, status: string): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.apiUrl}/${id}/status`, {
      status,
    });
  }

  // Delete project
  deleteProject(id: string): Observable<ProjectResponse> {
    return this.http.delete<ProjectResponse>(`${this.apiUrl}/${id}`);
  }

  // Get all projects (Admin only)
  getAllProjectsAdmin(): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/admin/all`);
  }
}
