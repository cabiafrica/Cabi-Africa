import { useState, useEffect } from 'react';
import { useLocation, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
// Components 
import { DriverApplicationsList } from './components/drivers/DriverApplicationsList';
import { ReferralConfiguration as ReferralConfig } from './components/ReferralConfiguration';
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
import { ReferralDashboard } from './components/management/ReferralDashboard';
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
import { JobActivitiesDashboard } from './components/operations/JobActivitiesDashboard';

// New Role Pages
import RolesList from './pages/Roles/RolesList';
import RoleEditor from './pages/Roles/RoleEditor';

// Widgets
import { RevenueWidget } from './components/widgets/RevenueWidget';
import { RideStatusWidget } from './components/widgets/RideStatusWidget';
import { NetworkGrowthWidget } from './components/widgets/NetworkGrowthWidget';
import { AcquisitionChannelWidget } from './components/widgets/AcquisitionChannelWidget';

// Enhanced Finance & Reporting Components
import { PayoutProcessing } from './components/PayoutProcessing';
import { PayoutScheduler } from './components/PayoutScheduler';
import { ExportableReports } from './components/ExportableReports';

// Icons
import { ExpandLess, ExpandMore } from '@mui/icons-material';

type View = 'dashboard' | 'applications' | 'job-activities' | 'referral-dashboard' | 'referral-config' | 'promo-config' | 'badge-management' | 'blog-management' | 'permissions' | 'roles' | 'users' | 'platform-users' | 'commission-ledger' | 'audit-log' | 'sos-config' | 'suspended-accounts' | 'organization-management' | 'simulation-dashboard' | 'support-tickets' | 'surge-zones' | 'airport-zones' | 'vehicle-categories' | 'promo-codes' | 'scheduled-rides' | 'cms' | 'bulk-messaging' | 'driver-performance' | 'city-management' | 'heat-maps' | 'driver-unions' | 'live-map' | 'bi-dashboard' | 'fraud-alerts' | 'gamification' | 'traction-logs';

interface MenuItem {
  icon: string;
  label: string;
  view?: string; // Changed from View to string path
  permission?: string;
  external?: boolean;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const SIDEBAR_MENU: MenuGroup[] = [
  {
    label: 'Operations',
    items: [
      { icon: '🏠', label: 'Dashboard', view: '/dashboard', permission: 'DISPATCH_DASHBOARD_VIEW' },
      { icon: '🚗', label: 'Job Activities', view: '/job-activities', permission: 'DISPATCH_DASHBOARD_VIEW' },
      { icon: '📄', label: 'Driver Applications', view: '/applications', permission: 'DRIVER_APPLICATIONS_VIEW' },
      { icon: '🏢', label: 'Organization', view: '/organization-management', permission: 'ORGANIZATION_VIEW' },
      { icon: '📅', label: 'Scheduled Rides', view: '/scheduled-rides', permission: 'DISPATCH_RIDE_MONITOR' },
      { icon: '🎫', label: 'Support Tickets', view: '/support-tickets', permission: 'OCCURRENCE_VIEW' },
      { icon: '📊', label: 'Driver Performance', view: '/driver-performance', permission: 'DISPATCH_ANALYTICS_VIEW' },
    ]
  },
  {
    label: 'Analytics & Map',
    items: [
      { icon: '📡', label: 'Live Map', view: '/live-map', permission: 'DISPATCH_REAL_TIME_MAP' },
      { icon: '🔥', label: 'Heat Maps', view: '/heat-maps', permission: 'DISPATCH_ANALYTICS_VIEW' },
      { icon: '📈', label: 'BI Dashboard', view: '/bi-dashboard', permission: 'DISPATCH_ANALYTICS_VIEW' },
      { icon: '🏙️', label: 'City Management', view: '/city-management', permission: 'LOCATIONS_EDIT' },
      { icon: '📥', label: 'Data Exports', view: '/exports', permission: 'FINANCIAL_REPORTS_VIEW' },
    ]
  },
  {
    label: 'Security',
    items: [
      { icon: '🚨', label: 'Fraud Alerts', view: '/fraud-alerts', permission: 'AUDIT_LOGS_VIEW' },
      { icon: '⚖️', label: 'Resolution Dash', view: '/resolution-dashboard', permission: 'OCCURRENCE_RESOLVE' },
      { icon: '🚫', label: 'Suspended Accounts', view: '/suspended-accounts', permission: 'DRIVER_SUSPEND' },
      { icon: '📜', label: 'Audit Log', view: '/audit-log', permission: 'AUDIT_LOGS_VIEW' },
      { icon: '🔒', label: 'Roles & Permissions', view: '/roles', permission: 'USER_ROLES_ASSIGN' },
      { icon: '🆘', label: 'SOS Config', view: '/sos-config', permission: 'SYSTEM_SETTINGS_EDIT' },
    ]
  },
  {
    label: 'User Management',
    items: [
      { icon: '🌍', label: 'All Users', view: '/platform-users', permission: 'PEOPLE_VIEW' },
      { icon: '👥', label: 'Admin Users', view: '/users', permission: 'PEOPLE_VIEW' },
    ]
  },
  {
    label: 'Configuration',
    items: [
      { icon: '💰', label: 'Referral Config', view: '/referral-config', permission: 'REFERRAL_FORMULA_VIEW' },
      { icon: '🔮', label: 'Simulation', view: '/simulation-dashboard', permission: 'DISPATCH_ANALYTICS_VIEW' },
      { icon: '🗺️', label: 'Surge Zones', view: '/surge-zones', permission: 'LOCATIONS_EDIT' },
      { icon: '✈️', label: 'Airport Zones', view: '/airport-zones', permission: 'LOCATIONS_EDIT' },
      { icon: '🚗', label: 'Services', view: '/vehicle-categories', permission: 'VEHICLES_VIEW' },
      { icon: '🏅', label: 'Badges', view: '/badge-management', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: '🎮', label: 'Gamification', view: '/gamification', permission: 'SYSTEM_SETTINGS_EDIT' },
    ]
  },
  {
    label: 'Marketing & Content',
    items: [
      { icon: '🏷️', label: 'Promo Codes', view: '/promo-codes', permission: 'MARKETING_CONTENT_EDIT' },
      { icon: '📢', label: 'Bulk Msg', view: '/bulk-messaging', permission: 'NOTIFICATIONS_MANAGE' },
      { icon: '📝', label: 'CMS', view: '/cms', permission: 'BLOG_POSTS_EDIT' },
    ]
  },
  {
    label: 'Finance & System',
    items: [
      { icon: '💹', label: 'Commissions', view: '/commission-ledger', permission: 'COMMISSION_VIEW' },
      { icon: '💸', label: 'Payout Processing', view: '/payouts', permission: 'PAYMENTS_PROCESS' },
      { icon: '⏱️', label: 'Payout Scheduler', view: '/payout-scheduler', permission: 'PAYMENTS_PROCESS' },
      { icon: '💰', label: 'Traction Logs', view: '/traction-logs', permission: 'AUDIT_LOGS_VIEW' },
    ]
  }
];


function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Operations']);

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Check local storage or system preference
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync theme with HTML element for Tailwind and useTheme hook
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

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
    if (!user) return false;
    // Super admins/Admins should have access to everything for now or via granular roles
    const role = (user.role as any)?.toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;

    if (!user.permissions) return false;
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
    <div className={`flex h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <aside className="sidebar w-64 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
          <h1 className="text-xl font-bold tracking-wider text-slate-900 dark:text-white">CABI ADMIN</h1>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 mb-6">Control Center</div>

          <img
            src={user?.profilePictureUrl || "https://ui-avatars.com/api/?name=" + (user?.fullName || "Admin") + "&background=random"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-3"
          />
          <div className="font-medium text-slate-900 dark:text-slate-200">{user?.fullName || 'Admin User'}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">{user?.email || 'admin@cabialpha.com'}</div>

          <div className="flex gap-2 w-full justify-center">
            <button
              onClick={toggleTheme}
              className="p-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full transition-all duration-200 text-slate-600 dark:text-slate-300"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:dark:bg-red-900/20 hover:text-red-600 hover:dark:text-red-400 border border-slate-200 dark:border-slate-700 rounded-full transition-all duration-200 group text-slate-600 dark:text-slate-300"
            >
              <span>Log Out</span>
              <span className="group-hover:translate-x-1 transition-transform">↪️</span>
            </button>
          </div>
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
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{group.label}</span>
                  {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </button>

                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                  {visibleItems.map(item => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.external && item.view) {
                          window.open(item.view, '_blank');
                        } else if (item.view) {
                          navigate(item.view);
                        }
                      }}
                      className={`w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors border-l-4 ${isActive(item.view) ? 'bg-blue-50 dark:bg-slate-800 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                      {item.external && <span className="text-xs ml-auto opacity-50">↗️</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Global Access Buttons - Persistent Footer */}
        {((user?.role as any)?.toUpperCase() === 'SUPER_ADMIN' || (user?.role as any)?.toUpperCase() === 'ADMIN' || hasPermission('DISPATCH_DASHBOARD_VIEW') || hasPermission('USER_PORTAL_DASHBOARD_VIEW')) && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2">
              System Access
            </div>
            {(user?.role === 'admin' || hasPermission('DISPATCH_DASHBOARD_VIEW') || hasPermission('view_dashboard')) && (
              <button
                onClick={() => window.open('http://localhost:3002', '_blank')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 hover:border-blue-600"
                title="Launch Dispatch Management Panel"
              >
                <span className="text-base group-hover:scale-110 transition-transform">🖥️</span>
                <span>Dispatch Panel</span>
                <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">LAUNCH ↗️</span>
              </button>
            )}
            {(user?.role === 'admin' || hasPermission('USER_PORTAL_DASHBOARD_VIEW') || hasPermission('view_dashboard')) && (
              <button
                onClick={() => window.open('http://localhost:3000', '_blank')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 hover:border-indigo-600"
                title="View User Portal Dashboard"
              >
                <span className="text-base group-hover:scale-110 transition-transform">👤</span>
                <span>User Portal</span>
                <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">VIEW ↗️</span>
              </button>
            )}
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
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
              <Route path="/job-activities" element={<JobActivitiesDashboard />} />

              <Route path="/resolution-dashboard" element={<div className="card"> <h2 className="text-2xl font-bold mb-4">Resolution Dashboard</h2> <p>Dispute Resolution and Case Management</p> </div>} />
              <Route path="/organization-management" element={<OrganizationManagement />} />
              <Route path="/referral-config" element={<ReferralConfig />} />
              <Route path="/referral-dashboard" element={<ReferralDashboard />} />
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
              <Route path="/payouts" element={<PayoutProcessing />} />
              <Route path="/payout-scheduler" element={<PayoutScheduler />} />
              <Route path="/exports" element={<ExportableReports />} />
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
