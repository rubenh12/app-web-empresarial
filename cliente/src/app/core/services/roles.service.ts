import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Permission {
  slug: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionSlugs: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly baseUrl = 'http://localhost:3000/roles';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  findOne(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.baseUrl}/permissions`);
  }

  create(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, dto);
  }

  update(id: string, dto: any): Observable<Role> {
    return this.http.patch<Role>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
