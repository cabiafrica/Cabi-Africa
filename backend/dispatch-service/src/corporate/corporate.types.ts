export type PaymentTerms = 'NET_30' | 'NET_60' | 'PREPAID';
export type CorporateAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CREDIT_HOLD';
export type ApprovalStatus =
  | 'AUTO_APPROVED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'TIMEOUT_ESCALATED'
  | 'SWITCHED_TO_PERSONAL';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE';

export interface CorporateAccount {
  id: string;
  companyName: string;
  registrationNumber: string;
  kraPin: string;
  billingContactEmail: string;
  billingContactPhone: string;
  creditLimit: number;
  creditUsed: number;
  graceBufferPercent: number; // default 10%
  paymentTerms: PaymentTerms;
  status: CorporateAccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostCenter {
  id: string;
  corporateAccountId: string;
  code: string; // e.g. "CC-FIN-01"
  name: string; // e.g. "Finance & Accounts"
  allocatedBudget: number; // Monthly allocation (KES)
  currentSpend: number; // Current month spend (KES)
  managerUserId: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  createdAt: Date;
}

export interface CorporateEmployee {
  id: string;
  corporateAccountId: string;
  costCenterId: string;
  userId: string;
  employeeId: string; // e.g. "EMP-9021"
  fullName: string;
  email: string;
  phone: string;
  monthlyAllowance: number; // Individual monthly allowance (KES)
  currentMonthSpent: number;
  requiresApprovalAbove: number; // Trips above this fare require manager approval (e.g. 1500)
  allowAfterHours: boolean; // If false, trips between 20:00 - 06:00 require approval
  status: 'ACTIVE' | 'REVOKED';
  createdAt: Date;
}

export interface CorporateTripAuthorization {
  id: string;
  corporateAccountId: string;
  costCenterId: string;
  employeeId: string;
  employeeUserId: string;
  employeeName: string;
  employeePhone: string;
  pickup: { address: string; latitude: number; longitude: number };
  dropoff: { address: string; latitude: number; longitude: number };
  estimatedFare: number;
  vehicleType: string;
  purpose: string;
  status: ApprovalStatus;
  policyBreachReasons: string[];
  approvedByUserId?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  timeoutAt: Date; // 15 minutes from creation
  rideId?: string;
  expenseVoucherCode?: string;
  createdAt: Date;
}

export interface CostCenterInvoiceLine {
  costCenterCode: string;
  costCenterName: string;
  tripsCount: number;
  subtotal: number;
}

export interface CorporateInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-11-0042"
  corporateAccountId: string;
  companyName: string;
  kraPin: string;
  billingMonth: string; // "YYYY-MM"
  totalTrips: number;
  subtotal: number;
  vatRatePercent: number; // 16% KRA standard
  vatAmount: number;
  totalAmount: number;
  costCenterBreakdown: CostCenterInvoiceLine[];
  status: InvoiceStatus;
  issuedAt: Date;
  dueDate: Date;
  paidAt?: Date;
  paymentReference?: string;
}

export interface PolicyEvaluationResult {
  canProceedAutomatically: boolean;
  status: 'AUTO_APPROVED' | 'REQUIRES_APPROVAL' | 'REJECTED_CREDIT_LIMIT';
  policyBreaches: string[];
  estimatedFare: number;
  employeeRemainingAllowance: number;
  costCenterAvailableBudget: number;
  graceBufferApplied: boolean;
}
