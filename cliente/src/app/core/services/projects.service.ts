import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  clientId: string;
  client?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
  clientId: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> { }

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = `${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/projects`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  findOne(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateProjectDto): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
