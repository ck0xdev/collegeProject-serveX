// src/app/models/project.model.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  service: string;
  budget: string;
  amount?: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'rejected';
  clientEmail: string;
  clientName?: string;
  progress?: number; // 0-100
  createdAt: Date | any;
  updatedAt: Date | any;
  files?: FileMetadata[];
  adminNotes?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date | any;
  uploadedBy: string;
  type: string; // 'deliverable' | 'document' | 'image'
}

export interface ProjectRequest {
  name: string;
  description: string;
  service: string;
  budget: string;
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data?: Project | Project[];
}

export interface UpdateProjectRequest {
  status?: string;
  progress?: number;
  amount?: string;
  adminNotes?: string;
}