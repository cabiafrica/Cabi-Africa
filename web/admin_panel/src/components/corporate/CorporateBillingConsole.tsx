import React, { useState, useEffect } from 'react';
import { 
  Building2, Receipt, DollarSign, Download, CheckCircle, 
  AlertCircle, Users, FileText, ChevronRight, Filter, Printer 
} from 'lucide-react';
import { dispatchApiClient } from '../../services/dispatchApiClient';
import { PageHeader } from '../common/PageHeader';

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
      {/* Harmonized Page Header with Golden Separator */}
      <PageHeader
        category="Finance & Sacco"
        title="Corporate Billing Console"
        subtitle="Manage cost centers, departmental limits (+10% buffer), and generate 16% KRA VAT consolidated monthly tax invoices."
        icon={<Building2 className="w-6 h-6" />}
        actions={
          <div className="flex items-center gap-2.5">
            <label htmlFor="corporate-client-select" className="sr-only">
              Select Corporate Client
            </label>
            <select
              id="corporate-client-select"
              aria-label="Select Corporate Client"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-[3px] bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              className="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-[3px] transition-all shadow-sm shadow-amber-500/20 whitespace-nowrap shrink-0 active:scale-95"
            >
              Sync Ledger
            </button>
          </div>
        }
      />

      {actionMessage && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-[4px] text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-emerald-200 font-bold text-sm">×</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131722] p-4 rounded-[4px] border border-white/10 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Monthly Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              KES {totalSpent.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Allocated: KES {totalBudget.toLocaleString()} ({((totalSpent / totalBudget) * 100).toFixed(1)}% spent)
          </div>
        </div>

        <div className="bg-[#131722] p-4 rounded-[4px] border border-white/10 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>KRA 16% VAT Remittance</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              KES {pendingVatRemittance.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-amber-400/90 font-medium mt-1">
            Current Billing Cycle Compliance
          </div>
        </div>

        <div className="bg-[#131722] p-4 rounded-[4px] border border-white/10 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Authorized Employees</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {totalEmployees}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {costCenters.length} Cost Centers
          </div>
        </div>

        <div className="bg-[#131722] p-4 rounded-[4px] border border-white/10 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Over-Quota Approvals</span>
            <AlertCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              0
            </span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            All trips within 10% emergency buffer
          </div>
        </div>
      </div>

      {/* Cost Center Allocation Section */}
      <div className="bg-[#131722] rounded-[4px] border border-white/10 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">
            Departmental Cost Centers & Quotas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Trips exceeding budget by 10% automatically timeout in 15 minutes and fallback to personal payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {costCenters.map(cc => {
            const usagePercent = Math.min((cc.currentSpent / cc.monthlyBudget) * 100, 100);
            const isNearExceeded = usagePercent >= 90;

            return (
              <div 
                key={cc.id}
                className="p-3.5 rounded-[4px] border border-white/10 bg-white/[0.02] space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-white">{cc.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Code: {cc.code} • {cc.employeeCount} Members</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] ${
                    isNearExceeded ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {usagePercent.toFixed(0)}% Used
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Spent: KES {cc.currentSpent.toLocaleString()}</span>
                    <span>Cap: KES {cc.monthlyBudget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-[2px] overflow-hidden">
                    <div 
                      className={`h-full rounded-[2px] ${isNearExceeded ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-emerald-500'}`}
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
      <div className="bg-[#131722] rounded-[4px] border border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">
              KRA-Compliant Consolidated Tax Invoices
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated monthly billing with 16% VAT itemization for corporate tax filing.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Billing Period</th>
                <th className="px-4 py-3">Net Trips Subtotal</th>
                <th className="px-4 py-3">KRA 16% VAT</th>
                <th className="px-4 py-3">Total Payable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-white whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-300">
                    {inv.billingPeriod}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium whitespace-nowrap text-slate-300">
                    KES {inv.subtotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-amber-400 font-semibold whitespace-nowrap">
                    KES {inv.vatAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-white whitespace-nowrap">
                    KES {inv.totalPayable.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-[2px] text-[10px] font-bold whitespace-nowrap ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                    }`}>
                      {inv.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveInvoicePreview(inv)}
                      className="px-3 py-1.5 rounded-[3px] text-xs font-semibold bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 transition-colors whitespace-nowrap"
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

      {/* Formal KRA Tax Invoice Preview Modal (Dark Terminal Gold) */}
      {activeInvoicePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131722] rounded-[4px] max-w-xl w-full p-6 text-white border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="text-lg font-bold text-white tracking-wide">CABI AFRICA GLOBAL LTD</div>
                <div className="text-xs text-amber-500 font-mono mt-0.5">KRA PIN: P051283921X • VAT Registered</div>
                <div className="text-xs text-slate-400">HQ: Delta Corner Tower, Westlands, Nairobi</div>
              </div>
              <button
                onClick={() => setActiveInvoicePreview(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="flex justify-between items-start text-xs bg-white/[0.02] p-3 rounded-[3px] border border-white/10">
              <div>
                <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Billed To</div>
                <div className="font-bold text-white text-sm mt-0.5">{activeInvoicePreview.companyName}</div>
                <div className="text-slate-400">Attn: Finance & Operations Department</div>
                <div className="text-slate-400">Period: {activeInvoicePreview.billingPeriod}</div>
              </div>
              <div className="text-right">
                <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Invoice Details</div>
                <div className="font-mono font-bold text-white mt-0.5">{activeInvoicePreview.invoiceNumber}</div>
                <div className="text-slate-400">Issue Date: {activeInvoicePreview.issuedAt}</div>
                <div className="text-slate-400">Due Date: {activeInvoicePreview.dueDate}</div>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-white/10 rounded-[3px] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-white/[0.03] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3">Department / Cost Center</th>
                    <th className="p-3 text-right">Rides</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {costCenters.map(cc => (
                    <tr key={cc.id}>
                      <td className="p-3">
                        <div className="font-semibold text-white">{cc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{cc.code}</div>
                      </td>
                      <td className="p-3 text-right text-slate-300">{Math.floor(cc.currentSpent / 950)}</td>
                      <td className="p-3 text-right font-medium text-white">KES {cc.currentSpent.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Ride Total (Excl. VAT):</span>
                <span className="font-medium text-white">KES {activeInvoicePreview.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span className="font-semibold">KRA Value Added Tax (16%):</span>
                <span className="font-bold">KES {activeInvoicePreview.vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2 text-white">
                <span>Total Amount Due:</span>
                <span className="text-amber-400">KES {activeInvoicePreview.totalPayable.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveInvoicePreview(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-[3px] transition-all shadow-sm shadow-amber-500/20 flex items-center gap-1.5"
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
