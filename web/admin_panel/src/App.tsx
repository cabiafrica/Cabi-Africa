import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
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
import { SosManager } from './components/sos/SosManager';
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

type View = 'applications' | 'mlm-dashboard' | 'mlm-config' | 'promo-config' | 'badge-management' | 'blog-management' | 'permissions' | 'roles' | 'users' | 'platform-users' | 'commission-ledger' | 'audit-log' | 'sos-config' | 'suspended-accounts' | 'organization-management' | 'simulation-dashboard' | 'support-tickets' | 'surge-zones' | 'airport-zones' | 'vehicle-categories' | 'promo-codes' | 'scheduled-rides' | 'cms' | 'bulk-messaging' | 'driver-performance' | 'city-management' | 'heat-maps' | 'driver-unions' | 'live-map' | 'bi-dashboard' | 'fraud-alerts';

function App() {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<View>('applications');

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">Please Log In</div>;
  }

  const hasPermission = (p: string) => {
    if (!user?.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(p);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="sidebar">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider">CABI ADMIN</h1>
          <div className="mt-2 text-xs text-slate-400">Control Center</div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Operations
          </div>
          {hasPermission('view_dashboard') && <button onClick={() => setCurrentView('dashboard')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'dashboard' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>🏠</span> Dashboard</button>}
          {hasPermission('manage_applications') && <button onClick={() => setCurrentView('applications')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'applications' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>📄</span> Driver Applications</button>}
          {hasPermission('manage_organizations') && <button onClick={() => setCurrentView('organization-management')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'organization-management' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>🏢</span> Organizations</button>}
          {hasPermission('view_scheduled_rides') && <button onClick={() => setCurrentView('scheduled-rides')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'scheduled-rides' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>📅</span> Scheduled Rides</button>}
          {hasPermission('manage_support') && <button onClick={() => setCurrentView('support-tickets')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'support-tickets' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>🎫</span> Support Tickets</button>}
          {hasPermission('manage_unions') && <button onClick={() => setCurrentView('driver-unions')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'driver-unions' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>🤝</span> Driver Unions</button>}
          {hasPermission('view_performance') && <button onClick={() => setCurrentView('driver-performance')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'driver-performance' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>📊</span> Driver Performance</button>}

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Analytics & Map
          </div>
          {hasPermission('view_live_map') && <button onClick={() => setCurrentView('live-map')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'live-map' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>📡</span> Live Map</button>}
          {hasPermission('view_heat_maps') && <button onClick={() => setCurrentView('heat-maps')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'heat-maps' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>🔥</span> Heat Maps</button>}
          {hasPermission('view_bi_dashboard') && <button onClick={() => setCurrentView('bi-dashboard')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'bi-dashboard' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>📈</span> BI Dashboard</button>}
          {hasPermission('manage_cities') && <button onClick={() => setCurrentView('city-management')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'city-management' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>🏙️</span> City Management</button>}
          {hasPermission('view_fraud_alerts') && <button onClick={() => setCurrentView('fraud-alerts')} className={`w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3 ${currentView === 'fraud-alerts' ? 'bg-slate-800 border-l-4 border-blue-500' : ''}`}><span>🚨</span> Fraud Alerts</button>}


          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            User Management
          </div>
          {hasPermission('manage_users') && <button onClick={() => setCurrentView('platform-users')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>🌍</span> All Users</button>}
          {hasPermission('manage_admins') && <button onClick={() => setCurrentView('users')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>👥</span> Admin Users</button>}
          {hasPermission('manage_suspended') && <button onClick={() => setCurrentView('suspended-accounts')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>🚫</span> Suspended</button>}

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Configuration
          </div>
          {hasPermission('configure_mlm') && <button onClick={() => setCurrentView('mlm-config')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>💰</span> MLM Config</button>}
          {hasPermission('view_simulation') && <button onClick={() => setCurrentView('simulation-dashboard')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>🔮</span> Simulation</button>}
          {hasPermission('manage_zones') && <button onClick={() => setCurrentView('surge-zones')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>🗺️</span> Surge Zones</button>}
          {hasPermission('manage_zones') && <button onClick={() => setCurrentView('airport-zones')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>✈️</span> Airport Zones</button>}
          {hasPermission('manage_vehicles') && <button onClick={() => setCurrentView('vehicle-categories')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>🚗</span> Vehicle Cats</button>}

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Marketing & Content
          </div>
          {hasPermission('manage_promotions') && <button onClick={() => setCurrentView('promo-codes')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>🏷️</span> Promo Codes</button>}
          {hasPermission('send_bulk_messages') && <button onClick={() => setCurrentView('bulk-messaging')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>📢</span> Bulk Msg</button>}
          {hasPermission('manage_content') && <button onClick={() => setCurrentView('cms')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>📝</span> CMS</button>}

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Finance & System
          </div>
          {hasPermission('view_commissions') && <button onClick={() => setCurrentView('commission-ledger')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>💹</span> Commissions</button>}
          {hasPermission('view_audit_log') && <button onClick={() => setCurrentView('audit-log')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>📜</span> Audit Log</button>}
          {hasPermission('manage_permissions') && <button onClick={() => setCurrentView('permissions')} className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center gap-3"><span>🔒</span> Permissions</button>}

        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Header currentView={currentView} />

        <div className="p-6 card">
          <div className="max-w-7xl mx-auto space-y-6">

            {currentView === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ExpiringDocumentsWidget />
                  <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold mb-2">Active Drivers</h3>
                    <p className="text-3xl font-mono text-green-600">1,245</p>
                  </div>
                  <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold mb-2">Today's Rides</h3>
                    <p className="text-3xl font-mono text-blue-600">3,890</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="font-bold mb-4">Live Activity</h3>
                  <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                    [Map Placeholder]
                  </div>
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;