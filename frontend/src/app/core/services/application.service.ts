import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Application } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  apply(jobId: string, resumeFile: File) {
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('resume', resumeFile);
    return this.http.post<Application>(this.apiUrl, formData);
  }

  getMyApplications() {
    return this.http.get<Application[]>(`${this.apiUrl}/my`);
  }

  getAllApplications() {
    return this.http.get<Application[]>(this.apiUrl);
  }

  updateStatus(id: string, status: string) {
    return this.http.put<Application>(`${this.apiUrl}/${id}`, { status });
  }
}
