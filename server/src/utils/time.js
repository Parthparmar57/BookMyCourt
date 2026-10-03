import { addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, isBefore, isAfter } from 'date-fns';

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
