import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import { RoleGuard } from './routes/RoleGuard';

// Pages
import { OwnerDashboard } from './pages/admin/OwnerDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000
    }
  }
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Executive Admin Suite */}
              <Route
                path="/admin/*"
                element={
                  <RoleGuard allowedRoles={['owner']}>
                    <AppShell pageTitle="Executive Dashboard">
                      <OwnerDashboard />
                    </AppShell>
                  </RoleGuard>
                }
              />

              {/* Front Desk Staff Routes */}
              <Route
                path="/staff/frontdesk/*"
                element={
                  <RoleGuard allowedRoles={['frontdesk', 'owner']}>
                    <AppShell pageTitle="Front Desk Operations">
                      <OwnerDashboard />
                    </AppShell>
                  </RoleGuard>
                }
              />

              {/* Bar POS Routes */}
              <Route
                path="/staff/bar/*"
                element={
                  <RoleGuard allowedRoles={['bar', 'owner']}>
                    <AppShell pageTitle="Bar & Cafeteria POS">
                      <div className="p-6 bg-white rounded-lg border">Bar & Cafeteria POS Active</div>
                    </AppShell>
                  </RoleGuard>
                }
              />

              {/* Kitchen Screen Route */}
              <Route
                path="/staff/kitchen"
                element={
                  <RoleGuard allowedRoles={['kitchen', 'bar', 'owner']}>
                    <AppShell pageTitle="Kitchen Display System">
                      <div className="p-6 bg-white rounded-lg border">Kitchen Display Screen Active</div>
                    </AppShell>
                  </RoleGuard>
                }
              />

              {/* Gear Shop Routes */}
              <Route
                path="/staff/shop/*"
                element={
                  <RoleGuard allowedRoles={['shop', 'owner']}>
                    <AppShell pageTitle="Gear Shop POS">
                      <div className="p-6 bg-white rounded-lg border">Shop POS & Inventory Active</div>
                    </AppShell>
                  </RoleGuard>
                }
              />

              {/* Member Portal Routes */}
              <Route
                path="/member/*"
                element={
                  <RoleGuard allowedRoles={['member']}>
                    <AppShell pageTitle="Member Portal">
                      <div className="p-6 bg-white rounded-lg border">Member Portal Active</div>
                    </AppShell>
                  </RoleGuard>
                }
              />

              {/* Public Website Routes */}
              <Route
                path="/"
                element={
                  <AppShell isPublic pageTitle="Champions Club">
                    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-8 text-center space-y-4">
                      <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                        CHAMPIONS CLUB
                      </h1>
                      <p className="text-lg font-semibold text-primary max-w-xl">
                        "One club. One connected experience."
                      </p>
                      <p className="text-sm text-text-muted max-w-md">
                        Digital Club OS for Court Booking, Membership, Gear Shop, Cafeteria POS, and Executive Analytics.
                      </p>
                    </div>
                  </AppShell>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
