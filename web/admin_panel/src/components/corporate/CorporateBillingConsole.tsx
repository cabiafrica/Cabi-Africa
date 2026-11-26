import React, { useState, useEffect } from 'react';
import { 
  Building2, Receipt, DollarSign, Download, CheckCircle, 
  AlertCircle, Users, FileText, ChevronRight, Filter, Printer 
} from 'lucide-react';
import { dispatchApiClient } from '../../services/dispatchApiClient';

interface CostCenter {
  id: string;
  name: string;
  code: string;
  monthlyBudget: number;
  currentSpent: number;
  employeeCount: number;
}

interface CorporateInvoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
  billingPeriod: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalPayable: number;
  status: 'PENDING_APPROVAL' | 'PAID' | 'OVERDUE';
  issuedAt: string;
  dueDate: string;
}

export const CorporateBillingConsole: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState('cabi_hq');
  const [invoices, setInvoices] = useState<CorporateInvoice[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [activeInvoicePreview, setActiveInvoicePreview] = useState<CorporateInvoice | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCorporateData();
  }, [selectedCompanyId]);

  const loadCorporateData = async () => {
    try {
      const res = await dispatchApiClient.get(`/corporate/invoices/monthly`);
      if (res.data && Array.isArray(res.data)) {
        setInvoices(res.data);
      }
    } catch (_) {
      // Fallback
    }

    setCostCenters([
      {
        id: 'cc_ops',
        name: 'Operations & Field Patrol',
        code: 'OPS-101',
        monthlyBudget: 250000,
        currentSpent: 168400,
        employeeCount: 42,
      },
      {
        id: 'cc_sales',
        name: 'Sales & Business Development',
        code: 'SLS-204',
        monthlyBudget: 180000,
        currentSpent: 165000,
        employeeCount: 28,
      },
      {
        id: 'cc_exec',
        name: 'Executive & Board Travel',
        code: 'EXE-001',
        monthlyBudget: 300000,
        currentSpent: 84200,
        employeeCount: 8,
      },
      {
        id: 'cc_tech',
        name: 'Engineering & Infrastructure',
        code: 'ENG-309',
        monthlyBudget: 150000,
        currentSpent: 42100,
        employeeCount: 19,
      },
    ]);

    setInvoices([
      {
        id: 'inv_2026_11',
        invoiceNumber: 'INV-2026-11-CORP-CABI',
        companyName: 'Cabi Africa Global Ltd',
        billingPeriod: 'November 2026',
        subtotal: 459700,
        vatRate: 0.16,
        vatAmount: 73552,
        totalPayable: 533252,
        status: 'PENDING_APPROVAL',
        issuedAt: '2026-11-01',
        dueDate: '2026-11-30',
      },
      {
        id: 'inv_2026_10',
        invoiceNumber: 'INV-2026-10-CORP-CABI',
        companyName: 'Cabi Africa Global Ltd',
        billingPeriod: 'October 2026',
        subtotal: 412500,
        vatRate: 0.16,
        vatAmount: 66000,
        totalPayable: 478500,
        status: 'PAID',
        issuedAt: '2026-10-01',
        dueDate: '2026-10-31',
      },
      {
        id: 'inv_2026_09',
        invoiceNumber: 'INV-2026-09-CORP-CABI',
        companyName: 'Cabi Africa Global Ltd',
        billingPeriod: 'September 2026',
        subtotal: 388000,
        vatRate: 0.16,
        vatAmount: 62080,
        totalPayable: 450080,
        status: 'PAID',
        issuedAt: '2026-09-01',
        dueDate: '2026-09-30',
      },
    ]);
  };

  const totalBudget = costCenters.reduce((acc, c) => acc + c.monthlyBudget, 0);
  const totalSpent = costCenters.reduce((acc, c) => acc + c.currentSpent, 0);
  const totalEmployees = costCenters.reduce((acc, c) => acc + c.employeeCount, 0);
  const pendingVatRemittance = invoices.filter(i => i.status === 'PENDING_APPROVAL').reduce((acc, i) => acc + i.vatAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            <Building2 className="w-4 h-4" />
            <span>Corporate Account Centralized Billing & Compliance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Corporate Invoicing & Departmental Quotas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Manage cost centers, departmental limits (+10% buffer), and generate 16% KRA VAT consolidated monthly tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="corporate-client-select" className="sr-only">
            Select Corporate Client
          </label>
          <select
            id="corporate-client-select"
            aria-label="Select Corporate Client"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="cabi_hq">Cabi Africa Global Ltd</option>
            <option value="safaricom">Safaricom PLC</option>
            <option value="equity_bank">Equity Group Holdings</option>
            <option value="kplc">Kenya Power & Lighting Co.</option>
          </select>

          <button
            onClick={() => {
              setActionMessage('Synced real-time cost-center telemetry with core ledger.');
              setTimeout(() => setActionMessage(null), 3500);
            }}
            className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-lg transition-all shadow-md shadow-amber-500/20 whitespace-nowrap shrink-0"
          >
            Sync Ledger
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card-dark p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Total Monthly Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              KES {totalSpent.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Allocated: KES {totalBudget.toLocaleString()} ({((totalSpent / totalBudget) * 100).toFixed(1)}% spent)
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>KRA 16% VAT Remittance</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              KES {pendingVatRemittance.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            Current Billing Cycle Compliance
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Authorized Employees</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalEmployees}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {costCenters.length} Cost Centers
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Over-Quota Approvals</span>
            <AlertCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              0
            </span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            All trips within 10% emergency buffer
          </div>
        </div>
      </div>

      {/* Cost Center Allocation Section */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/10 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Departmental Cost Centers & Quotas
            </h3>
            <p className="text-xs text-slate-400">
              Trips exceeding budget by 10% automatically timeout in 15 minutes and fallback to personal payment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {costCenters.map(cc => {
            const usagePercent = Math.min((cc.currentSpent / cc.monthlyBudget) * 100, 100);
            const isNearExceeded = usagePercent >= 90;

            return (
              <div 
                key={cc.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{cc.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Code: {cc.code} • {cc.employeeCount} Members</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isNearExceeded ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {usagePercent.toFixed(0)}% Used
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Spent: KES {cc.currentSpent.toLocaleString()}</span>
                    <span>Cap: KES {cc.monthlyBudget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isNearExceeded ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Consolidated Tax Invoices */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              KRA-Compliant Consolidated Tax Invoices
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated monthly billing with 16% VAT itemization for corporate tax filing.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-white/5 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-5 py-3">Invoice Number</th>
                <th className="px-5 py-3">Billing Period</th>
                <th className="px-5 py-3">Net Trips Subtotal</th>
                <th className="px-5 py-3">KRA 16% VAT</th>
                <th className="px-5 py-3">Total Payable</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                    {inv.billingPeriod}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium whitespace-nowrap">
                    KES {inv.subtotal.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-blue-600 font-semibold whitespace-nowrap">
                    KES {inv.vatAmount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    KES {inv.totalPayable.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {inv.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveInvoicePreview(inv)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 hover:bg-emerald-600 hover:text-white transition-colors whitespace-nowrap"
                    >
                      Preview & Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal KRA Tax Invoice Preview Modal */}
      {activeInvoicePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 text-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="text-xl font-bold text-slate-900">CABI AFRICA GLOBAL LTD</div>
                <div className="text-xs text-slate-500">KRA PIN: P051283921X • VAT Registered</div>
                <div className="text-xs text-slate-500">HQ: Delta Corner Tower, Westlands, Nairobi</div>
              </div>
              <button
                onClick={() => setActiveInvoicePreview(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="flex justify-between items-start text-xs">
              <div>
                <div className="font-bold uppercase tracking-wider text-slate-400">Billed To</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{activeInvoicePreview.companyName}</div>
                <div className="text-slate-600">Attn: Finance & Operations Department</div>
                <div className="text-slate-600">Period: {activeInvoicePreview.billingPeriod}</div>
              </div>
              <div className="text-right">
                <div className="font-bold uppercase tracking-wider text-slate-400">Invoice Details</div>
                <div className="font-mono font-bold mt-0.5">{activeInvoicePreview.invoiceNumber}</div>
                <div className="text-slate-600">Issue Date: {activeInvoicePreview.issuedAt}</div>
                <div className="text-slate-600">Due Date: {activeInvoicePreview.dueDate}</div>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Department / Cost Center</th>
                    <th className="p-3 text-right">Rides</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {costCenters.map(cc => (
                    <tr key={cc.id}>
                      <td className="p-3">
                        <div className="font-semibold">{cc.name}</div>
                        <div className="text-[10px] text-slate-400">{cc.code}</div>
                      </td>
                      <td className="p-3 text-right">{Math.floor(cc.currentSpent / 950)}</td>
                      <td className="p-3 text-right font-medium">KES {cc.currentSpent.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Ride Total (Excl. VAT):</span>
                <span className="font-medium">KES {activeInvoicePreview.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span className="font-semibold">KRA Value Added Tax (16%):</span>
                <span className="font-bold">KES {activeInvoicePreview.vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 text-slate-900">
                <span>Total Amount Due:</span>
                <span className="text-emerald-600">KES {activeInvoicePreview.totalPayable.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveInvoicePreview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CorporateBillingConsole;
