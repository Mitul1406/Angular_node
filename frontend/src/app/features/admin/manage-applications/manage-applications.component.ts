import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { Application, Job, User } from '../../../shared/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-manage-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-head">
        <div>
          <h1 class="page-title">Applications</h1>
          <p class="page-subtitle">Review and update candidate applications</p>
        </div>
        <a routerLink="/admin/post-job" class="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post New Job
        </a>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <button class="filter-btn" [class.active]="filterStatus === ''" (click)="filterStatus = ''">
          All <span class="filter-count">{{ applications().length }}</span>
        </button>
        @for (s of statuses; track s) {
          <button class="filter-btn" [class.active]="filterStatus === s" (click)="filterStatus = s">
            {{ s | titlecase }}
            <span class="filter-count">{{ countByStatus(s) }}</span>
          </button>
        }
      </div>

      @if (loading()) {
        <div class="skeleton-list">
          @for (i of [1,2,3,4]; track i) { <div class="skeleton-row"></div> }
        </div>
      } @else if (filteredApps.length === 0) {
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <p>No applications {{ filterStatus ? 'with status "' + filterStatus + '"' : 'yet' }}</p>
        </div>
      } @else {
        <div class="apps-table">
          <div class="table-header">
            <span>Candidate</span>
            <span>Job</span>
            <span>Applied</span>
            <span>Resume</span>
            <span>Status</span>
          </div>

          @for (app of filteredApps; track app._id) {
            <div class="table-row card">
              <div class="candidate-cell">
                <div class="candidate-avatar">{{ getUser(app).name[0] }}</div>
                <div>
                  <p class="candidate-name">{{ getUser(app).name }}</p>
                  <p class="candidate-email">{{ getUser(app).email }}</p>
                </div>
              </div>

              <div class="job-cell">
                <a [routerLink]="['/jobs', getJob(app)._id]" class="job-link">{{ getJob(app).title }}</a>
                <span class="job-company-sm">{{ getJob(app).company }}</span>
              </div>

              <div class="date-cell">{{ app.createdAt | date:'MMM d, y' }}</div>

              <div class="resume-cell">
                @if (app.resume) {
                  <a [href]="apiUrl + '/' + app.resume" target="_blank" class="resume-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    View
                  </a>
                } @else {
                  <span class="no-resume">—</span>
                }
              </div>

              <div class="status-cell">
                <select
                  class="status-select"
                  [value]="app.status"
                  [class]="'status-' + app.status"
                  [disabled]="updatingId() === app._id"
                  (change)="updateStatus(app, $event)">
                  @for (s of statuses; track s) {
                    <option [value]="s">{{ s | titlecase }}</option>
                  }
                </select>
                @if (updatingId() === app._id) {
                  <span class="updating-spinner"></span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .filter-bar { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn { display: flex; align-items: center; gap: 7px; padding: 7px 14px; border-radius: 100px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-secondary); font-family: inherit; transition: all 0.15s; }
    .filter-btn:hover { border-color: var(--accent); color: var(--text-primary); }
    .filter-btn.active { background: var(--accent-subtle); border-color: rgba(99,102,241,0.4); color: var(--accent); }
    .filter-count { font-size: 11px; background: var(--bg-elevated); border-radius: 100px; padding: 1px 7px; }
    .apps-table { display: flex; flex-direction: column; gap: 10px; }
    .table-header { display: grid; grid-template-columns: 200px 1fr 100px 80px 160px; gap: 16px; padding: 10px 24px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
    @media (max-width: 900px) { .table-header { display: none; } }
    .table-row { display: grid; grid-template-columns: 200px 1fr 100px 80px 160px; gap: 16px; align-items: center; }
    @media (max-width: 900px) { .table-row { grid-template-columns: 1fr; gap: 12px; } }
    .candidate-cell { display: flex; align-items: center; gap: 10px; }
    .candidate-avatar { width: 36px; height: 36px; background: var(--accent-subtle); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--accent); flex-shrink: 0; }
    .candidate-name { font-size: 14px; font-weight: 500; }
    .candidate-email { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
    .job-cell { display: flex; flex-direction: column; gap: 2px; }
    .job-link { font-size: 13px; font-weight: 500; color: var(--text-primary); }
    .job-link:hover { color: var(--accent); }
    .job-company-sm { font-size: 12px; color: var(--text-muted); }
    .date-cell { font-size: 13px; color: var(--text-secondary); }
    .resume-link { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: var(--accent); }
    .resume-link:hover { text-decoration: underline; }
    .no-resume { font-size: 14px; color: var(--text-muted); }
    .status-cell { display: flex; align-items: center; gap: 8px; }
    .status-select { appearance: none; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-weight: 500; font-family: inherit; padding: 6px 12px; cursor: pointer; background: var(--bg-elevated); color: var(--text-primary); outline: none; transition: all 0.15s; width: 130px;text-align: center; }
    .status-select:focus { border-color: var(--accent); }
    .status-select.status-pending { border-color: rgba(245,158,11,0.4); background: var(--warning-subtle); color: var(--warning); }
    .status-select.status-reviewed { border-color: rgba(99,102,241,0.4); background: var(--accent-subtle); color: var(--accent); }
    .status-select.status-accepted { border-color: rgba(34,197,94,0.4); background: var(--success-subtle); color: var(--success); }
    .status-select.status-rejected { border-color: rgba(239,68,68,0.4); background: var(--danger-subtle); color: var(--danger); }
    .updating-spinner { width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .skeleton-list { display: flex; flex-direction: column; gap: 10px; }
    .skeleton-row { height: 80px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); animation: pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .empty-state { text-align: center; padding: 80px 24px; color: var(--text-muted); }
    .empty-state svg { opacity: 0.3; margin-bottom: 16px; }
  `]
})
export class ManageApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  apiUrl =environment.apiUrl;
  applications = signal<Application[]>([]);
  loading = signal(true);
  updatingId = signal<string | null>(null);
  filterStatus = '';
  statuses = ['pending', 'reviewed', 'accepted', 'rejected'];

  get filteredApps() {
    if (!this.filterStatus) return this.applications();
    return this.applications().filter(a => a.status === this.filterStatus);
  }

  ngOnInit() {
    this.appService.getAllApplications().subscribe({
      next: (apps) => { this.applications.set(apps); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getUser(app: Application): User {
    return app.user as User;
  }

  getJob(app: Application): Job {
    return app.job as Job;
  }

  countByStatus(status: string) {
    return this.applications().filter(a => a.status === status).length;
  }

  updateStatus(app: Application, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    this.updatingId.set(app._id);
    this.appService.updateStatus(app._id, newStatus).subscribe({
      next: (updated) => {
        this.applications.update(apps =>
          apps.map(a => a._id === app._id ? { ...a, status: updated.status } : a)
        );
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null)
    });
  }
}
