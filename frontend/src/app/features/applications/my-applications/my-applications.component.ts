import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { Application, Job } from '../../../shared/models';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-head">
        <div>
          <h1 class="page-title">My Applications</h1>
          <p class="page-subtitle">Track the status of your job applications</p>
        </div>
      </div>

      @if (loading()) {
        <div class="skeleton-list">
          @for (i of [1,2,3]; track i) { <div class="skeleton-row"></div> }
        </div>
      } @else if (applications().length === 0) {
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p>No applications yet</p>
          <a routerLink="/jobs" class="btn btn-primary" style="margin-top:16px">Browse Jobs</a>
        </div>
      } @else {
        <div class="stats-row">
          <div class="stat-chip">
            <span class="stat-num">{{ applications().length }}</span>
            <span>Total</span>
          </div>
          <div class="stat-chip">
            <span class="stat-num pending">{{ countByStatus('pending') }}</span>
            <span>Pending</span>
          </div>
          <div class="stat-chip">
            <span class="stat-num reviewed">{{ countByStatus('reviewed') }}</span>
            <span>Reviewed</span>
          </div>
          <div class="stat-chip">
            <span class="stat-num accepted">{{ countByStatus('accepted') }}</span>
            <span>Accepted</span>
          </div>
          <div class="stat-chip">
            <span class="stat-num rejected">{{ countByStatus('rejected') }}</span>
            <span>Rejected</span>
          </div>
        </div>

        <div class="applications-list">
          @for (app of applications(); track app._id) {
            <div class="app-card card">
              <div class="app-left">
                <div class="company-avatar">{{ getJob(app).company[0] }}</div>
                <div class="app-info">
                  <a [routerLink]="['/jobs', getJob(app)._id]" class="app-job-title">{{ getJob(app).title }}</a>
                  <span class="app-company">{{ getJob(app).company }}</span>
                  <div class="app-meta">
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ getJob(app).location }}
                    </span>
                    <span>Applied {{ app.createdAt | date:'MMM d, y' }}</span>
                  </div>
                </div>
              </div>
              <div class="app-right">
                <span class="badge badge-{{ app.status }}">{{ app.status | titlecase }}</span>
                @if (app.resume) {
                  <a [href]="apiUrl + '/' + app.resume" target="_blank" class="btn btn-secondary btn-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Resume
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-head { margin-bottom: 32px; }
    .stats-row { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-chip { display: flex; flex-direction: column; align-items: center; gap: 2px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 20px; min-width: 80px; font-size: 12px; color: var(--text-muted); }
    .stat-num { font-size: 22px; font-weight: 700; color: var(--text-primary); }
    .stat-num.pending { color: var(--warning); }
    .stat-num.reviewed { color: var(--accent); }
    .stat-num.accepted { color: var(--success); }
    .stat-num.rejected { color: var(--danger); }
    .applications-list { display: flex; flex-direction: column; gap: 12px; }
    .app-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .app-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
    .company-avatar { width: 44px; height: 44px; background: var(--accent-subtle); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; color: var(--accent); flex-shrink: 0; }
    .app-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .app-job-title { font-size: 15px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.2px; }
    .app-job-title:hover { color: var(--accent); }
    .app-company { font-size: 13px; color: var(--text-secondary); }
    .app-meta { display: flex; align-items: center; gap: 14px; margin-top: 2px; }
    .app-meta span { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); }
    .app-right { display: flex; align-items: center; gap: 10px; }
    .btn-sm { padding: 7px 12px; font-size: 12px; }
    .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
    .skeleton-row { height: 88px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); animation: pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .empty-state { text-align: center; padding: 80px 24px; color: var(--text-muted); }
    .empty-state svg { opacity: 0.3; margin-bottom: 16px; }
  `]
})
export class MyApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  apiUrl = environment.apiUrl;
  applications = signal<Application[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.appService.getMyApplications().subscribe({
      next: (apps) => { this.applications.set(apps); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getJob(app: Application): Job {
    return app.job as Job;
  }

  countByStatus(status: string) {
    return this.applications().filter(a => a.status === status).length;
  }
}
