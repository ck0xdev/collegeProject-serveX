// src/app/components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { User } from '../../models/user.model';
import { Project } from '../../models/project.model';
import { ChatBoxComponent } from '../chat-box/chat-box.component';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, ChatBoxComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  allProjects: Project[] = [];
  loading = true;
  selectedProject: Project | null = null;
  showProjectModal = false;

  // Filters
  filterStatus: string = 'all';

  // Update form
  updateData = {
    status: '',
    progress: 0,
    amount: '',
    adminNotes: '',
  };

  stats = {
    totalProjects: 0,
    pendingRequests: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
  };

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    // Only admins can access
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadAllProjects();
  }

  loadAllProjects() {
    this.loading = true;
    this.projectService.getAllProjectsAdmin().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && Array.isArray(response.data)) {
          this.allProjects = response.data;
          this.calculateStats();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load projects:', error);
        alert(
          'Failed to load projects: ' +
            (error.error?.message || 'Unknown error'),
        );
      },
    });
  }

  calculateStats() {
    this.stats.totalProjects = this.allProjects.length;
    this.stats.pendingRequests = this.allProjects.filter(
      (p) => p.status === 'pending',
    ).length;
    this.stats.activeProjects = this.allProjects.filter(
      (p) => p.status === 'accepted' || p.status === 'in-progress',
    ).length;
    this.stats.completedProjects = this.allProjects.filter(
      (p) => p.status === 'completed',
    ).length;

    this.stats.totalRevenue = this.allProjects
      .filter((p) => p.status === 'completed')
      .reduce((total, project) => {
        const amount = project.amount
          ? parseFloat(project.amount.replace(/[$,]/g, ''))
          : 0;
        return total + amount;
      }, 0);
  }

  get filteredProjects(): Project[] {
    if (this.filterStatus === 'all') {
      return this.allProjects;
    }
    return this.allProjects.filter((p) => p.status === this.filterStatus);
  }

  openProjectModal(project: Project) {
    this.selectedProject = project;
    this.updateData = {
      status: project.status,
      progress: project.progress || 0,
      amount: project.amount || project.budget,
      adminNotes: project.adminNotes || '',
    };
    this.showProjectModal = true;
  }

  closeProjectModal() {
    this.showProjectModal = false;
    this.selectedProject = null;
  }

  acceptProject() {
    if (!this.selectedProject) return;

    this.updateData.status = 'accepted';
    this.updateProject();
  }

  rejectProject() {
    if (!this.selectedProject) return;

    if (!this.updateData.adminNotes) {
      alert('Please add a note explaining why the project was rejected');
      return;
    }

    this.updateData.status = 'rejected';
    this.updateProject();
  }

  updateProject() {
    if (!this.selectedProject) return;

    const updatePayload: any = {
      status: this.updateData.status,
    };

    if (this.updateData.progress !== undefined) {
      updatePayload.progress = this.updateData.progress;
    }

    if (this.updateData.amount) {
      updatePayload.amount = this.updateData.amount;
    }

    if (this.updateData.adminNotes) {
      updatePayload.adminNotes = this.updateData.adminNotes;
    }

    this.projectService
      .updateStatus(this.selectedProject.id, this.updateData.status)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Project updated successfully!');
            this.closeProjectModal();
            this.loadAllProjects();
          }
        },
        error: (error) => {
          console.error('Update failed:', error);
          alert(
            'Failed to update project: ' +
              (error.error?.message || 'Unknown error'),
          );
        },
      });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      'in-progress': 'status-progress',
      completed: 'status-completed',
      rejected: 'status-rejected',
    };
    return statusMap[status] || 'status-pending';
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
