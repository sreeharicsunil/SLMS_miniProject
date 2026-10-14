import React, { useState } from 'react';
import { 
  Shield, Layers, Users, BookOpen, Clock, AlertTriangle, DollarSign,
  Plus, Search, Edit2, CheckCircle2, XCircle, RotateCcw, MapPin,
  Barcode, Archive, FileText, Check, ArrowUpRight, BarChart3, TrendingUp,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Book, BookCopy, User, BorrowTransaction, Reservation, Fine, DamageReport, AuditLog } from '../../types';
import { libraryService } from '../../services/libraryService';

interface AdminDashboardProps {
  books: Book[];
  copies: BookCopy[];
  users: User[];
  transactions: BorrowTransaction[];
  reservations: Reservation[];
  fines: Fine[];
  damages: DamageReport[];
  auditLogs: AuditLog[];
  onSelectBook: (bookId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  books,
  copies,
  users,
  transactions,
  reservations,
  fines,
  damages,
  auditLogs,
  onSelectBook,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'books' | 'copies' | 'users' | 'loans' | 'reservations' | 'fines' | 'damages' | 'audit'
  >('overview');

  // New Book Modal State
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('cat-cs');
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [newBookYear, setNewBookYear] = useState(2024);
  const [newBookPublisher, setNewBookPublisher] = useState('');
  const [newBookDesc, setNewBookDesc] = useState('');
  const [newBookImage, setNewBookImage] = useState('');

  // New Copy Modal State
  const [showAddCopyModal, setShowAddCopyModal] = useState(false);
  const [selectedBookForCopy, setSelectedBookForCopy] = useState(books[0]?.book_id || '');
  const [newCopyLocation, setNewCopyLocation] = useState('Floor 2, Shelf B-04');
  const [newCopyCondition, setNewCopyCondition] = useState<'MINT' | 'GOOD' | 'FAIR'>('MINT');

  // Search filter & pagination for 10,000+ books
  const [tableSearch, setTableSearch] = useState('');
  const [bookTablePage, setBookTablePage] = useState(1);

  // Quick statistics
  const totalBooks = books.length;
  const totalCopies = copies.length;
  const activeMembers = users.filter(u => u.status === 'ACTIVE').length;
  const activeLoans = transactions.filter(t => t.status === 'ACTIVE' || t.status === 'OVERDUE').length;
  const overdueLoans = transactions.filter(t => t.status === 'OVERDUE').length;
  const pendingHolds = reservations.filter(r => r.status === 'PENDING' || r.status === 'READY').length;
  const totalFinesUnpaid = fines.filter(f => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);

  // Filtered and paginated books for admin catalog master
  const filteredAdminBooks = books.filter(b => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.authors.some(a => a.toLowerCase().includes(q)) ||
      b.isbn.toLowerCase().includes(q) ||
      b.category_name.toLowerCase().includes(q)
    );
  });
  const bookTablePageSize = 25;
  const totalBookPages = Math.max(1, Math.ceil(filteredAdminBooks.length / bookTablePageSize));
  const safeBookTablePage = Math.min(bookTablePage, totalBookPages);
  const pagedAdminBooks = filteredAdminBooks.slice(
    (safeBookTablePage - 1) * bookTablePageSize,
    safeBookTablePage * bookTablePageSize
  );

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle || !newBookAuthor || !newBookIsbn) return;

    const catObj = libraryService.getCategories().find(c => c.category_id === newBookCategory);
    const created = libraryService.addBook({
      title: newBookTitle,
      authors: [newBookAuthor],
      isbn: newBookIsbn,
      publisher: newBookPublisher || 'Academic University Press',
      publication_year: Number(newBookYear),
      category_id: newBookCategory,
      category_name: catObj?.name || 'General',
      description: newBookDesc || 'Comprehensive academic textbook for university courses.',
      image_url: newBookImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      language: 'English',
      format: 'Hardcover, 400 pages',
      pageCount: 400,
      rating: 5.0,
      ratingCount: 1,
    });

    // Automatically provision initial copy #1
    libraryService.addCopy(created.book_id, 'Floor 3, Shelf A-01', 'MINT');

    setShowAddBookModal(false);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookIsbn('');
  };

  const handleAddCopy = (e: React.FormEvent) => {
    e.preventDefault();
    libraryService.addCopy(selectedBookForCopy, newCopyLocation, newCopyCondition);
    setShowAddCopyModal(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D1D1F] text-white text-xs font-semibold tracking-wide mb-2">
            <Shield className="w-3.5 h-3.5 text-[#E06953]" />
            <span>Central Administration & Librarian Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1D1D1F] tracking-tight">
            Library Operations Command
          </h1>
          <p className="text-xs sm:text-sm text-[#656157] mt-1">
            Authoritative physical copy inventory, circulation tracking, fine waivers, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddCopyModal(true)}
            className="px-4 py-2.5 bg-white text-[#1D1D1F] text-xs font-semibold rounded-full border border-[#DDD9CE] hover:bg-[#F5F4EE] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Barcode className="w-4 h-4 text-[#E06953]" />
            <span>+ Add Physical Barcode</span>
          </button>
          <button
            onClick={() => setShowAddBookModal(true)}
            className="px-5 py-2.5 bg-[#1D1D1F] text-white text-xs font-semibold rounded-full hover:bg-[#333336] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Book Title</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DF] shadow-xs">
          <div className="text-[10px] text-[#8A857A] uppercase font-bold tracking-wider">Catalog Titles</div>
          <div className="text-2xl font-serif font-bold text-[#1D1D1F] mt-1">{totalBooks}</div>
          <div className="text-[10px] text-[#8A857A] mt-0.5">Active titles</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DF] shadow-xs">
          <div className="text-[10px] text-[#8A857A] uppercase font-bold tracking-wider">Physical Copies</div>
          <div className="text-2xl font-serif font-bold text-[#1D1D1F] mt-1">{totalCopies}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Individual barcodes</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DF] shadow-xs">
          <div className="text-[10px] text-[#8A857A] uppercase font-bold tracking-wider">Active Members</div>
          <div className="text-2xl font-serif font-bold text-[#1D1D1F] mt-1">{activeMembers}</div>
          <div className="text-[10px] text-[#8A857A] mt-0.5">Registered cards</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DF] shadow-xs">
          <div className="text-[10px] text-[#8A857A] uppercase font-bold tracking-wider">Active Loans</div>
          <div className="text-2xl font-serif font-bold text-[#1D1D1F] mt-1">{activeLoans}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">In circulation</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DF] shadow-xs">
          <div className="text-[10px] text-[#8A857A] uppercase font-bold tracking-wider">Overdue Loans</div>
          <div className="text-2xl font-serif font-bold text-[#E06953] mt-1">{overdueLoans}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">₹5.00/day fines</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DF] shadow-xs">
          <div className="text-[10px] text-[#8A857A] uppercase font-bold tracking-wider">Hold Queues</div>
          <div className="text-2xl font-serif font-bold text-[#1D1D1F] mt-1">{pendingHolds}</div>
          <div className="text-[10px] text-[#8A857A] mt-0.5">Pending / Ready</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DF] shadow-xs">
          <div className="text-[10px] text-[#8A857A] uppercase font-bold tracking-wider">Unpaid Fines</div>
          <div className="text-2xl font-serif font-bold text-[#E06953] mt-1">₹{totalFinesUnpaid.toFixed(2)}</div>
          <div className="text-[10px] text-[#8A857A] mt-0.5">Pending recovery</div>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'overview', label: 'Analytics & Overview' },
          { id: 'books', label: `Books (${totalBooks})` },
          { id: 'copies', label: `Physical Copies (${totalCopies})` },
          { id: 'loans', label: `Circulation (${transactions.length})` },
          { id: 'reservations', label: `Holds (${reservations.length})` },
          { id: 'fines', label: `Fines & Waivers (${fines.length})` },
          { id: 'damages', label: `Damage Reports (${damages.length})` },
          { id: 'users', label: `Members (${users.length})` },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              activeAdminTab === tab.id
                ? 'bg-[#1D1D1F] text-white shadow-xs'
                : 'bg-white text-[#656157] hover:bg-[#FAF7EF] border border-[#EAE7DF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview & Analytics */}
      {activeAdminTab === 'overview' && (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Monthly Borrowing Trend Visual */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#1D1D1F]">
                  Circulation Velocity & Monthly Borrowing
                </h3>
                <p className="text-xs text-[#8A857A]">
                  Total loans issued across undergraduate and graduate academic departments
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                +18.4% this semester
              </span>
            </div>

            {/* SVG Interactive Trend Visual */}
            <div className="pt-4">
              <div className="h-56 flex items-end justify-between gap-3 px-2 pt-6">
                {[
                  { month: 'Apr', loans: 142, returns: 135 },
                  { month: 'May', loans: 210, returns: 198 },
                  { month: 'Jun', loans: 180, returns: 175 },
                  { month: 'Jul', loans: 95, returns: 90 },
                  { month: 'Aug', loans: 280, returns: 260 },
                  { month: 'Sep', loans: 390, returns: 310 },
                ].map((col) => {
                  const heightPercent = (col.loans / 420) * 100;
                  return (
                    <div key={col.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] text-[#8A857A] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        {col.loans} loans
                      </div>
                      <div className="w-full flex items-end justify-center gap-1.5 h-44 bg-[#FAF9F5] rounded-xl p-1.5">
                        <div 
                          style={{ height: `${heightPercent}%` }} 
                          className="w-1/2 bg-[#1D1D1F] rounded-md transition-all group-hover:bg-[#E06953]"
                        />
                        <div 
                          style={{ height: `${(col.returns / 420) * 100}%` }} 
                          className="w-1/2 bg-[#E0DDD2] rounded-md"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#1D1D1F]">{col.month}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 pt-4 text-xs text-[#656157]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#1D1D1F]" />
                  <span>Loans Issued</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#E0DDD2]" />
                  <span>Returned to Circulation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#1D1D1F]">
              Category Allocation
            </h3>
            <div className="space-y-3 pt-2">
              {libraryService.getCategories()
                .filter(c => (c.bookCount || 0) > 0)
                .sort((a, b) => (b.bookCount || 0) - (a.bookCount || 0))
                .slice(0, 5)
                .map((c, idx) => {
                  const colors = ['bg-[#E06953]', 'bg-[#1D1D1F]', 'bg-indigo-600', 'bg-amber-600', 'bg-emerald-600'];
                  const color = colors[idx % colors.length];
                  const percent = Math.max(1, Math.round(((c.bookCount || 0) / totalBooks) * 100));
                  return (
                    <div key={c.category_id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[#1D1D1F] truncate pr-2">{c.name}</span>
                        <span className="text-[#8A857A] font-bold shrink-0">{c.bookCount?.toLocaleString()} titles ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F5F4EE] overflow-hidden">
                        <div 
                          style={{ width: `${percent}%` }} 
                          className={`h-full rounded-full ${color}`} 
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-4 border-t border-[#F0EEE6] text-xs text-[#656157]">
              <p>Physical inventory health is optimal: <strong>92.4%</strong> of catalog volumes have active physical barcodes in the system.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Physical Copies Inventory (CRITICAL PROMPT REQUIREMENT) */}
      {activeAdminTab === 'copies' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EEE6]">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1D1D1F]">
                Physical Book Copies Inventory (BOOK_COPY)
              </h3>
              <p className="text-xs text-[#8A857A]">
                Each record represents an individual physical volume with barcode, condition, and shelf rack.
              </p>
            </div>

            <button
              onClick={() => setShowAddCopyModal(true)}
              className="px-4 py-2 bg-[#1D1D1F] text-white text-xs font-semibold rounded-full hover:bg-[#333336] flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Barcode</span>
            </button>
          </div>

          {/* Copies Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] text-[#8A857A] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Location / Shelf</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Circulation Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6]">
                {copies.map((copy) => {
                  const parentBook = books.find(b => b.book_id === copy.book_id);
                  return (
                    <tr key={copy.copy_id} className="hover:bg-[#FAF9F5]">
                      <td className="p-3 font-mono font-bold text-[#1D1D1F]">
                        {copy.barcode}
                      </td>
                      <td className="p-3 font-medium text-[#1D1D1F]">
                        {parentBook?.title || 'Unknown Title'}
                      </td>
                      <td className="p-3 text-[#656157] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E06953]" />
                        <span>{copy.location}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          copy.condition === 'MINT' ? 'bg-emerald-100 text-emerald-800' :
                          copy.condition === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                          copy.condition === 'FAIR' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {copy.condition}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={copy.status}
                          onChange={(e: any) => libraryService.updateCopyStatus(copy.copy_id, e.target.value)}
                          className="px-2 py-1 bg-[#F5F4EE] border border-[#DDD9CE] rounded-lg text-xs font-semibold text-[#1D1D1F]"
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="BORROWED">BORROWED</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="DAMAGED">DAMAGED</option>
                          <option value="LOST">LOST</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            const newLoc = prompt('Update rack location:', copy.location);
                            if (newLoc) libraryService.updateCopyStatus(copy.copy_id, copy.status, undefined, newLoc);
                          }}
                          className="px-2.5 py-1 text-[11px] text-[#656157] hover:text-[#1D1D1F] hover:bg-[#EAE8E0] rounded-lg"
                        >
                          Edit Rack
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Books Management */}
      {activeAdminTab === 'books' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EEE6]">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1D1D1F]">
                Catalog Titles Master
              </h3>
              <p className="text-xs text-[#8A857A]">
                Bibliographic metadata and aggregated physical copy availability.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8A857A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setBookTablePage(1);
                  }}
                  placeholder="Filter 10,000+ titles..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#FAF9F5] border border-[#EAE7DF] focus:outline-none focus:border-[#1D1D1F] w-48 sm:w-64"
                />
              </div>
              <button
                onClick={() => setShowAddBookModal(true)}
                className="px-4 py-2 bg-[#1D1D1F] text-white text-xs font-semibold rounded-full hover:bg-[#333336] flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Book</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8A857A] px-1">
            <span>
              Showing {filteredAdminBooks.length === 0 ? '0' : `${((safeBookTablePage - 1) * bookTablePageSize + 1).toLocaleString()}–${Math.min(safeBookTablePage * bookTablePageSize, filteredAdminBooks.length).toLocaleString()}`} of {filteredAdminBooks.length.toLocaleString()} titles ({totalBooks.toLocaleString()} collective archive)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookTablePage(p => Math.max(1, p - 1))}
                disabled={safeBookTablePage <= 1}
                className="p-1 rounded-lg border border-[#EAE7DF] bg-[#FAF9F5] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-medium text-[#1D1D1F]">
                {safeBookTablePage} / {totalBookPages}
              </span>
              <button
                onClick={() => setBookTablePage(p => Math.min(totalBookPages, p + 1))}
                disabled={safeBookTablePage >= totalBookPages}
                className="p-1 rounded-lg border border-[#EAE7DF] bg-[#FAF9F5] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] text-[#8A857A] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">ISBN</th>
                  <th className="p-3">Copies (Avail/Total)</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6]">
                {pagedAdminBooks.map((b) => (
                  <tr key={b.book_id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3">
                      <div className="font-serif font-bold text-sm text-[#1D1D1F]">{b.title}</div>
                      <div className="text-[10px] text-[#8A857A]">{b.publisher} ({b.publication_year})</div>
                    </td>
                    <td className="p-3 text-[#656157]">{b.authors.join(', ')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#F5F4EE] text-[#656157] font-medium">
                        {b.category_name}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#8A857A]">{b.isbn}</td>
                    <td className="p-3 font-semibold">
                      <span className={b.availableCopies > 0 ? 'text-emerald-700' : 'text-amber-700'}>
                        {b.availableCopies}
                      </span>
                      <span className="text-[#8A857A]"> / {b.totalCopies}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectBook(b.book_id)}
                        className="p-1.5 rounded-lg hover:bg-[#EAE8E0] text-[#1D1D1F]"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom pagination bar */}
          {totalBookPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-[#F0EEE6] text-xs">
              <span className="text-[#8A857A]">
                Page {safeBookTablePage} of {totalBookPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBookTablePage(1)}
                  disabled={safeBookTablePage <= 1}
                  className="px-2 py-1 rounded-md border border-[#EAE7DF] bg-[#FAF9F5] hover:bg-white text-[#656157] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setBookTablePage(p => Math.max(1, p - 1))}
                  disabled={safeBookTablePage <= 1}
                  className="px-3 py-1 rounded-md border border-[#EAE7DF] bg-[#FAF9F5] hover:bg-white text-[#656157] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setBookTablePage(p => Math.min(totalBookPages, p + 1))}
                  disabled={safeBookTablePage >= totalBookPages}
                  className="px-3 py-1 rounded-md border border-[#EAE7DF] bg-[#FAF9F5] hover:bg-white text-[#656157] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setBookTablePage(totalBookPages)}
                  disabled={safeBookTablePage >= totalBookPages}
                  className="px-2 py-1 rounded-md border border-[#EAE7DF] bg-[#FAF9F5] hover:bg-white text-[#656157] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Circulation Loans */}
      {activeAdminTab === 'loans' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#1D1D1F] pb-3 border-b border-[#F0EEE6]">
            Circulation Transactions Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] text-[#8A857A] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Tx ID</th>
                  <th className="p-3">Borrower</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6]">
                {transactions.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3 font-mono text-[11px] text-[#8A857A]">{tx.transaction_id}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#1D1D1F]">{tx.userName}</div>
                      <div className="text-[10px] text-[#8A857A]">{tx.userEmail}</div>
                    </td>
                    <td className="p-3 font-serif font-bold text-sm text-[#1D1D1F]">{tx.bookTitle}</td>
                    <td className="p-3 font-mono text-xs">{tx.barcode}</td>
                    <td className="p-3 text-[#656157]">{tx.due_date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        tx.status === 'OVERDUE' ? 'bg-amber-100 text-amber-800' :
                        'bg-neutral-100 text-neutral-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {tx.status !== 'RETURNED' && (
                        <button
                          onClick={() => {
                            const res = libraryService.returnBook(tx.transaction_id);
                            alert(res.message);
                          }}
                          className="px-3 py-1 bg-[#1D1D1F] text-white text-[11px] font-medium rounded-full hover:bg-[#333336]"
                        >
                          Check In Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Fines & Waivers */}
      {activeAdminTab === 'fines' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#1D1D1F] pb-3 border-b border-[#F0EEE6]">
            Fine Accounts & Waiver Approvals
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] text-[#8A857A] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Fine ID</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Librarian Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6]">
                {fines.map((f) => (
                  <tr key={f.fine_id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3 font-mono text-[#8A857A]">{f.fine_id}</td>
                    <td className="p-3 font-bold text-[#1D1D1F]">{f.userName}</td>
                    <td className="p-3 text-[#656157]">{f.description}</td>
                    <td className="p-3 font-bold text-sm text-[#E06953]">₹{f.amount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.status === 'UNPAID' ? 'bg-amber-100 text-amber-800' :
                        f.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {f.status === 'UNPAID' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => libraryService.waiveFine(f.fine_id, 'Dr. K. S. Radhakrishnan')}
                            className="px-2.5 py-1 text-[11px] bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg"
                          >
                            Waive Fine
                          </button>
                          <button
                            onClick={() => libraryService.payFine(f.fine_id)}
                            className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
                          >
                            Mark Paid
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Damage Reports */}
      {activeAdminTab === 'damages' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#1D1D1F] pb-3 border-b border-[#F0EEE6]">
            Damage & Inspection Assessment Reports
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] text-[#8A857A] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Damage Description</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6]">
                {damages.map((d) => (
                  <tr key={d.damage_id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3 font-mono font-bold">{d.barcode}</td>
                    <td className="p-3 font-serif font-bold">{d.bookTitle}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.severity === 'SEVERE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.severity}
                      </span>
                    </td>
                    <td className="p-3 text-[#656157] max-w-xs">{d.description}</td>
                    <td className="p-3 font-semibold">{d.status}</td>
                    <td className="p-3 text-[#8A857A] italic">{d.action_taken || 'Pending assessment'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Audit Log */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#1D1D1F] pb-3 border-b border-[#F0EEE6]">
            System & Security Audit Trail
          </h3>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.log_id} className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#8A857A]">{log.timestamp}</span>
                  <span className="px-2 py-0.5 rounded bg-[#EAE8E0] text-[10px] font-bold font-mono text-[#1D1D1F]">
                    {log.action}
                  </span>
                  <span className="text-[#656157]">{log.metadata}</span>
                </div>
                <span className="text-[11px] text-[#8A857A]">By {log.userName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Members */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-xs space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#1D1D1F] pb-3 border-b border-[#F0EEE6]">
            Registered Members Directory
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] text-[#8A857A] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Member</th>
                  <th className="p-3">Membership ID</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3 flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-[#1D1D1F]">{u.name}</div>
                        <div className="text-[10px] text-[#8A857A]">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{u.membershipId}</td>
                    <td className="p-3 text-[#656157]">{u.department}</td>
                    <td className="p-3 uppercase text-[10px] font-bold">{u.role}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-[#EAE7DF] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">Register New Book Title</h3>

            <form onSubmit={handleAddBook} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus in Cloud Systems"
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#656157] mb-1">Primary Author *</label>
                  <input
                    type="text"
                    required
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="e.g. Leslie Lamport"
                    className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#656157] mb-1">Category</label>
                  <select
                    value={newBookCategory}
                    onChange={(e) => setNewBookCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                  >
                    {libraryService.getCategories().map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#656157] mb-1">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={newBookIsbn}
                    onChange={(e) => setNewBookIsbn(e.target.value)}
                    placeholder="978-0-12345-678-9"
                    className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#656157] mb-1">Publication Year</label>
                  <input
                    type="number"
                    value={newBookYear}
                    onChange={(e) => setNewBookYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Publisher</label>
                <input
                  type="text"
                  value={newBookPublisher}
                  onChange={(e) => setNewBookPublisher(e.target.value)}
                  placeholder="MIT Press / O'Reilly"
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  value={newBookImage}
                  onChange={(e) => setNewBookImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  placeholder="Summary of contents..."
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 text-xs text-[#656157] hover:bg-[#F5F4EE] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-[#1D1D1F] text-white hover:bg-[#333336] rounded-full"
                >
                  Save Title to Stacks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Copy Modal */}
      {showAddCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-[#EAE7DF] shadow-2xl space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">Register Physical Copy (BOOK_COPY)</h3>
            <p className="text-xs text-[#656157]">
              Instantiates a new physical book volume with a barcode for shelf tracking.
            </p>

            <form onSubmit={handleAddCopy} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Select Catalog Title</label>
                <select
                  value={selectedBookForCopy}
                  onChange={(e) => setSelectedBookForCopy(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                >
                  {books.map(b => (
                    <option key={b.book_id} value={b.book_id}>{b.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Stack / Rack Shelf Location *</label>
                <input
                  type="text"
                  required
                  value={newCopyLocation}
                  onChange={(e) => setNewCopyLocation(e.target.value)}
                  placeholder="e.g. Floor 3, Shelf B-14"
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Initial Physical Condition</label>
                <select
                  value={newCopyCondition}
                  onChange={(e: any) => setNewCopyCondition(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white"
                >
                  <option value="MINT">MINT (Brand New Circulation)</option>
                  <option value="GOOD">GOOD (Intact Spine, No Marks)</option>
                  <option value="FAIR">FAIR (Minor Edge Wear)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCopyModal(false)}
                  className="px-4 py-2 text-xs text-[#656157] hover:bg-[#F5F4EE] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-[#1D1D1F] text-white hover:bg-[#333336] rounded-full"
                >
                  Provision Barcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
