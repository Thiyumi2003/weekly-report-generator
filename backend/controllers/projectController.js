const Project = require('../models/Project');

// @desc    Get All Projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().populate('createdBy', 'name email');
    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Project
// @route   POST /api/projects
// @access  Private (Manager Only)
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.create({
      name,
      description,
      status: status || 'Active',
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Project
// @route   PUT /api/projects/:id
// @access  Private (Manager Only)
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Project
// @route   DELETE /api/projects/:id
// @access  Private (Manager Only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
