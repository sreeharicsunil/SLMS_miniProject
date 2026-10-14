export type UserRole = 'public' | 'member' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  membershipId: string;
  department: string;
  phone?: string;
  avatar: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'INACTIVE';
  joinedDate: string;
  currentlyBorrowedCount: number;
  passwordHash?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  membershipId: string;
  department: string;
  iat: number;
  exp: number;
  iss: string;
}

export interface JWTVerifyResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

export interface AuthResult {
  user: User;
  token: string;
  payload: JWTPayload;
}

export type CopyStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'DAMAGED' | 'LOST' | 'MAINTENANCE' | 'REMOVED';
export type CopyCondition = 'MINT' | 'GOOD' | 'FAIR' | 'POOR';

export interface BookCopy {
  copy_id: string;
  book_id: string;
  barcode: string;
  status: CopyStatus;
  condition: CopyCondition;
  location: string; // e.g. "Rack 3, Shelf B-02"
  acquisition_date: string;
  last_inspected?: string;
  notes?: string;
}

export interface Author {
  author_id: string;
  name: string;
  biography: string;
  photo_url: string;
}

export interface Category {
  category_id: string;
  name: string;
  description: string;
  icon?: string;
  bookCount?: number;
}

export interface Book {
  book_id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  description: string;
  publisher: string;
  publication_year: number;
  category_id: string;
  category_name: string;
  authors: string[];
  image_url: string;
  editors?: string;
  language: string;
  format: string; // e.g. "Paperback, 345 pages"
  pageCount: number;
  rating: number;
  ratingCount: number;
  totalCopies: number;
  availableCopies: number;
  featured?: boolean;
  popular?: boolean;
  edition?: string;
  created_at: string;
  updated_at: string;
  // Enriched Kaggle Google Books dataset fields
  google_book_id?: string;
  isbn_10?: string;
  isbn_13?: string;
  search_category?: string;
  preview_link?: string;
  info_link?: string;
  // SLM (Small Language Model) optimization fields
  slm_tokens?: number;
  slm_summary?: string;
}

export type TransactionStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';

export interface BorrowTransaction {
  transaction_id: string;
  user_id: string;
  userName: string;
  userEmail: string;
  book_id: string;
  bookTitle: string;
  bookImage: string;
  copy_id: string;
  barcode: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: TransactionStatus;
  fineGenerated?: number;
  notes?: string;
}

export type ReservationStatus = 'PENDING' | 'READY' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export interface Reservation {
  reservation_id: string;
  user_id: string;
  userName: string;
  book_id: string;
  bookTitle: string;
  bookImage: string;
  reservation_date: string;
  expiry_date: string;
  status: ReservationStatus;
  queuePosition: number;
  assignedCopyId?: string;
}

export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';
export type FineReason = 'OVERDUE' | 'LOST_BOOK' | 'DAMAGE' | 'OTHER';

export interface Fine {
  fine_id: string;
  user_id: string;
  userName: string;
  transaction_id?: string;
  bookTitle?: string;
  amount: number;
  reason: FineReason;
  description: string;
  status: FineStatus;
  created_at: string;
  paid_at?: string;
}

export type DamageSeverity = 'MINOR' | 'MODERATE' | 'SEVERE';
export type DamageStatus = 'REPORTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CHARGED';

export interface DamageReport {
  damage_id: string;
  copy_id: string;
  barcode: string;
  bookTitle: string;
  user_id: string;
  userName: string;
  transaction_id?: string;
  damage_type: string; // e.g. "Water damaged pages", "Torn spine"
  severity: DamageSeverity;
  description: string;
  reported_date: string;
  action_taken?: string;
  status: DamageStatus;
}

export interface Review {
  rating_id: string;
  user_id: string;
  userName: string;
  userAvatar: string;
  book_id: string;
  rating: number;
  review: string;
  chapterTag?: string;
  created_at: string;
}

export interface WishlistItem {
  wishlist_id: string;
  user_id: string;
  book_id: string;
  created_at: string;
}

export interface LibraryNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'due' | 'overdue' | 'reservation' | 'fine' | 'system' | 'recommendation';
  date: string;
  read: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  log_id: string;
  user_id: string;
  userName: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  metadata: string;
}

export interface SlmTelemetry {
  tokenCount: number;
  maxTokens: number;
  rawTokenEquivalent: number;
  compressionRatio: number;
  latencyMs: number;
  modelTarget: string;
  retrievedBookIds: string[];
  contextPayloadSnippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedBooks?: Book[];
  slmTelemetry?: SlmTelemetry;
  engineMode?: 'slm' | 'standard';
}

