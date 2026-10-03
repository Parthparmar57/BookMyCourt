import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';
import { KitchenLayout } from '../layouts/KitchenLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { HomePage } from '../modules/website/pages/HomePage';
import { AvailabilityPage } from '../modules/website/pages/AvailabilityPage';
import { MembershipPage } from '../modules/website/pages/MembershipPage';
import { ShopPage } from '../modules/website/pages/ShopPage';
import { TrialPage } from '../modules/website/pages/TrialPage';
import { LoginPage } from '../modules/website/pages/LoginPage';
import { RegisterPage } from '../modules/website/pages/RegisterPage';

import { OwnerDashboardPage } from '../modules/dashboard/pages/OwnerDashboardPage';
import { BookingsPage } from '../modules/bookings/pages/BookingsPage';
import { MembersPage } from '../modules/members/pages/MembersPage';
import { BarPage } from '../modules/bar/pages/BarPage';
import { KitchenPage } from '../modules/kitchen/pages/KitchenPage';
import { ShopInventoryPage } from '../modules/shop/pages/ShopInventoryPage';

// Dedicated Member Portal Pages
import { MemberDashboardPage } from '../modules/members/pages/MemberDashboardPage';
import { MemberBookingsPage } from '../modules/members/pages/MemberBookingsPage';
import { MemberCardPage } from '../modules/members/pages/MemberCardPage';
import { MemberTabPage } from '../modules/members/pages/MemberTabPage';

// Helper: wrap a layout + its children behind a role guard.
const guarded = (roles, layout, children) => ({
  element: <ProtectedRoute roles={roles} />,
  children: [{ element: layout, children }],
});

export const router = createBrowserRouter([
  // Public Routes (Navbar + Landing Page + Footer + Floating Chat Widget)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'courts', element: <AvailabilityPage /> },
      { path: 'availability', element: <AvailabilityPage /> },
      { path: 'membership', element: <MembershipPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'trial', element: <TrialPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  },

  // Owner / Admin Executive Suite
  {
    path: '/admin',
    ...guarded(['OWNER'], <AppLayout />, [
      { index: true, element: <OwnerDashboardPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'bar', element: <BarPage /> },
      { path: 'shop', element: <ShopInventoryPage /> },
      { path: 'crm', element: <OwnerDashboardPage /> },
      { path: 'accounting', element: <OwnerDashboardPage /> },
      { path: 'hr', element: <OwnerDashboardPage /> }
    ])
  },

  // Front Desk Staff Portal
  {
    path: '/staff/frontdesk',
    ...guarded(['OWNER', 'FRONT_DESK'], <AppLayout />, [
      { index: true, element: <MembersPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'crm', element: <MembersPage /> }
    ])
  },

  // Bar Staff POS
  {
    path: '/staff/bar',
    ...guarded(['OWNER', 'BAR_STAFF'], <AppLayout />, [
      { index: true, element: <BarPage /> }
    ])
  },

  // Shop Staff POS
  {
    path: '/staff/shop',
    ...guarded(['OWNER', 'SHOP_STAFF'], <AppLayout />, [
      { index: true, element: <ShopInventoryPage /> },
      { path: 'inventory', element: <ShopInventoryPage /> }
    ])
  },

  // Kitchen Display Screen (KDS)
  {
    path: '/staff/kitchen',
    ...guarded(['OWNER', 'KITCHEN', 'BAR_STAFF'], <KitchenLayout />, [
      { index: true, element: <KitchenPage /> }
    ])
  },

  // Member Portal — Dedicated Views per Navigation Tab
  {
    path: '/member',
    ...guarded(['MEMBER'], <AppLayout />, [
      { index: true, element: <MemberDashboardPage /> },
      { path: 'book', element: <BookingsPage /> },
      { path: 'bookings', element: <MemberBookingsPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'tab', element: <MemberTabPage /> },
      { path: 'card', element: <MemberCardPage /> }
    ])
  }
]);
