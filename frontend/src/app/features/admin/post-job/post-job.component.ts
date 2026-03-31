import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-head">
        <div>
          <h1 class="page-title">Post a Job</h1>
          <p class="page-subtitle">Create a new listing for candidates to apply</p>
        </div>
        <a routerLink="/admin/applications" class="btn btn-secondary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          View Applications
        </a>
      </div>

      <div class="form-layout">
        <div class="form-card card">
          @if (success()) {
            <div class="success-msg success-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Job posted successfully!
              <a routerLink="/jobs" style="margin-left:auto">View listing →</a>
            </div>
          }
          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-section">
              <h3 class="form-section-title">Basic Info</h3>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Job Title *</label>
                  <input class="form-input" formControlName="title" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div class="form-group">
                  <label class="form-label">Company *</label>
                  <input class="form-input" formControlName="company" placeholder="e.g. Acme Corp" />
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Location *</label>
                  <input class="form-input" formControlName="location" placeholder="e.g. Remote, New York" />
                </div>
                <div class="form-group">
                  <label class="form-label">Job Type *</label>
                  <select class="form-select" formControlName="type">
                    <option value="">Select type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="remote">Remote</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Salary Range <span class="optional">(optional)</span></label>
                <input class="form-input" formControlName="salary" placeholder="e.g. $80,000 – $120,000 / year" />
              </div>
            </div>

            <div class="form-divider"></div>

            <div class="form-section">
              <h3 class="form-section-title">Description</h3>
              <div class="form-group">
                <label class="form-label">Job Description *</label>
                <textarea class="form-textarea desc-textarea" formControlName="description" placeholder="Describe responsibilities, requirements, and what makes this role exciting..."></textarea>
                <span class="char-count">{{ form.get('description')?.value?.length ?? 0 }} chars</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="form.reset({ type: '' })">Clear</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading() || form.invalid">
                @if (loading()) { <span class="spinner"></span> }
                Post Job
              </button>
            </div>
          </form>
        </div>

        <div class="preview-card card">
          <h3 class="preview-title">Preview</h3>
          <div class="preview-header">
            <div class="company-avatar">{{ form.get('company')?.value?.[0] ?? '?' }}</div>
            <div>
              <p class="preview-job-title">{{ form.get('title')?.value || 'Job Title' }}</p>
              <p class="preview-company">{{ form.get('company')?.value || 'Company' }}</p>
            </div>
          </div>
          <div class="preview-tags">
            @if (form.get('location')?.value) {
              <span class="tag">📍 {{ form.get('location')?.value }}</span>
            }
            @if (form.get('type')?.value) {
              <span class="tag">{{ form.get('type')?.value }}</span>
            }
            @if (form.get('salary')?.value) {
              <span class="tag">💰 {{ form.get('salary')?.value }}</span>
            }
          </div>
          <p class="preview-desc">{{ (form.get('description')?.value | slice:0:200) || 'Job description will appear here...' }}{{ (form.get('description')?.value?.length ?? 0) > 200 ? '...' : '' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
    .form-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
    @media (max-width: 900px) { .form-layout { grid-template-columns: 1fr; } }
    .form-card { display: flex; flex-direction: column; gap: 0; }
    .form-section { padding: 24px 0; display: flex; flex-direction: column; gap: 16px; }
    .form-section:first-child { padding-top: 0; }
    .form-section-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .form-divider { height: 1px; background: var(--border-subtle); margin: 0 -24px; }
    .optional { color: var(--text-muted); font-weight: 400; }
    .desc-textarea { min-height: 180px; }
    .char-count { font-size: 12px; color: var(--text-muted); text-align: right; margin-top: 4px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; }
    .success-banner { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .preview-card { position: sticky; top: 84px; }
    .preview-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 16px; }
    .preview-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .company-avatar { width: 40px; height: 40px; background: var(--accent-subtle); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 17px; color: var(--accent); flex-shrink: 0; }
    .preview-job-title { font-size: 15px; font-weight: 600; }
    .preview-company { font-size: 13px; color: var(--text-secondary); }
    .preview-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .tag { font-size: 12px; color: var(--text-secondary); background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 100px; padding: 4px 10px; }
    .preview-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
    .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PostJobComponent {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private router = inject(Router);

  form = this.fb.group({
    title: ['', Validators.required],
    company: ['', Validators.required],
    location: ['', Validators.required],
    type: ['', Validators.required],
    salary: [''],
    description: ['', [Validators.required, Validators.minLength(30)]]
  });

  loading = signal(false);
  error = signal('');
  success = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set(false);
    this.jobService.createJob(this.form.value as any).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        this.form.reset({
  type: ''
});
        setTimeout(() => this.router.navigate(['/jobs']), 1500);
      },
      error: (e) => { this.error.set(e.error?.msg || 'Failed to post job'); this.loading.set(false); }
    });
  }
}
