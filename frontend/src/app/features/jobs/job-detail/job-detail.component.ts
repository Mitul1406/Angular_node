import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { Job } from '../../../shared/models';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <a routerLink="/jobs" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Back to Jobs
      </a>

      @if (loading()) {
        <div class="skeleton-detail"></div>
      } @else if (job()) {
        <div class="detail-layout">
          <div class="detail-main">
            <div class="detail-header card">
              <div class="header-top">
                <div class="company-avatar-lg">{{ job()!.company[0] }}</div>
                <div class="header-info">
                  <h1 class="job-title">{{ job()!.title }}</h1>
                  <p class="job-company">{{ job()!.company }}</p>
                </div>
              </div>
              <div class="job-tags">
                <span class="tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ job()!.location }}
                </span>
                <span class="tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                  {{ job()!.type }}
                </span>
                @if (job()!.salary) {
                  <span class="tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    {{ job()!.salary }}
                  </span>
                }
                <span class="tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Posted {{ job()!.createdAt | date:'MMMM d, y' }}
                </span>
              </div>
            </div>

            <div class="card description-card">
              <h2 class="section-title">Job Description</h2>
              <p class="description-text">{{ job()!.description }}</p>
            </div>
          </div>

          <div class="detail-sidebar">
            <div class="apply-card card">
              <h3>Apply for this role</h3>
              <p class="apply-sub">Submit your application with a resume</p>

              @if (!auth.isLoggedIn()) {
                <div class="apply-prompt">
                  <p>You need to be logged in to apply</p>
                  <a routerLink="/auth/login" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px">Sign in to Apply</a>
                </div>
              } @else if (auth.isAdmin()) {
                <div class="apply-prompt">
                  <p>Admins cannot apply for jobs</p>
                </div>
              } @else if (applied()) {
                <div class="applied-state">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Application submitted!
                </div>
              } @else {
                @if (applyError()) {
                  <div class="error-msg" style="margin-bottom:12px">{{ applyError() }}</div>
                }
                <div class="file-upload-area" (click)="fileInput.click()" [class.has-file]="selectedFile()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  @if (selectedFile()) {
                    <span class="file-name">{{ selectedFile()!.name }}</span>
                  } @else {
                    <span>Click to upload resume (PDF)</span>
                  }
                </div>
                <input #fileInput type="file" accept=".pdf,.doc,.docx" style="display:none" (change)="onFileSelected($event)" />

                <button class="btn btn-primary apply-btn" [disabled]="!selectedFile() || applyLoading()" (click)="submitApplication()">
                  @if (applyLoading()) { <span class="spinner"></span> }
                  Submit Application
                </button>
              }
            </div>

            @if (auth.isAdmin()) {
              <div class="card admin-actions">
                <h3>Admin Actions</h3>
                <button class="btn btn-danger" style="width:100%;justify-content:center;margin-top:12px" (click)="openDeleteModal(job)" [disabled]="deleteLoading()">
                  @if (deleteLoading()) { <span class="spinner"></span> }
                  Delete Job
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
    <div class="confirm-overlay" *ngIf="showDeleteModal">
  <div class="confirm-modal">
    <div class="confirm-header">
      <h3>Delete Job</h3>
      <button class="close-btn" (click)="closeModal()">✕</button>
    </div>

    <p class="confirm-text">
      Are you sure you want to delete this job?<br />
      <span>This action cannot be undone.</span>
    </p>

    <div class="confirm-actions">
      <button class="btn-secondary" (click)="closeModal()">Cancel</button>
      <button class="btn-danger" (click)="deleteJob()">Delete</button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.confirm-modal {
  width: 100%;
  max-width: 400px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 24px;
  animation: fadeIn 0.2s ease;
}

.confirm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.confirm-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-secondary);
}

.confirm-text {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.confirm-text span {
  color: #ff4d4f;
  font-size: 13px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-secondary {
  padding: 10px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg);
  cursor: pointer;
}

.btn-danger {
  padding: 10px 14px;
  border-radius: var(--radius);
  border: none;
  background: #ff4d4f;
  color: white;
  cursor: pointer;
}

.btn-danger:hover {
  opacity: 0.9;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
    .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); margin-bottom: 28px; transition: color 0.15s; }
    .back-link:hover { color: var(--text-primary); }
    .detail-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
    @media (max-width: 768px) { .detail-layout { grid-template-columns: 1fr; } }
    .detail-main { display: flex; flex-direction: column; gap: 16px; }
    .detail-header { display: flex; flex-direction: column; gap: 20px; }
    .header-top { display: flex; align-items: center; gap: 16px; }
    .company-avatar-lg { width: 56px; height: 56px; background: var(--accent-subtle); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 24px; color: var(--accent); flex-shrink: 0; }
    .job-title { font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: var(--text-primary)}
    .job-company { font-size: 15px; color: var(--text-secondary); margin-top: 2px; }
    .job-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 100px; padding: 5px 12px; }
    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 14px; color:var(--text-primary) }
    .description-text { font-size: 14px; color: var(--text-secondary); line-height: 1.75; white-space: pre-wrap; }
    .apply-card { display: flex; flex-direction: column; gap: 8px; }
    .apply-card h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .apply-sub { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
    .apply-prompt { text-align: center; padding: 16px 0; }
    .apply-prompt p { font-size: 13px; color: var(--text-muted); }
    .file-upload-area { border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.15s; color: var(--text-muted); font-size: 13px; text-align: center; }
    .file-upload-area:hover, .file-upload-area.has-file { border-color: var(--accent); background: var(--accent-subtle); color: var(--accent); }
    .file-name { font-size: 12px; font-family: 'Geist Mono', monospace; color: var(--accent); }
    .apply-btn { width: 100%; justify-content: center; margin-top: 4px; }
    .applied-state { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; background: var(--success-subtle); border: 1px solid rgba(34,197,94,0.2); border-radius: var(--radius-sm); color: var(--success); font-size: 14px; font-weight: 500; margin-top: 8px; }
    .admin-actions { margin-top: 4px; }
    .admin-actions h3 { font-size: 15px; font-weight: 600;color: var(--text-primary); }
    .skeleton-detail { height: 400px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-lg); animation: pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .description-card { min-height: 200px; }
  `]
})
export class JobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private appService = inject(ApplicationService);
  showDeleteModal = false;

openDeleteModal(job: any) {
  this.job = job;
  this.showDeleteModal = true;
}

closeModal() {
  this.showDeleteModal = false;
}

  auth = inject(AuthService);

  job = signal<Job | null>(null);
  loading = signal(true);
  selectedFile = signal<File | null>(null);
  applyLoading = signal(false);
  applyError = signal('');
  applied = signal(false);
  deleteLoading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.jobService.getJob(id).subscribe({
      next: (job) => { this.job.set(job); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.selectedFile.set(input.files[0]);
  }

  submitApplication() {
    if (!this.selectedFile() || !this.job()) return;
    this.applyLoading.set(true);
    this.applyError.set('');
    this.appService.apply(this.job()!._id, this.selectedFile()!).subscribe({
      next: () => { this.applied.set(true); this.applyLoading.set(false); },
      error: (e) => { this.applyError.set(e.error?.msg || 'Application failed'); this.applyLoading.set(false); }
    });
  }

  deleteJob() {
    this.deleteLoading.set(true);
    this.jobService.deleteJob(this.job()!._id).subscribe({
      next: () => this.router.navigate(['/jobs']),
      error: () => this.deleteLoading.set(false)
    });
  }
}
