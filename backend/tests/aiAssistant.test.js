const test = require('node:test');
const assert = require('node:assert/strict');
const WeeklyReport = require('../models/WeeklyReport');
const User = require('../models/User');
const { getRelevantReports } = require('../utils/aiAssistant');
const { askAIAssistant } = require('../controllers/dashboardController');

test('getRelevantReports filters to the named employee for person-specific questions', () => {
  const reports = [
    { _id: '1', week: '2026-W28', user: { _id: 'u1', name: 'Nipun' }, tasksCompleted: ['Task A'] },
    { _id: '2', week: '2026-W28', user: { _id: 'u2', name: 'Sara' }, tasksCompleted: ['Task B'] }
  ];
  const users = [{ _id: 'u1', name: 'Nipun' }, { _id: 'u2', name: 'Sara' }];

  const result = getRelevantReports(reports, 'What did Nipun work on this week?', users);

  assert.equal(result.targetUser.name, 'Nipun');
  assert.equal(result.contextReports.length, 1);
  assert.equal(result.contextReports[0]._id, '1');
});

test('getRelevantReports keeps team-wide context when no specific person is requested', () => {
  const reports = [
    { _id: '1', week: '2026-W28', user: { _id: 'u1', name: 'Nipun' }, tasksCompleted: ['Task A'] },
    { _id: '2', week: '2026-W28', user: { _id: 'u2', name: 'Sara' }, tasksCompleted: ['Task B'] }
  ];
  const users = [{ _id: 'u1', name: 'Nipun' }, { _id: 'u2', name: 'Sara' }];

  const result = getRelevantReports(reports, 'Summarize this week for the team', users);

  assert.equal(result.targetUser, null);
  assert.equal(result.contextReports.length, 2);
});

test('askAIAssistant responds without crashing for person-specific questions', async () => {
  const originalFindReports = WeeklyReport.find;
  const originalFindUsers = User.find;

  WeeklyReport.find = () => ({
    populate: () => ({
      populate: () => ({
        sort: () => [
          {
            week: '2026-W28',
            user: { _id: 'u1', name: 'Nipun' },
            project: { name: 'Alpha' },
            tasksCompleted: ['Implemented login flow'],
            tasksPlanned: ['Write tests'],
            blockers: [],
            hoursWorked: 40,
            notes: 'Done',
            status: 'Submitted'
          }
        ]
      })
    })
  });

  User.find = () => [{ _id: 'u1', name: 'Nipun' }];

  const req = {
    body: { query: 'What did Nipun work on this week?' },
    user: { role: 'Manager' }
  };
  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
    }
  };

  try {
    await askAIAssistant(req, res, () => {
      throw new Error('next should not be called');
    });

    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.payload.answer, 'string');
  } finally {
    WeeklyReport.find = originalFindReports;
    User.find = originalFindUsers;
  }
});
