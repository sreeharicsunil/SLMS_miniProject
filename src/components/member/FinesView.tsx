import React, { useState } from 'react';
import { DollarSign, ShieldAlert, CheckCircle, CreditCard, Receipt, Clock, AlertCircle } from 'lucide-react';
import { Fine } from '../../types';

interface FinesViewProps {
  fines: Fine[];
  onPayFine: (fineId: string) => void;
}

export const FinesView: React.FC<FinesViewProps> = ({ fines, onPayFine }) => {
  const [payingFine, setPayingFine] = useState<Fine | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const unpaidFines = fines.filter(f => f.status === 'UNPAID');
  const paidFines = fines.filter(f => f.status === 'PAID' || f.status === 'WAIVED');
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFine) return;
    onPayFine(payingFine.fine_id);
    setPaymentSuccess(`Payment of ₹${payingFine.amount.toFixed(2)} processed successfully. Receipt: REC-${Date.now().toString().slice(-6)}`);
    setPayingFine(null);
    setTimeout(() => setPaymentSuccess(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E06953]">
          Account Financials & Overdue Charges
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#1D1D1F] tracking-tight mt-1">
          Fines & Assessments
        </h1>
        <p className="text-xs sm:text-sm text-[#656157] mt-1">
          Fines are generated at ₹5.00 per day for items not returned by their 14-day due date.
        </p>
      </div>

      {paymentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{paymentSuccess}</span>
        </div>
      )}

      {/* Outstanding Fines Summary Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE7DF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8A857A]">
            Current Outstanding Balance
          </div>
          <div className="text-4xl font-serif font-bold text-[#E06953]">
            ₹{totalUnpaid.toFixed(2)}
          </div>
          <p className="text-xs text-[#656157]">
            {totalUnpaid > 0 
              ? 'Unpaid fines restrict new loans once the balance exceeds ₹50.00.' 
              : 'Your account is in good standing. No outstanding charges.'}
          </p>
        </div>

        {totalUnpaid > 0 && (
          <button
            onClick={() => setPayingFine(unpaidFines[0])}
            className="px-6 py-3 bg-[#1D1D1F] hover:bg-[#333336] text-white text-xs font-medium rounded-full shadow-md flex items-center gap-2 transition-all self-start sm:self-center"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Total Balance Online (UPI / Card)</span>
          </button>
        )}
      </div>

      {/* Unpaid Items Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-[#1D1D1F]">
          Pending Fine Records ({unpaidFines.length})
        </h2>

        {unpaidFines.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#EAE7DF] text-center text-xs text-[#8A857A]">
            No outstanding unpaid fines.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EAE7DF] divide-y divide-[#F0EEE6] overflow-hidden">
            {unpaidFines.map((fine) => (
              <div key={fine.fine_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                      {fine.reason}
                    </span>
                    <span className="font-serif font-bold text-sm text-[#1D1D1F]">
                      {fine.bookTitle || 'Library Transaction Assessment'}
                    </span>
                  </div>
                  <p className="text-xs text-[#656157]">{fine.description}</p>
                  <p className="text-[10px] text-[#8A857A]">Recorded on {fine.created_at}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-bold text-[#E06953]">
                    ₹{fine.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setPayingFine(fine)}
                    className="px-4 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] text-white text-xs font-medium rounded-full"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settled History */}
      {paidFines.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#E8E5DC]">
          <h2 className="text-lg font-serif font-bold text-[#1D1D1F]">
            Settled & Waived Fines History
          </h2>

          <div className="bg-white rounded-2xl border border-[#EAE7DF] divide-y divide-[#F0EEE6]">
            {paidFines.map((fine) => (
              <div key={fine.fine_id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif font-bold text-[#1D1D1F]">{fine.bookTitle}</div>
                  <div className="text-[11px] text-[#8A857A]">{fine.description}</div>
                  <div className="text-[10px] text-[#A39E93]">Settled: {fine.paid_at}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#1D1D1F]">₹{fine.amount.toFixed(2)}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fine.status === 'WAIVED' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {fine.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payingFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-[#EAE7DF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6]">
              <h3 className="text-lg font-serif font-bold text-[#1D1D1F]">Settle Library Fine</h3>
              <span className="text-sm font-bold text-[#E06953]">₹{payingFine.amount.toFixed(2)}</span>
            </div>

            <p className="text-xs text-[#656157]">
              {payingFine.description}
            </p>

            <form onSubmit={handleSimulatePayment} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Student / UPI ID / RuPay Card</label>
                <input
                  type="text"
                  required
                  defaultValue="prabakaran@okaxis"
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#656157] mb-1">Bank / Provider</label>
                  <input type="text" defaultValue="SBI / Federal Bank" className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#656157] mb-1">PIN / OTP</label>
                  <input type="password" defaultValue="••••" className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl" />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingFine(null)}
                  className="px-4 py-2 text-xs text-[#656157] hover:bg-[#F5F4EE] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-[#1D1D1F] text-white hover:bg-[#333336] rounded-full flex items-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Confirm Pay ₹{payingFine.amount.toFixed(2)}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
