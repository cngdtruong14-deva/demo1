/**
 * Date Helper Utility
 * Date manipulation and formatting functions
 */

const moment = require('moment');

/**
 * Get current timestamp
 */
function now() {
  return moment().toDate();
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}

/**
 * Format datetime to YYYY-MM-DD HH:mm:ss
 */
function formatDateTime(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Get start of day
 */
function startOfDay(date = new Date()) {
  return moment(date).startOf('day').toDate();
}

/**
 * Get end of day
 */
function endOfDay(date = new Date()) {
  return moment(date).endOf('day').toDate();
}

/**
 * Get date range for today
 */
function todayRange() {
  return {
    start: startOfDay(),
    end: endOfDay(),
  };
}

/**
 * Get date range for this week
 */
function thisWeekRange() {
  return {
    start: moment().startOf('week').toDate(),
    end: moment().endOf('week').toDate(),
  };
}

/**
 * Get date range for this month
 */
function thisMonthRange() {
  return {
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate(),
  };
}

/**
 * Add days to date
 */
function addDays(date, days) {
  return moment(date).add(days, 'days').toDate();
}

/**
 * Subtract days from date
 */
function subtractDays(date, days) {
  return moment(date).subtract(days, 'days').toDate();
}

/**
 * Get difference in days
 */
function diffInDays(date1, date2) {
  return moment(date1).diff(moment(date2), 'days');
}

/**
 * Check if date is in the past
 */
function isPast(date) {
  return moment(date).isBefore(moment());
}

/**
 * Check if date is in the future
 */
function isFuture(date) {
  return moment(date).isAfter(moment());
}

module.exports = {
  now,
  formatDate,
  formatDateTime,
  startOfDay,
  endOfDay,
  todayRange,
  thisWeekRange,
  thisMonthRange,
  addDays,
  subtractDays,
  diffInDays,
  isPast,
  isFuture,
};

