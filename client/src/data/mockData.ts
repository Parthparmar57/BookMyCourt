import {
  MembershipPlan,
  Member,
  Court,
  Booking,
  Product,
  BarTable,
  BarOrder,
  KitchenTicket,
  Lead,
  LedgerTransaction,
  Employee,
  LeaveRequest,
  OperationalAlert,
  NotificationItem,
  User
} from '../types';

// Mock Logged-in Users for fast Role Switcher
export const MOCK_USERS: User[] = [
  {
    id: 'user-owner',
    name: 'Vikramaditya Singhania',
    email: 'owner@championsclub.in',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98200 11223'
  },
  {
    id: 'user-frontdesk',
    name: 'Ananya Deshmukh',
    email: 'frontdesk@championsclub.in',
    role: 'frontdesk',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98201 44556'
  },
  {
    id: 'user-bar',
    name: 'Karan Mehra',
    email: 'bar@championsclub.in',
    role: 'bar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98202 77889'
  },
  {
    id: 'user-kitchen',
    name: 'Chef Ramesh Kumar',
    email: 'kitchen@championsclub.in',
    role: 'kitchen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98203 11447'
  },
  {
    id: 'user-shop',
    name: 'Priya Sundaram',
    email: 'shop@championsclub.in',
    role: 'shop',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98204 33669'
  },
  {
    id: 'user-member-1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@gmail.com',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    memberId: 'CC-2026-8842',
    phone: '+91 98765 43210'
  },
  {
    id: 'user-visitor',
    name: 'Guest Visitor',
    email: 'visitor@gmail.com',
    role: 'visitor'
  }
];

// Membership Plans Data
export const MOCK_PLANS: MembershipPlan[] = [
  {
    id: 'plan-gold',
    name: 'Gold',
    price: 4999,
    durationMonths: 12,
    courtDiscountPercent: 100, // 100% Free Sessions
    freeSessionsPerMonth: 20,
    shopDiscountPercent: 15,
    barDiscountPercent: 10,
    maxBookingsPerDay: 2,
    status: 'active',
    popular: true,
    description: 'Unlimited access to all courts, maximum discounts, and priority desk booking.'
  },
  {
    id: 'plan-silver',
    name: 'Silver',
    price: 2999,
    durationMonths: 6,
    courtDiscountPercent: 50,
    freeSessionsPerMonth: 8,
    shopDiscountPercent: 5,
    barDiscountPercent: 5,
    maxBookingsPerDay: 2,
    status: 'active',
    description: 'Standard access for regular players with 50% discount on court reservations.'
  },
  {
    id: 'plan-junior',
    name: 'Junior',
    price: 1499,
    durationMonths: 6,
    courtDiscountPercent: 50,
    freeSessionsPerMonth: 5,
    shopDiscountPercent: 5,
    barDiscountPercent: 5,
    maxBookingsPerDay: 1,
    ageLimitMax: 17, // Strictly under 18
    status: 'active',
    description: 'Exclusive plan for junior athletes under 18 years old.'
  }
];

// Configurable Courts
export const MOCK_COURTS: Court[] = [
  { id: 'court-1', name: 'Center Court 01', sport: 'Tennis', walkInRate: 800, openingHours: '06:00 AM - 10:00 PM', status: 'open' },
  { id: 'court-2', name: 'Court 02 (Hard)', sport: 'Tennis', walkInRate: 750, openingHours: '06:00 AM - 10:00 PM', status: 'open' },
  { id: 'court-3', name: 'Badminton Arena A', sport: 'Badminton', walkInRate: 500, openingHours: '06:00 AM - 10:00 PM', status: 'open' },
  { id: 'court-4', name: 'Badminton Arena B', sport: 'Badminton', walkInRate: 500, openingHours: '06:00 AM - 10:00 PM', status: 'open' },
  { id: 'court-5', name: 'Padel Glass Court 01', sport: 'Padel', walkInRate: 1200, openingHours: '06:00 AM - 10:00 PM', status: 'open' },
  { id: 'court-6', name: 'Padel Glass Court 02', sport: 'Padel', walkInRate: 1200, openingHours: '06:00 AM - 10:00 PM', status: 'maintenance' }
];

// Featured Members
export const MOCK_MEMBERS: Member[] = [
  {
    id: 'mem-101',
    memberId: 'CC-2026-8842',
    userId: 'user-member-1',
    name: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    email: 'rajesh.sharma@gmail.com',
    dateOfBirth: '1988-05-14',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    planId: 'plan-gold',
    planName: 'Gold',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active',
    qrCode: 'CC-QR-MEM-101',
    emergencyContact: { name: 'Sunita Sharma', phone: '+91 98765 43211' },
    activeBarTabId: 'tab-401',
    metrics: { totalBookings: 24, shopSpend: 18450, barSpend: 3200 }
  },
  {
    id: 'mem-102',
    memberId: 'CC-2026-1049',
    name: 'Aarav Mehta',
    phone: '+91 98111 22334',
    email: 'aarav.mehta@yahoo.in',
    dateOfBirth: '1995-11-22',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    planId: 'plan-silver',
    planName: 'Silver',
    startDate: '2026-04-15',
    endDate: '2026-10-15',
    status: 'active',
    qrCode: 'CC-QR-MEM-102',
    emergencyContact: { name: 'Nikhil Mehta', phone: '+91 98111 22335' },
    metrics: { totalBookings: 12, shopSpend: 4500, barSpend: 1200 }
  },
  {
    id: 'mem-103',
    memberId: 'CC-2026-3021',
    name: 'Ananya Patel',
    phone: '+91 99222 33445',
    email: 'ananya.p@outlook.com',
    dateOfBirth: '1992-08-09',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    planId: 'plan-gold',
    planName: 'Gold',
    startDate: '2026-03-01',
    endDate: '2026-10-10', // Expiring soon!
    status: 'expiring_soon',
    qrCode: 'CC-QR-MEM-103',
    emergencyContact: { name: 'Kavita Patel', phone: '+91 99222 33446' },
    metrics: { totalBookings: 38, shopSpend: 26000, barSpend: 6400 }
  },
  {
    id: 'mem-104',
    memberId: 'CC-2026-9012',
    name: 'Kabir Verma (Junior)',
    phone: '+91 97333 44556',
    email: 'kabir.verma@gmail.com',
    dateOfBirth: '2010-03-25', // Age 16
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    planId: 'plan-junior',
    planName: 'Junior',
    startDate: '2026-06-01',
    endDate: '2026-12-01',
    status: 'active',
    qrCode: 'CC-QR-MEM-104',
    emergencyContact: { name: 'Sanjay Verma (Father)', phone: '+91 97333 44550' },
    metrics: { totalBookings: 15, shopSpend: 8900, barSpend: 950 }
  },
  {
    id: 'mem-105',
    memberId: 'CC-2025-0041',
    name: 'Rohan Kapoor',
    phone: '+91 96444 55667',
    email: 'rohan.k@gmail.com',
    dateOfBirth: '1985-01-30',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    planId: 'plan-silver',
    planName: 'Silver',
    startDate: '2025-09-01',
    endDate: '2026-09-01', // Expired
    status: 'expired',
    qrCode: 'CC-QR-MEM-105',
    emergencyContact: { name: 'Pooja Kapoor', phone: '+91 96444 55668' },
    metrics: { totalBookings: 19, shopSpend: 12000, barSpend: 2800 }
  }
];

// Initial Bookings
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-501',
    bookingNumber: 'BK-2026-001',
    courtId: 'court-1',
    courtName: 'Center Court 01',
    sport: 'Tennis',
    date: '2026-10-03',
    startTime: '06:00',
    endTime: '07:00',
    memberId: 'mem-101',
    memberName: 'Rajesh Sharma',
    isWalkIn: false,
    price: 800,
    discount: 800,
    finalPrice: 0, // Gold Plan Free
    paymentMode: 'free_plan',
    paymentStatus: 'paid',
    createdAt: '2026-10-02T18:30:00Z',
    status: 'confirmed'
  },
  {
    id: 'book-502',
    bookingNumber: 'BK-2026-002',
    courtId: 'court-2',
    courtName: 'Court 02 (Hard)',
    sport: 'Tennis',
    date: '2026-10-03',
    startTime: '07:00',
    endTime: '08:00',
    isWalkIn: true,
    memberName: 'Sunil Gavaskar (Walk-In)',
    walkInDetails: { name: 'Sunil Gavaskar', phone: '+91 99999 88888' },
    price: 750,
    discount: 0,
    finalPrice: 750,
    paymentMode: 'upi',
    paymentStatus: 'paid',
    createdAt: '2026-10-03T06:15:00Z',
    status: 'confirmed'
  },
  {
    id: 'book-503',
    bookingNumber: 'BK-2026-003',
    courtId: 'court-5',
    courtName: 'Padel Glass Court 01',
    sport: 'Padel',
    date: '2026-10-03',
    startTime: '18:00',
    endTime: '19:00',
    memberName: 'Friday Open Social Play',
    isWalkIn: false,
    price: 1200,
    discount: 0,
    finalPrice: 1200,
    paymentMode: 'cash',
    paymentStatus: 'paid',
    createdAt: '2026-10-01T10:00:00Z',
    status: 'confirmed'
  }
];

// Gear Shop Products (Shared Stock Pool)
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Wilson Pro Staff 97 v14 Tennis Racket',
    category: 'Rackets',
    sku: 'WR-97-V14',
    brand: 'Wilson',
    variant: 'Grip Size 3 (4 3/8)',
    price: 18999,
    taxPercent: 18,
    image: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?auto=format&fit=crop&q=80&w=400',
    stock: 8,
    reorderLevel: 3,
    isLowStock: false,
    rating: 4.9
  },
  {
    id: 'prod-2',
    name: 'Babolat Pure Drive 2026 Racket',
    category: 'Rackets',
    sku: 'BB-PD-2026',
    brand: 'Babolat',
    variant: '300g Standard',
    price: 17499,
    taxPercent: 18,
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=400',
    stock: 2, // Low stock!
    reorderLevel: 4,
    isLowStock: true,
    rating: 4.8
  },
  {
    id: 'prod-3',
    name: 'Dunlop Fort All Court Tennis Balls (Can of 4)',
    category: 'Balls',
    sku: 'DP-FORT-4C',
    brand: 'Dunlop',
    variant: 'Extra Duty Felt',
    price: 499,
    taxPercent: 18,
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&q=80&w=400',
    stock: 45,
    reorderLevel: 15,
    isLowStock: false,
    rating: 4.7
  },
  {
    id: 'prod-4',
    name: 'Asics Gel-Resolution 9 Shoes (Men)',
    category: 'Shoes',
    sku: 'AS-GEL-R9',
    brand: 'Asics',
    variant: 'UK 9 / Blue White',
    price: 12999,
    taxPercent: 18,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    stock: 5,
    reorderLevel: 3,
    isLowStock: false,
    rating: 4.9
  },
  {
    id: 'prod-5',
    name: 'Yonex Super Grap Overgrip (Pack of 3)',
    category: 'Accessories',
    sku: 'YN-SG-3P',
    brand: 'Yonex',
    variant: 'Black',
    price: 349,
    taxPercent: 18,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=400',
    stock: 1, // Low stock!
    reorderLevel: 10,
    isLowStock: true,
    rating: 4.6
  },
  {
    id: 'prod-6',
    name: 'Champions Club Performance Dri-FIT Tee',
    category: 'Apparel',
    sku: 'CC-TEE-DRY',
    brand: 'Champions Club',
    variant: 'Size L / Emerald Green',
    price: 1499,
    taxPercent: 18,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400',
    stock: 22,
    reorderLevel: 8,
    isLowStock: false,
    rating: 4.9
  }
];

// Bar Tables
export const MOCK_BAR_TABLES: BarTable[] = [
  { id: 'tab-t1', tableNumber: 1, capacity: 4, status: 'free', currentOrderTotal: 0 },
  { id: 'tab-t2', tableNumber: 2, capacity: 2, status: 'free', currentOrderTotal: 0 },
  {
    id: 'tab-t3',
    tableNumber: 3,
    capacity: 4,
    status: 'occupied',
    currentOrderTotal: 840,
    activeMemberName: 'Rajesh Sharma',
    activeTabId: 'tab-401',
    occupiedTimeMinutes: 28
  },
  {
    id: 'tab-t4',
    tableNumber: 4,
    capacity: 6,
    status: 'needs_payment',
    currentOrderTotal: 1450,
    activeMemberName: 'Ananya Patel',
    occupiedTimeMinutes: 45
  },
  { id: 'tab-t5', tableNumber: 5, capacity: 4, status: 'free', currentOrderTotal: 0 },
  { id: 'tab-t6', tableNumber: 6, capacity: 8, status: 'free', currentOrderTotal: 0 }
];

// Kitchen Display Orders (KDS)
export const MOCK_KITCHEN_TICKETS: KitchenTicket[] = [
  {
    id: 'kt-101',
    orderNumber: 'BAR-2026-891',
    tableNumber: 3,
    memberName: 'Rajesh Sharma',
    items: [
      { name: 'Cold Brew Protein Shake (Whey)', quantity: 1, notes: 'Double shot espresso' },
      { name: 'Grilled Chicken Avocado Wrap', quantity: 1, notes: 'Extra hot sauce on side' }
    ],
    createdAt: '2026-10-03T09:45:00Z',
    elapsedMinutes: 8,
    status: 'preparing'
  },
  {
    id: 'kt-102',
    orderNumber: 'BAR-2026-892',
    tableNumber: 4,
    memberName: 'Ananya Patel',
    items: [
      { name: 'Fresh Watermelon Electrolyte Juice', quantity: 2 },
      { name: 'High Protein Peanut Butter Toast', quantity: 1 }
    ],
    createdAt: '2026-10-03T09:50:00Z',
    elapsedMinutes: 3,
    status: 'new'
  }
];

// CRM Leads (Kanban Board)
export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Siddharth Roy',
    phone: '+91 98112 34567',
    email: 'siddharth.roy@gmail.com',
    source: 'trial',
    interestSport: 'Padel',
    assignedStaff: 'Ananya Deshmukh',
    stage: 'new',
    createdAt: '2026-10-03T08:15:00Z',
    nextFollowUp: '2026-10-04'
  },
  {
    id: 'lead-2',
    name: 'Meera Deshpande',
    phone: '+91 98223 45678',
    email: 'meera.d@yahoo.in',
    source: 'website',
    interestSport: 'Tennis',
    assignedStaff: 'Ananya Deshmukh',
    stage: 'contacted',
    createdAt: '2026-10-02T14:30:00Z',
    notes: 'Looking for Gold annual membership for family.'
  },
  {
    id: 'lead-3',
    name: 'Infosys Sports Club Corporate Lead',
    phone: '+91 98334 56789',
    email: 'events@infosys.com',
    source: 'walk_in',
    interestSport: 'Badminton',
    assignedStaff: 'Vikramaditya Singhania',
    stage: 'quoted',
    createdAt: '2026-09-29T11:00:00Z',
    notes: 'Quoted ₹1,50,000 for weekend corporate tournament.'
  },
  {
    id: 'lead-4',
    name: 'Devendra Phadke',
    phone: '+91 98445 67890',
    email: 'dev.p@gmail.com',
    source: 'trial',
    interestSport: 'Tennis',
    assignedStaff: 'Ananya Deshmukh',
    stage: 'won',
    createdAt: '2026-09-25T16:00:00Z'
  }
];

// Financial Ledger Transactions
export const MOCK_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'tx-901',
    date: '2026-10-03',
    source: 'court',
    referenceId: 'BK-2026-002',
    customerName: 'Sunil Gavaskar',
    isMember: false,
    amount: 750,
    taxAmount: 114,
    paymentMode: 'upi',
    description: 'Court 02 Walk-In Reservation'
  },
  {
    id: 'tx-902',
    date: '2026-10-03',
    source: 'shop',
    referenceId: 'SH-2026-114',
    customerName: 'Rajesh Sharma',
    isMember: true,
    amount: 18999,
    taxAmount: 2898,
    paymentMode: 'card',
    description: 'Wilson Pro Staff Racket Purchase'
  },
  {
    id: 'tx-903',
    date: '2026-10-03',
    source: 'bar',
    referenceId: 'BAR-2026-880',
    customerName: 'Aarav Mehta',
    isMember: true,
    amount: 450,
    taxAmount: 22,
    paymentMode: 'upi',
    description: 'Cafeteria Table 2 Tab Settlement'
  },
  {
    id: 'tx-904',
    date: '2026-10-02',
    source: 'membership',
    referenceId: 'INV-2026-042',
    customerName: 'Ananya Patel',
    isMember: true,
    amount: 4999,
    taxAmount: 762,
    paymentMode: 'online',
    description: 'Gold Membership Annual Renewal'
  }
];

// Operational Action Required Alerts
export const MOCK_ALERTS: OperationalAlert[] = [
  {
    id: 'alt-1',
    severity: 'high',
    category: 'membership',
    message: '12 Memberships expiring within 7 days',
    actionLabel: 'View Members',
    actionUrl: '/staff/frontdesk/members?filter=expiring'
  },
  {
    id: 'alt-2',
    severity: 'high',
    category: 'inventory',
    message: '2 Products below minimum reorder stock',
    actionLabel: 'Restock Inventory',
    actionUrl: '/staff/shop/inventory'
  },
  {
    id: 'alt-3',
    severity: 'medium',
    category: 'tab',
    message: '₹14,850 in open member cafeteria tabs',
    actionLabel: 'Review Tabs',
    actionUrl: '/staff/bar/tabs'
  },
  {
    id: 'alt-4',
    severity: 'medium',
    category: 'lead',
    message: '4 Website trial leads pending follow-up',
    actionLabel: 'Open CRM',
    actionUrl: '/staff/frontdesk/crm'
  }
];

// Header Notification Bell Feed
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'booking_confirm',
    title: 'New Desk Booking',
    message: 'Rajesh Sharma booked Center Court 01 for 06:00 AM',
    timestamp: '10 mins ago',
    read: false
  },
  {
    id: 'notif-2',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Yonex Super Grap Overgrip stock reached 1 unit',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 'notif-3',
    type: 'new_lead',
    title: 'New Trial Request',
    message: 'Siddharth Roy requested a Padel trial session',
    timestamp: '2 hours ago',
    read: true
  }
];
