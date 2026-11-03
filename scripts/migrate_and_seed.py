import json
import os
import sys
import psycopg
import ollama

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def migrate_and_seed():
    print(">> Starting Data Migration and Vector Seeding to PostgreSQL...")

    # Load bundled mock data
    with open("scripts/mock_data.json", "r", encoding="utf-8") as f:
        mock_data = json.load(f)

    # Load extended dataset
    books_dataset_path = "src/mock/books_dataset.json"
    extended_books = []
    if os.path.exists(books_dataset_path):
        with open(books_dataset_path, "r", encoding="utf-8") as f:
            extended_books = json.load(f)
        print(f"Loaded {len(extended_books)} books from books_dataset.json")

    if not os.getenv("DATABASE_URL"):
        raise RuntimeError("DATABASE_URL must be set before running migrations.")

    from sqlalchemy.engine import make_url
    from backend.config import DATABASE_URL

    conninfo = make_url(DATABASE_URL).set(drivername="postgresql").render_as_string(
        hide_password=False
    )
    conn = psycopg.connect(conninfo, autocommit=True)

    with conn.cursor() as cur:
        # Clear existing data cleanly in reverse order of foreign keys
        print("Cleaning up old test rows if any...")
        cur.execute("""
            TRUNCATE TABLE fines, notifications, loans, reservations, book_embeddings, book_copies, books, users 
            RESTART IDENTITY CASCADE;
        """)

        # 1. SEED USERS
        print("Seeding Users...")
        user_id_map = {}  # old string id -> new integer id
        for u in mock_data.get("INITIAL_USERS", []):
            role = "Admin" if u.get("role") == "admin" else "Student"
            email = u.get("email", "")
            member_id = u.get("membershipId", f"MEM-{u['id']}")
            name = u.get("name", "User")
            pwd_hash = u.get("passwordHash") or "$2a$10$defaultHashForDemo"
            dept = u.get("department", "Computer Science")
            phone = u.get("phone", "+91 98765 43210")
            avatar = u.get("avatar", "")
            
            cur.execute("""
                INSERT INTO users (member_id, name, email, password_hash, role, status, department, phone, avatar)
                VALUES (%s, %s, %s, %s, %s, 'Active', %s, %s, %s)
                RETURNING user_id;
            """, (member_id, name, email, pwd_hash, role, dept, phone, avatar))
            new_id = cur.fetchone()[0]
            user_id_map[u["id"]] = new_id

        print(f"[OK] Seeded {len(user_id_map)} users.")

        # 2. SEED INITIAL RICH BOOKS
        print("Seeding Core Books from mockData...")
        book_id_map = {} # old string id -> new integer id
        inserted_books = [] # list of (new_book_id, text_to_embed)

        for b in mock_data.get("INITIAL_BOOKS", []):
            authors_str = ", ".join(b.get("authors", [])) if isinstance(b.get("authors"), list) else b.get("authors", "Unknown")
            isbn = b.get("isbn") or b.get("isbn_13") or "978-0000000000"
            title = b.get("title", "")
            publisher = b.get("publisher", "Standard Publishing")
            desc = b.get("description", "")
            cat = b.get("category_name", "General")
            subject = b.get("search_category", cat)
            level = "All Levels"
            lang = b.get("language", "English")
            syllabus = bool(b.get("featured", False))
            img = b.get("image_url", "")
            pub_year = b.get("publication_year", 2024)
            pages = b.get("pageCount", 300)
            rating = float(b.get("rating", 4.5))
            rating_count = int(b.get("ratingCount", 50))

            cur.execute("""
                INSERT INTO books (
                    isbn, title, author, publisher, description, category, subject, 
                    level, language, syllabus_relevant, image_url, publication_year, 
                    pages, rating, rating_count
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING book_id;
            """, (
                isbn, title, authors_str, publisher, desc, cat, subject,
                level, lang, syllabus, img, pub_year, pages, rating, rating_count
            ))
            new_b_id = cur.fetchone()[0]
            book_id_map[b["book_id"]] = new_b_id
            
            # Text to embed
            embed_text = f"Title: {title}. Author: {authors_str}. Genre: {cat}. Subject: {subject}. Summary: {desc[:400]}"
            inserted_books.append((new_b_id, embed_text))

        print(f"[OK] Seeded {len(book_id_map)} core library books.")

        # 3. SEED EXTENDED CATALOG (Sample 150 diverse books from books_dataset.json)
        genre_covers = {
            "Fiction": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
            "Science Fiction": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
            "Mystery": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
            "Thriller": "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80",
            "Non-Fiction": "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80"
        }

        extended_count = 0
        for eb in extended_books[:150]:
            title = eb.get("title", "").strip()
            if not title or len(title) < 2:
                continue
            author = eb.get("author", "Various Authors")
            genre = eb.get("genre", "Fiction")
            year = eb.get("year", 2020)
            isbn = eb.get("isbn", f"978-0-12345-{extended_count:04d}")
            pub = eb.get("publisher", "Global Editions")
            pages = eb.get("pages", 280)
            desc = f"A compelling work of {genre} by {author}, published by {pub}. Explores key thematic journeys and cultural inquiries."
            img = genre_covers.get(genre, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80")

            cur.execute("""
                INSERT INTO books (
                    isbn, title, author, publisher, description, category, subject, 
                    level, language, syllabus_relevant, image_url, publication_year, 
                    pages, rating, rating_count
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING book_id;
            """, (
                isbn, title, author, pub, desc, genre, genre,
                "General", "English", False, img, year, pages, 4.4, 30
            ))
            ext_b_id = cur.fetchone()[0]
            embed_text = f"Title: {title}. Author: {author}. Genre: {genre}. Summary: {desc}"
            inserted_books.append((ext_b_id, embed_text))
            extended_count += 1

        print(f"[OK] Seeded {extended_count} extended catalog books.")

        # 4. SEED BOOK COPIES
        print("Seeding Book Copies...")
        copy_id_map = {}
        seen_barcodes = set()
        # From INITIAL_COPIES
        for idx, c in enumerate(mock_data.get("INITIAL_COPIES", [])):
            book_id_str = c.get("book_id")
            if book_id_str in book_id_map:
                real_book_id = book_id_map[book_id_str]
                barcode = c.get("barcode", f"BC-INIT-{idx}")
                if barcode in seen_barcodes:
                    barcode = f"{barcode}-{idx}"
                seen_barcodes.add(barcode)

                status = c.get("status", "Available").capitalize()
                condition = c.get("condition", "Good").capitalize()
                loc = c.get("location", "Main Stacks")
                
                cur.execute("""
                    INSERT INTO book_copies (book_id, barcode, status, condition, location)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING copy_id;
                """, (real_book_id, barcode, status, condition, loc))
                new_c_id = cur.fetchone()[0]
                copy_id_map[c["copy_id"]] = new_c_id

        # Generate copies for extended books (2 copies each)
        cur.execute("SELECT book_id FROM books WHERE book_id NOT IN (SELECT DISTINCT book_id FROM book_copies);")
        books_needing_copies = cur.fetchall()
        for (b_id,) in books_needing_copies:
            for copy_num in range(1, 3):
                barcode = f"BC-B{b_id:04d}-C{copy_num}"
                cur.execute("""
                    INSERT INTO book_copies (book_id, barcode, status, condition, location)
                    VALUES (%s, %s, 'Available', 'Good', 'Rack 4, Shelf A')
                    ON CONFLICT (barcode) DO NOTHING;
                """, (b_id, barcode))

        print(f"[OK] Seeded book copies across all inventory.")

        # 5. SEED LOANS & FINES
        print("Seeding Loans and Fines...")
        for tx in mock_data.get("INITIAL_TRANSACTIONS", []):
            u_id = user_id_map.get(tx.get("user_id"))
            c_id = copy_id_map.get(tx.get("copy_id"))
            if u_id and c_id:
                status = tx.get("status", "Active").capitalize()
                cur.execute("""
                    INSERT INTO loans (user_id, copy_id, borrowed_at, due_at, returned_at, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING loan_id;
                """, (
                    u_id, c_id, 
                    tx.get("issue_date", "2026-03-01"),
                    tx.get("due_date", "2026-03-15"),
                    tx.get("return_date"),
                    status
                ))
                new_loan_id = cur.fetchone()[0]

                # If transaction has fine
                if tx.get("fineGenerated", 0) > 0:
                    fine_amt = float(tx.get("fineGenerated", 0))
                    cur.execute("""
                        INSERT INTO fines (loan_id, amount, reason, status)
                        VALUES (%s, %s, 'Overdue', 'Pending');
                    """, (new_loan_id, fine_amt))

        # Seed standalone initial fines
        for fn in mock_data.get("INITIAL_FINES", []):
            u_id = user_id_map.get(fn.get("user_id"))
            if u_id:
                # Find an existing loan for this user
                cur.execute("SELECT loan_id FROM loans WHERE user_id = %s LIMIT 1;", (u_id,))
                found_loan = cur.fetchone()
                if found_loan:
                    cur.execute("""
                        INSERT INTO fines (loan_id, amount, reason, status)
                        VALUES (%s, %s, %s, %s);
                    """, (
                        found_loan[0], 
                        float(fn.get("amount", 50.0)),
                        fn.get("reason", "Overdue").capitalize(),
                        "Pending" if fn.get("status") == "UNPAID" else "Paid"
                    ))

        print("[OK] Seeded loans and fines.")

        # 6. SEED NOTIFICATIONS
        print("Seeding Notifications...")
        for nt in mock_data.get("INITIAL_NOTIFICATIONS", []):
            u_id = user_id_map.get(nt.get("user_id"))
            if u_id:
                cur.execute("""
                    INSERT INTO notifications (user_id, type, title, message, is_read)
                    VALUES (%s, %s, %s, %s, %s);
                """, (
                    u_id,
                    nt.get("type", "SYSTEM"),
                    nt.get("title", "Library Notice"),
                    nt.get("message", ""),
                    bool(nt.get("is_read", False))
                ))

        print("[OK] Seeded notifications.")

        # 7. GENERATE AND SAVE VECTOR EMBEDDINGS (Local Ollama RAG)
        print(f"Generating Vector Embeddings for {len(inserted_books)} books via Ollama 'all-minilm'...")
        embed_count = 0
        for b_id, text in inserted_books:
            try:
                res = ollama.embeddings(model="all-minilm", prompt=text)
                vec = res["embedding"]
                cur.execute("""
                    INSERT INTO book_embeddings (book_id, embedding, model_name)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (book_id) DO UPDATE SET embedding = EXCLUDED.embedding;
                """, (b_id, vec, "all-minilm"))
                embed_count += 1
                if embed_count % 25 == 0 or embed_count == len(inserted_books):
                    print(f"  Processed {embed_count}/{len(inserted_books)} embeddings...")
            except Exception as e:
                print(f"  Error embedding book_id {b_id}: {e}")

        print(f"[OK] Successfully generated and stored {embed_count} vector embeddings in PostgreSQL!")

    conn.close()
    print("\n>> PostgreSQL Migration & Vector Seeding Completed Successfully!\n")

if __name__ == "__main__":
    migrate_and_seed()
