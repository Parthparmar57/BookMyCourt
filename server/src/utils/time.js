import { addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, isBefore, isAfter } from 'date-fns';
import { ApiError } from './ApiError.js';

// Convert an "HH:MM" string to minutes past midnight.
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Reject a booking slot that is in the past (Rule 2) or outside the court's
// opening hours (Rule 8). `startTime` is a Date; `startHHMM` is the requested
// slot start ("HH:MM"); hours are compared as minutes-of-day to avoid tz drift.
export const assertSlotBookable = ({ startTime, startHHMM, openTime, closeTime, sessionMinutes = 60, now = new Date() }) => {
  if (startTime.getTime() < now.getTime()) {
    throw new ApiError(400, 'Cannot book a slot in the past');
  }
  const start = toMinutes(startHHMM);
  const end = start + sessionMinutes;
  if (start < toMinutes(openTime) || end > toMinutes(closeTime)) {
    throw new ApiError(422, `Booking must be within opening hours (${openTime}–${closeTime})`);
  }
};

export const parseTimeOnDate = (date, timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let d = new Date(date);
  d = setHours(d, hours);
  d = setMinutes(d, minutes);
  d = setSeconds(d, 0);
  d = setMilliseconds(d, 0);
  return d;
};

export const generateDailySlots = (date, openTime = '06:00', closeTime = '23:00', slotDuration = 60, intervalMinutes = 30) => {
  const slots = [];
  const openDate = parseTimeOnDate(date, openTime);
  const closeDate = parseTimeOnDate(date, closeTime);

  let current = new Date(openDate);
  while (isBefore(addMinutes(current, slotDuration), closeDate) || +addMinutes(current, slotDuration) === +closeDate) {
    const end = addMinutes(current, slotDuration);
    const startHour = String(current.getHours()).padStart(2, '0');
    const startMin = String(current.getMinutes()).padStart(2, '0');
    const endHour = String(end.getHours()).padStart(2, '0');
    const endMin = String(end.getMinutes()).padStart(2, '0');

    slots.push({
      startTime: new Date(current),
      endTime: new Date(end),
      timeLabel: `${startHour}:${startMin} - ${endHour}:${endMin}`,
      slotTime: `${startHour}:${startMin}`,
    });

    current = addMinutes(current, intervalMinutes);
  }

  return slots;
};
