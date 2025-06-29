const { getStartOfDay } = require('./src/utils/dateUtils');

// Test date handling
console.log('=== Date Handling Debug ===');

const now = new Date();
console.log('Current date/time:', now.toISOString());
console.log('Current date (local):', now.toLocaleString());

const startOfToday = getStartOfDay(now);
console.log('Start of today:', startOfToday.toISOString());
console.log('Start of today (local):', startOfToday.toLocaleString());

// Test what happens when we submit right now
const submittedAt = new Date();
const submissionDate = getStartOfDay(submittedAt);
console.log('\nSubmission test:');
console.log('Submitted at:', submittedAt.toISOString());
console.log('Submission date (start of day):', submissionDate.toISOString());

// Check if dates match
const isToday = (
  submittedAt.getDate() === submissionDate.getDate() &&
  submittedAt.getMonth() === submissionDate.getMonth() &&
  submittedAt.getFullYear() === submissionDate.getFullYear()
);

console.log('Is submission today?', isToday);

// Test with a specific recent submission timestamp
const recentSubmissionISO = '2024-12-19T13:45:00.000Z'; // Example from recent submissions
const recentSubmission = new Date(recentSubmissionISO);
const recentSubmissionDate = getStartOfDay(recentSubmission);

console.log('\nRecent submission test:');
console.log('Recent submission:', recentSubmission.toISOString());
console.log('Recent submission (local):', recentSubmission.toLocaleString());
console.log('Recent submission date:', recentSubmissionDate.toISOString());
console.log('Recent submission date (local):', recentSubmissionDate.toLocaleString());

// Compare with today
console.log('\nDate comparison:');
console.log('Today start:', startOfToday.toISOString());
console.log('Recent submission date:', recentSubmissionDate.toISOString());
console.log('Are they the same?', startOfToday.getTime() === recentSubmissionDate.getTime());
