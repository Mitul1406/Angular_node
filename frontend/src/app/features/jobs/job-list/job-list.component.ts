import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { Job } from '../../../shared/models';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="list-header">
        <div>
          <h1 class="page-title">Open Positions</h1>
          <p class="page-subtitle">{{ jobs().length }} opportunities available</p>
        </div>
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input [(ngModel)]="searchQuery" placeholder="Search roles, companies..." class="search-input" />
        </div>
      </div>

      @if (loading()) {
        <div class="skeleton-list">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-card"></div>
          }
        </div>
      } @else if (filteredJobs.length === 0) {
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          <p>No jobs found</p>
        </div>
      } @else {
        <div class="jobs-grid">
          @for (job of filteredJobs; track job._id) {
            <a [routerLink]="['/jobs', job._id]" class="job-card card">
              <div class="job-card-top">
                <div class="company-avatar">{{ job.company[0] }}</div>
                <span class="job-type-badge">{{ job.type }}</span>
              </div>
              <h3 class="job-title">{{ job.title }}</h3>
              <p class="job-company">{{ job.company }}</p>
              <div class="job-meta">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ job.location }}
                </span>
                @if (job.salary) {
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    {{ job.salary }}
                  </span>
                }
              </div>
              <p class="job-desc">{{ job.description | slice:0:120 }}{{ job.description.length > 120 ? '...' : '' }}</p>
              <div class="job-card-footer">
                <span class="job-date">{{ job.createdAt | date:'MMM d' }}</span>
                <span class="view-link">View details →</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .list-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 36px; flex-wrap: wrap; }
    .search-box { display: flex; align-items: center; gap: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; min-width: 280px; }
    .search-box svg { color: var(--text-muted); flex-shrink: 0; }
    .search-input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 14px; font-family: inherit; width: 100%; }
    .search-input::placeholder { color: var(--text-muted); }
    .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .job-card { display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: inherit; cursor: pointer; }
    .job-card-top { display: flex; align-items: center; justify-content: space-between; }
    .company-avatar { width: 40px; height: 40px; background: var(--accent-subtle); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; color: var(--accent); }
    .job-type-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; background: var(--bg-hover); color: var(--text-secondary); border: 1px solid var(--border); letter-spacing: 0.04em; text-transform: uppercase; }
    .job-title { font-size: 16px; font-weight: 600; letter-spacing: -0.2px; }
    .job-company { font-size: 13px; color: var(--text-secondary); }
    .job-meta { display: flex; gap: 14px; flex-wrap: wrap; }
    .job-meta span { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--text-secondary); }
    .job-desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; flex: 1; }
    .job-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle); }
    .job-date { font-size: 12px; color: var(--text-muted); }
    .view-link { font-size: 13px; color: var(--accent); font-weight: 500; }
    .skeleton-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .skeleton-card { height: 220px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); animation: pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  `]
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  auth = inject(AuthService);

  jobs = signal<Job[]>([]);
  loading = signal(true);
  searchQuery = '';

  get filteredJobs() {
    const q = this.searchQuery.toLowerCase();
    return this.jobs().filter(j =>
      !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)
    );
  }

  ngOnInit() {
    this.jobService.getJobs().subscribe({
      next: (jobs) => { this.jobs.set(jobs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
