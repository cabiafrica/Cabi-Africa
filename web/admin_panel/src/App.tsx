import { useState } from 'react';
import { useLocation, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
// Components 
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

// New Role Pages
import RolesList from './pages/Roles/RolesList';
import RoleEditor from './pages/Roles/RoleEditor';

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
  view?: string; // Changed from View to string path
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
      { icon: '🏠', label: 'Dashboard', view: '/dashboard', permission: 'view_dashboard' },
      { icon: '📄', label: 'Driver Applications', view: '/applications', permission: 'manage_applications' },
      { icon: '🏢', label: 'Organization', view: '/organization-management', permission: 'manage_organizations' },
      { icon: '📅', label: 'Scheduled Rides', view: '/scheduled-rides', permission: 'view_scheduled_rides' },
      { icon: '🎫', label: 'Support Tickets', view: '/support-tickets', permission: 'manage_support' },
      { icon: '📊', label: 'Driver Performance', view: '/driver-performance', permission: 'view_performance' },
    ]
  },
  {
    label: 'Analytics & Map',
    items: [
      { icon: '📡', label: 'Live Map', view: '/live-map', permission: 'view_live_map' },
      { icon: '🔥', label: 'Heat Maps', view: '/heat-maps', permission: 'view_heat_maps' },
      { icon: '📈', label: 'BI Dashboard', view: '/bi-dashboard', permission: 'view_bi_dashboard' },
      { icon: '🏙️', label: 'City Management', view: '/city-management', permission: 'manage_cities' },
      { icon: '🚨', label: 'Fraud Alerts', view: '/fraud-alerts', permission: 'view_fraud_alerts' },
    ]
  },
  {
    label: 'User Management',
    items: [
      { icon: '🌍', label: 'All Users', view: '/platform-users', permission: 'manage_users' },
      { icon: '👥', label: 'Admin Users', view: '/users', permission: 'manage_admins' },
      { icon: '🚫', label: 'Suspended', view: '/suspended-accounts', permission: 'manage_suspended' },
    ]
  },
  {
    label: 'Configuration',
    items: [
      { icon: '💰', label: 'MLM Config', view: '/mlm-config', permission: 'configure_mlm' },
      { icon: '🔮', label: 'Simulation', view: '/simulation-dashboard', permission: 'view_simulation' },
      { icon: '🗺️', label: 'Surge Zones', view: '/surge-zones', permission: 'manage_zones' },
      { icon: '✈️', label: 'Airport Zones', view: '/airport-zones', permission: 'manage_zones' },
      { icon: '🚗', label: 'Services', view: '/vehicle-categories', permission: 'manage_vehicles' },
      { icon: '🏅', label: 'Badges', view: '/badge-management', permission: 'manage_config' },
      { icon: '🎮', label: 'Gamification', view: '/gamification', permission: 'manage_config' },
    ]
  },
  {
    label: 'Marketing & Content',
    items: [
      { icon: '🏷️', label: 'Promo Codes', view: '/promo-codes', permission: 'manage_promotions' },
      { icon: '📢', label: 'Bulk Msg', view: '/bulk-messaging', permission: 'send_bulk_messages' },
      { icon: '📝', label: 'CMS', view: '/cms', permission: 'manage_content' },
    ]
  },
  {
    label: 'Finance & System',
    items: [
      { icon: '💹', label: 'Commissions', view: '/commission-ledger', permission: 'view_commissions' },
      { icon: '💰', label: 'Traction Logs', view: '/traction-logs', permission: 'view_traction_logs' },
      { icon: '📜', label: 'Audit Log', view: '/audit-log', permission: 'view_audit_log' },
      { icon: '🔒', label: 'Roles & Permissions', view: '/roles', permission: 'manage_permissions' },
    ]
  }
];

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Operations']);

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

  if (!isAuthenticated) return <LoginPage />;

  const hasPermission = (p: string) => {
    if (!user?.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(p);
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  // Helper to determine active state
  const isActive = (path?: string) => path && location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <aside className="sidebar w-64 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">
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
                      onClick={() => item.view && navigate(item.view)}
                      className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors border-l-4 ${isActive(item.view) ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-300 hover:text-white'}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-900">
        {/* Using light bg for content area, can revert to dark if requested */}
        <Header currentView={location.pathname.replace('/', '') as View} />

        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard" element={
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
              } />

              <Route path="/applications" element={<DriverApplicationsList />} />
              <Route path="/organization-management" element={<OrganizationManagement />} />
              <Route path="/mlm-config" element={<MlmConfig />} />
              <Route path="/mlm-dashboard" element={<MlmDashboard />} />
              <Route path="/simulation-dashboard" element={<SimulationDashboard />} />
              <Route path="/promo-config" element={<PromoConfig />} />
              <Route path="/platform-users" element={<PlatformUsers />} />
              <Route path="/commission-ledger" element={<CommissionLedger />} />
              <Route path="/badge-management" element={<BadgeManagement />} />
              <Route path="/blog-management" element={<BlogManagement />} />

              {/* Updated Permission/Role Routes */}
              <Route path="/roles" element={<RolesList />} />
              <Route path="/roles/:id" element={<RoleEditor />} />
              <Route path="/permissions" element={<PermissionManagement />} /> {/* Legacy or update this later */}

              <Route path="/users" element={<UserManagement />} />
              <Route path="/audit-log" element={<AuditLogViewer />} />
              <Route path="/sos-config" element={<SosPenaltyConfig />} />
              <Route path="/suspended-accounts" element={<SuspendedAccounts />} />
              <Route path="/traction-logs" element={<TractionLogs />} />
              <Route path="/support-tickets" element={<SupportTicketManagement />} />
              <Route path="/surge-zones" element={<ZoneManagement type="SURGE" />} />
              <Route path="/airport-zones" element={<ZoneManagement type="AIRPORT" />} />
              <Route path="/vehicle-categories" element={<VehicleCategoriesManagement />} />
              <Route path="/promo-codes" element={<PromoCodeManagement />} />
              <Route path="/scheduled-rides" element={<ScheduledRideManagement />} />
              <Route path="/cms" element={<CMSManagement />} />
              <Route path="/bulk-messaging" element={<BulkMessaging />} />
              <Route path="/driver-performance" element={<DriverPerformanceReport />} />
              <Route path="/city-management" element={<CityManagementDashboard />} />
              <Route path="/heat-maps" element={<HeatMapAnalytics />} />
              <Route path="/driver-unions" element={<DriverUnionManagement />} />
              <Route path="/live-map" element={<LiveMap />} />
              <Route path="/bi-dashboard" element={<BIDashboard />} />
              <Route path="/fraud-alerts" element={<FraudDetectionDashboard />} />
              <Route path="/gamification" element={<GamificationManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
