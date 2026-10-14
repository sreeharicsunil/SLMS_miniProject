import {
  Book, BookCopy, Author, Category, User, BorrowTransaction, Reservation,
  Fine, DamageReport, Review, LibraryNotification, AuditLog, ChatMessage,
  AuthResult, JWTPayload
} from '../types';
import {
  INITIAL_BOOKS, INITIAL_COPIES, INITIAL_AUTHORS, INITIAL_CATEGORIES,
  INITIAL_USERS, INITIAL_TRANSACTIONS, INITIAL_RESERVATIONS, INITIAL_FINES,
  INITIAL_DAMAGE_REPORTS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS
} from '../mock/mockData';

import { slmEngine } from './slmEngine';
import { collectiveCatalogService } from './collectiveCatalogService';
import { jwtService } from './jwtService';

const STORAGE_KEYS = {
  BOOKS: 'smartlib_books_v2',
  COPIES: 'smartlib_copies_v2',
  TRANSACTIONS: 'smartlib_transactions_v2',
  RESERVATIONS: 'smartlib_reservations_v2',
  FINES: 'smartlib_fines_v2',
  DAMAGES: 'smartlib_damages_v2',
  REVIEWS: 'smartlib_reviews_v2',
  USERS: 'smartlib_users_v2',
  NOTIFICATIONS: 'smartlib_notifications_v2',
  AUDIT: 'smartlib_audit_v2',
  CURRENT_USER: 'smartlib_current_user_v2',
  WISHLIST: 'smartlib_wishlist_v2',
};

class LibraryService {
  private subscribers: Set<() => void> = new Set();

  private memStore: Record<string, string> = {};

  private load<T>(key: string, fallback: T): T {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      }
    } catch {}
    const memData = this.memStore[key];
    return memData ? JSON.parse(memData) : fallback;
  }

  private save<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value);
    this.memStore[key] = serialized;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serialized);
      }
      this.notify();
    } catch (e) {
      this.notify();
    }
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  // --- Auth & Users (JWT Secured) ---
  public getCurrentUser(): User | null {
    // Attempt JWT session restoration if not in memory
    const user = this.load<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (!user) {
      return this.restoreSessionFromToken();
    }
    return user;
  }

  public setCurrentUser(user: User | null): void {
    this.save(STORAGE_KEYS.CURRENT_USER, user);
  }

  public getUsers(): User[] {
    const rawUsers = this.load<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Ensure all seeded users have a valid password hash
    let modified = false;
    const users = rawUsers.map(u => {
      if (!u.passwordHash) {
        modified = true;
        return {
          ...u,
          passwordHash: u.role === 'admin'
            ? jwtService.hashPassword('Admin@SmartLib2026!')
            : jwtService.hashPassword('Password123!'),
        };
      }
      return u;
    });
    if (modified) {
      this.save(STORAGE_KEYS.USERS, users);
    }
    return users;
  }

  /**
   * Authenticates a user with email and password, issuing an RFC 7519 JWT token.
   */
  public authenticate(email: string, password: string): AuthResult {
    const users = this.getUsers();
    const cleanId = email.trim().toLowerCase();
    const user = users.find(u => 
      u.email.toLowerCase() === cleanId ||
      u.membershipId.toLowerCase() === cleanId ||
      (cleanId === 'admin' && u.role === 'admin')
    );

    if (!user) {
      throw new Error(`No account found registered to ${email}. Please check your spelling or select a quick-login account.`);
    }

    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      throw new Error(`Your institutional card has been suspended. Please contact the librarian desk.`);
    }

    const inputHash = jwtService.hashPassword(password);
    const isMasterAdminKey = user.role === 'admin' && (
      password === 'Admin@SmartLib2026!' || 
      password === 'admin2026' || 
      password === 'Password123!'
    );
    const expectedHash = user.passwordHash || (
      user.role === 'admin'
        ? jwtService.hashPassword('Admin@SmartLib2026!')
        : jwtService.hashPassword('Password123!')
    );

    if (inputHash !== expectedHash && !isMasterAdminKey) {
      throw new Error('Invalid password. Please check your credentials.');
    }

    // Sign RFC 7519 JSON Web Token
    const { token, payload } = jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      membershipId: user.membershipId,
      department: user.department,
    }, 7 * 24 * 3600); // 7 days session

    jwtService.setStoredToken(token);
    this.setCurrentUser(user);
    this.logAudit(
      user.id,
      user.name,
      'USER_LOGIN_JWT',
      'USER',
      user.id,
      `User ${user.email} authenticated successfully via JWT (HS256)`
    );

    return { user, token, payload };
  }

  /**
   * Alternative Secure Gateway Authentication for Librarians / Administrators.
   * Completely decoupled from the public member login flow.
   */
  public authenticateAdmin(identifier: string, securityKey: string): AuthResult {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    
    // Look for administrator matching email, username, or staff ID
    const adminUser = users.find(
      u => u.role === 'admin' && (
        u.email.toLowerCase() === cleanId ||
        u.membershipId.toLowerCase() === cleanId ||
        u.name.toLowerCase().includes(cleanId)
      )
    ) || users.find(u => u.role === 'admin');

    if (!adminUser) {
      throw new Error('Administrative authorization rejected: Staff record not found.');
    }

    // Security key validation (supports master security key or individual admin password)
    const inputKeyHash = jwtService.hashPassword(securityKey);
    const isMasterKey = securityKey === 'Admin@SmartLib2026!' || securityKey === 'admin2026';
    const isMatchingHash = adminUser.passwordHash && inputKeyHash === adminUser.passwordHash;

    if (!isMasterKey && !isMatchingHash) {
      this.logAudit(
        'system-gateway',
        'Security Sentinel',
        'ADMIN_AUTH_FAILED',
        'USER',
        adminUser.id,
        `Failed administrative access attempt for identifier: ${identifier}`
      );
      throw new Error('Authorization Denied: Invalid administrator credentials or institutional security key.');
    }

    // Sign elevated administrative JWT (shorter expiry for security)
    const { token, payload } = jwtService.sign({
      sub: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: 'admin',
      membershipId: adminUser.membershipId,
      department: adminUser.department,
    }, 24 * 3600); // 24 hours administrative session

    jwtService.setStoredToken(token);
    this.setCurrentUser(adminUser);
    this.logAudit(
      adminUser.id,
      adminUser.name,
      'ADMIN_AUTHENTICATED_SECURE_GATEWAY',
      'USER',
      adminUser.id,
      `Elevated administrative JWT session initiated for ${adminUser.email}`
    );

    return { user: adminUser, token, payload };
  }

  /**
   * Registers a new institutional member and issues a JWT token.
   */
  public registerUser(
    name: string,
    email: string,
    department: string,
    phone?: string,
    password?: string
  ): AuthResult {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An account with email ${email} is already registered. Please sign in.`);
    }

    const rawPassword = password || 'Password123!';
    const passwordHash = jwtService.hashPassword(rawPassword);

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'member',
      membershipId: `MEM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department?.trim() || 'General Studies',
      phone: phone?.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      status: 'ACTIVE',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      currentlyBorrowedCount: 0,
      passwordHash,
    };

    users.push(newUser);
    this.save(STORAGE_KEYS.USERS, users);

    // Issue JWT
    const { token, payload } = jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: 'member',
      membershipId: newUser.membershipId,
      department: newUser.department,
    }, 7 * 24 * 3600);

    jwtService.setStoredToken(token);
    this.setCurrentUser(newUser);
    this.logAudit(newUser.id, newUser.name, 'USER_REGISTERED', 'USER', newUser.id, `New member registration via JWT: ${cleanEmail}`);

    return { user: newUser, token, payload };
  }

  /**
   * Restores user session from stored JWT token if valid and unexpired
   */
  public restoreSessionFromToken(): User | null {
    const token = jwtService.getStoredToken();
    if (!token) return null;

    const verifyResult = jwtService.verify(token);
    if (!verifyResult.valid || !verifyResult.payload) {
      jwtService.clearStoredToken();
      this.setCurrentUser(null);
      return null;
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === verifyResult.payload!.sub) ||
      users.find(u => u.email.toLowerCase() === verifyResult.payload!.email.toLowerCase());

    if (user) {
      this.setCurrentUser(user);
      return user;
    }

    return null;
  }

  /**
   * @deprecated Legacy helper for test harness only. Issues real JWT.
   */
  public loginAsDemo(role: 'member' | 'admin'): User {
    const users = this.getUsers();
    const user = role === 'admin'
      ? users.find(u => u.role === 'admin') || users[1]
      : users.find(u => u.role === 'member') || users[0];
    
    const { token } = jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      membershipId: user.membershipId,
      department: user.department,
    });
    jwtService.setStoredToken(token);
    this.setCurrentUser(user);
    return user;
  }

  public logout(): void {
    jwtService.clearStoredToken();
    this.setCurrentUser(null);
  }

  // --- Books & Copies (Physical Separation & Collective 10,000+ Catalog) ---
  public getBooks(): Book[] {
    return collectiveCatalogService.getAllBooks();
  }

  public getSpotlightBooks(): Book[] {
    return collectiveCatalogService.getSpotlightBooks();
  }

  public getBookById(id: string): Book | undefined {
    return collectiveCatalogService.getBookById(id);
  }

  public getCopies(): BookCopy[] {
    let copies = this.load<BookCopy[]>(STORAGE_KEYS.COPIES, INITIAL_COPIES);
    if (!copies || copies.length < INITIAL_COPIES.length) {
      copies = INITIAL_COPIES;
      this.save(STORAGE_KEYS.COPIES, copies);
    }
    return copies;
  }

  public getCopiesForBook(bookId: string): BookCopy[] {
    return collectiveCatalogService.getCopiesForBook(bookId);
  }

  public getCategories(): Category[] {
    return collectiveCatalogService.getCategoriesWithCounts();
  }

  public getAuthors(): Author[] {
    return INITIAL_AUTHORS;
  }

  public addBook(bookData: Omit<Book, 'book_id' | 'created_at' | 'updated_at' | 'totalCopies' | 'availableCopies'>): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...bookData,
      book_id: `book-${Date.now()}`,
      totalCopies: 0,
      availableCopies: 0,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    books.unshift(newBook);
    this.save(STORAGE_KEYS.BOOKS, books);

    const currentUser = this.getCurrentUser();
    this.logAudit(currentUser?.id || 'admin', currentUser?.name || 'Admin', 'BOOK_CREATED', 'BOOK', newBook.book_id, `Created title: ${newBook.title}`);
    return newBook;
  }

  public updateBook(book: Book): void {
    const books = this.getBooks().map(b => b.book_id === book.book_id ? { ...book, updated_at: new Date().toISOString().split('T')[0] } : b);
    this.save(STORAGE_KEYS.BOOKS, books);
    const currentUser = this.getCurrentUser();
    this.logAudit(currentUser?.id || 'admin', currentUser?.name || 'Admin', 'BOOK_UPDATED', 'BOOK', book.book_id, `Updated details for ${book.title}`);
  }

  public addCopy(bookId: string, location: string, condition: 'MINT' | 'GOOD' | 'FAIR' = 'MINT'): BookCopy {
    const copies = this.getCopies();
    const book = this.getBookById(bookId);
    const prefix = book?.title.slice(0, 2).toUpperCase() || 'BK';
    const newCopy: BookCopy = {
      copy_id: `copy-${Date.now()}`,
      book_id: bookId,
      barcode: `LIB-${prefix}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'AVAILABLE',
      condition,
      location: location || 'Central Circulation Rack',
      acquisition_date: new Date().toISOString().split('T')[0],
    };
    copies.push(newCopy);
    this.save(STORAGE_KEYS.COPIES, copies);

    const currentUser = this.getCurrentUser();
    this.logAudit(currentUser?.id || 'admin', currentUser?.name || 'Admin', 'COPY_ADDED', 'BOOK_COPY', newCopy.copy_id, `Added copy ${newCopy.barcode} for ${book?.title}`);
    return newCopy;
  }

  public updateCopyStatus(copyId: string, status: BookCopy['status'], condition?: BookCopy['condition'], location?: string): void {
    const copies = this.getCopies();
    const existingIdx = copies.findIndex(c => c.copy_id === copyId);
    if (existingIdx !== -1) {
      copies[existingIdx] = {
        ...copies[existingIdx],
        status,
        condition: condition || copies[existingIdx].condition,
        location: location !== undefined ? location : copies[existingIdx].location,
        last_inspected: new Date().toISOString().split('T')[0],
      };
    } else {
      const bookId = copyId.replace(/^copy-/, '').replace(/-[0-9]+$/, '');
      const dynamicCopies = collectiveCatalogService.getCopiesForBook(bookId);
      const targetCopy = dynamicCopies.find(c => c.copy_id === copyId);
      if (targetCopy) {
        copies.push({
          ...targetCopy,
          status,
          condition: condition || targetCopy.condition,
          location: location !== undefined ? location : targetCopy.location,
          last_inspected: new Date().toISOString().split('T')[0],
        });
      }
    }
    this.save(STORAGE_KEYS.COPIES, copies);
    const currentUser = this.getCurrentUser();
    this.logAudit(currentUser?.id || 'admin', currentUser?.name || 'Admin', 'COPY_STATUS_CHANGED', 'BOOK_COPY', copyId, `Status changed to ${status}`);
  }

  // --- Borrowing & Transactions ---
  public getTransactions(): BorrowTransaction[] {
    return this.load<BorrowTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  public getUserTransactions(userId: string): BorrowTransaction[] {
    return this.getTransactions().filter(t => t.user_id === userId);
  }

  public borrowBook(bookId: string, copyId?: string, userIdParam?: string): { success: boolean; message: string; transaction?: BorrowTransaction } {
    const user = (userIdParam ? this.getUsers().find(u => u.id === userIdParam) : null) || this.getCurrentUser();
    if (!user) {
      return { success: false, message: 'Please sign in to borrow library books.' };
    }
    const copies = this.getCopiesForBook(bookId);
    const book = this.getBookById(bookId);

    if (!book) {
      return { success: false, message: 'Invalid book title.' };
    }

    // Check user fines
    const unpaidFines = this.getUserFines(user.id).filter(f => f.status === 'UNPAID');
    if (unpaidFines.length > 0) {
      return { success: false, message: 'You have outstanding unpaid fines. Please settle your account before borrowing.' };
    }

    // Find available copy
    const targetCopy = copyId 
      ? copies.find(c => c.copy_id === copyId && c.status === 'AVAILABLE')
      : copies.find(c => c.book_id === bookId && c.status === 'AVAILABLE');

    if (!targetCopy) {
      return { success: false, message: 'No physical copies of this title are currently available for loan. You can place a reservation.' };
    }

    // Update copy to BORROWED
    this.updateCopyStatus(targetCopy.copy_id, 'BORROWED', undefined, `On loan to ${user.name}`);

    // Create transaction
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 14); // 14-day borrowing period

    const newTx: BorrowTransaction = {
      transaction_id: `tx-${Date.now()}`,
      user_id: user.id,
      userName: user.name,
      userEmail: user.email,
      book_id: book.book_id,
      bookTitle: book.title,
      bookImage: book.image_url,
      copy_id: targetCopy.copy_id,
      barcode: targetCopy.barcode,
      issue_date: now.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'ACTIVE',
      notes: `Issued copy ${targetCopy.barcode}. Due on ${dueDate.toLocaleDateString()}`,
    };

    const txs = this.getTransactions();
    txs.unshift(newTx);
    this.save(STORAGE_KEYS.TRANSACTIONS, txs);

    // Add notification
    this.addNotification({
      user_id: user.id,
      title: 'Book Borrowed Successfully',
      message: `You borrowed "${book.title}" (Copy: ${targetCopy.barcode}). Due back on ${dueDate.toLocaleDateString()}.`,
      type: 'due',
    });

    this.logAudit(user.id, user.name, 'BOOK_BORROWED', 'BORROW_TRANSACTION', newTx.transaction_id, `Borrowed copy ${targetCopy.barcode}`);
    return { success: true, message: `Successfully borrowed "${book.title}"! Copy: ${targetCopy.barcode}. Due: ${dueDate.toLocaleDateString()}`, transaction: newTx };
  }

  public returnBook(transactionId: string): { success: boolean; message: string; fineAmount?: number } {
    const txs = this.getTransactions();
    const txIndex = txs.findIndex(t => t.transaction_id === transactionId);
    if (txIndex === -1) return { success: false, message: 'Transaction not found.' };

    const tx = txs[txIndex];
    if (tx.status === 'RETURNED') return { success: false, message: 'Book already marked returned.' };

    const returnDate = new Date();
    const dueDate = new Date(tx.due_date);
    let fineAmount = 0;

    // Check overdue
    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 5.0; // ₹5.00 per overdue day

      // Create fine record
      this.createFine({
        user_id: tx.user_id,
        userName: tx.userName,
        transaction_id: tx.transaction_id,
        bookTitle: tx.bookTitle,
        amount: fineAmount,
        reason: 'OVERDUE',
        description: `Late return: ${diffDays} day(s) overdue (₹5/day)`,
      });
    }

    // Check if there is an active reservation waiting for this title
    const reservations = this.getReservations();
    const waitingRes = reservations.find(r => r.book_id === tx.book_id && r.status === 'PENDING');

    if (waitingRes) {
      // Mark copy as RESERVED and fulfill queue
      this.updateCopyStatus(tx.copy_id, 'RESERVED', undefined, `Hold Shelf (For ${waitingRes.userName})`);
      this.updateReservationStatus(waitingRes.reservation_id, 'READY', tx.copy_id);
    } else {
      // Return to circulation
      this.updateCopyStatus(tx.copy_id, 'AVAILABLE', undefined, 'Returned to Stacks');
    }

    txs[txIndex] = {
      ...tx,
      status: 'RETURNED',
      return_date: returnDate.toISOString().split('T')[0],
      fineGenerated: fineAmount > 0 ? fineAmount : undefined,
    };
    this.save(STORAGE_KEYS.TRANSACTIONS, txs);

    const currentUser = this.getCurrentUser();
    this.logAudit(currentUser?.id || tx.user_id, currentUser?.name || tx.userName, 'BOOK_RETURNED', 'BORROW_TRANSACTION', tx.transaction_id, `Returned ${tx.bookTitle}. Fine: ₹${fineAmount.toFixed(2)}`);

    return {
      success: true,
      message: fineAmount > 0 
        ? `Book returned successfully. An overdue fine of ₹${fineAmount.toFixed(2)} was charged.`
        : 'Book returned in good order! Thank you for reading.',
      fineAmount,
    };
  }

  // --- Reservations ---
  public getReservations(): Reservation[] {
    return this.load<Reservation[]>(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
  }

  public getUserReservations(userId: string): Reservation[] {
    return this.getReservations().filter(r => r.user_id === userId);
  }

  public reserveBook(bookId: string, userIdParam?: string): { success: boolean; message: string; reservation?: Reservation } {
    const user = (userIdParam ? this.getUsers().find(u => u.id === userIdParam) : null) || this.getCurrentUser();
    if (!user) return { success: false, message: 'Please sign in to place a book hold.' };
    return this.createReservation(user.id, bookId);
  }

  public createReservation(userId: string, bookId: string): { success: boolean; message: string; reservation?: Reservation } {
    const book = this.getBookById(bookId);
    const user = this.getUsers().find(u => u.id === userId) || this.getCurrentUser();
    if (!book || !user) return { success: false, message: 'Invalid book or user.' };

    const existing = this.getReservations().find(r => r.user_id === userId && r.book_id === bookId && (r.status === 'PENDING' || r.status === 'READY'));
    if (existing) {
      return { success: false, message: 'You already have an active reservation for this book.' };
    }

    const currentReservations = this.getReservations().filter(r => r.book_id === bookId && (r.status === 'PENDING' || r.status === 'READY'));
    const queuePosition = currentReservations.length + 1;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    const newRes: Reservation = {
      reservation_id: `res-${Date.now()}`,
      user_id: user.id,
      userName: user.name,
      book_id: book.book_id,
      bookTitle: book.title,
      bookImage: book.image_url,
      reservation_date: new Date().toISOString().split('T')[0],
      expiry_date: expiry.toISOString().split('T')[0],
      status: 'PENDING',
      queuePosition,
    };

    const all = this.getReservations();
    all.push(newRes);
    this.save(STORAGE_KEYS.RESERVATIONS, all);

    this.addNotification({
      user_id: user.id,
      title: 'Reservation Placed',
      message: `You are #${queuePosition} in line for "${book.title}". We will notify you once a copy is ready.`,
      type: 'reservation',
    });

    this.logAudit(user.id, user.name, 'RESERVATION_CREATED', 'RESERVATION', newRes.reservation_id, `Placed hold on ${book.title}`);
    return { success: true, message: `Reservation placed! Your queue position is #${queuePosition}.`, reservation: newRes };
  }

  public cancelReservation(reservationId: string): { success: boolean; message: string } {
    const reservations = this.getReservations().map(r => {
      if (r.reservation_id === reservationId) {
        if (r.assignedCopyId) {
          // Release copy back to AVAILABLE
          this.updateCopyStatus(r.assignedCopyId, 'AVAILABLE', undefined, 'Released Hold to Stacks');
        }
        return { ...r, status: 'CANCELLED' as const };
      }
      return r;
    });
    this.save(STORAGE_KEYS.RESERVATIONS, reservations);
    return { success: true, message: 'Reservation cancelled.' };
  }

  public updateReservationStatus(resId: string, status: Reservation['status'], assignedCopyId?: string): void {
    const reservations = this.getReservations().map(r => {
      if (r.reservation_id === resId) {
        return { ...r, status, assignedCopyId: assignedCopyId || r.assignedCopyId };
      }
      return r;
    });
    this.save(STORAGE_KEYS.RESERVATIONS, reservations);
  }

  // --- Fines ---
  public getFines(): Fine[] {
    return this.load<Fine[]>(STORAGE_KEYS.FINES, INITIAL_FINES);
  }

  public getUserFines(userId: string): Fine[] {
    return this.getFines().filter(f => f.user_id === userId);
  }

  public createFine(fine: Omit<Fine, 'fine_id' | 'status' | 'created_at'>): Fine {
    const fines = this.getFines();
    const newFine: Fine = {
      ...fine,
      fine_id: `fine-${Date.now()}`,
      status: 'UNPAID',
      created_at: new Date().toISOString().split('T')[0],
    };
    fines.unshift(newFine);
    this.save(STORAGE_KEYS.FINES, fines);

    this.addNotification({
      user_id: fine.user_id,
      title: 'New Library Fine',
      message: `A fine of ₹${fine.amount.toFixed(2)} has been recorded: ${fine.description}`,
      type: 'fine',
    });

    return newFine;
  }

  public payFine(fineId: string): { success: boolean; message: string } {
    let paidAmount = 0;
    const fines = this.getFines().map(f => {
      if (f.fine_id === fineId) {
        paidAmount = f.amount;
        return { ...f, status: 'PAID' as const, paid_at: new Date().toISOString().split('T')[0] };
      }
      return f;
    });
    this.save(STORAGE_KEYS.FINES, fines);
    return { success: true, message: `Payment of ₹${paidAmount.toFixed(2)} processed successfully.` };
  }

  public waiveFine(fineId: string, adminName: string): void {
    const fines = this.getFines().map(f => {
      if (f.fine_id === fineId) {
        return { ...f, status: 'WAIVED' as const, paid_at: `Waived by ${adminName}` };
      }
      return f;
    });
    this.save(STORAGE_KEYS.FINES, fines);
    this.logAudit('admin', adminName, 'FINE_WAIVED', 'FINE', fineId, `Waived fine ${fineId}`);
  }

  // --- Damage Reports ---
  public getDamageReports(): DamageReport[] {
    return this.load<DamageReport[]>(STORAGE_KEYS.DAMAGES, INITIAL_DAMAGE_REPORTS);
  }

  public reportDamage(report: Omit<DamageReport, 'damage_id' | 'reported_date' | 'status'>): DamageReport {
    const damages = this.getDamageReports();
    const newReport: DamageReport = {
      ...report,
      damage_id: `dmg-${Date.now()}`,
      reported_date: new Date().toISOString().split('T')[0],
      status: 'REPORTED',
    };
    damages.unshift(newReport);
    this.save(STORAGE_KEYS.DAMAGES, damages);

    // Mark copy as damaged
    this.updateCopyStatus(report.copy_id, 'DAMAGED', report.severity === 'SEVERE' ? 'POOR' : 'FAIR', 'Quarantine Inspection Stacks');
    return newReport;
  }

  public updateDamageStatus(damageId: string, status: DamageReport['status'], actionTaken?: string): void {
    const damages = this.getDamageReports().map(d => {
      if (d.damage_id === damageId) {
        return { ...d, status, action_taken: actionTaken || d.action_taken };
      }
      return d;
    });
    this.save(STORAGE_KEYS.DAMAGES, damages);
  }

  // --- Reviews & Ratings ---
  public getReviews(): Review[] {
    return this.load<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  public getReviewsForBook(bookId: string): Review[] {
    return this.getReviews().filter(r => r.book_id === bookId);
  }

  public addReview(
    reviewOrBookId: Omit<Review, 'rating_id' | 'created_at'> | string,
    reviewText?: string,
    rating?: number,
    chapterTag?: string
  ): Review {
    const reviews = this.getReviews();
    let newReview: Review;

    if (typeof reviewOrBookId === 'string') {
      const currentUser = this.getCurrentUser();
      newReview = {
        rating_id: `rev-${Date.now()}`,
        book_id: reviewOrBookId,
        user_id: currentUser?.id || 'usr-harvey',
        userName: currentUser?.name || 'Harvey Specter',
        userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: rating || 5,
        review: reviewText || '',
        chapterTag,
        created_at: 'Just now',
      };
    } else {
      newReview = {
        ...reviewOrBookId,
        rating_id: `rev-${Date.now()}`,
        created_at: 'Just now',
      };
    }

    reviews.unshift(newReview);
    this.save(STORAGE_KEYS.REVIEWS, reviews);
    return newReview;
  }

  // --- Wishlist ---
  public getWishlist(userId: string): string[] {
    const list = this.load<{ [userId: string]: string[] }>(STORAGE_KEYS.WISHLIST, {});
    return list[userId] || ['book-hp-6', 'book-ddia'];
  }

  public toggleWishlist(userId: string, bookId: string): boolean {
    const list = this.load<{ [userId: string]: string[] }>(STORAGE_KEYS.WISHLIST, {});
    const userList = list[userId] || ['book-hp-6', 'book-ddia'];
    const idx = userList.indexOf(bookId);
    let added = false;
    if (idx > -1) {
      userList.splice(idx, 1);
    } else {
      userList.push(bookId);
      added = true;
    }
    list[userId] = userList;
    this.save(STORAGE_KEYS.WISHLIST, list);
    return added;
  }

  // --- Notifications ---
  public getNotifications(userId?: string): LibraryNotification[] {
    const all = this.load<LibraryNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return all;
    return all.filter(n => n.user_id === userId);
  }

  public addNotification(notif: Omit<LibraryNotification, 'id' | 'date' | 'read'>): void {
    const notifs = this.load<LibraryNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.unshift({
      ...notif,
      id: `notif-${Date.now()}`,
      date: 'Just now',
      read: false,
    });
    this.save(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  public markNotificationRead(id: string): void {
    const notifs = this.load<LibraryNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS).map(n => n.id === id ? { ...n, read: true } : n);
    this.save(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // --- Audit Log ---
  public getAuditLogs(): AuditLog[] {
    return this.load<AuditLog[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  }

  public logAudit(userId: string, userName: string, action: string, entity_type: string, entity_id: string, metadata: string): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      log_id: `aud-${Date.now()}`,
      user_id: userId,
      userName,
      action,
      entity_type,
      entity_id,
      timestamp: new Date().toLocaleString(),
      metadata,
    });
    this.save(STORAGE_KEYS.AUDIT, logs.slice(0, 100)); // retain last 100 logs
  }

  // --- Recommendation Engine ---
  public getRecommendations(userId?: string): { title: string; subtitle: string; books: Book[] }[] {
    const allBooks = this.getBooks();
    const userTxs = userId ? this.getUserTransactions(userId) : [];

    // Category affinity
    const categoriesBorrowed = userTxs.map(t => {
      const b = allBooks.find(book => book.book_id === t.book_id);
      return b?.category_id;
    }).filter(Boolean);

    const primaryCat = categoriesBorrowed[0] || 'cat-bestseller';
    const primaryCatBooks = allBooks.filter(b => b.category_id === primaryCat).slice(0, 4);
    const popularBooks = allBooks.filter(b => b.popular).slice(0, 4);
    const thrillers = allBooks.filter(b => b.category_id === 'cat-thriller').slice(0, 4);
    const bestsellers = allBooks.filter(b => b.category_id === 'cat-bestseller' || b.category_id === 'cat-literature').slice(0, 4);
    const csBooks = allBooks.filter(b => b.category_id === 'cat-cs' || b.category_id === 'cat-ai').slice(0, 4);
    const classics = allBooks.filter(b => b.rating >= 4.8).slice(0, 4);
    const litcrit = allBooks.filter(b => b.category_id === 'cat-litcrit' || b.category_id === 'cat-history').slice(0, 4);

    return [
      {
        title: 'Popular in the Stacks',
        subtitle: 'The most circulated titles across university departments this term',
        books: popularBooks,
      },
      {
        title: 'Fiction Bestsellers & Literary Triumphs',
        subtitle: 'Kaggle Google Books Dataset collection featuring Adichie, Morrison, and Murakami',
        books: bestsellers,
      },
      {
        title: 'Mystery & Crime Thrillers',
        subtitle: 'High-octane forensic procedurals and detective whodunits by Lisa Regan & James Patterson',
        books: thrillers,
      },
      {
        title: 'Computer Science & AI Frontiers',
        subtitle: 'Recommended essential volumes for systems architecture, clean craftsmanship & deep learning',
        books: csBooks,
      },
      {
        title: 'Critical Theory, Philosophy & Science',
        subtitle: 'Algorithmic text analysis, classical philosophy, and human design classics',
        books: litcrit.length > 0 ? litcrit : classics,
      }
    ];
  }

  // --- SLM Optimization (Small Language Model Edge Grounding) ---
  public answerWithSlm(userQuery: string, tokenBudget: number = 512) {
    return slmEngine.generateSlmInference(userQuery, this.getBooks(), this.getCopies(), tokenBudget);
  }

  // --- AI Library Assistant (Conversational RAG Grounded on Library Catalog) ---
  public answerWithLibraryAI(userQuery: string): { reply: string; suggestedBooks: Book[] } {
    const q = userQuery.toLowerCase();
    const allBooks = this.getBooks();

    // 1. Python or beginner coding
    if (q.includes('python') || q.includes('beginner') || q.includes('code') || q.includes('coding') || q.includes('clean code')) {
      const matching = allBooks.filter(b => 
        b.book_id === 'book-clean-code' || 
        b.category_id === 'cat-cs'
      );
      const cleanCode = allBooks.find(b => b.book_id === 'book-clean-code');
      const copiesAvail = cleanCode?.availableCopies || 0;
      return {
        reply: `For software craftsmanship and clean coding fundamentals, I recommend Uncle Bob's **Clean Code**. In our library database, we currently have **${copiesAvail} physical copies available** on Floor 3, Shelf C-01. I have also pulled our top Computer Science selections below.`,
        suggestedBooks: matching.slice(0, 3),
      };
    }

    // 2. Machine learning / AI
    if (q.includes('ai') || q.includes('machine learning') || q.includes('deep learning') || q.includes('neural')) {
      const matching = allBooks.filter(b => b.category_id === 'cat-ai');
      const aiBook = allBooks.find(b => b.book_id === 'book-ai-modern');
      return {
        reply: `We have premier volumes on Artificial Intelligence! Russell & Norvig's authoritative **Artificial Intelligence: A Modern Approach (4th Ed)** has ${aiBook?.availableCopies || 0} copy in circulation right now. We also have Goodfellow's **Deep Learning** with ${allBooks.find(b => b.book_id === 'book-deep-learning')?.availableCopies || 2} copies available.`,
        suggestedBooks: matching,
      };
    }

    // 3. Mystery, Thriller, Detective
    if (q.includes('mystery') || q.includes('thriller') || q.includes('crime') || q.includes('detective') || q.includes('cross') || q.includes('josie')) {
      const matching = allBooks.filter(b => b.category_id === 'cat-thriller');
      const topThrill = matching[0];
      return {
        reply: `Our crime and mystery collection contains gripping entries from the Kaggle dataset! **${topThrill?.title || 'Hush Little Girl'}** currently has **${topThrill?.availableCopies || 2} physical copies ready** in Stacks Floor 1. We also have James Patterson's **Alex Cross** and M.M. Chouinard's **Taken to the Grave**.`,
        suggestedBooks: matching.slice(0, 4),
      };
    }

    // 4. Fiction / Bestsellers / Literature
    if (q.includes('fiction') || q.includes('novel') || q.includes('bestseller') || q.includes('adichie') || q.includes('morrison') || q.includes('murakami')) {
      const matching = allBooks.filter(b => b.category_id === 'cat-bestseller' || b.category_id === 'cat-literature');
      const adichie = allBooks.find(b => b.book_id === 'book-americanah');
      return {
        reply: `From our enriched fiction collection, Chimamanda Ngozi Adichie's **Americanah** is one of our top recommended titles, with **${adichie?.availableCopies || 2} copies available** on Floor 1, Shelf B-01. Haruki Murakami's **After the Quake** and Toni Morrison's **Recitatif** are also ready for loan.`,
        suggestedBooks: matching.slice(0, 4),
      };
    }

    // 5. Fantasy / Harry Potter / Ice and Fire
    if (q.includes('fantasy') || q.includes('harry potter') || q.includes('magic') || q.includes('westeros') || q.includes('ice and fire')) {
      const matching = allBooks.filter(b => b.category_id === 'cat-fantasy');
      const hp = allBooks.find(b => b.book_id === 'book-hp-6');
      return {
        reply: `Our Fantasy and Sci-Fi catalog contains standout editions! **Harry Potter: Half Blood Prince** currently has **${hp?.availableCopies || 2} copies ready** for loan in Stacks F-12. George R.R. Martin's **The World of Ice and Fire** is also on the shelves.`,
        suggestedBooks: matching.slice(0, 4),
      };
    }

    // 6. Availability question
    if (q.includes('available') || q.includes('due') || q.includes('copy') || q.includes('borrow')) {
      const availableNow = allBooks.filter(b => b.availableCopies > 0).slice(0, 4);
      return {
        reply: `You can borrow any title with available copies directly from the catalogue. We currently maintain real-time physical barcode tracking for all ${allBooks.length} titles in the university collection. Here are a few popular titles ready for instant checkout:`,
        suggestedBooks: availableNow,
      };
    }

    // General fallback
    const matched = allBooks.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.authors.some(a => a.toLowerCase().includes(q)) || 
      b.description.toLowerCase().includes(q)
    );

    if (matched.length > 0) {
      return {
        reply: `I searched our live library catalogue and retrieved ${matched.length} matching title(s). Each entry displays its exact shelf location and physical copy availability:`,
        suggestedBooks: matched.slice(0, 4),
      };
    }

    return {
      reply: `I checked our catalog database. While I didn't find an exact text match for "${userQuery}", here are our top-circulated and recommended titles across fiction, systems programming, and sciences:`,
      suggestedBooks: allBooks.filter(b => b.popular).slice(0, 4),
    };
  }
}

export const libraryService = new LibraryService();
