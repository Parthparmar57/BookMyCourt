export type UserRole = 'owner' | 'frontdesk' | 'bar' | 'kitchen' | 'shop' | 'member' | 'visitor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  memberId?: string;
  phone?: string;
}

export type MembershipTier = 'Gold' | 'Silver' | 'Junior';

export interface MembershipPlan {
  id: string;
  name: MembershipTier;
  price: number; // Monthly plan fee (INR ₹)
  durationMonths: number;
  courtDiscountPercent: number; // e.g. Gold=100%, Silver=50%, Junior=25%
  freeSessionsPerMonth: number;
  shopDiscountPercent: number; // e.g. Gold=15%, Silver=5%, Junior=5%
  barDiscountPercent: number;  // e.g. Gold=10%, Silver=5%, Junior=5%
  maxBookingsPerDay: number;
  ageLimitMax?: number; // Junior limit strictly < 18
  status: 'active' | 'archived';
  description: string;
  popular?: boolean;
}

export interface Member {
  id: string;
  memberId: string; // e.g., CC-2026-8842
  userId?: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  photoUrl: string;
  planId: string;
  planName: MembershipTier;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring_soon' | 'expired';
  qrCode: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  activeBarTabId?: string;
  metrics: {
    totalBookings: number;
    shopSpend: number;
    barSpend: number;
  };
}

export type SportType = 'Tennis' | 'Badminton' | 'Padel' | 'Squash';

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  walkInRate: number; // Rate per hour (₹)
  openingHours: string; // e.g. "06:00 AM - 10:00 PM"
  status: 'open' | 'maintenance';
}

export type SlotStatus = 'available' | 'booked' | 'social_play' | 'maintenance' | 'selected' | 'disabled';

export interface BookingSlot {
  id: string; // courtId + timestamp
  courtId: string;
  courtName: string;
  sport: SportType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: SlotStatus;
  bookingId?: string;
  memberName?: string;
  memberId?: string;
  isWalkIn?: boolean;
  price: number;
  isSocialPlay?: boolean;
  maxPlayers?: number;
  currentPlayers?: number;
  playersList?: string[];
}

export interface Booking {
  id: string;
  bookingNumber: string;
  courtId: string;
  courtName: string;
  sport: SportType;
  date: string;
  startTime: string;
  endTime: string;
  memberId?: string;
  memberName: string;
  isWalkIn: boolean;
  walkInDetails?: {
    name: string;
    phone: string;
  };
  price: number;
  discount: number;
  finalPrice: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'tab' | 'free_plan';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
  status: 'confirmed' | 'cancelled';
}

export type ProductCategory = 'Rackets' | 'Balls' | 'Shoes' | 'Accessories' | 'Apparel';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  sku: string;
  brand: string;
  variant?: string;
  price: number; // MSRP (INR ₹)
  taxPercent: number; // GST (e.g. 18%)
  image: string;
  stock: number;
  reorderLevel: number;
  isLowStock: boolean;
  rating?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  tax: number;
  discount: number;
}

export type OrderStatus = 'placed' | 'packed' | 'ready' | 'shipped' | 'delivered';

export interface ShopOrder {
  id: string;
  orderNumber: string;
  memberId?: string;
  memberName: string;
  channel: 'counter' | 'online';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'online';
  status: OrderStatus;
  createdAt: string;
  deliveryAddress?: string;
}

export interface BarTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: 'free' | 'occupied' | 'needs_payment';
  currentOrderTotal: number;
  activeMemberName?: string;
  activeTabId?: string;
  occupiedTimeMinutes?: number;
}

export interface BarOrderItem {
  itemId: string;
  name: string;
  category: 'Beverages' | 'Snacks' | 'Proteins & Shakes' | 'Meals';
  price: number;
  quantity: number;
  notes?: string;
}

export interface BarOrder {
  id: string;
  orderNumber: string;
  tableNumber: number;
  memberId?: string;
  memberName: string;
  isGuest: boolean;
  items: BarOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode?: 'cash' | 'card' | 'upi' | 'tab';
  status: 'new' | 'preparing' | 'served' | 'settled';
  createdAt: string;
}

export interface KitchenTicket {
  id: string;
  orderNumber: string;
  tableNumber: number;
  memberName: string;
  items: {
    name: string;
    quantity: number;
    notes?: string;
  }[];
  createdAt: string;
  elapsedMinutes: number;
  status: 'new' | 'preparing' | 'served';
}

export type LeadStage = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: 'website' | 'walk_in' | 'trial';
  interestSport: SportType;
  assignedStaff: string;
  stage: LeadStage;
  createdAt: string;
  nextFollowUp?: string;
  notes?: string;
}

export interface LedgerTransaction {
  id: string;
  date: string;
  source: 'court' | 'shop' | 'bar' | 'membership';
  referenceId: string;
  customerName: string;
  isMember: boolean;
  amount: number;
  taxAmount: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'online';
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Front Desk' | 'Bar Staff' | 'Kitchen' | 'Shop Staff' | 'Admin';
  email: string;
  phone: string;
  joiningDate: string;
  salary: number;
  bankAccount: string;
  status: 'active' | 'on_leave';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  type: 'sick' | 'casual' | 'annual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface NotificationItem {
  id: string;
  type: 'booking_confirm' | 'booking_cancel' | 'expiry_warning' | 'low_stock' | 'new_lead' | 'order_ready';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface OperationalAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: 'inventory' | 'membership' | 'tab' | 'lead';
  message: string;
  actionLabel: string;
  actionUrl: string;
}
