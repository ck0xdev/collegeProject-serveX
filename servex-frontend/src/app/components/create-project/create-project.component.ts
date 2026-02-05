// src/app/components/create-project/create-project.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { ProjectRequest } from '../../models/project.model';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css'
})
export class CreateProjectComponent {
  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<void>();

  formData: ProjectRequest = {
    name: '',
    description: '',
    service: '',
    budget: ''
  };

  services = [
    'Web Development',
    'UI/UX Design',
    'App Development',
    'Backend Development',
    'Consulting'
  ];

  budgets = [
    'Micro ($500 - $1k)',
    'Standard ($1k - $5k)',
    'Pro ($5k+)'
  ];

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private projectService: ProjectService) {}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formData.name || !this.formData.description || !this.formData.service || !this.formData.budget) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;

    this.projectService.createProject(this.formData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = 'Project created successfully!';
          setTimeout(() => {
            this.projectCreated.emit();
            this.closeModal();
          }, 1000);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to create project';
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}