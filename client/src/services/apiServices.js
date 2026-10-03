import { MOCK_MEMBERS, MOCK_COURTS, MOCK_SLOTS, MOCK_PLANS, MOCK_PRODUCTS, MOCK_TABLES, MOCK_KITCHEN_TICKETS, MOCK_LEADS, MOCK_DASHBOARD_METRICS } from '../data/mockData';

// Simulated latency helper
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const memberApi = {
  async getMembers() {
    await delay();
    return [...MOCK_MEMBERS];
  },
  async searchMembers(query) {
    await delay(100);
    const q = query.toLowerCase();
    return MOCK_MEMBERS.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.phone.includes(q) || 
      m.id.toLowerCase().includes(q)
    );
  },
  async createMember(newMember) {
    await delay();
    const created = {
      id: `BMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      qrCode: `BMC-2026-QR-${Date.now()}`,
      status: 'ACTIVE',
      activeBookingsCountToday: 0,
      activeTabBalance: 0,
      ...newMember
    };
    MOCK_MEMBERS.push(created);
    return created;
  }
};

export const bookingApi = {
  async getCourts() {
    await delay();
    return [...MOCK_COURTS];
  },
  async getSlots() {
    await delay();
    return [...MOCK_SLOTS];
  },
  async createBooking(bookingData) {
    await delay();
    const newSlot = {
      id: `s-${Date.now()}`,
      status: 'BOOKED',
      ...bookingData
    };
    MOCK_SLOTS.push(newSlot);
    return newSlot;
  }
};

export const shopApi = {
  async getProducts() {
    await delay();
    return [...MOCK_PRODUCTS];
  },
  async updateStock(productId, delta) {
    await delay();
    const item = MOCK_PRODUCTS.find(p => p.id === productId);
    if (item) item.stock = Math.max(0, item.stock + delta);
    return item;
  }
};

export const barApi = {
  async getTables() {
    await delay();
    return [...MOCK_TABLES];
  },
  async getKitchenTickets() {
    await delay();
    return [...MOCK_KITCHEN_TICKETS];
  },
  async advanceKitchenTicket(ticketId) {
    await delay();
    const ticket = MOCK_KITCHEN_TICKETS.find(k => k.id === ticketId);
    if (ticket) {
      if (ticket.status === 'NEW') ticket.status = 'IN_PREPARATION';
      else if (ticket.status === 'IN_PREPARATION') ticket.status = 'READY_TO_SERVE';
    }
    return ticket;
  }
};

export const dashboardApi = {
  async getMetrics() {
    await delay();
    return { ...MOCK_DASHBOARD_METRICS };
  },
  async getLeads() {
    await delay();
    return [...MOCK_LEADS];
  }
};
