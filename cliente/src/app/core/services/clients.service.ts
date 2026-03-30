import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status?: string;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly baseUrl = 'http://localhost:3000/clients';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl);
  }

  findOne(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateClientDto): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateClientDto): Observable<Client> {
    return this.http.patch<Client>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
