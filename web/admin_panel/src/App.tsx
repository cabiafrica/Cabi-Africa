import { useState, useEffect } from 'react';
import { useLocation, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
// Components 
import { DriverApprovalDashboard } from './components/DriverApprovalDashboard';
import { ReferralConfiguration as ReferralConfig } from './components/ReferralConfiguration';
import { PromotionalConfig as PromoConfig } from './components/PromotionalConfig';
import { BadgeManagement } from './components/management/BadgeManagement';
import { BlogManagement } from './components/management/BlogManagement';
import { PermissionManagement } from './components/management/PermissionManagement';
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
import { AppSettingsManagement } from './components/settings/AppSettingsManagement';
import { JobActivitiesDashboard } from './components/operations/JobActivitiesDashboard';
import { WelfareSchemeManagement } from './components/settings/WelfareSchemeManagement';
import SaccoIntegrationHub from './pages/sacco/SaccoIntegrationHub';

// New Role Pages
import RolesList from './pages/Roles/RolesList';
import RoleEditor from './pages/Roles/RoleEditor';
import { DriverGroupsPage } from './pages/DriverGroupsPage';
import { SosIncidentDashboard } from './pages/SosIncidentDashboard';
import { OccurrenceList } from './pages/OccurrenceList';
import OrganizationsList from './pages/organizations/OrganizationsList';
import OrganizationDetails from './pages/organizations/OrganizationDetails';
import { VehicleBenefitsPage } from './pages/VehicleBenefitsPage';
import { VehicleQualificationsPage } from './pages/VehicleQualificationsPage';
import { BenefitClaimsPage } from './pages/BenefitClaimsPage';


// Widgets
import { RevenueWidget } from './components/widgets/RevenueWidget';
import { RideStatusWidget } from './components/widgets/RideStatusWidget';
import { NetworkGrowthWidget } from './components/widgets/NetworkGrowthWidget';
import { AcquisitionChannelWidget } from './components/widgets/AcquisitionChannelWidget';

// Enhanced Finance & Reporting Components
import { PayoutProcessing } from './components/PayoutProcessing';
import { PayoutScheduler } from './components/PayoutScheduler';
import { ExportableReports } from './components/ExportableReports';

// Guards
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Icons
import { ExpandLess, ExpandMore } from '@mui/icons-material';

type View = 'dashboard' | 'applications' | 'job-activities' | 'referral-dashboard' | 'referral-config' | 'promo-config' | 'badge-management' | 'blog-management' | 'permissions' | 'roles' | 'users' | 'platform-users' | 'commission-ledger' | 'audit-log' | 'sos-config' | 'suspended-accounts' | 'organization-management' | 'simulation-dashboard' | 'support-tickets' | 'surge-zones' | 'airport-zones' | 'vehicle-categories' | 'promo-codes' | 'scheduled-rides' | 'cms' | 'bulk-messaging' | 'driver-performance' | 'city-management' | 'heat-maps' | 'driver-unions' | 'live-map' | 'bi-dashboard' | 'fraud-alerts' | 'gamification' | 'traction-logs' | 'occurrences';

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
      { icon: '🏢', label: 'Organizations', view: '/organizations', permission: 'ORGANIZATION_VIEW' },
      { icon: '📁', label: 'Driver Groups', view: '/driver-groups', permission: 'ORGANIZATION_VIEW' },
      { icon: '📅', label: 'Scheduled Rides', view: '/scheduled-rides', permission: 'DISPATCH_RIDE_MONITOR' },
      { icon: '🎫', label: 'Support Tickets', view: '/support-tickets', permission: 'OCCURRENCE_VIEW' },
      { icon: '📊', label: 'Driver Performance', view: '/driver-performance', permission: 'DISPATCH_ANALYTICS_VIEW' },
      { icon: '🛡️', label: 'Benefit Claims', view: '/benefit-claims', permission: 'OCCURRENCE_VIEW' },
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
      { icon: '📋', label: 'Occurrences', view: '/occurrences', permission: 'OCCURRENCE_VIEW' },
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
      { icon: '⚙️', label: 'App Settings', view: '/app-settings', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: '🎁', label: 'Vehicle Benefits', view: '/vehicle-benefits', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: '🏆', label: 'Qualifications', view: '/vehicle-qualifications', permission: 'SYSTEM_SETTINGS_EDIT' },
    ]
  },
  {
    label: 'Marketing & Content',
    items: [
      { icon: '🏷️', label: 'Promo Codes', view: '/promo-codes', permission: 'MARKETING_CONTENT_EDIT' },
      { icon: '📢', label: 'Bulk Msg', view: '/bulk-messaging', permission: 'NOTIFICATIONS_MANAGE' },
      { icon: '📝', label: 'CMS', view: '/cms', permission: 'BLOG_POSTS_EDIT' },
      { icon: '📰', label: 'Blog Management', view: '/blog-management', permission: 'BLOG_POSTS_EDIT' },
    ]
  },
  {
    label: 'Finance & System',
    items: [
      { icon: '💹', label: 'Commissions', view: '/commission-ledger', permission: 'COMMISSION_VIEW' },
      { icon: '💸', label: 'Payout Processing', view: '/payouts', permission: 'PAYMENTS_PROCESS' },
      { icon: '⏱️', label: 'Payout Scheduler', view: '/payout-scheduler', permission: 'PAYMENTS_PROCESS' },
      { icon: '🏦', label: 'Welfare Schemes', view: '/welfare-schemes', permission: 'COMMISSION_EDIT' },
      { icon: '💰', label: 'Traction Logs', view: '/traction-logs', permission: 'AUDIT_LOGS_VIEW' },
      { icon: '🏛️', label: 'Sacco Integration', view: '/sacco-integration', permission: 'SYSTEM_SETTINGS_EDIT' },
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

  // Detached Visualization Mode for External Screens
  if (location.pathname.startsWith('/visualize')) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white flex flex-col antialiased">
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm tracking-wide">Cabi Admin Telemetry</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  EXTERNAL SCREEN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Undocked display monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen?.().catch(() => {});
                } else {
                  document.exitFullscreen?.().catch(() => {});
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              Fullscreen
            </button>
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/30 rounded-lg transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              title="Close window and return to main panel"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
              Dock to Main Display
            </button>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-7xl">
            <Routes>
              <Route path="/visualize/revenue" element={<RevenueWidget />} />
              <Route path="/visualize/ride-status" element={<RideStatusWidget />} />
              <Route path="/visualize/growth" element={<NetworkGrowthWidget />} />
              <Route path="/visualize/acquisition" element={<AcquisitionChannelWidget />} />
            </Routes>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  const hasPermission = (p: string) => {
    if (!user) return false;
    // Super admins/Admins should have access to everything for now or via granular roles
    const role = (user.role as string)?.toUpperCase();
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
      <aside className="sidebar w-64 flex-shrink-0 flex flex-col bg-slate-950 border-r border-white/5 shadow-2xl transition-colors duration-200">
        <div className="p-8 border-b border-white/5 flex flex-col items-center text-center">
          <h1 className="text-xl font-black tracking-[0.3em] text-primary">CABI ADMIN</h1>
          <div className="mt-1 text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-6">Security Terminal</div>

          <img
            src={user?.profilePictureUrl || "https://ui-avatars.com/api/?name=" + (user?.fullName || "Admin") + "&background=FFD700&color=000"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover ring-1 ring-primary/30 mb-3 grayscale hover:grayscale-0 transition-all duration-500"
          />
          <div className="font-semibold text-slate-200">{user?.fullName || 'Admin User'}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">{user?.role || 'Senior Administrator'}</div>

          <div className="flex gap-2 w-full justify-center">
            <button
              onClick={toggleTheme}
              className="p-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-full transition-all duration-200 text-slate-400"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-slate-900 hover:bg-primary hover:text-black border border-white/10 rounded-full transition-all duration-300 group text-slate-400"
            >
              <span>Log Out</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
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
                      className={`w-full text-left px-6 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors border-l-2 ${isActive(item.view) ? 'bg-primary/5 border-primary text-primary font-semibold' : 'border-transparent text-slate-500 hover:text-slate-200'}`}
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
        {((user?.role as string)?.toUpperCase() === 'SUPER_ADMIN' || (user?.role as string)?.toUpperCase() === 'ADMIN' || hasPermission('DISPATCH_DASHBOARD_VIEW') || hasPermission('USER_PORTAL_DASHBOARD_VIEW')) && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2">
              System Access
            </div>
            {((user?.role as string)?.toUpperCase() === 'SUPER_ADMIN' || (user?.role as string)?.toUpperCase() === 'ADMIN' || hasPermission('DISPATCH_DASHBOARD_VIEW')) && (
              <button
                onClick={() => {
                  const url = import.meta.env.VITE_DISPATCH_PANEL_URL || 
                    (window.location.hostname.includes('cabi.africa') || window.location.hostname.includes('vercel.app') 
                      ? 'https://dispatch.cabi.africa' 
                      : 'http://localhost:3002');
                  window.location.href = url;
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:bg-primary hover:text-black rounded-lg transition-all duration-300 group border border-white/5"
                title="Launch Dispatch Management Panel"
              >
                <span className="text-base group-hover:scale-110 transition-transform">🖥️</span>
                <span>Dispatch Panel</span>
                <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">LAUNCH ↗️</span>
              </button>
            )}
            {((user?.role as string)?.toUpperCase() === 'SUPER_ADMIN' || (user?.role as string)?.toUpperCase() === 'ADMIN' || hasPermission('USER_PORTAL_DASHBOARD_VIEW')) && (
              <button
                onClick={() => {
                  const url = import.meta.env.VITE_USER_PORTAL_URL || 
                    (window.location.hostname.includes('cabi.africa') || window.location.hostname.includes('vercel.app') 
                      ? 'https://app.cabi.africa' 
                      : 'http://localhost:3000');
                  window.location.href = url;
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:bg-primary hover:text-black rounded-lg transition-all duration-300 group border border-white/5"
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

              <Route path="/applications" element={<ProtectedRoute permission="DRIVER_APPLICATIONS_VIEW"><DriverApprovalDashboard /></ProtectedRoute>} />
              <Route path="/job-activities" element={<ProtectedRoute permission="DISPATCH_DASHBOARD_VIEW"><JobActivitiesDashboard /></ProtectedRoute>} />

              <Route path="/occurrences" element={<ProtectedRoute permission="OCCURRENCE_VIEW"><OccurrenceList /></ProtectedRoute>} />
              <Route path="/resolution-dashboard" element={<ProtectedRoute permission="OCCURRENCE_RESOLVE"><SosIncidentDashboard /></ProtectedRoute>} />
              <Route path="/resolution-dashboard/:incidentId" element={<ProtectedRoute permission="OCCURRENCE_RESOLVE"><SosIncidentDashboard /></ProtectedRoute>} />
              <Route path="/organizations" element={<ProtectedRoute permission="ORGANIZATION_VIEW"><OrganizationsList /></ProtectedRoute>} />
              <Route path="/organizations/:id" element={<ProtectedRoute permission="ORGANIZATION_VIEW"><OrganizationDetails /></ProtectedRoute>} />
              <Route path="/driver-groups" element={<ProtectedRoute permission="ORGANIZATION_VIEW"><DriverGroupsPage /></ProtectedRoute>} />
              <Route path="/referral-config" element={<ProtectedRoute permission="REFERRAL_FORMULA_VIEW"><ReferralConfig /></ProtectedRoute>} />
              <Route path="/referral-dashboard" element={<ProtectedRoute permission="REFERRAL_FORMULA_VIEW"><ReferralDashboard /></ProtectedRoute>} />
              <Route path="/simulation-dashboard" element={<SimulationDashboard />} />
              <Route path="/promo-config" element={<PromoConfig />} />
              <Route path="/platform-users" element={<PlatformUsers />} />
              <Route path="/commission-ledger" element={<CommissionLedger />} />
              <Route path="/badge-management" element={<BadgeManagement />} />
              <Route path="/blog-management" element={<BlogManagement />} />

              {/* Updated Permission/Role Routes */}
              <Route path="/roles" element={<ProtectedRoute permission="USER_ROLES_ASSIGN"><RolesList /></ProtectedRoute>} />
              <Route path="/roles/:id" element={<ProtectedRoute permission="USER_ROLES_ASSIGN"><RoleEditor /></ProtectedRoute>} />
              <Route path="/permissions" element={<ProtectedRoute permission="USER_ROLES_ASSIGN"><PermissionManagement /></ProtectedRoute>} /> {/* Legacy or update this later */}

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
              <Route path="/app-settings" element={<AppSettingsManagement />} />
              <Route path="/welfare-schemes" element={<WelfareSchemeManagement />} />
              <Route path="/vehicle-benefits" element={<VehicleBenefitsPage />} />
              <Route path="/vehicle-qualifications" element={<VehicleQualificationsPage />} />
              <Route path="/benefit-claims" element={<BenefitClaimsPage />} />
              <Route path="/sacco-integration" element={<ProtectedRoute permission="SYSTEM_SETTINGS_EDIT"><SaccoIntegrationHub /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
