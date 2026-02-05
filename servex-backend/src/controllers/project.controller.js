// src/controllers/project.controller.js
const Project = require('../models/project.model');
const { db } = require('../config/firebase.config');

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, service, budget } = req.body;
    const clientEmail = req.user.email;
    const clientName = req.user.name; // Get name from JWT token

    const project = new Project({
      name,
      description,
      service,
      budget,
      clientEmail,
      clientName, // Add client name
      status: 'pending'
    });

    const savedProject = await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

// Get all projects for logged-in user
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.findByEmail(req.user.email);

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns this project
    if (project.clientEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

// Update project status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Only admin can update status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update project status'
      });
    }

    await Project.update(id, { status });

    res.status(200).json({
      success: true,
      message: 'Project status updated'
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns this project
    if (project.clientEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Project.delete(id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

// Get ALL projects (Admin only)
exports.getAllProjects = async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Get all projects from all users
    const snapshot = await db.collection('projects').get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const projects = snapshot.docs.map(doc => doc.data());
    
    // Sort by creation date (newest first)
    projects.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};