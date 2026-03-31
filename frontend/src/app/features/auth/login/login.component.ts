import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your account</p>
        </div>

        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" type="email" formControlName="email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" formControlName="password" placeholder="••••••••" />
          </div>
          <button type="submit" class="btn btn-primary auth-submit" [disabled]="loading || form.invalid">
            @if (loading) { <span class="spinner"></span> } Signin
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Register</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 36px;
    }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .auth-icon {
      width: 52px; height: 52px;
      background: var(--accent-subtle);
      border-radius: var(--radius);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      color: var(--accent);
    }
    .auth-header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .auth-header p { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
    .auth-submit { width: 100%; justify-content: center; padding: 12px; }
    .auth-footer { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 20px; }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = false;
  error = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/jobs']),
      error: (e) => { this.error = e.error?.msg || 'Login failed'; this.loading = false; }
    });
  }
}
