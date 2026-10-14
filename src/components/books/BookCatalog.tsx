import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, SlidersHorizontal, Grid, List, Sparkles, 
  Bookmark, CheckCircle2, ArrowUpRight, BookOpen, AlertCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Zap, Library
} from 'lucide-react';
import { Book, Category } from '../../types';

interface BookCatalogProps {
  books: Book[];
  categories: Category[];
  onSelectBook: (bookId: string) => void;
  onBorrowBook: (bookId: string) => void;
  onReserveBook: (bookId: string) => void;
  onAskAI: (book: Book) => void;
  initialCategory?: string;
  initialSearch?: string;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  categories,
  onSelectBook,
  onBorrowBook,
  onReserveBook,
  onAskAI,
  initialCategory,
  initialSearch = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [availabilityOnly, setAvailabilityOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'year' | 'title'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [scope, setScope] = useState<'all' | 'spotlight'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 24;

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, availabilityOnly, sortBy, scope]);

  const filteredBooks = useMemo(() => {
    const sourceBooks = scope === 'spotlight' 
      ? books.slice(0, 33) 
      : books;

    return sourceBooks
      .filter((b) => {
        const matchesCat = selectedCategory === 'all' || b.category_id === selectedCategory;
        const matchesSearch = 
          !searchQuery.trim() ||
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
          b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.publisher && b.publisher.toLowerCase().includes(searchQuery.toLowerCase())) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAvail = !availabilityOnly || b.availableCopies > 0;
        return matchesCat && matchesSearch && matchesAvail;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'year') return b.publication_year - a.publication_year;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        // Default popular
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      });
  }, [books, selectedCategory, searchQuery, availabilityOnly, sortBy, scope]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedBooks = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, safeCurrentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Catalog Header with Collective Strength Notice */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E06953]">
              University Stacks & Collection
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-stone-900 text-amber-300 border border-stone-700 flex items-center gap-1 font-mono">
              <Library className="w-2.5 h-2.5 text-amber-400" />
              10,000+ Volume Collective Archive
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1D1D1F] tracking-tight">
            Discover Books
          </h1>
          <p className="text-xs sm:text-sm text-[#656157] mt-1 flex items-center gap-2 flex-wrap">
            <span>
              Showing {filteredBooks.length.toLocaleString()} titles available across departments
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              ⚡ SLM Tokenized • books_dataset.json Integrated
            </span>
          </p>
        </div>

        {/* Scope, View Mode & Sort Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Scope Selector */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs cursor-pointer ${
                scope === 'all'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#8A857A] hover:text-[#1D1D1F]'
              }`}
            >
              All Collective ({books.length.toLocaleString()})
            </button>
            <button
              onClick={() => setScope('spotlight')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs cursor-pointer ${
                scope === 'spotlight'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#8A857A] hover:text-[#1D1D1F]'
              }`}
            >
              Spotlight (33)
            </button>
          </div>

          <div className="flex items-center bg-white rounded-xl p-1 border border-[#EAE7DF] shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#F5F4EE] text-[#1D1D1F]' : 'text-[#8A857A] hover:text-[#1D1D1F]'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#F5F4EE] text-[#1D1D1F]' : 'text-[#8A857A] hover:text-[#1D1D1F]'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white text-xs font-medium text-[#1D1D1F] rounded-xl border border-[#EAE7DF] shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="popular">Sort: Most Popular</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="year">Sort: Publication Year</option>
            <option value="title">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE7DF] shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A857A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across 10,000+ volumes by title, author name, publisher, or ISBN..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F5F4EE] border border-[#E0DDD2] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D1D1F]"
          />
        </div>

        {/* Category Filter Chips with Live Collective Book Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1D1D1F] text-white shadow-xs'
                : 'bg-[#F5F4EE] text-[#656157] hover:bg-[#EAE8E0]'
            }`}
          >
            All Categories ({books.length.toLocaleString()})
          </button>
          {categories.map((c) => {
            const count = c.bookCount !== undefined ? c.bookCount : books.filter(b => b.category_id === c.category_id).length;
            return (
              <button
                key={c.category_id}
                onClick={() => setSelectedCategory(c.category_id)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === c.category_id
                    ? 'bg-[#1D1D1F] text-white shadow-xs'
                    : 'bg-[#F5F4EE] text-[#656157] hover:bg-[#EAE8E0]'
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === c.category_id
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200/80 text-stone-700'
                }`}>
                  {count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Availability Toggle and Results Counter */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F0EEE6] text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-[#656157]">
            <input
              type="checkbox"
              checked={availabilityOnly}
              onChange={(e) => setAvailabilityOnly(e.target.checked)}
              className="rounded text-[#E06953] focus:ring-[#E06953]"
            />
            <span>Show available copies only (instant loan ready)</span>
          </label>

          <span className="text-[#8A857A] font-medium text-xs">
            Showing {filteredBooks.length === 0 ? '0' : `${((safeCurrentPage - 1) * pageSize + 1).toLocaleString()}–${Math.min(safeCurrentPage * pageSize, filteredBooks.length).toLocaleString()}`} of {filteredBooks.length.toLocaleString()} volumes
          </span>
        </div>
      </div>

      {/* Books Display */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EAE7DF] p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-[#8A857A] mx-auto opacity-50" />
          <h3 className="text-base font-serif font-bold text-[#1D1D1F]">No Matching Titles Found</h3>
          <p className="text-xs text-[#656157] max-w-sm mx-auto">
            Try adjusting your search terms or clearing the category filters to browse all 10,000+ catalog volumes.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setAvailabilityOnly(false); }}
            className="px-4 py-2 bg-[#1D1D1F] text-white text-xs rounded-full font-medium mt-2 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View with Fast Pagination */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {paginatedBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div
                key={book.book_id}
                className="group flex flex-col justify-between bg-white p-3 rounded-2xl border border-[#EAE7DF] hover:border-[#DDD8CC] transition-all shadow-xs hover:shadow-md"
              >
                {/* Book Cover with 3D shadow */}
                <div 
                  onClick={() => onSelectBook(book.book_id)}
                  className="cursor-pointer"
                >
                  <div className="w-full aspect-[2/3] rounded-md overflow-hidden book-card-shadow bg-[#232323] mb-2.5 relative">
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold backdrop-blur-xs text-white bg-black/60">
                      ★ {book.rating}
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold backdrop-blur-xs text-amber-300 bg-black/75">
                      ⚡ ~{book.slm_tokens || 44} tok
                    </div>
                  </div>

                  <span className="text-[9px] font-semibold text-[#E06953] uppercase tracking-wider block truncate">
                    {book.category_name}
                  </span>
                  <h3 className="text-xs font-serif font-bold text-[#1D1D1F] line-clamp-1 group-hover:text-[#E06953] transition-colors mt-0.5" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-[10px] text-[#8A857A] truncate">
                    {book.authors[0]}
                  </p>
                </div>

                {/* Copies & Quick Action Footer */}
                <div className="pt-2 mt-2 border-t border-[#F0EEE6] flex items-center justify-between text-[10px]">
                  <span className={`font-semibold ${isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isAvailable ? `${book.availableCopies} avail` : 'On loan'}
                  </span>

                  <button
                    onClick={() => onSelectBook(book.book_id)}
                    className="p-1 rounded-full hover:bg-[#F5F4EE] text-[#1D1D1F] transition-colors cursor-pointer"
                    title="View Book Details"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-[#EAE7DF] divide-y divide-[#F0EEE6] overflow-hidden shadow-xs">
          {paginatedBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div
                key={book.book_id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors"
              >
                <div 
                  onClick={() => onSelectBook(book.book_id)}
                  className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-11 h-15 rounded overflow-hidden book-card-shadow shrink-0 bg-[#232323]">
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-serif font-bold text-[#1D1D1F] truncate hover:text-[#E06953]">
                        {book.title}
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#F5F4EE] text-[#8A857A]">
                        {book.publication_year}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#656157] truncate">
                      By {book.authors.join(', ')} • {book.category_name} • ISBN: {book.isbn}
                    </p>
                    <p className="text-[10px] text-[#8A857A] line-clamp-1">
                      {book.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:border-l sm:border-[#F0EEE6] sm:pl-4">
                  <div className="text-right hidden sm:block">
                    <div className={`text-xs font-bold ${isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isAvailable ? `${book.availableCopies} Available` : 'On Loan'}
                    </div>
                    <div className="text-[10px] text-[#8A857A]">Total: {book.totalCopies} copies</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAvailable ? (
                      <button
                        onClick={() => onBorrowBook(book.book_id)}
                        className="px-3 py-1 bg-[#1D1D1F] text-white text-[11px] font-medium rounded-full hover:bg-[#333336] transition-all cursor-pointer"
                      >
                        Borrow
                      </button>
                    ) : (
                      <button
                        onClick={() => onReserveBook(book.book_id)}
                        className="px-3 py-1 bg-[#E06953] text-white text-[11px] font-medium rounded-full hover:bg-[#D45943] transition-all cursor-pointer"
                      >
                        Reserve
                      </button>
                    )}
                    <button
                      onClick={() => onSelectBook(book.book_id)}
                      className="px-2.5 py-1 bg-[#F5F4EE] text-[#1D1D1F] text-[11px] font-medium rounded-full hover:bg-[#EAE8E0] transition-all cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EAE7DF] text-xs">
          <div className="text-[#8A857A]">
            Page <strong className="text-[#1D1D1F]">{safeCurrentPage}</strong> of <strong className="text-[#1D1D1F]">{totalPages}</strong> ({filteredBooks.length.toLocaleString()} volumes)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className={`p-2 rounded-xl border border-[#EAE7DF] transition-all ${
                safeCurrentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-[#FAF9F5]'
                  : 'bg-white hover:bg-[#F5F4EE] text-[#1D1D1F] cursor-pointer'
              }`}
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className={`px-3 py-1.5 rounded-xl border border-[#EAE7DF] font-medium transition-all flex items-center gap-1 ${
                safeCurrentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-[#FAF9F5]'
                  : 'bg-white hover:bg-[#F5F4EE] text-[#1D1D1F] cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Numeric Page Pills */}
            <div className="hidden sm:flex items-center gap-1 px-1">
              {(() => {
                const pills = [];
                const maxPills = 5;
                let startPage = Math.max(1, safeCurrentPage - 2);
                let endPage = Math.min(totalPages, startPage + maxPills - 1);
                if (endPage - startPage < maxPills - 1) {
                  startPage = Math.max(1, endPage - maxPills + 1);
                }

                for (let p = startPage; p <= endPage; p++) {
                  pills.push(
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                        p === safeCurrentPage
                          ? 'bg-[#1D1D1F] text-white shadow-xs'
                          : 'bg-white border border-[#EAE7DF] text-stone-700 hover:bg-[#F5F4EE]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                return pills;
              })()}
            </div>

            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl border border-[#EAE7DF] font-medium transition-all flex items-center gap-1 ${
                safeCurrentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed bg-[#FAF9F5]'
                  : 'bg-white hover:bg-[#F5F4EE] text-[#1D1D1F] cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className={`p-2 rounded-xl border border-[#EAE7DF] transition-all ${
                safeCurrentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed bg-[#FAF9F5]'
                  : 'bg-white hover:bg-[#F5F4EE] text-[#1D1D1F] cursor-pointer'
              }`}
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
