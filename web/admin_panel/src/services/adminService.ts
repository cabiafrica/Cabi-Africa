import {
  DriverService,
  ReferralService,
  SafetyService,
  UserService,
  OrgService,
  AnalyticsService,
  SystemService
} from './admin';

export * from './admin/types';

class AdminService {
  private driverService = new DriverService();
  private referralService = new ReferralService();
  private safetyService = new SafetyService();
  private userService = new UserService();
  private orgService = new OrgService();
  private analyticsService = new AnalyticsService();
  private systemService = new SystemService();

  // --- Driver Service Delegation ---
  getPendingApplications = this.driverService.getPendingApplications.bind(this.driverService);
  getApplicationDetails = this.driverService.getApplicationDetails.bind(this.driverService);
  approveApplication = this.driverService.approveApplication.bind(this.driverService);
  requestCorrection = this.driverService.requestCorrection.bind(this.driverService);
  getBadges = this.driverService.getBadges.bind(this.driverService);
  createBadge = this.driverService.createBadge.bind(this.driverService);
  updateBadge = this.driverService.updateBadge.bind(this.driverService);
  deleteBadge = this.driverService.deleteBadge.bind(this.driverService);
  bulkRejectDrivers = this.driverService.bulkRejectDrivers.bind(this.driverService);
  getDriverApplicationsPaginated = this.driverService.getDriverApplicationsPaginated.bind(this.driverService);
  simulateDriverRegistrations = this.driverService.simulateDriverRegistrations.bind(this.driverService);
  updateDriverProfile = this.driverService.updateDriverProfile.bind(this.driverService);
  bulkApproveDocuments = this.driverService.bulkApproveDocuments.bind(this.driverService);
  bulkRejectDocuments = this.driverService.bulkRejectDocuments.bind(this.driverService);
  getDriverPerformanceReport = this.driverService.getDriverPerformanceReport.bind(this.driverService);
  getExpiringDocuments = this.driverService.getExpiringDocuments.bind(this.driverService);

  // --- Referral Service Delegation ---
  getReferralConfig = this.referralService.getReferralConfig.bind(this.referralService);
  updateReferralConfig = this.referralService.updateReferralConfig.bind(this.referralService);
  getPromoConfig = this.referralService.getPromoConfig.bind(this.referralService);
  updatePromoConfig = this.referralService.updatePromoConfig.bind(this.referralService);
  adjustDriverLedger = this.referralService.adjustDriverLedger.bind(this.referralService);
  getCommissionLedger = this.referralService.getCommissionLedger.bind(this.referralService);
  getReferralDashboardStats = this.referralService.getReferralDashboardStats.bind(this.referralService);
  getDriverDownline = this.referralService.getDriverDownline.bind(this.referralService);
  getReferralRules = this.referralService.getReferralRules.bind(this.referralService);
  updateReferralRules = this.referralService.updateReferralRules.bind(this.referralService);

  // --- Safety Service Delegation ---
  getSosIncidentDetails = this.safetyService.getSosIncidentDetails.bind(this.safetyService);
  logSosIncidentAction = this.safetyService.logSosIncidentAction.bind(this.safetyService);
  resolveSosIncident = this.safetyService.resolveSosIncident.bind(this.safetyService);
  resolveSos = this.safetyService.resolveSos.bind(this.safetyService);
  getSosPenaltyConfig = this.safetyService.getSosPenaltyConfig.bind(this.safetyService);
  updateSosPenaltyConfig = this.safetyService.updateSosPenaltyConfig.bind(this.safetyService);

  // --- User Service Delegation ---
  getAdminUsers = this.userService.getAdminUsers.bind(this.userService);
  createAdminUser = this.userService.createAdminUser.bind(this.userService);
  updateUserRoles = this.userService.updateUserRoles.bind(this.userService);
  updateUserDirectPermissions = this.userService.updateUserDirectPermissions.bind(this.userService);
  getAuditLogs = this.userService.getAuditLogs.bind(this.userService);
  getSuspendedAdmins = this.userService.getSuspendedAdmins.bind(this.userService);
  reactivateAdmin = this.userService.reactivateAdmin.bind(this.userService);
  getPlatformUsers = this.userService.getPlatformUsers.bind(this.userService);
  getUserPaymentHistory = this.userService.getUserPaymentHistory.bind(this.userService);
  getUserDetails = this.userService.getUserDetails.bind(this.userService);
  impersonateUser = this.userService.impersonateUser.bind(this.userService);
  getUserDocuments = this.userService.getUserDocuments.bind(this.userService);
  getUserAuditLog = this.userService.getUserAuditLog.bind(this.userService);
  getUserRideHistory = this.userService.getUserRideHistory.bind(this.userService);
  suspendUser = this.userService.suspendUser.bind(this.userService);
  reactivateUser = this.userService.reactivateUser.bind(this.userService);
  getSuspendedUsers = this.userService.getSuspendedUsers.bind(this.userService);
  getDocumentHistory = this.userService.getDocumentHistory.bind(this.userService);

  // --- Org Service Delegation ---
  getOrganizations = this.orgService.getOrganizations.bind(this.orgService);
  updateOrganizationStatus = this.orgService.updateOrganizationStatus.bind(this.orgService);
  getSubgroupDetails = this.orgService.getSubgroupDetails.bind(this.orgService);
  getSubgroups = this.orgService.getSubgroups.bind(this.orgService);
  createSubgroup = this.orgService.createSubgroup.bind(this.orgService);
  updateSubgroup = this.orgService.updateSubgroup.bind(this.orgService);
  deleteSubgroup = this.orgService.deleteSubgroup.bind(this.orgService);
  getSubgroupMembers = this.orgService.getSubgroupMembers.bind(this.orgService);
  addMemberToSubgroup = this.orgService.addMemberToSubgroup.bind(this.orgService);
  removeMemberFromSubgroup = this.orgService.removeMemberFromSubgroup.bind(this.orgService);
  getOrganizationAuditLog = this.orgService.getOrganizationAuditLog.bind(this.orgService);

  // --- Analytics Service Delegation ---
  getBIStats = this.analyticsService.getBIStats.bind(this.analyticsService);
  getHeatMapData = this.analyticsService.getHeatMapData.bind(this.analyticsService);
  getLiveDrivers = this.analyticsService.getLiveDrivers.bind(this.analyticsService);
  getFraudAlerts = this.analyticsService.getFraudAlerts.bind(this.analyticsService);
  getCityKPIs = this.analyticsService.getCityKPIs.bind(this.analyticsService);
  runSimulation = this.analyticsService.runSimulation.bind(this.analyticsService);

  // --- System Service Delegation ---
  getPermissions = this.systemService.getPermissions.bind(this.systemService);
  createPermission = this.systemService.createPermission.bind(this.systemService);
  updatePermission = this.systemService.updatePermission.bind(this.systemService);
  deletePermission = this.systemService.deletePermission.bind(this.systemService);
  getRoles = this.systemService.getRoles.bind(this.systemService);
  createRole = this.systemService.createRole.bind(this.systemService);
  updateRole = this.systemService.updateRole.bind(this.systemService);
  deleteRole = this.systemService.deleteRole.bind(this.systemService);
  globalSearch = this.systemService.globalSearch.bind(this.systemService);
  getServices = this.systemService.getServices.bind(this.systemService);
  createService = this.systemService.createService.bind(this.systemService);
  getSupportTickets = this.systemService.getSupportTickets.bind(this.systemService);
  getZones = this.systemService.getZones.bind(this.systemService);
  getVehicleCategories = this.systemService.getVehicleCategories.bind(this.systemService);
  getPromoCodes = this.systemService.getPromoCodes.bind(this.systemService);
  getScheduledRides = this.systemService.getScheduledRides.bind(this.systemService);
  sendBulkMessage = this.systemService.sendBulkMessage.bind(this.systemService);
  getAdminPosts = this.systemService.getAdminPosts.bind(this.systemService);
  createPost = this.systemService.createPost.bind(this.systemService);
  updatePost = this.systemService.updatePost.bind(this.systemService);
  deletePost = this.systemService.deletePost.bind(this.systemService);
  getCMSContent = this.systemService.getCMSContent.bind(this.systemService);
}

export const adminService = new AdminService();