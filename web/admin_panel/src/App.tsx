import { useState } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { DriverApplicationsList } from './components/drivers/DriverApplicationsList';
import { MlmConfiguration as MlmConfig } from './components/MlmConfiguration';
import { PromotionalConfig as PromoConfig } from './components/PromotionalConfig';
import { BadgeManagement } from './components/management/BadgeManagement';
import { BlogManagement } from './components/management/BlogManagement';
import { PermissionManagement } from './components/management/PermissionManagement';
import { RoleManagement } from './components/management/RoleManagement';
import { UserManagement } from './components/management/UserManagement';
import { UserManagementDashboard as PlatformUsers } from './components/management/PlatformUsers';
import { OrganizationManagement } from './components/management/OrganizationManagement';
import { SimulationDashboard } from './components/management/SimulationDashboard';
import { ExpiringDocumentsWidget } from './components/dashboard/ExpiringDocumentsWidget';
import { CommissionLedger } from './components/management/CommissionLedger';
import { MlmDashboard } from './components/management/MlmDashboard';
import { AuditLogViewer } from './components/viewers/AuditLogViewer';
import { TractionLogs } from './components/management/TractionLogs';
import { SuspendedAccountManagement as SuspendedAccounts } from './components/SuspendedAccountManagement';
import { SosPenaltyConfig } from './components/SosPenaltyConfig';
import { SupportTicketManagement } from './components/support/SupportTicketManagement';
import { ZoneManagement } from './components/locations/ZoneManagement';
import { VehicleCategoriesManagement } from './components/settings/VehicleCategoriesManagement';
import { PromoCodeManagement } from './components/marketing/PromoCodeManagement';
import { ScheduledRideManagement } from './components/operations/ScheduledRideManagement';
import { CMSManagement } from './components/content/CMSManagement';
import { BulkMessaging } from './components/communications/BulkMessaging';
import { DriverPerformanceReport } from './components/reports/DriverPerformanceReport';
import { CityManagementDashboard } from './components/city/CityManagementDashboard';
import { HeatMapAnalytics } from './components/analytics/HeatMapAnalytics';
import { DriverUnionManagement } from './components/drivers/DriverUnionManagement';
import { LiveMap } from './components/locations/LiveMap';
import { BIDashboard } from './components/dashboard/BIDashboard';
import { FraudDetectionDashboard } from './components/dashboard/FraudDetectionDashboard';
import { Header } from './components/layout/Header';
import { DashboardAnalytics } from './components/dashboard/DashboardAnalytics';
import { GamificationManagement } from './components/settings/GamificationManagement';

// Widgets
import { RevenueWidget } from './components/widgets/RevenueWidget';
import { RideStatusWidget } from './components/widgets/RideStatusWidget';
import { NetworkGrowthWidget } from './components/widgets/NetworkGrowthWidget';
import { AcquisitionChannelWidget } from './components/widgets/AcquisitionChannelWidget';

// Icons
import { ExpandLess, ExpandMore } from '@mui/icons-material';

type View = 'dashboard' | 'applications' | 'mlm-dashboard' | 'mlm-config' | 'promo-config' | 'badge-management' | 'blog-management' | 'permissions' | 'roles' | 'users' | 'platform-users' | 'commission-ledger' | 'audit-log' | 'sos-config' | 'suspended-accounts' | 'organization-management' | 'simulation-dashboard' | 'support-tickets' | 'surge-zones' | 'airport-zones' | 'vehicle-categories' | 'promo-codes' | 'scheduled-rides' | 'cms' | 'bulk-messaging' | 'driver-performance' | 'city-management' | 'heat-maps' | 'driver-unions' | 'live-map' | 'bi-dashboard' | 'fraud-alerts' | 'gamification' | 'traction-logs';

interface MenuItem {
  icon: string;
  label: string;
  view?: View;
  permission?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const SIDEBAR_MENU: MenuGroup[] = [
  {
    label: 'Operations',
    items: [
      { icon: '🏠', label: 'Dashboard', view: 'dashboard', permission: 'view_dashboard' },
      { icon: '📄', label: 'Driver Applications', view: 'applications', permission: 'manage_applications' },
      { icon: '🏢', label: 'Organization', view: 'organization-management', permission: 'manage_organizations' },
      { icon: '📅', label: 'Scheduled Rides', view: 'scheduled-rides', permission: 'view_scheduled_rides' },
      { icon: '🎫', label: 'Support Tickets', view: 'support-tickets', permission: 'manage_support' },
      { icon: '📊', label: 'Driver Performance', view: 'driver-performance', permission: 'view_performance' },
    ]
  },
  {
    label: 'Analytics & Map',
    items: [
      { icon: '📡', label: 'Live Map', view: 'live-map', permission: 'view_live_map' },
      { icon: '🔥', label: 'Heat Maps', view: 'heat-maps', permission: 'view_heat_maps' },
      { icon: '📈', label: 'BI Dashboard', view: 'bi-dashboard', permission: 'view_bi_dashboard' },
      { icon: '🏙️', label: 'City Management', view: 'city-management', permission: 'manage_cities' },
      { icon: '🚨', label: 'Fraud Alerts', view: 'fraud-alerts', permission: 'view_fraud_alerts' },
    ]
  },
  {
    label: 'User Management',
    items: [
      { icon: '🌍', label: 'All Users', view: 'platform-users', permission: 'manage_users' },
      { icon: '👥', label: 'Admin Users', view: 'users', permission: 'manage_admins' },
      { icon: '🚫', label: 'Suspended', view: 'suspended-accounts', permission: 'manage_suspended' },
    ]
  },
  {
    label: 'Configuration',
    items: [
      { icon: '💰', label: 'MLM Config', view: 'mlm-config', permission: 'configure_mlm' },
      { icon: '🔮', label: 'Simulation', view: 'simulation-dashboard', permission: 'view_simulation' },
      { icon: '🗺️', label: 'Surge Zones', view: 'surge-zones', permission: 'manage_zones' },
      { icon: '✈️', label: 'Airport Zones', view: 'airport-zones', permission: 'manage_zones' },
      { icon: '🚗', label: 'Services', view: 'vehicle-categories', permission: 'manage_vehicles' },
      { icon: '🏅', label: 'Badges', view: 'badge-management', permission: 'manage_config' },
      { icon: '🎮', label: 'Gamification', view: 'gamification', permission: 'manage_config' },
    ]
  },
  {
    label: 'Marketing & Content',
    items: [
      { icon: '🏷️', label: 'Promo Codes', view: 'promo-codes', permission: 'manage_promotions' },
      { icon: '📢', label: 'Bulk Msg', view: 'bulk-messaging', permission: 'send_bulk_messages' },
      { icon: '📝', label: 'CMS', view: 'cms', permission: 'manage_content' },
    ]
  },
  {
    label: 'Finance & System',
    items: [
      { icon: '💹', label: 'Commissions', view: 'commission-ledger', permission: 'view_commissions' },
      { icon: '💰', label: 'Traction Logs', view: 'traction-logs', permission: 'view_traction_logs' },
      { icon: '📜', label: 'Audit Log', view: 'audit-log', permission: 'view_audit_log' },
      { icon: '🔒', label: 'Permissions', view: 'permissions', permission: 'manage_permissions' },
    ]
  }
];

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Operations']); // Default open
  const location = useLocation();

  // Detached Visualization Mode
  if (location.pathname.startsWith('/visualize')) {
    return (
      <div className="min-h-screen w-screen bg-slate-900 text-white p-6 overflow-hidden flex items-center justify-center">
        <div className="w-full h-full max-w-7xl max-h-[90vh]">
          <Routes>
            <Route path="/visualize/revenue" element={<RevenueWidget />} />
            <Route path="/visualize/ride-status" element={<RideStatusWidget />} />
            <Route path="/visualize/growth" element={<NetworkGrowthWidget />} />
            <Route path="/visualize/acquisition" element={<AcquisitionChannelWidget />} />
          </Routes>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const hasPermission = (p: string) => {
    if (!user?.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(p);
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <aside className="sidebar">
        <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center">
          <h1 className="text-xl font-bold tracking-wider">CABI ADMIN</h1>
          <div className="mt-1 text-xs text-slate-400 mb-6">Control Center</div>

          <img
            src={user?.profilePictureUrl || "https://ui-avatars.com/api/?name=" + (user?.fullName || "Admin") + "&background=random"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-600 mb-3"
          />
          <div className="font-medium text-slate-200">{user?.fullName || 'Admin User'}</div>
          <div className="text-xs text-slate-400 mb-4">{user?.email || 'admin@cabialpha.com'}</div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 rounded-full transition-all duration-200 group"
          >
            <span>Log Out</span>
            <span className="group-hover:translate-x-1 transition-transform">↪️</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {SIDEBAR_MENU.map((group) => {
            // Filter items user has permission for
            const visibleItems = group.items.filter(item => !item.permission || hasPermission(item.permission));

            if (visibleItems.length === 0) return null;

            const isExpanded = expandedMenus.includes(group.label);

            return (
              <div key={group.label} className="mb-2">
                <button
                  onClick={() => toggleMenu(group.label)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-800/50 transition-colors"
                >
                  <span>{group.label}</span>
                  {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </button>

                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                  {visibleItems.map(item => (
                    <button
                      key={item.label}
                      onClick={() => item.view && setCurrentView(item.view)}
                      className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors border-l-4 ${currentView === item.view ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-300 hover:text-white'}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="px-4 mt-6 pt-6 border-t border-slate-700">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">External Apps</div>
            <a href="http://localhost:3002" target="_blank" rel="noreferrer" className="w-full text-left px-6 py-2 hover:bg-slate-800 flex items-center gap-3 text-cyan-400 font-semibold border border-slate-700 rounded mb-2 text-sm"><span>🚀</span> Dispatch Panel &rarr;</a>
            <a href="http://localhost:3000/admin" target="_blank" rel="noreferrer" className="w-full text-left px-6 py-2 hover:bg-slate-800 flex items-center gap-3 text-emerald-400 font-semibold border border-slate-700 rounded text-sm"><span>🌐</span> User Portal Admin &rarr;</a>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Header currentView={currentView} />

        <div className="p-6 card">
          <div className="max-w-7xl mx-auto space-y-6">

            {currentView === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                  <span className="text-sm text-gray-500">Live Overview</span>
                </div>

                <DashboardAnalytics />

                <div className="grid grid-cols-1 gap-6">
                  <ExpiringDocumentsWidget />
                </div>
              </div>
            )}

            {currentView === 'applications' && <DriverApplicationsList />}
            {currentView === 'organization-management' && <OrganizationManagement />}
            {currentView === 'mlm-config' && <MlmConfig />}
            {currentView === 'mlm-dashboard' && <MlmDashboard />}
            {currentView === 'simulation-dashboard' && <SimulationDashboard />}
            {currentView === 'promo-config' && <PromoConfig />}
            {currentView === 'platform-users' && <PlatformUsers />}
            {currentView === 'commission-ledger' && <CommissionLedger />}
            {currentView === 'badge-management' && <BadgeManagement />}
            {currentView === 'blog-management' && <BlogManagement />}
            {currentView === 'permissions' && <PermissionManagement />}
            {currentView === 'roles' && <RoleManagement />}
            {currentView === 'users' && <UserManagement />}
            {currentView === 'audit-log' && <AuditLogViewer />}
            {currentView === 'sos-config' && <SosPenaltyConfig />}
            {currentView === 'suspended-accounts' && <SuspendedAccounts />}
            {currentView === 'traction-logs' && <TractionLogs />}

            {currentView === 'support-tickets' && <SupportTicketManagement />}
            {currentView === 'surge-zones' && <ZoneManagement type="SURGE" />}
            {currentView === 'airport-zones' && <ZoneManagement type="AIRPORT" />}
            {currentView === 'vehicle-categories' && <VehicleCategoriesManagement />}
            {currentView === 'promo-codes' && <PromoCodeManagement />}
            {currentView === 'scheduled-rides' && <ScheduledRideManagement />}
            {currentView === 'cms' && <CMSManagement />}
            {currentView === 'bulk-messaging' && <BulkMessaging />}
            {currentView === 'driver-performance' && <DriverPerformanceReport />}

            {currentView === 'city-management' && <CityManagementDashboard />}
            {currentView === 'heat-maps' && <HeatMapAnalytics />}
            {currentView === 'driver-unions' && <DriverUnionManagement />}
            {currentView === 'live-map' && <LiveMap />}
            {currentView === 'bi-dashboard' && <BIDashboard />}
            {currentView === 'fraud-alerts' && <FraudDetectionDashboard />}
            {currentView === 'gamification' && <GamificationManagement />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
