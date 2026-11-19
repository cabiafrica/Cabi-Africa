import { useState, useEffect, useMemo, lazy, Suspense, ReactNode } from 'react';
import { useLocation, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import cabiLogo from './assets/cabi_logo_white.png';
import { Header } from './components/layout/Header';
import { CommandPalette, CommandItem } from './components/layout/CommandPalette';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import {
  LayoutDashboard, Radio, Flame, TrendingUp, ShieldAlert,
  Users, UserCog, FileCheck, FolderKanban, BarChart3, Building2, Ban,
  Car, CalendarClock, ClipboardList, Scale, Ticket, ShieldCheck,
  Percent, Wallet, Clock, Landmark, Building, Download, Activity,
  MapPin, Zap, Plane, Tag, Gift, Award, Gamepad2, Settings,
  Megaphone, FileText, Newspaper, Lock, PhoneCall, Compass, ScrollText,
  Search, Sun, Moon, ChevronDown, ChevronUp, Monitor, User as UserIcon, ArrowUpRight, LogOut
} from 'lucide-react';

// Lazy-loaded Route Components
const DriverApprovalDashboard = lazy(() => import('./components/DriverApprovalDashboard').then(m => ({ default: m.DriverApprovalDashboard })));
const ReferralConfig = lazy(() => import('./components/ReferralConfiguration').then(m => ({ default: m.ReferralConfiguration })));
const PromoConfig = lazy(() => import('./components/PromotionalConfig').then(m => ({ default: m.PromotionalConfig })));
const BadgeManagement = lazy(() => import('./components/management/BadgeManagement').then(m => ({ default: m.BadgeManagement })));
const BlogManagement = lazy(() => import('./components/management/BlogManagement').then(m => ({ default: m.BlogManagement })));
const PermissionManagement = lazy(() => import('./components/management/PermissionManagement').then(m => ({ default: m.PermissionManagement })));
const UserManagement = lazy(() => import('./components/management/UserManagement').then(m => ({ default: m.UserManagement })));
const PlatformUsers = lazy(() => import('./components/management/PlatformUsers').then(m => ({ default: m.UserManagementDashboard })));
const SimulationDashboard = lazy(() => import('./components/management/SimulationDashboard').then(m => ({ default: m.SimulationDashboard })));
const ExpiringDocumentsWidget = lazy(() => import('./components/dashboard/ExpiringDocumentsWidget').then(m => ({ default: m.ExpiringDocumentsWidget })));
const CommissionLedger = lazy(() => import('./components/management/CommissionLedger').then(m => ({ default: m.CommissionLedger })));
const ReferralDashboard = lazy(() => import('./components/management/ReferralDashboard').then(m => ({ default: m.ReferralDashboard })));
const AuditLogViewer = lazy(() => import('./components/viewers/AuditLogViewer').then(m => ({ default: m.AuditLogViewer })));
const TractionLogs = lazy(() => import('./components/management/TractionLogs').then(m => ({ default: m.TractionLogs })));
const SuspendedAccounts = lazy(() => import('./components/SuspendedAccountManagement').then(m => ({ default: m.SuspendedAccountManagement })));
const SosPenaltyConfig = lazy(() => import('./components/SosPenaltyConfig').then(m => ({ default: m.SosPenaltyConfig })));
const SupportTicketManagement = lazy(() => import('./components/support/SupportTicketManagement').then(m => ({ default: m.SupportTicketManagement })));
const ZoneManagement = lazy(() => import('./components/locations/ZoneManagement').then(m => ({ default: m.ZoneManagement })));
const VehicleCategoriesManagement = lazy(() => import('./components/settings/VehicleCategoriesManagement').then(m => ({ default: m.VehicleCategoriesManagement })));
const PromoCodeManagement = lazy(() => import('./components/marketing/PromoCodeManagement').then(m => ({ default: m.PromoCodeManagement })));
const ScheduledRideManagement = lazy(() => import('./components/operations/ScheduledRideManagement').then(m => ({ default: m.ScheduledRideManagement })));
const CMSManagement = lazy(() => import('./components/content/CMSManagement').then(m => ({ default: m.CMSManagement })));
const BulkMessaging = lazy(() => import('./components/communications/BulkMessaging').then(m => ({ default: m.BulkMessaging })));
const DriverPerformanceReport = lazy(() => import('./components/reports/DriverPerformanceReport').then(m => ({ default: m.DriverPerformanceReport })));
const CityManagementDashboard = lazy(() => import('./components/city/CityManagementDashboard').then(m => ({ default: m.CityManagementDashboard })));
const HeatMapAnalytics = lazy(() => import('./components/analytics/HeatMapAnalytics').then(m => ({ default: m.HeatMapAnalytics })));
const DriverUnionManagement = lazy(() => import('./components/drivers/DriverUnionManagement').then(m => ({ default: m.DriverUnionManagement })));
const LiveMap = lazy(() => import('./components/locations/LiveMap').then(m => ({ default: m.LiveMap })));
const BIDashboard = lazy(() => import('./components/dashboard/BIDashboard').then(m => ({ default: m.BIDashboard })));
const FraudDetectionDashboard = lazy(() => import('./components/dashboard/FraudDetectionDashboard').then(m => ({ default: m.FraudDetectionDashboard })));
const DashboardAnalytics = lazy(() => import('./components/dashboard/DashboardAnalytics').then(m => ({ default: m.DashboardAnalytics })));
const GamificationManagement = lazy(() => import('./components/settings/GamificationManagement').then(m => ({ default: m.GamificationManagement })));
const AppSettingsManagement = lazy(() => import('./components/settings/AppSettingsManagement').then(m => ({ default: m.AppSettingsManagement })));
const JobActivitiesDashboard = lazy(() => import('./components/operations/JobActivitiesDashboard').then(m => ({ default: m.JobActivitiesDashboard })));
const WelfareSchemeManagement = lazy(() => import('./components/settings/WelfareSchemeManagement').then(m => ({ default: m.WelfareSchemeManagement })));
const LegacyPrograms = lazy(() => import('./pages/LegacyPrograms').then(m => ({ default: m.LegacyPrograms })));
const SaccoIntegrationHub = lazy(() => import('./pages/sacco/SaccoIntegrationHub'));
const RolesList = lazy(() => import('./pages/Roles/RolesList'));
const RoleEditor = lazy(() => import('./pages/Roles/RoleEditor'));
const DriverGroupsPage = lazy(() => import('./pages/DriverGroupsPage').then(m => ({ default: m.DriverGroupsPage })));
const SosIncidentDashboard = lazy(() => import('./pages/SosIncidentDashboard').then(m => ({ default: m.SosIncidentDashboard })));
const OccurrenceList = lazy(() => import('./pages/OccurrenceList').then(m => ({ default: m.OccurrenceList })));
const OrganizationsList = lazy(() => import('./pages/organizations/OrganizationsList'));
const OrganizationDetails = lazy(() => import('./pages/organizations/OrganizationDetails'));
const VehicleBenefitsPage = lazy(() => import('./pages/VehicleBenefitsPage').then(m => ({ default: m.VehicleBenefitsPage })));
const VehicleQualificationsPage = lazy(() => import('./pages/VehicleQualificationsPage').then(m => ({ default: m.VehicleQualificationsPage })));
const BenefitClaimsPage = lazy(() => import('./pages/BenefitClaimsPage').then(m => ({ default: m.BenefitClaimsPage })));
const DisputeAdjudicationDashboard = lazy(() => import('./components/dispute/DisputeAdjudicationDashboard').then(m => ({ default: m.DisputeAdjudicationDashboard })));
const CorporateBillingConsole = lazy(() => import('./components/corporate/CorporateBillingConsole').then(m => ({ default: m.CorporateBillingConsole })));

// Widgets
const RevenueWidget = lazy(() => import('./components/widgets/RevenueWidget').then(m => ({ default: m.RevenueWidget })));
const RideStatusWidget = lazy(() => import('./components/widgets/RideStatusWidget').then(m => ({ default: m.RideStatusWidget })));
const NetworkGrowthWidget = lazy(() => import('./components/widgets/NetworkGrowthWidget').then(m => ({ default: m.NetworkGrowthWidget })));
const AcquisitionChannelWidget = lazy(() => import('./components/widgets/AcquisitionChannelWidget').then(m => ({ default: m.AcquisitionChannelWidget })));

// Enhanced Finance & Reporting Components
const PayoutProcessing = lazy(() => import('./components/PayoutProcessing').then(m => ({ default: m.PayoutProcessing })));
const PayoutScheduler = lazy(() => import('./components/PayoutScheduler').then(m => ({ default: m.PayoutScheduler })));
const ExportableReports = lazy(() => import('./components/ExportableReports').then(m => ({ default: m.ExportableReports })));

const RouteFallback = () => (
  <div className="flex items-center justify-center py-20 text-sm text-gray-400">
    Loading module...
  </div>
);

type View = 'dashboard' | 'applications' | 'job-activities' | 'referral-dashboard' | 'referral-config' | 'promo-config' | 'badge-management' | 'blog-management' | 'permissions' | 'roles' | 'users' | 'platform-users' | 'commission-ledger' | 'audit-log' | 'sos-config' | 'suspended-accounts' | 'organization-management' | 'simulation-dashboard' | 'support-tickets' | 'surge-zones' | 'airport-zones' | 'vehicle-categories' | 'promo-codes' | 'scheduled-rides' | 'cms' | 'bulk-messaging' | 'driver-performance' | 'city-management' | 'heat-maps' | 'driver-unions' | 'live-map' | 'bi-dashboard' | 'fraud-alerts' | 'gamification' | 'traction-logs' | 'occurrences' | 'disputes' | 'corporate-billing';

interface MenuItem {
  icon: ReactNode;
  label: string;
  view?: string;
  permission?: string;
  external?: boolean;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const SIDEBAR_MENU: MenuGroup[] = [
  {
    label: 'Command Center',
    items: [
      { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', view: '/dashboard', permission: 'DISPATCH_DASHBOARD_VIEW' },
      { icon: <Radio className="w-4 h-4" />, label: 'Live Map', view: '/live-map', permission: 'DISPATCH_REAL_TIME_MAP' },
      { icon: <Flame className="w-4 h-4" />, label: 'Heat Maps', view: '/heat-maps', permission: 'DISPATCH_ANALYTICS_VIEW' },
      { icon: <TrendingUp className="w-4 h-4" />, label: 'BI Dashboard', view: '/bi-dashboard', permission: 'DISPATCH_ANALYTICS_VIEW' },
      { icon: <ShieldAlert className="w-4 h-4" />, label: 'Fraud Alerts', view: '/fraud-alerts', permission: 'AUDIT_LOGS_VIEW' },
    ]
  },
  {
    label: 'Fleet & People',
    items: [
      { icon: <Users className="w-4 h-4" />, label: 'All Users', view: '/platform-users', permission: 'PEOPLE_VIEW' },
      { icon: <UserCog className="w-4 h-4" />, label: 'Admin Users', view: '/users', permission: 'PEOPLE_VIEW' },
      { icon: <FileCheck className="w-4 h-4" />, label: 'Driver Applications', view: '/applications', permission: 'DRIVER_APPLICATIONS_VIEW' },
      { icon: <FolderKanban className="w-4 h-4" />, label: 'Driver Groups', view: '/driver-groups', permission: 'ORGANIZATION_VIEW' },
      { icon: <BarChart3 className="w-4 h-4" />, label: 'Driver Performance', view: '/driver-performance', permission: 'DISPATCH_ANALYTICS_VIEW' },
      { icon: <Building2 className="w-4 h-4" />, label: 'Organizations', view: '/organizations', permission: 'ORGANIZATION_VIEW' },
      { icon: <Ban className="w-4 h-4" />, label: 'Suspended Accounts', view: '/suspended-accounts', permission: 'DRIVER_SUSPEND' },
    ]
  },
  {
    label: 'Trips & Safety',
    items: [
      { icon: <Car className="w-4 h-4" />, label: 'Job Activities', view: '/job-activities', permission: 'DISPATCH_DASHBOARD_VIEW' },
      { icon: <CalendarClock className="w-4 h-4" />, label: 'Scheduled Rides', view: '/scheduled-rides', permission: 'DISPATCH_RIDE_MONITOR' },
      { icon: <ClipboardList className="w-4 h-4" />, label: 'Occurrences', view: '/occurrences', permission: 'OCCURRENCE_VIEW' },
      { icon: <Scale className="w-4 h-4" />, label: 'Resolution Dash', view: '/resolution-dashboard', permission: 'OCCURRENCE_RESOLVE' },
      { icon: <Ticket className="w-4 h-4" />, label: 'Support Tickets', view: '/support-tickets', permission: 'OCCURRENCE_VIEW' },
      { icon: <ShieldCheck className="w-4 h-4" />, label: 'Benefit Claims', view: '/benefit-claims', permission: 'OCCURRENCE_VIEW' },
      { icon: <Scale className="w-4 h-4" />, label: 'Disputes & Detours', view: '/disputes', permission: 'OCCURRENCE_RESOLVE' },
    ]
  },
  {
    label: 'Finance & Sacco',
    items: [
      { icon: <Percent className="w-4 h-4" />, label: 'Commissions', view: '/commission-ledger', permission: 'COMMISSION_VIEW' },
      { icon: <Wallet className="w-4 h-4" />, label: 'Payout Processing', view: '/payouts', permission: 'PAYMENTS_PROCESS' },
      { icon: <Clock className="w-4 h-4" />, label: 'Payout Scheduler', view: '/payout-scheduler', permission: 'PAYMENTS_PROCESS' },
      { icon: <Landmark className="w-4 h-4" />, label: 'Welfare Schemes', view: '/welfare-schemes', permission: 'COMMISSION_EDIT' },
      { icon: <TrendingUp className="w-4 h-4" />, label: 'Cabi Legacy', view: '/legacy-programs', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: <Building className="w-4 h-4" />, label: 'Sacco Integration', view: '/sacco-integration', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: <Download className="w-4 h-4" />, label: 'Data Exports', view: '/exports', permission: 'FINANCIAL_REPORTS_VIEW' },
      { icon: <Building2 className="w-4 h-4" />, label: 'Corporate Billing', view: '/corporate-billing', permission: 'FINANCIAL_REPORTS_VIEW' },
      { icon: <Activity className="w-4 h-4" />, label: 'Traction Logs', view: '/traction-logs', permission: 'AUDIT_LOGS_VIEW' },
    ]
  },
  {
    label: 'Growth & Platform',
    items: [
      { icon: <MapPin className="w-4 h-4" />, label: 'City Management', view: '/city-management', permission: 'LOCATIONS_EDIT' },
      { icon: <Zap className="w-4 h-4" />, label: 'Surge Zones', view: '/surge-zones', permission: 'LOCATIONS_EDIT' },
      { icon: <Plane className="w-4 h-4" />, label: 'Airport Zones', view: '/airport-zones', permission: 'LOCATIONS_EDIT' },
      { icon: <Car className="w-4 h-4" />, label: 'Services', view: '/vehicle-categories', permission: 'VEHICLES_VIEW' },
      { icon: <Tag className="w-4 h-4" />, label: 'Promo Codes', view: '/promo-codes', permission: 'MARKETING_CONTENT_EDIT' },
      { icon: <Gift className="w-4 h-4" />, label: 'Referral Config', view: '/referral-config', permission: 'REFERRAL_FORMULA_VIEW' },
      { icon: <Award className="w-4 h-4" />, label: 'Badges', view: '/badge-management', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: <Gamepad2 className="w-4 h-4" />, label: 'Gamification', view: '/gamification', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: <Gift className="w-4 h-4" />, label: 'Vehicle Benefits', view: '/vehicle-benefits', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: <Award className="w-4 h-4" />, label: 'Qualifications', view: '/vehicle-qualifications', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: <Megaphone className="w-4 h-4" />, label: 'Bulk Msg', view: '/bulk-messaging', permission: 'NOTIFICATIONS_MANAGE' },
      { icon: <FileText className="w-4 h-4" />, label: 'CMS', view: '/cms', permission: 'BLOG_POSTS_EDIT' },
      { icon: <Newspaper className="w-4 h-4" />, label: 'Blog Management', view: '/blog-management', permission: 'BLOG_POSTS_EDIT' },
      { icon: <Lock className="w-4 h-4" />, label: 'Roles & Permissions', view: '/roles', permission: 'USER_ROLES_ASSIGN' },
      { icon: <PhoneCall className="w-4 h-4" />, label: 'SOS Config', view: '/sos-config', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: <Settings className="w-4 h-4" />, label: 'App Settings', view: '/app-settings', permission: 'SYSTEM_SETTINGS_EDIT' },
      { icon: <Compass className="w-4 h-4" />, label: 'Simulation', view: '/simulation-dashboard', permission: 'DISPATCH_ANALYTICS_VIEW' },
      { icon: <ScrollText className="w-4 h-4" />, label: 'Audit Log', view: '/audit-log', permission: 'AUDIT_LOGS_VIEW' },
    ]
  }
];


function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Command Center']);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  const hasPermission = (p: string) => {
    if (!user) return false;
    const role = (user.role as string)?.toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;
    if (!user.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(p);
  };

  const commandItems = useMemo<CommandItem[]>(() => {
    return SIDEBAR_MENU.flatMap((group) =>
      group.items
        .filter((item) => !item.permission || hasPermission(item.permission))
        .map((item) => ({
          label: item.label,
          view: item.view,
          group: group.label,
          icon: item.icon,
        }))
    );
  }, [user]);

  // Detached Visualization Mode for External Screens
  if (location.pathname.startsWith('/visualize')) {
    return (
      <div className="min-h-screen w-screen bg-brand-black text-white flex flex-col antialiased">
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-surface-dark/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center font-bold text-black shadow-md shadow-brand-yellow/20">
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
                  document.documentElement.requestFullscreen?.().catch((err) => {
                    console.warn('[AdminApp] Fullscreen error:', err);
                  });
                } else {
                  document.exitFullscreen?.().catch((err) => {
                    console.warn('[AdminApp] Exit fullscreen error:', err);
                  });
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-brand-yellow hover:bg-brand-yellowHover rounded-lg transition-all shadow-md shadow-brand-yellow/20 cursor-pointer"
              title="Close window and return to main panel"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
              Dock to Main Display
            </button>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-7xl">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/visualize/revenue" element={<RevenueWidget />} />
                <Route path="/visualize/ride-status" element={<RideStatusWidget />} />
                <Route path="/visualize/growth" element={<NetworkGrowthWidget />} />
                <Route path="/visualize/acquisition" element={<AcquisitionChannelWidget />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.identityVerified !== true) return <LoginPage />;

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  // Helper to determine active state
  const isActive = (path?: string) => path && location.pathname.startsWith(path);

  return (
    <div className={`flex h-screen transition-colors duration-200 ${darkMode ? 'dark bg-brand-black text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <CommandPalette items={commandItems} isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <aside className="sidebar w-64 flex-shrink-0 flex flex-col bg-surface-dark border-r border-white/10 shadow-2xl transition-colors duration-200">
        <div className="p-8 border-b border-white/5 flex flex-col items-center text-center">
          <img src={cabiLogo} alt="Cabi Africa" className="h-10 w-auto object-contain mb-3" />
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
              className="p-2 text-xs font-medium bg-card-dark hover:bg-white/10 border border-white/10 rounded-full transition-all duration-200 text-gray-400 hover:text-brand-yellow"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-card-dark hover:bg-brand-yellow hover:text-black border border-white/10 rounded-full transition-all duration-300 group text-gray-400"
            >
              <span>Log Out</span>
              <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <button
            onClick={() => setIsCommandOpen(true)}
            className="mt-4 w-full flex items-center justify-between px-3 py-2 text-xs text-gray-400 bg-brand-black/60 hover:bg-brand-black border border-white/10 hover:border-brand-yellow/40 rounded-xl transition-all"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Quick Jump...</span>
            </span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500">⌘K</kbd>
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
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:bg-white/5 transition-colors"
                >
                  <span>{group.label}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isExpanded ? 'max-h-[900px]' : 'max-h-0'}`}>
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
                      className={`w-full text-left px-5 py-2.5 hover:bg-white/5 flex items-center gap-3 transition-colors border-l-2 ${isActive(item.view) ? 'bg-brand-yellow/10 border-brand-yellow text-brand-yellow font-semibold' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-sm truncate">{item.label}</span>
                      {item.external && <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Global Access Buttons - Persistent Footer */}
        {((user?.role as string)?.toUpperCase() === 'SUPER_ADMIN' || (user?.role as string)?.toUpperCase() === 'ADMIN' || hasPermission('DISPATCH_DASHBOARD_VIEW') || hasPermission('USER_PORTAL_DASHBOARD_VIEW')) && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2 bg-slate-50/50 dark:bg-card-dark/20">
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
                <Monitor className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Dispatch Panel</span>
                <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5">LAUNCH <ArrowUpRight className="w-3 h-3" /></span>
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
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:bg-brand-yellow hover:text-black rounded-lg transition-all duration-300 group border border-white/5"
                title="View User Portal Dashboard"
              >
                <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>User Portal</span>
                <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5">VIEW <ArrowUpRight className="w-3 h-3" /></span>
              </button>
            )}
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Using light bg for content area, can revert to dark if requested */}
        <Header currentView={location.pathname.replace('/', '') as View} />

        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Suspense fallback={<RouteFallback />}>
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
              <Route path="/legacy-programs" element={<LegacyPrograms />} />
              <Route path="/wealth-programs" element={<LegacyPrograms />} />
              <Route path="/vehicle-benefits" element={<VehicleBenefitsPage />} />
              <Route path="/vehicle-qualifications" element={<VehicleQualificationsPage />} />
              <Route path="/benefit-claims" element={<BenefitClaimsPage />} />
              <Route path="/disputes" element={<ProtectedRoute permission="OCCURRENCE_RESOLVE"><DisputeAdjudicationDashboard /></ProtectedRoute>} />
              <Route path="/corporate-billing" element={<ProtectedRoute permission="FINANCIAL_REPORTS_VIEW"><CorporateBillingConsole /></ProtectedRoute>} />
              <Route path="/sacco-integration" element={<ProtectedRoute permission="SYSTEM_SETTINGS_EDIT"><SaccoIntegrationHub /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
