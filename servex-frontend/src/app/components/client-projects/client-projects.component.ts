// src/app/components/client-projects/client-projects.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CreateProjectComponent } from '../create-project/create-project.component';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { User } from '../../models/user.model';
import { Project } from '../../models/project.model';
import { ChatBoxComponent } from '../chat-box/chat-box.component';

@Component({
  selector: 'app-client-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, CreateProjectComponent, ChatBoxComponent],
  templateUrl: './client-projects.component.html',
  styleUrl: './client-projects.component.css'
})
export class ClientProjectsComponent implements OnInit {
  currentUser: User | null = null;
  projects: Project[] = [];
  loading = true;
  showCreateProject = false;

  pendingProjects: Project[] = [];
  activeProjects: Project[] = [];
  completedProjects: Project[] = [];
  rejectedProjects: Project[] = [];

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    
    // Redirect admin to admin dashboard
    if (this.currentUser?.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.loadProjects();
  }

  loadProjects() {
  console.log('🔄 Loading projects...');
  this.loading = true;
  this.projectService.getMyProjects().subscribe({
    next: (response) => {
      console.log('✅ Projects response:', response);
      this.loading = false;
      if (response.success && Array.isArray(response.data)) {
        console.log('📊 Projects data:', response.data);
        this.projects = response.data;
        this.categorizeProjects();
      } else {
        console.log('⚠️ Response not successful or not array:', response);
      }
    },
    error: (error) => {
      console.error('❌ Failed to load projects:', error);
      this.loading = false;
    }
  });
}

  categorizeProjects() {
    this.pendingProjects = this.projects.filter(p => p.status === 'pending');
    this.activeProjects = this.projects.filter(p => p.status === 'accepted' || p.status === 'in-progress');
    this.completedProjects = this.projects.filter(p => p.status === 'completed');
    this.rejectedProjects = this.projects.filter(p => p.status === 'rejected');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'badge-pending',
      'accepted': 'badge-accepted',
      'in-progress': 'badge-active',
      'completed': 'badge-completed',
      'rejected': 'badge-rejected'
    };
    return statusMap[status] || 'badge-pending';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': '⏳ Pending Review',
      'accepted': '✅ Accepted',
      'in-progress': '🚀 In Progress',
      'completed': '🎉 Completed',
      'rejected': '❌ Rejected'
    };
    return statusMap[status] || status;
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  onProjectCreated() {
  console.log('✅ Project created! Reloading...');
  this.showCreateProject = false;
  setTimeout(() => {
    this.loadProjects();
  }, 500);
}
}