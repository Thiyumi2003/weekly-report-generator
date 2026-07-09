const WeeklyReport = require('../models/WeeklyReport');
const Project = require('../models/Project');
const User = require('../models/User');
const openai = require('../config/openai');
const { getRelevantReports } = require('../utils/aiAssistant');

// @desc    Get Dashboard Summary Metrics (Cards)
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'Team Member') {
      query.user = req.user.id;
    }

    // 1. Total Reports
    const totalReports = await WeeklyReport.countDocuments(query);

    // 2. Manager summary cards
    let reportsSubmitted = 0;
    let pendingReports = 0;

    if (req.user.role === 'Manager') {
      reportsSubmitted = await WeeklyReport.countDocuments({ ...query, status: 'Approved' });
      pendingReports = await WeeklyReport.countDocuments({ ...query, status: { $in: ['Submitted', 'Late'] } });
    } else {
      const submittedQuery = { ...query, status: { $in: ['Submitted', 'Late', 'Approved'] } };
      reportsSubmitted = await WeeklyReport.countDocuments(submittedQuery);
      const pendingQuery = { ...query, status: 'Draft' };
      pendingReports = await WeeklyReport.countDocuments(pendingQuery);
    }

    // 4. Open Blockers (Reports with non-empty blockers list)
    const blockersQuery = { 
      ...query, 
      blockers: { $exists: true, $not: { $size: 0 } },
      status: { $ne: 'Approved' } // Only count active blockers in non-approved reports
    };
    const openBlockers = await WeeklyReport.countDocuments(blockersQuery);

    res.status(200).json({
      success: true,
      summary: {
        totalReports,
        reportsSubmitted,
        pendingReports,
        openBlockers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Dashboard Chart Data
// @route   GET /api/dashboard/charts
// @access  Private
exports.getCharts = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'Team Member') {
      query.user = req.user.id;
    }

    const reports = await WeeklyReport.find(query)
      .populate('project', 'name')
      .populate('user', 'name');

    // Chart 1: Tasks Completed by Week
    // Group reports by week and sum up length of tasksCompleted
    const weekMap = {};
    reports.forEach(r => {
      if (!weekMap[r.week]) {
        weekMap[r.week] = { week: r.week, tasksCompleted: 0, tasksPlanned: 0 };
      }
      weekMap[r.week].tasksCompleted += r.tasksCompleted ? r.tasksCompleted.length : 0;
      weekMap[r.week].tasksPlanned += r.tasksPlanned ? r.tasksPlanned.length : 0;
    });
    const tasksByWeek = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week)).slice(-8); // Limit to last 8 weeks

    // Chart 2: Submission Status
    const statusCounts = { Draft: 0, Submitted: 0, Late: 0, Approved: 0 };
    reports.forEach(r => {
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status]++;
      }
    });
    const submissionStatus = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));

    // Chart 3: Workload by Project (hours worked per project)
    const projectHoursMap = {};
    reports.forEach(r => {
      const projectName = r.project ? r.project.name : 'Unknown Project';
      if (!projectHoursMap[projectName]) {
        projectHoursMap[projectName] = 0;
      }
      projectHoursMap[projectName] += r.hoursWorked || 0;
    });
    const workloadByProject = Object.keys(projectHoursMap).map(name => ({
      name,
      value: projectHoursMap[name]
    }));

    // Chart 4: Reports Trend
    // Group submissions count by week
    const reportTrendMap = {};
    reports.forEach(r => {
      if (!reportTrendMap[r.week]) {
        reportTrendMap[r.week] = { week: r.week, count: 0 };
      }
      if (r.status !== 'Draft') {
        reportTrendMap[r.week].count++;
      }
    });
    const reportsTrend = Object.values(reportTrendMap).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);

    // Recent Activity Table (Last 5 reports)
    const recentActivity = reports
      .filter(r => r.status !== 'Draft')
      .sort((a, b) => (b.submittedAt || b.createdAt) - (a.submittedAt || a.createdAt))
      .slice(0, 5)
      .map(r => ({
        _id: r._id,
        user: r.user ? r.user.name : 'Unknown User',
        project: r.project ? r.project.name : 'Unknown Project',
        week: r.week,
        status: r.status,
        submittedAt: r.submittedAt || r.createdAt
      }));

    res.status(200).json({
      success: true,
      charts: {
        tasksByWeek,
        submissionStatus,
        workloadByProject,
        reportsTrend,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask AI Assistant about weekly reports
// @route   POST /api/dashboard/ai
// @access  Private (Manager Only)
exports.askAIAssistant = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search or question query' });
    }

    // Fetch reports with populate
    const reports = await WeeklyReport.find()
      .populate('user', 'name email')
      .populate('project', 'name')
      .sort({ week: -1 });

    if (reports.length === 0) {
      return res.status(200).json({
        success: true,
        answer: 'No reports have been submitted to the database yet, so I cannot summarize any work.',
        mode: 'demo'
      });
    }

    const users = await User.find({ role: 'Team Member' });
    const { targetUser, contextReports } = getRelevantReports(reports, query, users);
    let answer = '';

    const toArray = (value) => Array.isArray(value) ? value : [];

    // Standard format for AI Context
    const reportsContext = contextReports.map(r => ({
      employee: r.user ? r.user.name : 'Unknown',
      week: r.week,
      project: r.project ? r.project.name : 'N/A',
      tasksCompleted: toArray(r.tasksCompleted).join(', '),
      tasksPlanned: toArray(r.tasksPlanned).join(', '),
      blockers: toArray(r.blockers).join(', '),
      hoursWorked: r.hoursWorked,
      notes: r.notes,
      status: r.status
    }));

    if (targetUser) {
      const userReports = contextReports.filter(r => r.user && r.user._id.toString() === targetUser._id.toString());
      if (userReports.length === 0) {
        answer = `I found employee **${targetUser.name}** in the database, but they haven't submitted any weekly reports yet.`;
      } else {
        const latest = userReports[0];
        answer = `### Summary for ${targetUser.name}\n\n`;
        answer += `Here is a summary of **${targetUser.name}**'s latest work on **${latest.project ? latest.project.name : 'their project'}** (${latest.week}):\n\n`;
        answer += `* **Tasks Completed:**\n`;
        latest.tasksCompleted.forEach(t => { answer += `  - ${t}\n`; });
        if (latest.tasksCompleted.length === 0) answer += `  - None reported\n`;
        
        answer += `* **Tasks Planned:**\n`;
        latest.tasksPlanned.forEach(t => { answer += `  - ${t}\n`; });
        if (latest.tasksPlanned.length === 0) answer += `  - None reported\n`;

        answer += `* **Blockers:**\n`;
        if (latest.blockers.length > 0) {
          latest.blockers.forEach(b => { answer += `  - ⚠️ ${b}\n`; });
        } else {
          answer += `  - None reported (smooth sailing!)\n`;
        }
        answer += `\n* **Total Hours Worked:** ${latest.hoursWorked} hours.`;
        if (userReports.length > 1) {
          answer += `\n\n*Note: They have submitted a total of ${userReports.length} reports in the history.*`;
        }
      }

      return res.status(200).json({
        success: true,
        answer,
        mode: 'demo'
      });
    }

    // If OpenAI is initialized, query ChatGPT
    if (openai) {
      try {
        const scopeText = 'You are helping a Manager analyze weekly reports submitted by their team.';

        const systemPrompt = `You are TeamPulse Assistant, an expert AI agent inside a team productivity dashboard.
${scopeText}
Below is the JSON structured data representing the relevant weekly reports:
${JSON.stringify(reportsContext, null, 2)}

Answer the user's question concisely, directly, and in a professional manner. 
Use bullet points, highlighting, and short paragraphs. Avoid long introductory or concluding text.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.5,
          max_tokens: 600
        });

        return res.status(200).json({
          success: true,
          answer: response.choices[0].message.content,
          mode: 'openai'
        });
      } catch (aiError) {
        console.error('OpenAI API request error:', aiError.message);
        // Fallback to rule-based mock engine if OpenAI fails during API call
      }
    }

    // Rule-based Fallback Mock Engine (NLP-lite)
    const lowerQuery = query.toLowerCase();

    if (targetUser) {
      const userReports = contextReports.filter(r => r.user && r.user._id.toString() === targetUser._id.toString());
      if (userReports.length === 0) {
        answer = `I found employee **${targetUser.name}** in the database, but they haven't submitted any weekly reports yet.`;
      } else {
        const latest = userReports[0];
        answer = `### Summary for ${targetUser.name}\n\n`;
        answer += `Here is a summary of **${targetUser.name}**'s latest work on **${latest.project ? latest.project.name : 'their project'}** (${latest.week}):\n\n`;
        answer += `* **Tasks Completed:**\n`;
        latest.tasksCompleted.forEach(t => { answer += `  - ${t}\n`; });
        if (latest.tasksCompleted.length === 0) answer += `  - None reported\n`;
        
        answer += `* **Tasks Planned:**\n`;
        latest.tasksPlanned.forEach(t => { answer += `  - ${t}\n`; });
        if (latest.tasksPlanned.length === 0) answer += `  - None reported\n`;

        answer += `* **Blockers:**\n`;
        if (latest.blockers.length > 0) {
          latest.blockers.forEach(b => { answer += `  - ⚠️ ${b}\n`; });
        } else {
          answer += `  - None reported (smooth sailing!)\n`;
        }
        answer += `\n* **Total Hours Worked:** ${latest.hoursWorked} hours.`;
        if (userReports.length > 1) {
          answer += `\n\n*Note: They have submitted a total of ${userReports.length} reports in the history.*`;
        }
      }
    } else if (lowerQuery.includes('blocker') || lowerQuery.includes('blocking') || lowerQuery.includes('impediment')) {
      const reportsWithBlockers = reports.filter(r => r.blockers && r.blockers.length > 0);
      if (reportsWithBlockers.length === 0) {
        answer = `### Team Blockers Report\n\nNo team members have reported any blockers in their reports. Everything is on track!`;
      } else {
        answer = `### Active Team Blockers\n\nHere are the recurring issues and blockers reported by the team:\n\n`;
        reportsWithBlockers.forEach(r => {
          answer += `* **${r.user ? r.user.name : 'Unknown User'}** (${r.week} on Project: *${r.project ? r.project.name : 'N/A'}*):\n`;
          r.blockers.forEach(b => {
            answer += `  - ⚠️ ${b}\n`;
          });
        });
      }
    } else if (lowerQuery.includes('summarize') || lowerQuery.includes('summary') || lowerQuery.includes('this week') || lowerQuery.includes('last week')) {
      // General summary of recent reports
      const recentReports = reports.slice(0, 5);
      answer = `### Weekly Team Work Summary\n\nHere is an overview of the work done by the team across projects recently:\n\n`;
      recentReports.forEach(r => {
        answer += `* **${r.user ? r.user.name : 'Employee'}** on *${r.project ? r.project.name : 'Project'}* (${r.week}):\n`;
        answer += `  - Completed: ${r.tasksCompleted.join(', ') || 'No tasks listed'}\n`;
        if (r.blockers.length > 0) {
          answer += `  - ⚠️ Blockers: ${r.blockers.join(', ')}\n`;
        }
      });
      
      const totalHours = reports.reduce((sum, r) => sum + r.hoursWorked, 0);
      answer += `\n**Total Team Logged Hours:** ${totalHours} hrs across all reports.`;
    } else {
      // Default help text / fallback summary
      answer = `### TeamPulse Assistant (Demo Mode)\n\nI couldn't identify a specific command in your question. As a demo helper, I can answer queries like:\n\n`;
      answer += `1. **"What did [Employee Name] work on?"** (e.g., "What did John work on last week?")\n`;
      answer += `2. **"Show recurring blockers."** / "What is blocking the team?"\n`;
      answer += `3. **"Summarize this week's work."**\n\n`;
      answer += `*Currently scanning ${reports.length} report(s) in the database.*`;
    }

    res.status(200).json({
      success: true,
      answer,
      mode: 'demo'
    });
  } catch (error) {
    next(error);
  }
};
