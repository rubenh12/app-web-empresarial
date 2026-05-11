import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  previousData: any;
  newData: any;
  userId: string;
  userName: string;
  projectId?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/audit-log`;

  constructor(private http: HttpClient) {}

  findAll(projectId?: string, entityId?: string): Observable<AuditLog[]> {
    let url = this.apiUrl;
    const params = [];
    if (projectId) params.push(`projectId=${projectId}`);
    if (entityId) params.push(`entityId=${entityId}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<AuditLog[]>(url);
  }
}
