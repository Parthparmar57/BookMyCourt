import { broadcastEvent } from '../lib/socket.js';

export const emitLeaveRequested = (leave) => {
  broadcastEvent('leave_requested', leave);
};

export const emitLeaveStatusUpdated = (leave) => {
  broadcastEvent('leave_status_updated', leave);
};
