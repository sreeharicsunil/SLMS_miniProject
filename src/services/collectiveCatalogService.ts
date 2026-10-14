import { Book, BookCopy, Category } from '../types';
import rawDataset from '../mock/books_dataset.json';
import { INITIAL_BOOKS, INITIAL_COPIES, INITIAL_CATEGORIES } from '../mock/mockData';

// High-resolution genre-aligned book covers from Unsplash
const GENRE_COVERS: Record<string, string[]> = {
  'Thriller': [
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80'
  ],
  'Mystery': [
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80'
  ],
  'Science Fiction': [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80'
  ],
  'Fantasy': [
    'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'
  ],
  'Non-Fiction': [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80'
  ],
  'Horror': [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80'
  ],
  'Biography': [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'
  ],
  'Romance': [
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'
  ],
  'Historical': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80'
  ],
  'Fiction': [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80'
  ]
};

const GENRE_CATEGORY_MAPPING: Record<string, { id: string; name: string }> = {
  'Fiction': { id: 'cat-bestseller', name: 'Fiction & Bestsellers' },
  'Thriller': { id: 'cat-thriller', name: 'Mystery & Crime Thrillers' },
  'Mystery': { id: 'cat-thriller', name: 'Mystery & Crime Thrillers' },
  'Fantasy': { id: 'cat-fantasy', name: 'Fantasy & Epic Worldbuilding' },
  'Science Fiction': { id: 'cat-scifi', name: 'Science Fiction & Speculative' },
  'Horror': { id: 'cat-horror', name: 'Horror & Supernatural' },
  'Romance': { id: 'cat-romance', name: 'Romance & Contemporary' },
  'Non-Fiction': { id: 'cat-nonfiction', name: 'Non-Fiction & Applied Knowledge' },
  'Biography': { id: 'cat-biography', name: 'Biographies & Memoirs' },
  'Historical': { id: 'cat-history', name: 'Historical & Philosophy' }
};

interface RawBookItem {
  title: string;
  author: string;
  year: number;
  genre: string;
  isbn: string;
  publisher: string;
  pages: number;
}

export class CollectiveCatalogService {
  private collectiveBooks: Book[] = [];
  private booksById: Map<string, Book> = new Map();
  private generatedCopiesMap: Map<string, BookCopy[]> = new Map();
  private initialized = false;

  constructor() {
    this.initializeCatalog();
  }

  private initializeCatalog() {
    if (this.initialized) return;

    // 1. Add spotlight initial books
    const allBooks: Book[] = [...INITIAL_BOOKS];
    allBooks.forEach(b => this.booksById.set(b.book_id, b));

    // 2. Map and append 10,000 books from books_dataset.json
    const rawList = rawDataset as RawBookItem[];
    const startIndex = INITIAL_BOOKS.length;

    rawList.forEach((item, idx) => {
      const globalIndex = startIndex + idx;
      const bookId = `book-ds-${idx}`;
      const genreMapping = GENRE_CATEGORY_MAPPING[item.genre] || {
        id: 'cat-nonfiction',
        name: 'Non-Fiction & Applied Knowledge'
      };

      const covers = GENRE_COVERS[item.genre] || GENRE_COVERS['Fiction'];
      const imageUrl = covers[idx % covers.length];

      // Deterministic rating & rating count
      const rating = Number((4.0 + ((idx * 7) % 10) * 0.1).toFixed(1));
      const ratingCount = 80 + ((idx * 43) % 4500);

      // Deterministic physical copy availability
      const totalCopies = 2 + (idx % 3); // 2, 3, or 4 copies
      const availableCopies = Math.max(1, totalCopies - (idx % 2));

      const book: Book = {
        book_id: bookId,
        isbn: item.isbn,
        title: item.title,
        subtitle: `${item.genre} Edition (${item.year})`,
        description: `"${item.title}" is a notable ${item.genre.toLowerCase()} work by ${item.author}, published in ${item.year} by ${item.publisher}. Spanning ${item.pages} pages, it explores compelling themes and classic motifs within the ${item.genre.toLowerCase()} literary canon.`,
        publisher: item.publisher,
        publication_year: item.year,
        category_id: genreMapping.id,
        category_name: genreMapping.name,
        authors: [item.author],
        image_url: imageUrl,
        language: 'English',
        format: `Paperback, ${item.pages} pages`,
        pageCount: item.pages,
        rating,
        ratingCount,
        totalCopies,
        availableCopies,
        popular: idx % 15 === 0,
        featured: idx % 200 === 0,
        created_at: `2024-0${(idx % 8) + 1}-15`,
        updated_at: '2024-08-20',
        search_category: `${item.genre.toLowerCase()} ${item.publisher.toLowerCase()}`,
        slm_tokens: 44,
        slm_summary: `"${item.title}" (${item.year}): ${item.genre} volume by ${item.author} published by ${item.publisher}.`
      };

      allBooks.push(book);
      this.booksById.set(bookId, book);
    });

    this.collectiveBooks = allBooks;
    this.initialized = true;
  }

  /**
   * Returns all 10,033 books in the collective catalog.
   */
  public getAllBooks(): Book[] {
    return this.collectiveBooks;
  }

  /**
   * Returns total count of all books across collective strength.
   */
  public getTotalCount(): number {
    return this.collectiveBooks.length;
  }

  /**
   * Returns the 33 curated cornerstone / spotlight books.
   */
  public getSpotlightBooks(): Book[] {
    return this.collectiveBooks.slice(0, INITIAL_BOOKS.length);
  }

  /**
   * Finds a book by ID across the collective catalog.
   */
  public getBookById(id: string): Book | undefined {
    return this.booksById.get(id);
  }

  /**
   * Returns physical copies for any book (curated or 10,000 extended).
   */
  public getCopiesForBook(bookId: string): BookCopy[] {
    // Check initial stored copies
    const initialCopies = INITIAL_COPIES.filter(c => c.book_id === bookId);
    if (initialCopies.length > 0) return initialCopies;

    // Check generated cache
    if (this.generatedCopiesMap.has(bookId)) {
      return this.generatedCopiesMap.get(bookId)!;
    }

    const book = this.booksById.get(bookId);
    if (!book) return [];

    const total = book.totalCopies || 3;
    const avail = book.availableCopies || 2;
    const prefix = book.category_id.replace('cat-', '').toUpperCase().slice(0, 3);
    const copies: BookCopy[] = [];

    const floor = (book.publication_year % 3) + 1;
    const shelfLetter = String.fromCharCode(65 + (book.title.charCodeAt(0) % 8));
    const shelfNum = ((book.pageCount % 16) + 1).toString().padStart(2, '0');
    const shelfLocation = `Floor ${floor}, Shelf ${shelfLetter}-${shelfNum}`;

    for (let c = 1; c <= total; c++) {
      const isAvail = c <= avail;
      copies.push({
        copy_id: `copy-${bookId}-${c}`,
        book_id: bookId,
        barcode: `LIB-${prefix}-${(bookId.replace(/[^0-9]/g, '') || '100')}-${c}`,
        status: isAvail ? 'AVAILABLE' : (c === total ? 'RESERVED' : 'BORROWED'),
        condition: c === 1 ? 'MINT' : (c === 2 ? 'GOOD' : 'FAIR'),
        location: isAvail ? shelfLocation : (c === total ? 'Hold Shelf #03' : 'On Loan'),
        acquisition_date: `2023-05-${(c * 5).toString().padStart(2, '0')}`
      });
    }

    this.generatedCopiesMap.set(bookId, copies);
    return copies;
  }

  /**
   * Returns all categories with live collective aggregated book counts across the 10,000+ volume collection.
   */
  public getCategoriesWithCounts(): Category[] {
    const countsByCat: Record<string, number> = {};
    this.collectiveBooks.forEach(b => {
      countsByCat[b.category_id] = (countsByCat[b.category_id] || 0) + 1;
    });

    const categoryTemplates: Category[] = [
      { category_id: 'cat-bestseller', name: 'Fiction & Bestsellers', description: 'Award-winning contemporary fiction, major blockbusters, and bestselling narratives' },
      { category_id: 'cat-thriller', name: 'Mystery & Crime Thrillers', description: 'Gripping investigative suspense, police procedurals, and psychological whodunits' },
      { category_id: 'cat-scifi', name: 'Science Fiction & Speculative', description: 'Far-future space exploration, quantum timelines, dystopian visions, and alternate realities' },
      { category_id: 'cat-nonfiction', name: 'Non-Fiction & Applied Knowledge', description: 'Investigative essays, applied sciences, sociology, business, and investigative journalism' },
      { category_id: 'cat-horror', name: 'Horror & Supernatural', description: 'Gothic terror, paranormal mysteries, psychological dread, and dark fiction' },
      { category_id: 'cat-biography', name: 'Biographies & Memoirs', description: 'Intimate memoirs, personal chronicles, and extraordinary historical life journeys' },
      { category_id: 'cat-fantasy', name: 'Fantasy & Epic Worldbuilding', description: 'Epic worldbuilding, high fantasy sagas, mythic realms, and enchanted kingdoms' },
      { category_id: 'cat-romance', name: 'Romance & Contemporary', description: 'Heartfelt relationship dramas, modern love stories, emotional bonds, and connections' },
      { category_id: 'cat-history', name: 'Historical & Philosophy', description: 'Historical chronicles, classical German philosophy, cultural preservation, and ancient eras' },
      { category_id: 'cat-cs', name: 'Computer Science & Software', description: 'Algorithms, distributed systems, clean architecture, and craftsmanship principles' },
      { category_id: 'cat-ai', name: 'Artificial Intelligence & ML', description: 'Machine learning, deep neural representations, LLMs, and intelligent agents' },
      { category_id: 'cat-litcrit', name: 'Literary Studies & Criticism', description: 'Book history, computational text analytics, literary theory, and publishing culture' },
      { category_id: 'cat-design', name: 'Design & UX', description: 'Human-centered interaction, visual craft, affordances, and cognitive psychology' },
      { category_id: 'cat-music', name: 'Music, Arts & Culture', description: 'Archival audio history, master studio sessions, and popular song recordings' },
    ];

    return categoryTemplates.map(cat => ({
      ...cat,
      bookCount: countsByCat[cat.category_id] || 0
    }));
  }

  /**
   * Fast paginated filtering across the 10,000+ volume collection.
   */
  public getPaginatedBooks(params: {
    page: number;
    pageSize: number;
    category?: string;
    query?: string;
    sortBy?: 'popular' | 'rating' | 'year' | 'title';
    availabilityOnly?: boolean;
    scope?: 'all' | 'spotlight';
  }): {
    books: Book[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  } {
    const {
      page = 1,
      pageSize = 24,
      category = 'all',
      query = '',
      sortBy = 'popular',
      availabilityOnly = false,
      scope = 'all'
    } = params;

    const sourcePool = scope === 'spotlight' ? this.getSpotlightBooks() : this.collectiveBooks;
    const cleanQuery = query.toLowerCase().trim();

    const filtered = sourcePool.filter(b => {
      if (category !== 'all' && b.category_id !== category) return false;
      if (availabilityOnly && b.availableCopies <= 0) return false;
      if (!cleanQuery) return true;

      return (
        b.title.toLowerCase().includes(cleanQuery) ||
        b.authors.some(a => a.toLowerCase().includes(cleanQuery)) ||
        b.isbn.toLowerCase().includes(cleanQuery) ||
        b.publisher.toLowerCase().includes(cleanQuery) ||
        (b.search_category && b.search_category.toLowerCase().includes(cleanQuery))
      );
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return b.publication_year - a.publication_year;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      // popular
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    });

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const paginatedBooks = filtered.slice(startIdx, startIdx + pageSize);

    return {
      books: paginatedBooks,
      totalCount,
      totalPages,
      currentPage: safePage
    };
  }
}

export const collectiveCatalogService = new CollectiveCatalogService();
