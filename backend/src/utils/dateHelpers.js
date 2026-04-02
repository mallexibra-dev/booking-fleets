/**
 * Date Utility Functions
 */

const { isBefore, isAfter, areIntervalsOverlapping } = require('date-fns');

/**
 * Check if two time intervals overlap
 * @param {Date} start1 - Start time of first interval
 * @param {Date} end1 - End time of first interval
 * @param {Date} start2 - Start time of second interval
 * @param {Date} end2 - End time of second interval
 * @returns {boolean}
 */
const hasTimeOverlap = (start1, end1, start2, end2) => {
  return areIntervalsOverlapping(
    { start: start1, end: end1 },
    { start: start2, end: end2 }
  );
};

/**
 * Validate that end time is after start time
 * @param {Date} startTime
 * @param {Date} endTime
 * @returns {boolean}
 */
const isValidTimeRange = (startTime, endTime) => {
  return isAfter(new Date(endTime), new Date(startTime));
};

/**
 * Check if a date is in the past
 * @param {Date} date
 * @returns {boolean}
 */
const isPastDate = (date) => {
  return isBefore(new Date(date), new Date());
};

module.exports = {
  hasTimeOverlap,
  isValidTimeRange,
  isPastDate,
};
