import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a class="nav-brand" routerLink="/jobs">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          WorkHive
        </a>

        <div class="nav-links">
          <a routerLink="/jobs" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Jobs</a>
          @if (auth.isLoggedIn() && !auth.isAdmin()) {
            <a routerLink="/my-applications" routerLinkActive="active">My Applications</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/admin/applications" routerLinkActive="active">Reviews</a>
            <a routerLink="/admin/post-job" routerLinkActive="active">Post Job</a>
          }
        </div>

        <div class="nav-actions">
          @if (auth.isLoggedIn()) {
            <span class="nav-role" [class.admin-badge]="auth.isAdmin()" [class.user-badge]="!auth.isAdmin()">
              {{ auth.isAdmin() ? 'Admin' : 'User' }}
            </span>
            <button class="btn btn-secondary btn-sm" (click)="toggleTheme()">
  {{ isDark ? '☀️' : '🌙' }}
</button>
            <button class="btn btn-secondary btn-sm" (click)="auth.logout()">Logout</button>
          } @else {
            <button class="btn btn-secondary btn-sm" (click)="toggleTheme()">
  {{ isDark ? '☀️' : '🌙' }}
</button>
            <a routerLink="/auth/login" class="btn btn-secondary btn-sm">Login</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm">Register</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      height: 64px;
      background: color-mix(in srgb, var(--bg) 85%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
      flex-shrink: 0;
    }
    .nav-brand svg { color: var(--accent); }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    .nav-links a {
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      color: var(--text-secondary);
      transition: color 0.15s, background 0.15s;
    }
    .nav-links a:hover { color: var(--text-primary); background: var(--bg-elevated); }
    .nav-links a.active { color: var(--text-primary); background: var(--bg-elevated); }
    .nav-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .btn-sm { padding: 7px 14px; font-size: 13px; }
    .nav-role {
      font-size: 12px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 100px;
      background: var(--bg-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
    .admin-badge { background: var(--accent-subtle); color: var(--accent); border-color: rgba(99,102,241,0.3); }
    .user-badge { background: var(--bg-elevated); color: var(--success); border-color: var(--success); }
  `]
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);

  isDark = true;

  toggleTheme() {
    this.isDark = !this.isDark;
    const body = document.body;

    if (this.isDark) {
      body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
      this.isDark = false;
      document.body.classList.add('light-theme');
    }
  }
}
