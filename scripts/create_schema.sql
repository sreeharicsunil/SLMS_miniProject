-- Smart Library Management System - Relational Schema
-- Aligned with the approved ER Diagram

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Student',
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    department VARCHAR(100) DEFAULT 'General',
    phone VARCHAR(30),
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. BOOKS TABLE
CREATE TABLE IF NOT EXISTS books (
    book_id SERIAL PRIMARY KEY,
    isbn VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    subject VARCHAR(100),
    level VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English',
    syllabus_relevant BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    publication_year INT,
    pages INT,
    rating DECIMAL(3, 2) DEFAULT 4.5,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOOK EMBEDDINGS TABLE (1:1 with BOOKS)
CREATE TABLE IF NOT EXISTS book_embeddings (
    embedding_id SERIAL PRIMARY KEY,
    book_id INT UNIQUE REFERENCES books(book_id) ON DELETE CASCADE,
    embedding FLOAT8[] NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOK COPIES TABLE (1:M with BOOKS)
CREATE TABLE IF NOT EXISTS book_copies (
    copy_id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(book_id) ON DELETE CASCADE,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Available',
    condition VARCHAR(50) DEFAULT 'Good',
    location VARCHAR(100) DEFAULT 'Main Stacks',
    acquired_at DATE DEFAULT CURRENT_DATE
);

-- 5. LOANS TABLE (M:1 with USERS, M:1 with BOOK_COPIES)
CREATE TABLE IF NOT EXISTS loans (
    loan_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    copy_id INT REFERENCES book_copies(copy_id) ON DELETE CASCADE,
    borrowed_at DATE DEFAULT CURRENT_DATE,
    due_at DATE NOT NULL,
    returned_at DATE,
    status VARCHAR(50) DEFAULT 'Borrowed'
);

-- 6. FINES TABLE (M:1 with LOANS)
CREATE TABLE IF NOT EXISTS fines (
    fine_id SERIAL PRIMARY KEY,
    loan_id INT REFERENCES loans(loan_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    reason VARCHAR(100) DEFAULT 'Overdue',
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

-- 7. NOTIFICATIONS TABLE (M:1 with USERS)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_loan_id INT REFERENCES loans(loan_id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. RESERVATIONS TABLE (Hold Queue)
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    book_id INT REFERENCES books(book_id) ON DELETE CASCADE,
    queue_position INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indices for search performance
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_copies_book_id ON book_copies(book_id);
CREATE INDEX IF NOT EXISTS idx_copies_status ON book_copies(status);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
