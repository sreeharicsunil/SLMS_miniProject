import React from 'react';
import { User, Book } from '../../types';
import { Shield, BookOpen, Clock, DollarSign, Bookmark, ArrowUpRight, Barcode, CheckCircle } from 'lucide-react';

interface UserProfileViewProps {
  currentUser: User;
  wishlistBooks: Book[];
  onSelectBook: (bookId: string) => void;
  onBrowseCatalogue: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  wishlistBooks,
  onSelectBook,
  onBrowseCatalogue,
}) => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E06953]">
          Reader Identity & Library Card
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#1D1D1F] tracking-tight mt-1">
          University Membership
        </h1>
        <p className="text-xs sm:text-sm text-[#656157] mt-1">
          Official digital student credentials, borrowing privileges, and saved book lists.
        </p>
      </div>

      {/* Digital University Library Card Graphic */}
      <div className="relative w-full max-w-lg mx-auto bg-gradient-to-br from-[#232323] via-[#1D1D1F] to-[#121214] text-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-700 overflow-hidden">
        {/* Decorative corner seal */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#E06953]/15 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <div className="text-[10px] tracking-widest uppercase font-bold text-[#E06953]">
              University Library System
            </div>
            <div className="font-serif text-lg font-bold text-white mt-0.5">
              Smart Library Pass
            </div>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <Shield className="w-5 h-5 text-[#E06953]" />
          </div>
        </div>

        <div className="flex items-center gap-5 my-6">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md"
          />
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-white">{currentUser.name}</h3>
            <p className="text-xs text-neutral-300">{currentUser.department || 'Department of Letters'}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Status: {currentUser.status}
            </span>
          </div>
        </div>

        {/* Barcode Strip */}
        <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-2">
          <div className="font-mono text-center tracking-widest text-[11px] text-neutral-400">
            {currentUser.membershipId}
          </div>
          {/* Visual CSS barcode representation */}
          <div className="w-full h-9 flex items-center justify-center gap-1 bg-white/10 p-1.5 rounded-lg">
            {Array.from({ length: 38 }).map((_, i) => (
              <div
                key={i}
                style={{ width: (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1) }}
                className="h-full bg-white/80"
              />
            ))}
          </div>
          <div className="text-[9px] text-neutral-400 tracking-wider uppercase">
            Present at self-checkout kiosk or circulation desk
          </div>
        </div>
      </div>

      {/* Wishlist Saved Books */}
      <div className="space-y-4 pt-6 border-t border-[#E8E5DC]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-[#1D1D1F] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#E06953]" />
            <span>Saved Wishlist ({wishlistBooks.length})</span>
          </h2>
        </div>

        {wishlistBooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-[#EAE7DF] text-center space-y-2">
            <p className="text-xs text-[#656157]">You haven&apos;t bookmarked any titles yet.</p>
            <button
              onClick={onBrowseCatalogue}
              className="px-4 py-2 bg-[#1D1D1F] text-white text-xs font-medium rounded-full mt-2"
            >
              Browse Catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {wishlistBooks.map((book) => (
              <div
                key={book.book_id}
                onClick={() => onSelectBook(book.book_id)}
                className="cursor-pointer group flex flex-col bg-white p-3.5 rounded-2xl border border-[#EAE7DF] hover:border-[#D6D2C4] shadow-xs hover:shadow-md transition-all"
              >
                <div className="w-full aspect-[2/3] rounded-md overflow-hidden book-card-shadow bg-[#232323] mb-3">
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#1D1D1F] line-clamp-1 group-hover:text-[#E06953]">
                  {book.title}
                </h4>
                <p className="text-[11px] text-[#8A857A] truncate">
                  {book.authors[0]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
