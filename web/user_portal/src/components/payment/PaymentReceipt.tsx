import React, { useRef } from 'react';

interface PaymentReceiptProps {
    receiptNumber: string;
    date: string;
    payerName: string;
    payerPhone: string;
    amount: number;
    paymentMethod: string;
    status: 'HELD' | 'PAID';
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
    receiptNumber,
    date,
    payerName,
    payerPhone,
    amount,
    paymentMethod,
    status,
}) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = receiptRef.current?.innerHTML;
        if (printContent) {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
            const doc = iframe.contentWindow?.document || iframe.contentDocument;
            if (doc) {
                doc.write(`
                    <html>
                        <head>
                            <title>Print Receipt</title>
                            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                        </head>
                        <body class="bg-white p-8">
                            ${printContent}
                        </body>
                    </html>
                `);
                doc.close();
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    document.body.removeChild(iframe);
                }, 500);
            }
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-lg shadow-lg overflow-hidden">
            <div ref={receiptRef} className="p-8 bg-white text-slate-800">
                <div className="text-center mb-8 border-b-2 border-slate-100 pb-6">
                    <h2 className="text-2xl font-black uppercase tracking-widest text-[#D4AF37]">CABI AFRICA</h2>
                    <p className="text-xs text-slate-500 font-medium">OFFICIAL PAYMENT RECEIPT</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Receipt No:</span>
                        <span className="font-mono font-bold text-slate-900">{receiptNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Date:</span>
                        <span className="font-medium text-slate-900">{date}</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-100">
                    <div className="mb-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Payer</p>
                        <p className="font-bold text-lg">{payerName}</p>
                        <p className="text-slate-600 font-mono text-sm">{payerPhone}</p>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Amount Paid</p>
                            <p className="text-sm text-[#B48A1E] font-semibold">{paymentMethod}</p>
                        </div>
                        <p className="text-3xl font-black text-slate-900">KES {amount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status === 'HELD' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        Account Status: {status}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 italic px-4">
                        Funds are held in a suspense account pending partner verification.
                    </p>
                </div>

                <div className="text-xs text-center text-slate-400">
                    Internal Ref: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
                <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download / Print Receipt
                </button>
                <p className="text-xs text-center text-slate-500">
                    <strong>Next Step:</strong> Upload this receipt to your Partner Wealth Portal to unlock your account.
                </p>
            </div>
        </div>
    );
};
