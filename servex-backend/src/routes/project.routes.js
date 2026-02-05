// src/routes/project.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const projectController = require('../controllers/project.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');

// Validation rules
const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('service').trim().notEmpty().withMessage('Service type is required'),
  body('budget').trim().notEmpty().withMessage('Budget is required')
];

// All routes require authentication
router.use(verifyToken);

// Routes
router.post('/', validateProject, handleValidationErrors, projectController.createProject);
router.get('/', projectController.getMyProjects);
router.get('/:id', projectController.getProject);
router.put('/:id/status', projectController.updateProjectStatus);
router.delete('/:id', projectController.deleteProject);
// Admin-only route to get ALL projects
router.get('/admin/all', projectController.getAllProjects);

module.exports = router;