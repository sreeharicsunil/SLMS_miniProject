import React from 'react';
import { Bookmark, Clock, CheckCircle2, XCircle, ArrowUpRight, BookOpen, AlertCircle } from 'lucide-react';
import { Reservation } from '../../types';

interface ReservationsViewProps {
  reservations: Reservation[];
  onCancelReservation: (resId: string) => void;
  onSelectBook: (bookId: string) => void;
  onBrowseCatalogue: () => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  onCancelReservation,
  onSelectBook,
  onBrowseCatalogue,
}) => {
  const activeHolds = reservations.filter(r => r.status === 'PENDING' || r.status === 'READY');
  const pastHolds = reservations.filter(r => r.status === 'CANCELLED' || r.status === 'FULFILLED' || r.status === 'EXPIRED');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E06953]">
          Hold Queue & Pickups
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#1D1D1F] tracking-tight mt-1">
          My Reservations
        </h1>
        <p className="text-xs sm:text-sm text-[#656157] mt-1">
          Fair FIFO queue holds. When a checked-out book returns to the stacks, it is reserved for you.
        </p>
      </div>

      {/* Active Holds List */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-[#1D1D1F] flex items-center gap-2">
          <span>Active Holds</span>
          <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#EAE8E0] text-[#1D1D1F] font-semibold">
            {activeHolds.length}
          </span>
        </h2>

        {activeHolds.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-[#EAE7DF] text-center space-y-3">
            <Bookmark className="w-10 h-10 text-[#8A857A] mx-auto opacity-50" />
            <h3 className="text-base font-serif font-bold text-[#1D1D1F]">No Current Reservations</h3>
            <p className="text-xs text-[#656157] max-w-sm mx-auto">
              You haven&apos;t placed any holds. When a popular title is fully checked out, you can reserve it directly from its book page.
            </p>
            <button
              onClick={onBrowseCatalogue}
              className="px-5 py-2.5 bg-[#1D1D1F] text-white text-xs font-medium rounded-full hover:bg-[#333336] transition-all mt-2"
            >
              Explore Catalogue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeHolds.map((res) => {
              const isReady = res.status === 'READY';
              return (
                <div
                  key={res.reservation_id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
                    isReady ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-[#EAE7DF]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => onSelectBook(res.book_id)}
                      className="w-16 h-22 rounded-md overflow-hidden book-card-shadow shrink-0 bg-[#232323] cursor-pointer"
                    >
                      <img src={res.bookImage} alt={res.bookTitle} className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isReady ? 'Ready for Pickup' : `Queue Position #${res.queuePosition}`}
                        </span>
                        <span className="text-[11px] text-[#8A857A]">
                          Reserved: {res.reservation_date}
                        </span>
                      </div>

                      <h3 
                        onClick={() => onSelectBook(res.book_id)}
                        className="text-base font-serif font-bold text-[#1D1D1F] hover:text-[#E06953] cursor-pointer"
                      >
                        {res.bookTitle}
                      </h3>

                      <p className="text-xs text-[#656157]">
                        {isReady ? (
                          <span className="text-emerald-700 font-medium">
                            Assigned to Hold Shelf #08. Pick up before {res.expiry_date}.
                          </span>
                        ) : (
                          <span>
                            Estimated availability based on active borrower return schedules: ~4-7 days.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onSelectBook(res.book_id)}
                      className="px-3.5 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F4EE] rounded-full border border-[#E8E6DF]"
                    >
                      Book Details
                    </button>
                    <button
                      onClick={() => onCancelReservation(res.reservation_id)}
                      className="px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-full border border-red-200"
                    >
                      Cancel Hold
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Holds */}
      {pastHolds.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-[#E8E5DC]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8A857A]">
            Archived Hold Requests
          </h3>
          <div className="bg-white rounded-2xl border border-[#EAE7DF] divide-y divide-[#F0EEE6]">
            {pastHolds.map((res) => (
              <div key={res.reservation_id} className="p-3.5 text-xs flex items-center justify-between">
                <span className="font-serif font-bold text-[#1D1D1F]">{res.bookTitle}</span>
                <span className="text-[#8A857A] capitalize">{res.status.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
