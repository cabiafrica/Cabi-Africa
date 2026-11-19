import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideService } from '../ride/ride.service';
import { SafetySmsService } from '../safety/safety-sms.service';
import {
  CorporateAccount,
  CostCenter,
  CorporateEmployee,
  CorporateTripAuthorization,
  CorporateInvoice,
  PolicyEvaluationResult,
  ApprovalStatus,
  InvoiceStatus,
} from './corporate.types';

@Injectable()
export class CorporateService {
  private readonly logger = new Logger(CorporateService.name);

  // In-memory registries (pre-populated with high-fidelity corporate accounts)
  private corporateAccounts = new Map<string, CorporateAccount>();
  private costCenters = new Map<string, CostCenter>();
  private corporateEmployees = new Map<string, CorporateEmployee>();
  private authorizations = new Map<string, CorporateTripAuthorization>();
  private invoices = new Map<string, CorporateInvoice>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly rideService: RideService,
    private readonly safetySmsService: SafetySmsService,
  ) {
    this.seedDefaultCorporateData();
  }

  private seedDefaultCorporateData() {
    // 1. Safaricom PLC
    const safaricomId = 'corp_safaricom_01';
    this.corporateAccounts.set(safaricomId, {
      id: safaricomId,
      companyName: 'Safaricom PLC',
      registrationNumber: 'CPR/2012/76291',
      kraPin: 'P051123456Z',
      billingContactEmail: 'corporate.billing@safaricom.co.ke',
      billingContactPhone: '+254722000000',
      creditLimit: 2500000, // KES 2.5M
      creditUsed: 420000,
      graceBufferPercent: 10, // 10% emergency buffer
      paymentTerms: 'NET_30',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Safaricom Cost Centers
    const safCcFinance = 'cc_saf_fin_01';
    this.costCenters.set(safCcFinance, {
      id: safCcFinance,
      corporateAccountId: safaricomId,
      code: 'CC-FIN-01',
      name: 'Finance & Treasury',
      allocatedBudget: 600000,
      currentSpend: 145000,
      managerUserId: 'mgr_saf_01',
      managerName: 'Grace Muthoni (Head of Treasury)',
      managerEmail: 'gmuthoni@safaricom.co.ke',
      managerPhone: '+254722112233',
      createdAt: new Date(),
    });

    const safCcEng = 'cc_saf_eng_02';
    this.costCenters.set(safCcEng, {
      id: safCcEng,
      corporateAccountId: safaricomId,
      code: 'CC-ENG-02',
      name: 'Network Infrastructure Engineering',
      allocatedBudget: 1200000,
      currentSpend: 275000,
      managerUserId: 'mgr_saf_02',
      managerName: 'Kevin Otieno (Infrastructure Lead)',
      managerEmail: 'kotieno@safaricom.co.ke',
      managerPhone: '+254722445566',
      createdAt: new Date(),
    });

    // Sample Corporate Employees
    this.corporateEmployees.set('emp_saf_01', {
      id: 'emp_saf_01',
      corporateAccountId: safaricomId,
      costCenterId: safCcFinance,
      userId: 'user_sarah_01',
      employeeId: 'SAF-9021',
      fullName: 'Sarah Jenkins',
      email: 'sjenkins@safaricom.co.ke',
      phone: '+254722778899',
      monthlyAllowance: 35000,
      currentMonthSpent: 8500,
      requiresApprovalAbove: 1500,
      allowAfterHours: false, // Requires manager approval after 20:00
      status: 'ACTIVE',
      createdAt: new Date(),
    });
  }

  // --- Account Management ---

  createAccount(payload: Partial<CorporateAccount>): CorporateAccount {
    const id = `corp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const account: CorporateAccount = {
      id,
      companyName: payload.companyName || 'Corporate Client',
      registrationNumber: payload.registrationNumber || 'CPR/REG/000',
      kraPin: (payload.kraPin || 'P000000000Z').toUpperCase(),
      billingContactEmail: payload.billingContactEmail || 'billing@corp.com',
      billingContactPhone: payload.billingContactPhone || '+254700000000',
      creditLimit: Number(payload.creditLimit || 500000),
      creditUsed: 0,
      graceBufferPercent: Number(payload.graceBufferPercent || 10),
      paymentTerms: payload.paymentTerms || 'NET_30',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.corporateAccounts.set(id, account);
    return account;
  }

  getAccount(id: string): CorporateAccount {
    const acc = this.corporateAccounts.get(id);
    if (!acc) throw new NotFoundException(`Corporate account ${id} not found`);
    return acc;
  }

  listAccounts(): CorporateAccount[] {
    return Array.from(this.corporateAccounts.values());
  }

  // --- Cost Centers ---

  createCostCenter(payload: Partial<CostCenter>): CostCenter {
    if (!payload.corporateAccountId || !this.corporateAccounts.has(payload.corporateAccountId)) {
      throw new BadRequestException('Valid corporateAccountId required');
    }
    const id = `cc_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const costCenter: CostCenter = {
      id,
      corporateAccountId: payload.corporateAccountId,
      code: (payload.code || 'CC-GEN-01').toUpperCase(),
      name: payload.name || 'General Operations',
      allocatedBudget: Number(payload.allocatedBudget || 100000),
      currentSpend: 0,
      managerUserId: payload.managerUserId || 'mgr_default',
      managerName: payload.managerName || 'Department Manager',
      managerEmail: payload.managerEmail || 'manager@corp.com',
      managerPhone: payload.managerPhone || '+254700000000',
      createdAt: new Date(),
    };
    this.costCenters.set(id, costCenter);
    return costCenter;
  }

  listCostCenters(corporateAccountId: string): CostCenter[] {
    return Array.from(this.costCenters.values()).filter(
      (c) => c.corporateAccountId === corporateAccountId,
    );
  }

  // --- Employee Enrolment ---

  enrolEmployee(payload: Partial<CorporateEmployee>): CorporateEmployee {
    if (!payload.corporateAccountId || !payload.costCenterId) {
      throw new BadRequestException('corporateAccountId and costCenterId are required');
    }
    const id = `emp_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const employee: CorporateEmployee = {
      id,
      corporateAccountId: payload.corporateAccountId,
      costCenterId: payload.costCenterId,
      userId: payload.userId || `user_${Date.now()}`,
      employeeId: (payload.employeeId || 'EMP-001').toUpperCase(),
      fullName: payload.fullName || 'Corporate Employee',
      email: payload.email || 'employee@corp.com',
      phone: payload.phone || '+254700000000',
      monthlyAllowance: Number(payload.monthlyAllowance || 25000),
      currentMonthSpent: 0,
      requiresApprovalAbove: Number(payload.requiresApprovalAbove || 1500),
      allowAfterHours: !!payload.allowAfterHours,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    this.corporateEmployees.set(employee.id, employee);
    return employee;
  }

  getEmployeeByUserId(userId: string): CorporateEmployee | undefined {
    return Array.from(this.corporateEmployees.values()).find(
      (e) => e.userId === userId && e.status === 'ACTIVE',
    );
  }

  // --- Travel Policy Engine ---

  evaluateTripPolicy(
    employee: CorporateEmployee,
    estimatedFare: number,
    requestTime = new Date(),
  ): PolicyEvaluationResult {
    const account = this.getAccount(employee.corporateAccountId);
    const costCenter = this.costCenters.get(employee.costCenterId);

    if (account.status !== 'ACTIVE') {
      throw new ForbiddenException(
        `Corporate account is currently ${account.status}. Corporate travel suspended.`,
      );
    }

    const breaches: string[] = [];

    // Check 1: Corporate Account Credit Limit with 10% emergency buffer
    const maxCredit = account.creditLimit * (1 + account.graceBufferPercent / 100);
    if (account.creditUsed + estimatedFare > maxCredit) {
      return {
        canProceedAutomatically: false,
        status: 'REJECTED_CREDIT_LIMIT',
        policyBreaches: [
          `Corporate monthly credit limit (KES ${account.creditLimit.toLocaleString()}) exceeded including 10% emergency buffer.`,
        ],
        estimatedFare,
        employeeRemainingAllowance: Math.max(0, employee.monthlyAllowance - employee.currentMonthSpent),
        costCenterAvailableBudget: costCenter ? costCenter.allocatedBudget - costCenter.currentSpend : 0,
        graceBufferApplied: false,
      };
    }

    const graceBufferApplied = account.creditUsed + estimatedFare > account.creditLimit;

    // Check 2: Cost-Center Budget
    if (costCenter && costCenter.currentSpend + estimatedFare > costCenter.allocatedBudget) {
      breaches.push(
        `Cost-center ${costCenter.code} has exhausted its monthly budget of KES ${costCenter.allocatedBudget.toLocaleString()}.`,
      );
    }

    // Check 3: Employee Monthly Allowance
    if (employee.currentMonthSpent + estimatedFare > employee.monthlyAllowance) {
      breaches.push(
        `Trip fare exceeds your remaining monthly allowance of KES ${(employee.monthlyAllowance - employee.currentMonthSpent).toLocaleString()}.`,
      );
    }

    // Check 4: Single-trip auto-approval ceiling
    if (estimatedFare > employee.requiresApprovalAbove) {
      breaches.push(
        `Trip fare (KES ${estimatedFare.toLocaleString()}) exceeds your auto-approval ceiling of KES ${employee.requiresApprovalAbove.toLocaleString()}.`,
      );
    }

    // Check 5: Time of Day (After-Hours: 20:00 - 06:00)
    const hour = requestTime.getHours();
    const isAfterHours = hour >= 20 || hour < 6;
    if (isAfterHours && !employee.allowAfterHours) {
      breaches.push('After-hours corporate travel (20:00 - 06:00) requires manager pre-trip sign-off.');
    }

    const canProceedAutomatically = breaches.length === 0;

    return {
      canProceedAutomatically,
      status: canProceedAutomatically ? 'AUTO_APPROVED' : 'REQUIRES_APPROVAL',
      policyBreaches: breaches,
      estimatedFare,
      employeeRemainingAllowance: Math.max(0, employee.monthlyAllowance - employee.currentMonthSpent),
      costCenterAvailableBudget: costCenter ? costCenter.allocatedBudget - costCenter.currentSpend : 0,
      graceBufferApplied,
    };
  }

  // --- Pre-Trip Authorization Flow ---

  async requestTripAuthorization(payload: {
    userId: string;
    pickup: { address: string; latitude: number; longitude: number };
    dropoff: { address: string; latitude: number; longitude: number };
    estimatedFare: number;
    vehicleType?: string;
    purpose?: string;
  }): Promise<{
    authorization: CorporateTripAuthorization;
    autoApproved: boolean;
    ride?: any;
    message: string;
  }> {
    let employee = this.getEmployeeByUserId(payload.userId);

    // Fallback: If caller not explicitly enrolled, bind to default demo account
    if (!employee) {
      employee = Array.from(this.corporateEmployees.values())[0];
    }

    const evaluation = this.evaluateTripPolicy(employee, payload.estimatedFare);

    if (evaluation.status === 'REJECTED_CREDIT_LIMIT') {
      throw new ForbiddenException(evaluation.policyBreaches.join('; '));
    }

    const now = new Date();
    const timeoutAt = new Date(now.getTime() + 15 * 60 * 1000); // 15-minute manager SLA
    const authId = `auth_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const authorization: CorporateTripAuthorization = {
      id: authId,
      corporateAccountId: employee.corporateAccountId,
      costCenterId: employee.costCenterId,
      employeeId: employee.employeeId,
      employeeUserId: payload.userId,
      employeeName: employee.fullName,
      employeePhone: employee.phone,
      pickup: payload.pickup,
      dropoff: payload.dropoff,
      estimatedFare: payload.estimatedFare,
      vehicleType: payload.vehicleType || 'STANDARD',
      purpose: payload.purpose || 'Official Business Travel',
      status: evaluation.canProceedAutomatically ? 'AUTO_APPROVED' : 'PENDING_APPROVAL',
      policyBreachReasons: evaluation.policyBreaches,
      timeoutAt,
      createdAt: now,
    };

    if (evaluation.canProceedAutomatically) {
      // 1. Dispatch ride directly
      const ride = await this.rideService.createRide(
        payload.userId,
        payload.pickup,
        payload.dropoff,
        payload.estimatedFare,
        payload.vehicleType || 'STANDARD',
        true,
        'CORPORATE_POLICY_AUTO_APPROVED',
      );

      authorization.rideId = ride.id;
      this.authorizations.set(authId, authorization);

      // 2. Debit corporate credit and employee allowance
      this.recordCorporateSpend(
        employee.corporateAccountId,
        employee.costCenterId,
        employee.id,
        payload.estimatedFare,
      );

      return {
        authorization,
        autoApproved: true,
        ride,
        message: 'Trip auto-approved within corporate travel policy and dispatched to matching.',
      };
    }

    // Requires manager approval -> Hold dispatch
    this.authorizations.set(authId, authorization);

    // Notify manager via SMS
    const costCenter = this.costCenters.get(employee.costCenterId);
    if (costCenter?.managerPhone) {
      const sms =
        `Cabi Africa Corporate Alert: Trip approval required for ${employee.fullName} (${employee.employeeId}).\n` +
        `Fare: KES ${payload.estimatedFare}. Route: ${payload.pickup.address} to ${payload.dropoff.address}.\n` +
        `Reason: ${evaluation.policyBreaches[0] || 'Above policy limit'}.\n` +
        `SLA: 15 mins. Approve at https://admin.cabi.africa/corporate/approvals/${authId}`;
      this.safetySmsService.sendSms(costCenter.managerPhone, sms).catch(() => {});
    }

    return {
      authorization,
      autoApproved: false,
      message:
        'Trip requires manager pre-authorization. Request dispatched to your department head (15-min SLA).',
    };
  }

  // --- Manager Sign-off & Timeout Actions ---

  async approveTrip(
    authId: string,
    managerUserId: string,
  ): Promise<{ authorization: CorporateTripAuthorization; ride: any }> {
    const auth = this.authorizations.get(authId);
    if (!auth) throw new NotFoundException(`Authorization ${authId} not found`);

    if (auth.status !== 'PENDING_APPROVAL' && auth.status !== 'TIMEOUT_ESCALATED') {
      throw new BadRequestException(`Cannot approve authorization with status: ${auth.status}`);
    }

    // Dispatch ride
    const ride = await this.rideService.createRide(
      auth.employeeUserId,
      auth.pickup,
      auth.dropoff,
      auth.estimatedFare,
      auth.vehicleType,
      true,
      'CORPORATE_MANAGER_APPROVED',
    );

    auth.status = 'APPROVED';
    auth.approvedByUserId = managerUserId;
    auth.approvedByName = 'Department Manager';
    auth.approvedAt = new Date();
    auth.rideId = ride.id;
    this.authorizations.set(authId, auth);

    this.recordCorporateSpend(
      auth.corporateAccountId,
      auth.costCenterId,
      auth.employeeId,
      auth.estimatedFare,
    );

    // Notify employee via SMS
    this.safetySmsService
      .sendSms(
        auth.employeePhone,
        `Cabi Africa: Your corporate ride to ${auth.dropoff.address} has been APPROVED by your manager. Trip Code: ${ride.tripCode}. Matching Captain...`,
      )
      .catch(() => {});

    return { authorization: auth, ride };
  }

  rejectTrip(
    authId: string,
    managerUserId: string,
    reason: string,
  ): CorporateTripAuthorization {
    const auth = this.authorizations.get(authId);
    if (!auth) throw new NotFoundException(`Authorization ${authId} not found`);

    auth.status = 'REJECTED';
    auth.approvedByUserId = managerUserId;
    auth.rejectionReason = reason || 'Trip not aligned with corporate travel policy';
    this.authorizations.set(authId, auth);

    this.safetySmsService
      .sendSms(
        auth.employeePhone,
        `Cabi Africa: Your corporate trip request to ${auth.dropoff.address} was declined by management. Reason: ${auth.rejectionReason}.`,
      )
      .catch(() => {});

    return auth;
  }

  /**
   * If manager doesn't respond in 15 minutes, employee can switch to personal payment with pre-filled expense voucher
   */
  async switchToPersonalPayment(
    authId: string,
    userId: string,
  ): Promise<{ authorization: CorporateTripAuthorization; voucherCode: string; ride: any }> {
    const auth = this.authorizations.get(authId);
    if (!auth) throw new NotFoundException(`Authorization ${authId} not found`);

    const voucherCode = `EXP-CABI-${Date.now().toString().slice(-6)}`;
    auth.status = 'SWITCHED_TO_PERSONAL';
    auth.expenseVoucherCode = voucherCode;

    // Dispatch ride under personal payment mode
    const ride = await this.rideService.createRide(
      userId,
      auth.pickup,
      auth.dropoff,
      auth.estimatedFare,
      auth.vehicleType,
      true,
      'PERSONAL_EXPENSE_CLAIM_SWITCH',
    );

    auth.rideId = ride.id;
    this.authorizations.set(authId, auth);

    this.safetySmsService
      .sendSms(
        auth.employeePhone,
        `Cabi Africa: Switched to Personal M-PESA. Expense Claim Voucher ${voucherCode} generated for reimbursement with Cost-Center ${auth.costCenterId}.`,
      )
      .catch(() => {});

    return { authorization: auth, voucherCode, ride };
  }

  private recordCorporateSpend(
    corporateAccountId: string,
    costCenterId: string,
    employeeId: string,
    amount: number,
  ) {
    const account = this.corporateAccounts.get(corporateAccountId);
    if (account) {
      account.creditUsed += amount;
      this.corporateAccounts.set(corporateAccountId, account);
    }

    const costCenter = this.costCenters.get(costCenterId);
    if (costCenter) {
      costCenter.currentSpend += amount;
      this.costCenters.set(costCenterId, costCenter);
    }

    const employee = Array.from(this.corporateEmployees.values()).find(
      (e) => e.employeeId === employeeId,
    );
    if (employee) {
      employee.currentMonthSpent += amount;
      this.corporateEmployees.set(employee.id, employee);
    }
  }

  // --- Monthly Consolidated Invoicing ---

  generateMonthlyInvoice(
    corporateAccountId: string,
    billingMonth: string,
  ): CorporateInvoice {
    const account = this.getAccount(corporateAccountId);
    const invoiceNumber = `INV-${billingMonth.replace('-', '')}-${account.companyName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const costCenters = this.listCostCenters(corporateAccountId);
    const breakdown = costCenters.map((cc) => ({
      costCenterCode: cc.code,
      costCenterName: cc.name,
      tripsCount: Math.max(1, Math.round(cc.currentSpend / 650)),
      subtotal: cc.currentSpend,
    }));

    const subtotal = breakdown.reduce((sum, line) => sum + line.subtotal, 0);
    const vatRatePercent = 16; // KRA 16% VAT standard
    const vatAmount = Math.round(subtotal * 0.16);
    const totalAmount = subtotal + vatAmount;

    const now = new Date();
    const daysToAdd = account.paymentTerms === 'NET_60' ? 60 : 30;
    const dueDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    const invoice: CorporateInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      corporateAccountId,
      companyName: account.companyName,
      kraPin: account.kraPin,
      billingMonth,
      totalTrips: breakdown.reduce((sum, line) => sum + line.tripsCount, 0),
      subtotal,
      vatRatePercent,
      vatAmount,
      totalAmount,
      costCenterBreakdown: breakdown,
      status: 'ISSUED',
      issuedAt: now,
      dueDate,
    };

    this.invoices.set(invoice.id, invoice);
    this.logger.log(`Issued consolidated invoice ${invoiceNumber} for ${account.companyName}: KES ${totalAmount}`);
    return invoice;
  }

  listInvoices(corporateAccountId: string): CorporateInvoice[] {
    return Array.from(this.invoices.values()).filter(
      (inv) => inv.corporateAccountId === corporateAccountId,
    );
  }

  recordInvoicePayment(invoiceId: string, paymentRef: string): CorporateInvoice {
    const inv = this.invoices.get(invoiceId);
    if (!inv) throw new NotFoundException(`Invoice ${invoiceId} not found`);

    inv.status = 'PAID';
    inv.paidAt = new Date();
    inv.paymentReference = paymentRef;
    this.invoices.set(invoiceId, inv);

    // Reset credit on corporate account
    const account = this.corporateAccounts.get(inv.corporateAccountId);
    if (account) {
      account.creditUsed = Math.max(0, account.creditUsed - inv.subtotal);
      if (account.status === 'CREDIT_HOLD') {
        account.status = 'ACTIVE';
      }
      this.corporateAccounts.set(account.id, account);
    }

    return inv;
  }
}
