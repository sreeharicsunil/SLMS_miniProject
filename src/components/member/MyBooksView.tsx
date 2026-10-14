import React from 'react';
import { Clock, AlertTriangle, CheckCircle, RotateCcw, ArrowUpRight, BookOpen, Calendar } from 'lucide-react';
import { BorrowTransaction } from '../../types';

interface MyBooksViewProps {
  transactions: BorrowTransaction[];
  onReturnBook: (transactionId: string) => void;
  onSelectBook: (bookId: string) => void;
  onBrowseCatalogue: () => void;
}

export const MyBooksView: React.FC<MyBooksViewProps> = ({
  transactions,
  onReturnBook,
  onSelectBook,
  onBrowseCatalogue,
}) => {
  const activeLoans = transactions.filter(t => t.status === 'ACTIVE' || t.status === 'OVERDUE');
  const pastLoans = transactions.filter(t => t.status === 'RETURNED');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E06953]">
          Personal Circulation Desk
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#1D1D1F] tracking-tight mt-1">
          My Borrowed Books
        </h1>
        <p className="text-xs sm:text-sm text-[#656157] mt-1">
          Track active loans, return copies to circulation stacks, and review reading history.
        </p>
      </div>

      {/* Active Loans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-[#1D1D1F] flex items-center gap-2">
            <span>Currently on Loan</span>
            <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#EAE8E0] text-[#1D1D1F] font-semibold">
              {activeLoans.length}
            </span>
          </h2>
        </div>

        {activeLoans.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-[#EAE7DF] text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#8A857A] mx-auto opacity-50" />
            <h3 className="text-base font-serif font-bold text-[#1D1D1F]">No Active Borrowed Titles</h3>
            <p className="text-xs text-[#656157] max-w-sm mx-auto">
              You do not have any books currently checked out. Browse the catalog to borrow physical copies.
            </p>
            <button
              onClick={onBrowseCatalogue}
              className="px-5 py-2.5 bg-[#1D1D1F] text-white text-xs font-medium rounded-full hover:bg-[#333336] transition-all mt-2"
            >
              Browse Library Catalogue
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {activeLoans.map((tx) => {
              const isOverdue = tx.status === 'OVERDUE';
              return (
                <div
                  key={tx.transaction_id}
                  className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                    isOverdue ? 'border-amber-300 ring-1 ring-amber-200' : 'border-[#EAE7DF]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Book Cover */}
                    <div 
                      onClick={() => onSelectBook(tx.book_id)}
                      className="w-20 sm:w-24 aspect-[2/3] rounded-md overflow-hidden book-card-shadow shrink-0 bg-[#232323] cursor-pointer"
                    >
                      <img
                        src={tx.bookImage}
                        alt={tx.bookTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isOverdue ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOverdue ? 'Overdue Loan' : 'Active Circulation'}
                        </span>
                        <span className="text-[10px] text-[#8A857A] font-mono">
                          {tx.barcode}
                        </span>
                      </div>

                      <h3 
                        onClick={() => onSelectBook(tx.book_id)}
                        className="text-base font-serif font-bold text-[#1D1D1F] hover:text-[#E06953] cursor-pointer truncate"
                      >
                        {tx.bookTitle}
                      </h3>

                      <div className="text-xs text-[#656157] space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-[#8A857A]" />
                          <span>Issued: {tx.issue_date}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isOverdue ? 'text-amber-700' : 'text-[#1D1D1F]'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due date: {tx.due_date}</span>
                        </div>
                      </div>

                      {tx.notes && (
                        <p className="text-[11px] text-[#8A857A] italic line-clamp-1">
                          {tx.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-[#F0EEE6] flex items-center justify-between">
                    {isOverdue ? (
                      <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Fine: $1.50/day overdue</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[#8A857A]">
                        Loan Period: 14 days
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectBook(tx.book_id)}
                        className="px-3 py-1.5 text-xs text-[#656157] hover:text-[#1D1D1F] rounded-full hover:bg-[#F5F4EE]"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => onReturnBook(tx.transaction_id)}
                        className="px-4 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] text-white text-xs font-medium rounded-full flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return Book</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Returned Loans */}
      {pastLoans.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#E8E5DC]">
          <h2 className="text-xl font-serif font-bold text-[#1D1D1F]">
            Returned Loans History
          </h2>

          <div className="bg-white rounded-2xl border border-[#EAE7DF] overflow-hidden shadow-xs divide-y divide-[#F0EEE6]">
            {pastLoans.map((tx) => (
              <div key={tx.transaction_id} className="p-4 flex items-center justify-between text-xs hover:bg-[#FAF9F5]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-12 rounded overflow-hidden bg-[#232323] shrink-0">
                    <img src={tx.bookImage} alt={tx.bookTitle} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1D1D1F]">{tx.bookTitle}</h4>
                    <p className="text-[11px] text-[#8A857A]">
                      Barcode: {tx.barcode} • Returned on {tx.return_date || 'Earlier this semester'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Returned</span>
                  </span>
                  <button
                    onClick={() => onSelectBook(tx.book_id)}
                    className="p-1.5 rounded-full hover:bg-[#F5F4EE] text-[#1D1D1F]"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
