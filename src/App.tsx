import React, { useState, useEffect } from 'react';
import { libraryService } from './services/libraryService';
import { 
  Book, BookCopy, User, BorrowTransaction, Reservation, Fine,
  DamageReport, AuditLog, Category, LibraryNotification 
} from './types';

import { LandingPage } from './components/layout/LandingPage';
import { AppLayout, ActiveTab } from './components/layout/AppLayout';
import { AuthModal } from './components/auth/AuthModal';
import { MemberDashboard } from './components/member/MemberDashboard';
import { BookCatalog } from './components/books/BookCatalog';
import { BookDetailView } from './components/books/BookDetailView';
import { MyBooksView } from './components/member/MyBooksView';
import { ReservationsView } from './components/member/ReservationsView';
import { FinesView } from './components/member/FinesView';
import { LibraryAIChat } from './components/assistant/LibraryAIChat';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserProfileView } from './components/profile/UserProfileView';
import { ReaderModal } from './components/books/ReaderModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const isPort3001 = typeof window !== 'undefined' && window.location.port === '3001';

  // Global State managed by LibraryService
  const [currentUser, setCurrentUser] = useState<User | null>(libraryService.getCurrentUser());
  const [books, setBooks] = useState<Book[]>(libraryService.getBooks());
  const [copies, setCopies] = useState<BookCopy[]>(libraryService.getCopies());
  const [categories, setCategories] = useState<Category[]>(libraryService.getCategories());
  const [transactions, setTransactions] = useState<BorrowTransaction[]>(libraryService.getTransactions());
  const [reservations, setReservations] = useState<Reservation[]>(libraryService.getReservations());
  const [fines, setFines] = useState<Fine[]>(libraryService.getFines());
  const [damages, setDamages] = useState<DamageReport[]>(libraryService.getDamageReports());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(libraryService.getAuditLogs());
  const [notifications, setNotifications] = useState<LibraryNotification[]>(libraryService.getNotifications());
  const [wishlistBookIds, setWishlistBookIds] = useState<string[]>(['book-got-world']);

  // Navigation State: If logged in as admin or on admin port 3001, default to 'admin' (Library Operations Command)
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const user = libraryService.getCurrentUser();
    if (user?.role === 'admin' || isPort3001) return 'admin';
    return 'home';
  });
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [readingBookId, setReadingBookId] = useState<string | null>(null);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Unified Auth Modal & Feedback
  const [showAuthModal, setShowAuthModal] = useState(isPort3001 && !libraryService.getCurrentUser());
  const [authRole, setAuthRole] = useState<'admin' | 'member'>(isPort3001 ? 'admin' : 'member');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Hidden Administrative Gateway listeners:
  // 1. Keyboard combo: Ctrl + Shift + A (or Alt + Shift + A)
  // 2. URL hash: #admin or query param ?admin=true
  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=')) {
        setAuthRole('admin');
        setShowAuthModal(true);
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setAuthRole('admin');
        setShowAuthModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Subscribe to library service updates
  useEffect(() => {
    const unsubscribe = libraryService.subscribe(() => {
      setCurrentUser(libraryService.getCurrentUser());
      setBooks(libraryService.getBooks());
      setCopies(libraryService.getCopies());
      setCategories(libraryService.getCategories());
      setTransactions(libraryService.getTransactions());
      setReservations(libraryService.getReservations());
      setFines(libraryService.getFines());
      setDamages(libraryService.getDamageReports());
      setAuditLogs(libraryService.getAuditLogs());
      setNotifications(libraryService.getNotifications());
    });
    return () => unsubscribe();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Actions
  const handleBorrow = (bookId: string, copyId?: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const res = libraryService.borrowBook(bookId, copyId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleReserve = (bookId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const res = libraryService.reserveBook(bookId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleReturn = (txId: string) => {
    const res = libraryService.returnBook(txId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCancelReservation = (resId: string) => {
    const res = libraryService.cancelReservation(resId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handlePayFine = (fineId: string) => {
    const res = libraryService.payFine(fineId);
    if (res.success) {
      showToast(res.message, 'success');
    }
  };

  const handleAddReview = (bookId: string, review: string, rating: number, chapterTag?: string) => {
    libraryService.addReview(bookId, review, rating, chapterTag);
    showToast('Review published to university reader feed!', 'success');
  };

  const handleToggleWishlist = (bookId: string) => {
    setWishlistBookIds(prev => {
      const exists = prev.includes(bookId);
      const next = exists ? prev.filter(id => id !== bookId) : [...prev, bookId];
      showToast(exists ? 'Removed from saved wishlist' : 'Added to saved wishlist', 'success');
      return next;
    });
  };

  const handleAskAIAboutBook = (book: Book) => {
    setAiInitialPrompt(`Tell me about "${book.title}" by ${book.authors.join(', ')}. Where is it located and are copies available?`);
    setSelectedBookId(null);
    setActiveTab('assistant');
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    setActiveTab('catalog');
    setSelectedBookId(null);
  };

  // Currently Selected Book Object
  const selectedBook = selectedBookId ? books.find(b => b.book_id === selectedBookId) : null;
  const readingBook = readingBookId ? books.find(b => b.book_id === readingBookId) : null;

  // Filtered transactions & reservations for active user
  const userTransactions = currentUser
    ? transactions.filter(t => t.user_id === currentUser.id)
    : [];
  const userReservations = currentUser
    ? reservations.filter(r => r.user_id === currentUser.id)
    : [];
  const userFines = currentUser
    ? fines.filter(f => f.user_id === currentUser.id)
    : [];

  const wishlistBooks = books.filter(b => wishlistBookIds.includes(b.book_id));

  return (
    <div className="min-h-screen bg-[#F5F4EE] text-[#1D1D1F] selection:bg-[#E06953] selection:text-white font-sans">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1D1D1F] text-white shadow-2xl text-xs sm:text-sm max-w-md border border-white/10">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reader Modal Spread */}
      {readingBook && (
        <ReaderModal
          book={readingBook}
          onClose={() => setReadingBookId(null)}
        />
      )}

      {/* Unified Authentication Modal (Admin and Member routes automatically) */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            if (window.location.hash === '#admin') {
              history.replaceState(null, '', window.location.pathname);
            }
          }}
          initialMode={authMode}
          initialRole={authRole}
          onSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
            if (user.role === 'admin') {
              setActiveTab('admin');
              showToast(`Welcome Administrator ${user.name}! Routing to Library Operations Command.`, 'success');
            } else {
              setActiveTab('home');
              showToast(`Welcome back, ${user.name}! Session secured with JWT.`, 'success');
            }
          }}
        />
      )}

      {/* View Logic: If user is not authenticated and hasn't explicitly entered app, show Landing Page */}
      {!currentUser ? (
        <LandingPage
          onGetStarted={() => {
            setAuthRole('member');
            setAuthMode('signup');
            setShowAuthModal(true);
          }}
          onSignIn={() => {
            setAuthRole('member');
            setAuthMode('signin');
            setShowAuthModal(true);
          }}
          onExploreCatalogue={() => {
            setAuthRole('member');
            setAuthMode('signin');
            setShowAuthModal(true);
          }}
          featuredBooks={books}
          onSelectBook={(bookId: string) => {
            setSelectedBookId(bookId);
            setAuthRole('member');
            setAuthMode('signin');
            setShowAuthModal(true);
          }}
          onOpenAdminGateway={() => {
            setAuthRole('admin');
            setAuthMode('signin');
            setShowAuthModal(true);
          }}
        />
      ) : (
        /* Authenticated Application Experience */
        <AppLayout
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedBookId(null);
            setActiveTab(tab);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onLogout={() => {
            libraryService.logout();
            setCurrentUser(null);
            showToast('Signed out of Smart Library system.');
          }}
          notifications={notifications}
          onMarkNotificationRead={(id) => libraryService.markNotificationRead(id)}
        >
          {/* If a book detail is selected, render BookDetailView */}
          {selectedBook ? (
            <BookDetailView
              book={selectedBook}
              copies={copies.filter(c => c.book_id === selectedBook.book_id)}
              reviews={libraryService.getReviewsForBook(selectedBook.book_id)}
              currentUser={currentUser}
              allBooks={books}
              onBack={() => setSelectedBookId(null)}
              onSelectBook={(bookId) => setSelectedBookId(bookId)}
              onBorrow={(bookId, copyId) => handleBorrow(bookId, copyId)}
              onReserve={(bookId) => handleReserve(bookId)}
              onAddReview={(text, rating, chapter) => handleAddReview(selectedBook.book_id, text, rating, chapter)}
              onAskAI={(b) => handleAskAIAboutBook(b)}
              isWishlisted={wishlistBookIds.includes(selectedBook.book_id)}
              onToggleWishlist={() => handleToggleWishlist(selectedBook.book_id)}
            />
          ) : (
            <>
              {/* Administrator Experience: Directly accesses Library Operations Command */}
              {currentUser.role === 'admin' ? (
                <>
                  {activeTab === 'admin' && (
                    <AdminDashboard
                      books={books}
                      copies={copies}
                      users={libraryService.getUsers()}
                      transactions={transactions}
                      reservations={reservations}
                      fines={fines}
                      damages={damages}
                      auditLogs={auditLogs}
                      onSelectBook={(id) => setSelectedBookId(id)}
                    />
                  )}

                  {activeTab === 'catalog' && (
                    <BookCatalog
                      books={books}
                      categories={categories}
                      onSelectBook={(id) => setSelectedBookId(id)}
                      onBorrowBook={(id) => handleBorrow(id)}
                      onReserveBook={(id) => handleReserve(id)}
                      onAskAI={(b) => handleAskAIAboutBook(b)}
                      initialSearch={searchQuery}
                    />
                  )}

                  {(activeTab === 'profile' || activeTab === 'settings') && (
                    <UserProfileView
                      currentUser={currentUser}
                      wishlistBooks={wishlistBooks}
                      onSelectBook={(id) => setSelectedBookId(id)}
                      onBrowseCatalogue={() => setActiveTab('catalog')}
                    />
                  )}

                  {/* Fallback for admin if unexpected tab is reached */}
                  {activeTab !== 'admin' && activeTab !== 'catalog' && activeTab !== 'profile' && activeTab !== 'settings' && (
                    <AdminDashboard
                      books={books}
                      copies={copies}
                      users={libraryService.getUsers()}
                      transactions={transactions}
                      reservations={reservations}
                      fines={fines}
                      damages={damages}
                      auditLogs={auditLogs}
                      onSelectBook={(id) => setSelectedBookId(id)}
                    />
                  )}
                </>
              ) : (
                /* Regular Academic Member Experience */
                <>
                  {/* Tab: Home (Editorial Member Dashboard) */}
                  {activeTab === 'home' && (
                    <MemberDashboard
                      currentUser={currentUser}
                      books={books}
                      transactions={userTransactions}
                      reservations={userReservations}
                      fines={userFines}
                      onSelectBook={(id) => setSelectedBookId(id)}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                      onStartReading={(bookId) => setReadingBookId(bookId)}
                    />
                  )}

                  {/* Tab: Catalog (All Books with Filters) */}
                  {activeTab === 'catalog' && (
                    <BookCatalog
                      books={books}
                      categories={categories}
                      onSelectBook={(id) => setSelectedBookId(id)}
                      onBorrowBook={(id) => handleBorrow(id)}
                      onReserveBook={(id) => handleReserve(id)}
                      onAskAI={(b) => handleAskAIAboutBook(b)}
                      initialSearch={searchQuery}
                    />
                  )}

                  {/* Tab: My Borrowed Books */}
                  {activeTab === 'my-books' && (
                    <MyBooksView
                      transactions={userTransactions}
                      onReturnBook={(txId) => handleReturn(txId)}
                      onSelectBook={(id) => setSelectedBookId(id)}
                      onBrowseCatalogue={() => setActiveTab('catalog')}
                    />
                  )}

                  {/* Tab: Reservations / Hold Queue */}
                  {activeTab === 'reservations' && (
                    <ReservationsView
                      reservations={userReservations}
                      onCancelReservation={(id) => handleCancelReservation(id)}
                      onSelectBook={(id) => setSelectedBookId(id)}
                      onBrowseCatalogue={() => setActiveTab('catalog')}
                    />
                  )}

                  {/* Tab: Fines & Assessments (INR ₹) */}
                  {activeTab === 'fines' && (
                    <FinesView
                      fines={userFines}
                      onPayFine={(fineId) => handlePayFine(fineId)}
                    />
                  )}

                  {/* Tab: Curated Recommendations */}
                  {activeTab === 'recommendations' && (
                    <RecommendationsView
                      currentUser={currentUser}
                      onSelectBook={(id) => setSelectedBookId(id)}
                      onAskAI={() => setActiveTab('assistant')}
                    />
                  )}

                  {/* Tab: Conversational Library AI */}
                  {activeTab === 'assistant' && (
                    <LibraryAIChat
                      onSelectBook={(id) => setSelectedBookId(id)}
                      initialPrompt={aiInitialPrompt}
                    />
                  )}

                  {/* Tab: User Profile & Cards */}
                  {(activeTab === 'profile' || activeTab === 'settings') && (
                    <UserProfileView
                      currentUser={currentUser}
                      wishlistBooks={wishlistBooks}
                      onSelectBook={(id) => setSelectedBookId(id)}
                      onBrowseCatalogue={() => setActiveTab('catalog')}
                    />
                  )}
                </>
              )}
            </>
          )}
        </AppLayout>
      )}
    </div>
  );
}
