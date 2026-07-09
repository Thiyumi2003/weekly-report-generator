const WeeklyReport = require('../models/WeeklyReport');
const Project = require('../models/Project');

// @desc    Get All Reports (Filtered)
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res, next) => {
  try {
    let query = {};

    // Authorization: Members see only their own reports, Managers see all
    if (req.user.role === 'Team Member') {
      query.user = req.user.id;
    } else if (req.query.member) {
      // Manager filtering by member ID
      query.user = req.query.member;
    }

    // Filters
    if (req.query.project) {
      query.project = req.query.project;
    }
    if (req.query.week) {
      query.week = req.query.week;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Date range filters
    if (req.query.startDate && req.query.endDate) {
      query.startDate = { $gte: new Date(req.query.startDate) };
      query.endDate = { $lte: new Date(req.query.endDate) };
    } else if (req.query.startDate) {
      query.startDate = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.endDate = { $lte: new Date(req.query.endDate) };
    }

    // Text search query
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      query.$or = [
        { tasksCompleted: searchRegex },
        { tasksPlanned: searchRegex },
        { blockers: searchRegex },
        { notes: searchRegex }
      ];
    }

    const reports = await WeeklyReport.find(query)
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort({ startDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res, next) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('project', 'name');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Authorization
    if (req.user.role === 'Team Member' && report.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Weekly Report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    const { week, startDate, endDate, project, tasksCompleted, tasksPlanned, blockers, hoursWorked, notes, status } = req.body;

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if report already exists for this week/project/user combination
    const existingReport = await WeeklyReport.findOne({
      user: req.user.id,
      week,
      project
    });

    if (existingReport) {
      return res.status(400).json({ 
        success: false, 
        message: `You have already created a report for project '${projectExists.name}' for week '${week}'.` 
      });
    }

    const reportData = {
      user: req.user.id,
      week,
      startDate,
      endDate,
      project,
      tasksCompleted,
      tasksPlanned,
      blockers: blockers || [],
      hoursWorked,
      notes: notes || '',
      status: status || 'Draft'
    };

    if (status === 'Submitted' || status === 'Late') {
      reportData.submittedAt = Date.now();
    }

    const report = await WeeklyReport.create(reportData);

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Weekly Report
// @route   PUT /api/reports/:id
// @access  Private
exports.updateReport = async (req, res, next) => {
  try {
    let report = await WeeklyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Authorization
    const isOwner = report.user.toString() === req.user.id;
    const isManager = req.user.role === 'Manager';

    if (!isOwner && !isManager) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this report' });
    }

    // Team members can't edit approved reports
    if (!isManager && report.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Approved reports cannot be modified by team members' });
    }

    const updateFields = { ...req.body };

    // Set submittedAt timestamp if status is changing to Submitted
    if ((req.body.status === 'Submitted' || req.body.status === 'Late') && report.status === 'Draft') {
      updateFields.submittedAt = Date.now();
    }

    // Only managers can set status to Approved
    if (req.body.status === 'Approved' && !isManager) {
      return res.status(403).json({ success: false, message: 'Only managers can approve reports' });
    }

    report = await WeeklyReport.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    }).populate('project', 'name');

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Weekly Report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await WeeklyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Authorization: Owner or Manager
    if (report.user.toString() !== req.user.id && req.user.role !== 'Manager') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
    }

    // Team members can't delete approved reports
    if (req.user.role === 'Team Member' && report.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Approved reports cannot be deleted' });
    }

    await WeeklyReport.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
