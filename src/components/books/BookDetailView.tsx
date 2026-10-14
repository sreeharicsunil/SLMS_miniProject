import React, { useState } from 'react';
import { 
  ArrowUpRight, Bookmark, Share2, Download, ArrowLeft,
  ChevronUp, ChevronDown, Check, Star, ShieldCheck, Sparkles,
  MapPin, AlertCircle, MessageSquarePlus, BookOpen, Clock
} from 'lucide-react';
import { Book, BookCopy, Review, User } from '../../types';

interface BookDetailViewProps {
  book: Book;
  copies: BookCopy[];
  reviews: Review[];
  currentUser: User | null;
  allBooks: Book[];
  onBack: () => void;
  onSelectBook: (bookId: string) => void;
  onBorrow: (bookId: string, copyId?: string) => void;
  onReserve: (bookId: string) => void;
  onAddReview: (reviewText: string, rating: number, chapterTag?: string) => void;
  onAskAI: (book: Book) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  copies,
  reviews,
  currentUser,
  allBooks,
  onBack,
  onSelectBook,
  onBorrow,
  onReserve,
  onAddReview,
  onAskAI,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newChapterTag, setNewChapterTag] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  // Navigate between adjacent books in catalog
  const currentIndex = allBooks.findIndex(b => b.book_id === book.book_id);
  const prevBook = currentIndex > 0 ? allBooks[currentIndex - 1] : allBooks[allBooks.length - 1];
  const nextBook = currentIndex < allBooks.length - 1 ? allBooks[currentIndex + 1] : allBooks[0];

  const availableCopies = copies.filter(c => c.status === 'AVAILABLE');
  const isAvailable = availableCopies.length > 0;

  // Readers Also Explored
  const similarBooks = allBooks
    .filter(b => b.category_id === book.category_id && b.book_id !== book.book_id)
    .slice(0, 4);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    onAddReview(newReviewText, newRating, newChapterTag || undefined);
    setNewReviewText('');
    setNewChapterTag('');
    setShowReviewModal(false);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-fade-in">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#656157] hover:text-[#1D1D1F] bg-white px-3.5 py-1.5 rounded-full border border-[#EAE7DF] shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#8A857A]">
          <span>ISBN: {book.isbn}</span>
          <span>•</span>
          <span className="capitalize">{book.category_name}</span>
        </div>
      </div>

      {/* Main Top Showcase - Replicating Image 1 */}
      <section className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Book Cover with Vertical Arrows matching reference */}
        <div className="md:col-span-5 flex items-center justify-center gap-4 sm:gap-6">
          {/* Vertical Next/Prev Arrows */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onSelectBook(prevBook.book_id)}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7EF] border border-[#EAE7DF] text-[#656157] hover:text-[#1D1D1F] flex items-center justify-center shadow-xs transition-transform active:scale-95"
              title={`Previous: ${prevBook.title}`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectBook(nextBook.book_id)}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7EF] border border-[#EAE7DF] text-[#656157] hover:text-[#1D1D1F] flex items-center justify-center shadow-xs transition-transform active:scale-95"
              title={`Next: ${nextBook.title}`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* 3D Realistic Book Cover with custom shadow */}
          <div className="w-56 sm:w-64 aspect-[2/3] rounded-lg overflow-hidden book-card-shadow bg-[#232323] relative border-l border-white/20">
            <img
              src={book.image_url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
              ★ {book.rating}
            </div>
          </div>
        </div>

        {/* Right Metadata and Action Buttons */}
        <div className="md:col-span-7 space-y-5">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#1D1D1F] tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="text-sm sm:text-base font-serif italic text-[#4A453A] mt-2">
              {book.authors.join(', ')}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#656157] leading-relaxed max-w-lg">
            {book.subtitle || 'Get ready to uncover the dark secrets and betrayals in the book. A thrilling adventure awaits you.'}
          </p>

          {/* Action Row matching reference buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isAvailable ? (
              <button
                onClick={() => onBorrow(book.book_id)}
                className="px-6 py-3 bg-[#1D1D1F] text-white text-xs font-medium rounded-full hover:bg-[#333336] transition-all shadow-sm flex items-center gap-2 group hover:scale-[1.02]"
              >
                <span>Start reading</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ) : (
              <button
                onClick={() => onReserve(book.book_id)}
                className="px-6 py-3 bg-[#E06953] text-white text-xs font-medium rounded-full hover:bg-[#D45943] transition-all shadow-sm flex items-center gap-2 group hover:scale-[1.02]"
              >
                <span>Place Hold (Reserve)</span>
                <Clock className="w-4 h-4" />
              </button>
            )}

            {/* Bookmark pill */}
            <button
              onClick={onToggleWishlist}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                isWishlisted
                  ? 'bg-[#E06953] text-white border-[#E06953]'
                  : 'bg-white hover:bg-[#FAF7EF] text-[#656157] border-[#EAE7DF]'
              }`}
              title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Share pill */}
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-[#FAF7EF] text-[#656157] border border-[#EAE7DF] flex items-center justify-center transition-colors relative"
              title="Share Title"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && (
                <span className="absolute -top-7 text-[10px] bg-[#1D1D1F] text-white px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>

            {/* AI Assistant Quick Pill */}
            <button
              onClick={() => onAskAI(book)}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-[#FAF7EF] text-[#E06953] border border-[#EAE7DF] flex items-center justify-center transition-colors"
              title="Ask Library AI about this book"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Availability Summary */}
          <div className="flex items-center gap-3 pt-2 text-xs">
            <span className={`inline-flex items-center gap-1.5 font-semibold ${isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isAvailable ? `${availableCopies.length} of ${copies.length} Physical Copies Available` : 'All Copies Currently Checked Out'}
            </span>
          </div>
        </div>
      </section>

      {/* White Content Sheet - Faithful to Image 1 bottom structure */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE7DF] shadow-sm space-y-10">
        <div className="grid md:grid-cols-12 gap-10">
          {/* Left Column: Description & Reader Review */}
          <div className="md:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-[#1D1D1F]">
                Description
              </h2>
              <p className="text-xs sm:text-sm text-[#656157] leading-relaxed">
                {book.description}
              </p>
              <p className="text-xs sm:text-sm text-[#656157] leading-relaxed">
                With action-packed sequences, shocking twists, and moments of heart-wrenching tragedy, &ldquo;{book.title}&rdquo; is a must-read for any fan of the {book.category_name} series.
              </p>
            </div>

            {/* Reviewer Card matching Roberto Jordan card in Image 1 */}
            <div className="pt-4 border-t border-[#F0EEE6] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif font-bold text-[#1D1D1F]">
                  Reader Review & Community Notes
                </h3>
                {currentUser && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="text-xs font-semibold text-[#E06953] hover:underline flex items-center gap-1"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Write Review</span>
                  </button>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.slice(0, 2).map((rev) => (
                    <div key={rev.rating_id} className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-[#DDD9CE]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1D1D1F]">{rev.userName}</span>
                          <div className="flex text-amber-500 text-[10px]">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#656157] leading-relaxed italic">
                          &ldquo;{rev.review}&rdquo;
                        </p>
                        {rev.chapterTag && (
                          <div className="text-[10px] text-[#E06953] font-medium pt-0.5">
                            {rev.chapterTag}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8A857A]">No reviews yet for this title. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>

          {/* Right Column: Book Specifications matching Image 1 */}
          <div className="md:col-span-5 space-y-6 md:border-l md:border-[#F0EEE6] md:pl-10">
            {/* Editors */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A857A]">
                Editors & Contributors
              </h3>
              <p className="text-xs sm:text-sm text-[#1D1D1F] leading-relaxed">
                {book.editors || `${book.authors.join(', ')} (author), Christopher Reath, Alena Gestabor, Steve Korg`}
              </p>
            </div>

            {/* Language */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A857A]">
                Language
              </h3>
              <p className="text-xs sm:text-sm text-[#1D1D1F]">
                {book.language || 'Standard English (USA & UK)'}
              </p>
            </div>

            {/* Paperback Specs & ISBN */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A857A]">
                Paperback Specifications
              </h3>
              <p className="text-xs sm:text-sm text-[#1D1D1F]">
                {book.format || 'paper textured, full colour, 345 pages'}
              </p>
              <p className="text-xs text-[#8A857A] font-mono mt-1">
                ISBN: {book.isbn} {book.isbn_13 ? `• ISBN-13: ${book.isbn_13}` : ''}
              </p>
            </div>

            {/* SLM Model Footprint & Kaggle Dataset Metadata */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/70 to-orange-50/40 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#E06953]" />
                  <span>SLM Edge Grounding Atom</span>
                </span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#E06953] border border-amber-200">
                  ~{book.slm_tokens || 45} Tokens
                </span>
              </div>
              <p className="text-[11px] text-stone-700 italic">
                &ldquo;{book.slm_summary || book.description.slice(0, 110)}...&rdquo;
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] text-stone-500 border-t border-amber-100">
                <span>Dataset: Kaggle Google Books</span>
                {book.google_book_id && <span>• ID: <code className="font-mono">{book.google_book_id}</code></span>}
                {book.search_category && <span>• Tag: <em>{book.search_category}</em></span>}
              </div>
            </div>

            {/* Physical Barcodes & Locations Table (Crucial MCA Physical Copy Architecture) */}
            <div className="space-y-3 pt-4 border-t border-[#F0EEE6]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E06953]" />
                  <span>Physical Stacks Barcodes ({copies.length})</span>
                </h3>
              </div>

              <div className="space-y-2">
                {copies.map((copy) => {
                  const isCopyAvail = copy.status === 'AVAILABLE';
                  return (
                    <div
                      key={copy.copy_id}
                      className="p-2.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F5] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-[#1D1D1F]">{copy.barcode}</div>
                        <div className="text-[10px] text-[#8A857A]">{copy.location} • Condition: {copy.condition}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          copy.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                          copy.status === 'BORROWED' ? 'bg-amber-100 text-amber-800' :
                          copy.status === 'RESERVED' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {copy.status}
                        </span>

                        {isCopyAvail && currentUser && (
                          <button
                            onClick={() => onBorrow(book.book_id, copy.copy_id)}
                            className="px-2.5 py-1 bg-[#1D1D1F] text-white text-[10px] font-medium rounded-lg hover:bg-[#333336]"
                          >
                            Loan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Books Shelf */}
      {similarBooks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#1D1D1F]">
              Readers Also Explored in {book.category_name}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {similarBooks.map((simBook) => (
              <div
                key={simBook.book_id}
                onClick={() => onSelectBook(simBook.book_id)}
                className="cursor-pointer group flex flex-col bg-white p-3.5 rounded-2xl border border-[#EAE7DF] hover:border-[#D6D2C4] shadow-xs hover:shadow-md transition-all"
              >
                <div className="w-full aspect-[2/3] rounded-md overflow-hidden book-card-shadow bg-[#232323] mb-3">
                  <img
                    src={simBook.image_url}
                    alt={simBook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#1D1D1F] line-clamp-1 group-hover:text-[#E06953]">
                  {simBook.title}
                </h4>
                <p className="text-[11px] text-[#8A857A] truncate">
                  {simBook.authors[0]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-[#EAE7DF] shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#1D1D1F]">Write Reader Review</h3>
            <p className="text-xs text-[#656157]">
              Share your insights on &ldquo;{book.title}&rdquo; with university peers.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewRating(num)}
                      className={`text-xl ${num <= newRating ? 'text-amber-500' : 'text-neutral-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Chapter or Section Tag (Optional)</label>
                <input
                  type="text"
                  value={newChapterTag}
                  onChange={(e) => setNewChapterTag(e.target.value)}
                  placeholder="e.g. Chapter Seven: The Horcrux"
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Review *</label>
                <textarea
                  required
                  rows={4}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="What did you think of the themes, character arcs, or technical depth?"
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#656157] hover:bg-[#F5F4EE] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-[#1D1D1F] text-white hover:bg-[#333336] rounded-full"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
