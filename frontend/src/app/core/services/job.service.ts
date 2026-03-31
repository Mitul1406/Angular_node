import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Job } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getJobs() {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getJob(id: string) {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  createJob(data: Partial<Job>) {
    return this.http.post<Job>(this.apiUrl, data);
  }

  deleteJob(id: string) {
    return this.http.delete<{ msg: string }>(`${this.apiUrl}/${id}`);
  }
}
