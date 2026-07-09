const test = require('node:test');
const assert = require('node:assert/strict');
const { validationResult } = require('express-validator');
const { reportRules, reportUpdateRules } = require('../validations/reportValidation');

async function runValidation(rules, body) {
  const req = { body };
  const res = {};
  const next = () => {};

  for (const rule of rules) {
    await rule(req, res, next);
  }

  return validationResult(req);
}

test('reportUpdateRules allows a status-only approval update', async () => {
  const errors = await runValidation(reportUpdateRules, { status: 'Approved' });

  assert.equal(errors.isEmpty(), true, errors.array().map(err => err.msg).join(', '));
});

test('reportUpdateRules validates a full report update payload', async () => {
  const errors = await runValidation(reportUpdateRules, {
    week: '2026-W28',
    startDate: '2026-07-06',
    endDate: '2026-07-12',
    project: '507f1f77bcf86cd799439011',
    tasksCompleted: ['Task A'],
    tasksPlanned: ['Task B'],
    blockers: [],
    hoursWorked: 40,
    notes: 'Done',
    status: 'Submitted'
  });

  assert.equal(errors.isEmpty(), true, errors.array().map(err => err.msg).join(', '));
});
