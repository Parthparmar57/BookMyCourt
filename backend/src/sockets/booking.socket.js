import { broadcastEvent } from '../lib/socket.js';

export const emitBookingUpdate = (booking) => {
  broadcastEvent('booking_changed', booking);
};
