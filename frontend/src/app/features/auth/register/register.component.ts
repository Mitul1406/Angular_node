import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h1>Create account</h1>
          <p>Get started with WorkHive</p>
        </div>

        @if (error) { <div class="error-msg">{{ error }}</div> }
        @if (success) { <div class="success-msg">Account created! Redirecting to login...</div> }

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input class="form-input" formControlName="name" placeholder="Jane Doe" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" type="email" formControlName="email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" formControlName="password" placeholder="Min. 6 characters" />
          </div>
          <div class="auth-field">
  <label class="auth-label">Select Role</label>
  <select class="auth-select" formControlName="role">
    <option value="user">👤 Job Seeker</option>
    <option value="admin">🛠️ Admin / Recruiter</option>
  </select>
</div>
          <button type="submit" class="btn btn-primary auth-submit" [disabled]="loading || form.invalid">
            @if (loading) { <span class="spinner"></span> } Create Account
          </button>
        </form>

        <p class="auth-footer">Already have an account? <a routerLink="/auth/login">Sign in</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 24px; }
    .auth-card { width: 100%; max-width: 420px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 36px; }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .auth-icon { width: 52px; height: 52px; background: var(--accent-subtle); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--accent); }
    .auth-header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .auth-header p { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
    .auth-submit { width: 100%; justify-content: center; padding: 12px; }
    .auth-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.auth-select {
  appearance: none;
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  cursor: pointer;

  /* custom dropdown arrow */
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23666' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5.516 7.548l4.484 4.451 4.484-4.451L16 8.935l-6 5.97-6-5.97z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.auth-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

.auth-select:hover {
  border-color: var(--accent);
}
    .auth-footer { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 20px; }
    .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['user', Validators.required]
  });

  loading = false;
  error = '';
  success = false;

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (e) => { this.error = e.error?.msg || 'Registration failed'; this.loading = false; }
    });
  }
}
