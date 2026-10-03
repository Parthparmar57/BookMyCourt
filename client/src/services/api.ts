import {
  MOCK_USERS,
  MOCK_PLANS,
  MOCK_COURTS,
  MOCK_MEMBERS,
  MOCK_BOOKINGS,
  MOCK_PRODUCTS,
  MOCK_BAR_TABLES,
  MOCK_KITCHEN_TICKETS,
  MOCK_LEADS,
  MOCK_TRANSACTIONS,
  MOCK_ALERTS,
  MOCK_NOTIFICATIONS
} from '../data/mockData';
import {
  User,
  Member,
  MembershipPlan,
  Court,
  Booking,
  BookingSlot,
  Product,
  BarTable,
  BarOrder,
  KitchenTicket,
  Lead,
  LedgerTransaction,
  OperationalAlert,
  NotificationItem,
  SportType
} from '../types';

// Helper for realistic sub-second network simulation
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

// Local mutable state copies for interactive CRUD during the session
let membersStore = [...MOCK_MEMBERS];
let bookingsStore = [...MOCK_BOOKINGS];
let productsStore = [...MOCK_PRODUCTS];
let barTablesStore = [...MOCK_BAR_TABLES];
let kitchenTicketsStore = [...MOCK_KITCHEN_TICKETS];
let leadsStore = [...MOCK_LEADS];
let transactionsStore = [...MOCK_TRANSACTIONS];
let plansStore = [...MOCK_PLANS];

export const authApi = {
  async getUsers(): Promise<User[]> {
    await delay(50);
    return MOCK_USERS;
  }
};

export const memberApi = {
  async getMembers(query = ''): Promise<Member[]> {
    await delay(100);
    if (!query) return membersStore;
    const q = query.toLowerCase();
    return membersStore.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.qrCode.toLowerCase().includes(q)
    );
  },

  async getMemberById(id: string): Promise<Member | undefined> {
    await delay(50);
    return membersStore.find(m => m.id === id || m.memberId === id);
  },

  async createMember(newMember: Omit<Member, 'id' | 'memberId' | 'qrCode' | 'metrics'>): Promise<Member> {
    await delay(200);
    const count = membersStore.length + 101;
    const memberId = `CC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: Member = {
      ...newMember,
      id: `mem-${count}`,
      memberId,
      qrCode: `CC-QR-${memberId}`,
      metrics: { totalBookings: 0, shopSpend: 0, barSpend: 0 }
    };
    membersStore = [created, ...membersStore];
    return created;
  },

  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    await delay(150);
    membersStore = membersStore.map(m => (m.id === id ? { ...m, ...updates } : m));
    const updated = membersStore.find(m => m.id === id);
    if (!updated) throw new Error('Member not found');
    return updated;
  }
};

export const membershipApi = {
  async getPlans(): Promise<MembershipPlan[]> {
    await delay(50);
    return plansStore;
  },

  async updatePlan(id: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan> {
    await delay(100);
    plansStore = plansStore.map(p => (p.id === id ? { ...p, ...updates } : p));
    return plansStore.find(p => p.id === id)!;
  }
};

export const courtApi = {
  async getCourts(): Promise<Court[]> {
    await delay(50);
    return MOCK_COURTS;
  }
};

export const bookingApi = {
  async getBookingSlots(date: string, sport?: SportType): Promise<BookingSlot[]> {
    await delay(100);
    const slots: BookingSlot[] = [];
    const timeBlocks = [
      '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
      '10:00', '10:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ];

    const activeCourts = sport ? MOCK_COURTS.filter(c => c.sport === sport) : MOCK_COURTS;

    activeCourts.forEach(court => {
      timeBlocks.forEach((time, index) => {
        const nextTime = timeBlocks[index + 1] || '20:00';
        const slotId = `${court.id}-${date}-${time}`;
        
        // Match existing confirmed bookings
        const existingBooking = bookingsStore.find(
          b => b.courtId === court.id && b.date === date && b.startTime === time && b.status === 'confirmed'
        );

        if (court.status === 'maintenance') {
          slots.push({
            id: slotId,
            courtId: court.id,
            courtName: court.name,
            sport: court.sport,
            date,
            startTime: time,
            endTime: nextTime,
            status: 'maintenance',
            price: court.walkInRate
          });
        } else if (existingBooking) {
          slots.push({
            id: slotId,
            courtId: court.id,
            courtName: court.name,
            sport: court.sport,
            date,
            startTime: time,
            endTime: nextTime,
            status: 'booked',
            bookingId: existingBooking.id,
            memberName: existingBooking.memberName,
            memberId: existingBooking.memberId,
            price: existingBooking.finalPrice
          });
        } else if (court.sport === 'Padel' && time === '18:00') {
          // Friday Social Play slot
          slots.push({
            id: slotId,
            courtId: court.id,
            courtName: court.name,
            sport: court.sport,
            date,
            startTime: time,
            endTime: nextTime,
            status: 'social_play',
            isSocialPlay: true,
            maxPlayers: 8,
            currentPlayers: 4,
            playersList: ['Rajesh Sharma', 'Ananya Patel', 'Karan M.', 'Dev P.'],
            price: 300 // Per player
          });
        } else {
          slots.push({
            id: slotId,
            courtId: court.id,
            courtName: court.name,
            sport: court.sport,
            date,
            startTime: time,
            endTime: nextTime,
            status: 'available',
            price: court.walkInRate
          });
        }
      });
    });

    return slots;
  },

  async createBooking(payload: {
    courtId: string;
    courtName: string;
    sport: SportType;
    date: string;
    startTime: string;
    endTime: string;
    memberId?: string;
    memberName: string;
    isWalkIn: boolean;
    price: number;
    discount: number;
    finalPrice: number;
    paymentMode: 'cash' | 'card' | 'upi' | 'tab' | 'free_plan';
  }): Promise<Booking> {
    await delay(200);

    // Business Rule G1 & BR4: Validate double booking overlap
    const overlap = bookingsStore.find(
      b => b.courtId === payload.courtId &&
           b.date === payload.date &&
           b.startTime === payload.startTime &&
           b.status === 'confirmed'
    );
    if (overlap) {
      throw new Error('This court slot was just booked by another user. Please select a different time slot.');
    }

    // Business Rule BR3: Validate max 2 bookings/day for members
    if (payload.memberId) {
      const dailyCount = bookingsStore.filter(
        b => b.memberId === payload.memberId && b.date === payload.date && b.status === 'confirmed'
      ).length;
      if (dailyCount >= 2) {
        throw new Error('Member daily booking limit reached (Maximum 2 bookings per member per day).');
      }
    }

    const newBooking: Booking = {
      ...payload,
      id: `book-${Date.now()}`,
      bookingNumber: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    bookingsStore = [newBooking, ...bookingsStore];

    // Automatically post transaction to Central Ledger (Business Rule BR11)
    transactionsStore.unshift({
      id: `tx-${Date.now()}`,
      date: payload.date,
      source: 'court',
      referenceId: newBooking.bookingNumber,
      customerName: payload.memberName,
      isMember: !payload.isWalkIn,
      amount: payload.finalPrice,
      taxAmount: Math.round(payload.finalPrice * 0.18),
      paymentMode: payload.paymentMode === 'free_plan' ? 'cash' : payload.paymentMode,
      description: `Court Booking: ${payload.courtName} (${payload.startTime})`
    });

    return newBooking;
  },

  async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
    await delay(150);
    bookingsStore = bookingsStore.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    return true;
  }
};

export const shopApi = {
  async getProducts(category?: string): Promise<Product[]> {
    await delay(80);
    if (!category || category === 'All') return productsStore;
    return productsStore.filter(p => p.category === category);
  },

  async updateStock(productId: string, newStock: number): Promise<Product> {
    await delay(100);
    productsStore = productsStore.map(p => {
      if (p.id === productId) {
        const isLow = newStock <= p.reorderLevel;
        return { ...p, stock: newStock, isLowStock: isLow };
      }
      return p;
    });
    return productsStore.find(p => p.id === productId)!;
  },

  async processSale(payload: {
    memberName: string;
    items: { product: Product; quantity: number }[];
    paymentMode: 'cash' | 'card' | 'upi' | 'online';
    channel: 'counter' | 'online';
  }): Promise<boolean> {
    await delay(200);

    let subtotal = 0;
    let totalTax = 0;

    // Deduct shared inventory pool (Business Goal G4 & Rule BR10)
    payload.items.forEach(({ product, quantity }) => {
      const current = productsStore.find(p => p.id === product.id);
      if (current) {
        const remaining = Math.max(0, current.stock - quantity);
        current.stock = remaining;
        current.isLowStock = remaining <= current.reorderLevel;
      }
      subtotal += product.price * quantity;
      totalTax += Math.round((product.price * quantity) * (product.taxPercent / 100));
    });

    // Record ledger transaction
    transactionsStore.unshift({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      source: 'shop',
      referenceId: `SH-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: payload.memberName,
      isMember: true,
      amount: subtotal,
      taxAmount: totalTax,
      paymentMode: payload.paymentMode,
      description: `Gear Shop Purchase (${payload.channel})`
    });

    return true;
  }
};

export const barApi = {
  async getTables(): Promise<BarTable[]> {
    await delay(50);
    return barTablesStore;
  },

  async sendKitchenOrder(payload: {
    tableNumber: number;
    memberName: string;
    items: { name: string; quantity: number; notes?: string }[];
  }): Promise<KitchenTicket> {
    await delay(150);

    // Update table status
    barTablesStore = barTablesStore.map(t =>
      t.tableNumber === payload.tableNumber
        ? { ...t, status: 'occupied' as const, activeMemberName: payload.memberName }
        : t
    );

    const newTicket: KitchenTicket = {
      id: `kt-${Date.now()}`,
      orderNumber: `BAR-2026-${Math.floor(100 + Math.random() * 900)}`,
      tableNumber: payload.tableNumber,
      memberName: payload.memberName,
      items: payload.items,
      createdAt: new Date().toISOString(),
      elapsedMinutes: 1,
      status: 'new'
    };

    kitchenTicketsStore = [newTicket, ...kitchenTicketsStore];
    return newTicket;
  }
};

export const kitchenApi = {
  async getTickets(): Promise<KitchenTicket[]> {
    await delay(50);
    return kitchenTicketsStore;
  },

  async updateTicketStatus(id: string, status: 'new' | 'preparing' | 'served'): Promise<KitchenTicket> {
    await delay(100);
    kitchenTicketsStore = kitchenTicketsStore.map(t => (t.id === id ? { ...t, status } : t));
    return kitchenTicketsStore.find(t => t.id === id)!;
  }
};

export const crmApi = {
  async getLeads(): Promise<Lead[]> {
    await delay(80);
    return leadsStore;
  },

  async updateLeadStage(id: string, stage: Lead['stage']): Promise<Lead> {
    await delay(100);
    leadsStore = leadsStore.map(l => (l.id === id ? { ...l, stage } : l));
    return leadsStore.find(l => l.id === id)!;
  },

  async createLead(newLead: Omit<Lead, 'id' | 'createdAt' | 'stage'>): Promise<Lead> {
    await delay(150);
    const created: Lead = {
      ...newLead,
      id: `lead-${Date.now()}`,
      stage: 'new',
      createdAt: new Date().toISOString()
    };
    leadsStore = [created, ...leadsStore];
    return created;
  }
};

export const ledgerApi = {
  async getTransactions(): Promise<LedgerTransaction[]> {
    await delay(80);
    return transactionsStore;
  }
};

export const dashboardApi = {
  async getDashboardMetrics() {
    await delay(100);

    const totalRevenueToday = transactionsStore.reduce((acc, tx) => acc + tx.amount, 0);

    const revenueBySource = [
      { name: 'Courts', value: 62000, color: '#4A812F' },
      { name: 'Shop', value: 38500, color: '#94DE64' },
      { name: 'Bar', value: 24000, color: '#D99A24' },
      { name: 'Membership', value: 24000, color: '#212424' }
    ];

    const paymentModeSplit = [
      { name: 'UPI', value: 54000, color: '#4A812F' },
      { name: 'Card', value: 42000, color: '#94DE64' },
      { name: 'Cash', value: 28500, color: '#D99A24' },
      { name: 'Online', value: 24000, color: '#4B5563' }
    ];

    const revenueTrend = [
      { day: 'Mon', revenue: 18400 },
      { day: 'Tue', revenue: 22100 },
      { day: 'Wed', revenue: 19800 },
      { day: 'Thu', revenue: 26400 },
      { day: 'Fri', revenue: 34200 },
      { day: 'Sat', revenue: 48900 },
      { day: 'Sun', revenue: 41500 }
    ];

    return {
      kpis: {
        revenueToday: totalRevenueToday,
        revenueWeek: 211300,
        revenueMonth: 845000,
        activeMembers: membersStore.length + 400,
        courtOccupancy: 84, // 84% peak utilization
        expiringMemberships: 12,
        lowStockItems: productsStore.filter(p => p.isLowStock).length
      },
      revenueBySource,
      paymentModeSplit,
      revenueTrend,
      alerts: MOCK_ALERTS
    };
  }
};

export const notificationApi = {
  async getNotifications(): Promise<NotificationItem[]> {
    await delay(50);
    return MOCK_NOTIFICATIONS;
  }
};
