// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CreateProjectComponent } from '../create-project/create-project.component';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { User } from '../../models/user.model';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    CreateProjectComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  projects: Project[] = [];
  loading = true;
  showCreateProject = false;

  stats = {
    activeProjects: 0,
    pendingTasks: 0,
    totalInvested: 0,
  };

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getMyProjects().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && Array.isArray(response.data)) {
          this.projects = response.data;
          this.calculateStats();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load projects:', error);
      },
    });
  }

  calculateStats() {
    this.stats.activeProjects = this.projects.filter(
      (p) => p.status === 'accepted' || p.status === 'in-progress',
    ).length;
    this.stats.pendingTasks = this.projects.filter(
      (p) => p.status === 'pending',
    ).length;

    // Calculate total invested (remove $ and convert to number)
    this.stats.totalInvested = this.projects.reduce((total, project) => {
      const amount = project.amount
        ? parseFloat(project.amount.replace(/[$,]/g, ''))
        : 0;
      return total + amount;
    }, 0);
  }

  getStatusClass(status: string): string {
    return `badge-${status}`;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      active: 'In Progress',
      completed: 'Completed',
    };
    return statusMap[status] || status;
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  onProjectCreated() {
    this.showCreateProject = false;
    // Force immediate reload
    setTimeout(() => {
      this.loadProjects();
    }, 500);
  }
}
