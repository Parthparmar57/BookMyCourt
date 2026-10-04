import { emitToRoom, broadcastEvent } from '../lib/socket.js';

export const emitNewKitchenOrder = (order) => {
  emitToRoom('kitchen', 'new_kitchen_order', order);
  broadcastEvent('bar_order_updated', order);
};

export const emitKitchenStatusUpdate = (order) => {
  emitToRoom('kitchen', 'kitchen_status_changed', order);
  broadcastEvent('order_status_updated', order);
};

export const emitTableStatusUpdate = (table) => {
  broadcastEvent('table_status_updated', table);
};
