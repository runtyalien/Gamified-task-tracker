#!/usr/bin/env node

const { getStartOfDay } = require('./src/utils/dateUtils');

console.log('🔍 Testing IST date alignment...\n');

// Test with current date in various formats
const now = new Date();
console.log('Current time (UTC):', now.toISOString());

// Simulate frontend sending YYYY-MM-DD
const frontendDate = now.toISOString().split('T')[0];
console.log('Frontend date format:', frontendDate);

// How backend will parse it
const backendStartOfDay = getStartOfDay(frontendDate);
console.log('Backend start of day (IST logic):', backendStartOfDay.toISOString());

// IST current time for reference
const istOffset = 5.5 * 60 * 60 * 1000;
const istTime = new Date(now.getTime() + istOffset);
console.log('Current IST time:', istTime.toISOString());
console.log('IST date:', istTime.toISOString().split('T')[0]);

// Test the new IST-based frontend date
const getCurrentDateIST = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().split('T')[0];
};

const frontendISTDate = getCurrentDateIST();
console.log('\nNew frontend IST date:', frontendISTDate);
const backendISTStartOfDay = getStartOfDay(frontendISTDate);
console.log('Backend start of day (with IST frontend):', backendISTStartOfDay.toISOString());

// Check if they now match for today
console.log('\nAlignment check:');
console.log('Frontend IST date:', frontendISTDate);
console.log('Backend expects date for queries:', backendISTStartOfDay.toISOString());
console.log('Dates should align for:', frontendISTDate === backendISTStartOfDay.toISOString().split('T')[0]);
