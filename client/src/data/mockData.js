// Realistic seed mock dataset for BookMyCourt (Indian Context: ₹ INR, UPI, GST, +91 phones)

export const MOCK_CLUBS = [
  {
    id: 'club-1',
    name: 'BookMyCourt Sports Arena',
    city: 'Mumbai',
    facilities: ['Tennis', 'Badminton', 'Padel', 'Squash'],
    totalCourts: 8
  }
];

export const MOCK_USERS = [
  { id: 'usr-1', name: 'Vikramaditya Sharma', role: 'OWNER', email: 'owner@bookmycourt.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'usr-2', name: 'Ananya Verma', role: 'FRONT_DESK', email: 'frontdesk@bookmycourt.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'usr-3', name: 'Rohan Mehta', role: 'BAR_STAFF', email: 'bar@bookmycourt.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'usr-4', name: 'Chef Suresh Kumar', role: 'KITCHEN', email: 'kitchen@bookmycourt.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'usr-5', name: 'Karan Malhotra', role: 'SHOP_STAFF', email: 'shop@bookmycourt.com', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { id: 'usr-6', name: 'Rajesh Patel', role: 'MEMBER', email: 'rajesh.patel@gmail.com', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' }
];

export const MOCK_PLANS = [
  {
    id: 'plan-gold',
    name: 'Gold Tier',
    price: 4999,
    durationMonths: 1,
    courtDiscountPercent: 100,
    freeSessionsPerMonth: 12,
    shopDiscountPercent: 15,
    barDiscountPercent: 10,
    maxBookingsPerDay: 2,
    popular: true,
    features: ['100% Free Court Bookings', '15% Off Gear Shop', '10% Off Bar & Cafe', 'Priority Slot Lock', 'Free Locker Access']
  },
  {
    id: 'plan-silver',
    name: 'Silver Tier',
    price: 2499,
    durationMonths: 1,
    courtDiscountPercent: 50,
    freeSessionsPerMonth: 4,
    shopDiscountPercent: 5,
    barDiscountPercent: 5,
    maxBookingsPerDay: 2,
    popular: false,
    features: ['50% Off Court Bookings', '5% Off Gear Shop', '5% Off Bar & Cafe', 'Standard Slot Lock']
  },
  {
    id: 'plan-junior',
    name: 'Junior Tier',
    price: 1499,
    durationMonths: 1,
    courtDiscountPercent: 40,
    freeSessionsPerMonth: 2,
    shopDiscountPercent: 5,
    barDiscountPercent: 5,
    maxBookingsPerDay: 1,
    ageLimitMax: 18,
    popular: false,
    features: ['For players under 18 years', '40% Off Court Bookings', 'Weekend Coaching Clinic access']
  }
];

export const MOCK_MEMBERS = [
  {
    id: 'BMC-2026-8842',
    name: 'Rajesh Patel',
    phone: '9820123456',
    email: 'rajesh.patel@gmail.com',
    dob: '1992-05-14',
    age: 34,
    planId: 'plan-gold',
    planName: 'Gold Tier',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    qrCode: 'BMC-2026-8842-QR',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    emergencyContact: { name: 'Priya Patel', phone: '9820199999' },
    activeBookingsCountToday: 1,
    activeTabBalance: 450
  },
  {
    id: 'BMC-2026-9011',
    name: 'Neha Sharma',
    phone: '9876543210',
    email: 'neha.sharma@gmail.com',
    dob: '1996-09-20',
    age: 30,
    planId: 'plan-silver',
    planName: 'Silver Tier',
    status: 'ACTIVE',
    startDate: '2026-02-15',
    expiryDate: '2026-08-15',
    qrCode: 'BMC-2026-9011-QR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    emergencyContact: { name: 'Sunil Sharma', phone: '9876500000' },
    activeBookingsCountToday: 0,
    activeTabBalance: 0
  },
  {
    id: 'BMC-2026-7731',
    name: 'Aarav Gupta',
    phone: '9123456789',
    email: 'aarav.g@gmail.com',
    dob: '2010-03-12',
    age: 16,
    planId: 'plan-junior',
    planName: 'Junior Tier',
    status: 'ACTIVE',
    startDate: '2026-03-01',
    expiryDate: '2026-09-01',
    qrCode: 'BMC-2026-7731-QR',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    emergencyContact: { name: 'Manish Gupta', phone: '9123400000' },
    activeBookingsCountToday: 0,
    activeTabBalance: 0
  }
];

export const MOCK_COURTS = [
  { id: 'c1', name: 'Court 1 (Badminton)', sport: 'Badminton', hourlyRate: 600, status: 'OPEN' },
  { id: 'c2', name: 'Court 2 (Badminton)', sport: 'Badminton', hourlyRate: 600, status: 'OPEN' },
  { id: 'c3', name: 'Court 3 (Tennis Pro)', sport: 'Tennis', hourlyRate: 1200, status: 'OPEN' },
  { id: 'c4', name: 'Court 4 (Tennis Synthetic)', sport: 'Tennis', hourlyRate: 1000, status: 'OPEN' },
  { id: 'c5', name: 'Court 5 (Padel Glass)', sport: 'Padel', hourlyRate: 1500, status: 'OPEN' },
  { id: 'c6', name: 'Court 6 (Padel Outdoor)', sport: 'Padel', hourlyRate: 1400, status: 'MAINTENANCE' }
];

export const MOCK_SLOTS = [
  { id: 's1', courtId: 'c1', startTime: '06:00 AM', endTime: '07:00 AM', status: 'BOOKED', memberName: 'Rajesh Patel', memberId: 'BMC-2026-8842', isWalkIn: false, price: 0 },
  { id: 's2', courtId: 'c1', startTime: '07:00 AM', endTime: '08:00 AM', status: 'AVAILABLE', price: 600 },
  { id: 's3', courtId: 'c1', startTime: '08:00 AM', endTime: '09:00 AM', status: 'AVAILABLE', price: 600 },
  { id: 's4', courtId: 'c2', startTime: '06:00 AM', endTime: '07:00 AM', status: 'AVAILABLE', price: 600 },
  { id: 's5', courtId: 'c2', startTime: '07:00 AM', endTime: '08:00 AM', status: 'SOCIAL_PLAY', title: 'Friday Morning Open', joinedCount: 6, maxCount: 8, entryFee: 150 },
  { id: 's6', courtId: 'c3', startTime: '06:00 AM', endTime: '07:00 AM', status: 'BOOKED', memberName: 'Walk-in: Sunil Kumar', isWalkIn: true, price: 1200 },
  { id: 's7', courtId: 'c5', startTime: '07:00 PM', endTime: '08:00 PM', status: 'BOOKED', memberName: 'Neha Sharma', memberId: 'BMC-2026-9011', isWalkIn: false, price: 750 }
];

export const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Wilson Pro Staff 97 v14', category: 'Rackets', sku: 'WLS-97-V14', price: 18999, stock: 12, reorderLevel: 3, image: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=300' },
  { id: 'p2', name: 'Babolat Pure Drive 2026', category: 'Rackets', sku: 'BAB-PD-2026', price: 17499, stock: 2, reorderLevel: 5, image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300' },
  { id: 'p3', name: 'Dunlop Fort Tournament Balls (3 Can)', category: 'Balls', sku: 'DUN-FORT-3', price: 549, stock: 45, reorderLevel: 10, image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=300' },
  { id: 'p4', name: 'Asics Gel Resolution 9 Shoes', category: 'Shoes', sku: 'ASC-GEL-R9', price: 11999, stock: 8, reorderLevel: 4, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
  { id: 'p5', name: 'Yonex Super Grap Overgrip 3x', category: 'Accessories', sku: 'YNX-GRIP-3P', price: 399, stock: 120, reorderLevel: 20, image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300' }
];

export const MOCK_MENU_ITEMS = [
  { id: 'm1', name: 'Espresso Coffee', category: 'Beverages', price: 120, available: true },
  { id: 'm2', name: 'Whey Protein Shake (Chocolate)', category: 'Proteins', price: 250, available: true },
  { id: 'm3', name: 'Grilled Chicken Club Sandwich', category: 'Meals', price: 280, available: true },
  { id: 'm4', name: 'Energy Electrolyte Drink', category: 'Beverages', price: 90, available: true },
  { id: 'm5', name: 'Avocado Toast & Eggs', category: 'Snacks', price: 220, available: true }
];

export const MOCK_TABLES = [
  { id: 't1', tableNumber: 'Table 1', capacity: 4, status: 'OCCUPIED', activeMember: 'Rajesh Patel', elapsedMins: 35, totalAmount: 450, itemsCount: 2 },
  { id: 't2', tableNumber: 'Table 2', capacity: 2, status: 'FREE', activeMember: null, elapsedMins: 0, totalAmount: 0, itemsCount: 0 },
  { id: 't3', tableNumber: 'Table 3', capacity: 6, status: 'FREE', activeMember: null, elapsedMins: 0, totalAmount: 0, itemsCount: 0 },
  { id: 't4', tableNumber: 'Table 4 (Lounge)', capacity: 4, status: 'OCCUPIED', activeMember: 'Walk-in Guest', elapsedMins: 12, totalAmount: 370, itemsCount: 2 }
];

export const MOCK_KITCHEN_TICKETS = [
  { id: 'k-101', tableNumber: 'Table 1', memberName: 'Rajesh Patel', items: ['1x Whey Protein Shake (Chocolate)', '1x Grilled Chicken Club Sandwich'], notes: 'Extra crispy bread', status: 'IN_PREPARATION', timeElapsed: '8 mins' },
  { id: 'k-102', tableNumber: 'Table 4', memberName: 'Walk-in Guest', items: ['2x Espresso Coffee', '1x Avocado Toast'], notes: 'Sugar on side', status: 'NEW', timeElapsed: '2 mins' }
];

export const MOCK_LEADS = [
  { id: 'ld-1', name: 'Amit Sharma', phone: '9811223344', email: 'amit.s@gmail.com', sport: 'Tennis', stage: 'NEW', source: 'Public Website', createdAt: '2026-10-02' },
  { id: 'ld-2', name: 'Kavita Roy', phone: '9877665544', email: 'kavita.roy@gmail.com', sport: 'Padel', stage: 'CONTACTED', source: 'Trial Booking', createdAt: '2026-10-01' },
  { id: 'ld-3', name: 'Rohan Deshmukh', phone: '9765432109', email: 'rohan.d@gmail.com', sport: 'Badminton', stage: 'QUOTED', source: 'Walk-In', createdAt: '2026-09-29' }
];

export const MOCK_DASHBOARD_METRICS = {
  totalRevenueToday: 148500,
  courtRevenue: 62000,
  shopRevenue: 38500,
  barRevenue: 24000,
  membershipRevenue: 24000,
  activeMembers: 412,
  expiringMembers: 28,
  utilizationRate: 78,
  lowStockItemsCount: 2
};
