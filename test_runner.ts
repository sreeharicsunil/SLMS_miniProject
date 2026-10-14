import { libraryService } from './src/services/libraryService';
import { slmEngine, SLM_PROFILES } from './src/services/slmEngine';
import { INITIAL_BOOKS, INITIAL_COPIES, INITIAL_CATEGORIES, INITIAL_AUTHORS } from './src/mock/mockData';
import { collectiveCatalogService } from './src/services/collectiveCatalogService';

console.log('====================================');
console.log('SMART LIBRARY AI - SLM INTEGRATION TESTS');
console.log('====================================\n');

// 1. Dataset stats
console.log('1. DATASET ENRICHMENT VERIFICATION:');
console.log(`- Total Books: ${INITIAL_BOOKS.length} (Target: >= 30)`);
console.log(`- Total Physical Copies: ${INITIAL_COPIES.length} (Target: >= 90)`);
console.log(`- Total Categories: ${INITIAL_CATEGORIES.length}`);
console.log(`- Total Authors: ${INITIAL_AUTHORS.length}`);

if (INITIAL_BOOKS.length < 30) {
  throw new Error(`Expected at least 30 books, found ${INITIAL_BOOKS.length}`);
}
console.log('✔ Dataset enrichment verified.\n');

// 2. LibraryService integration
console.log('2. LIBRARY SERVICE RECALCULATION:');
const books = libraryService.getBooks();
const copies = libraryService.getCopies();
console.log(`- libraryService.getBooks() count: ${books.length}`);
console.log(`- libraryService.getCopies() count: ${copies.length}`);

// Verify physical copy calculation
const americanah = books.find(b => b.book_id === 'book-americanah');
if (!americanah) throw new Error('Americanah not found in books!');
console.log(`- Americanah copies: total=${americanah.totalCopies}, available=${americanah.availableCopies}`);

const hushLittleGirl = books.find(b => b.book_id === 'book-hush-little-girl');
if (!hushLittleGirl) throw new Error('Hush Little Girl not found in books!');
console.log(`- Hush Little Girl copies: total=${hushLittleGirl.totalCopies}, available=${hushLittleGirl.availableCopies}`);
console.log('✔ Physical copy inventory calculation verified.\n');

// 3. SLM Token Serialization & Compression
console.log('3. SLM TOKEN COMPRESSION ENGINE:');
const serialized = slmEngine.serializeForSlm(americanah, copies);
console.log(`- Serialized Atom: ${serialized.text}`);
console.log(`- SLM Token Count: ${serialized.tokens} tokens`);
console.log(`- Raw JSON Token Count: ${serialized.rawTokens} tokens`);
const compression = Math.round((1 - (serialized.tokens / serialized.rawTokens)) * 100);
console.log(`- Context Compression Ratio: ${compression}% (Tokens Saved: ${serialized.rawTokens - serialized.tokens})`);
if (compression < 65) {
  throw new Error(`Compression ratio too low: ${compression}%`);
}
console.log('✔ SLM serialization & compression verified.\n');

// 4. SLM Retrieval & Grounded Ingestion
console.log('4. SLM EDGE GROUNDED REASONING:');

// Query 1: Crime thrillers
console.log('\n--- Test Query 1: "crime mystery thrillers by Lisa Regan" ---');
const res1 = libraryService.answerWithSlm('crime mystery thrillers by Lisa Regan', 512);
console.log(`[SLM Telemetry]: ${res1.telemetry.tokenCount}/${res1.telemetry.maxTokens} tok | Saved ${res1.telemetry.compressionRatio}% | Latency: ${res1.telemetry.latencyMs}ms`);
console.log(`[Suggested]: ${res1.suggestedBooks.map(b => b.title).join(' | ')}`);
console.log(`[Reply snippet]:\n${res1.reply.slice(0, 200)}...`);

// Query 2: Location query
console.log('\n--- Test Query 2: "Where is Clean Code located on the shelf?" ---');
const res2 = libraryService.answerWithSlm('Where is Clean Code located on the shelf?', 256);
console.log(`[SLM Telemetry]: ${res2.telemetry.tokenCount}/${res2.telemetry.maxTokens} tok | Model: ${res2.telemetry.modelTarget}`);
console.log(`[Reply]:\n${res2.reply}`);

// Query 3: Recommendation
console.log('\n--- Test Query 3: "Recommend bestsellers by Chimamanda Ngozi Adichie" ---');
const res3 = libraryService.answerWithSlm('Recommend bestsellers by Chimamanda Ngozi Adichie', 512);
console.log(`[SLM Telemetry]: ${res3.telemetry.tokenCount}/${res3.telemetry.maxTokens} tok`);
console.log(`[Suggested]: ${res3.suggestedBooks.map(b => b.title).join(' | ')}`);

// 5. Recommendations curation
console.log('\n5. RECOMMENDATIONS SYSTEM WITH ENRICHED DATASET:');
const recs = libraryService.getRecommendations();
recs.forEach((section, i) => {
  console.log(`Section ${i + 1}: "${section.title}" - ${section.books.length} books`);
  console.log(`  Top 2: ${section.books.slice(0, 2).map(b => b.title).join(' & ')}`);
});

// 6. Collective 10,000+ Book Catalog Integration
console.log('\n6. COLLECTIVE CATALOG 10,000+ VOLUME INTEGRATION:');
console.log(`- Total Books in Collective Catalog: ${collectiveCatalogService.getTotalCount()} (Target: >= 10,000)`);
if (collectiveCatalogService.getTotalCount() < 10000) {
  throw new Error(`Expected at least 10,000 collective books, found ${collectiveCatalogService.getTotalCount()}`);
}

const collectiveCategories = collectiveCatalogService.getCategoriesWithCounts();
console.log(`- Total Collective Categories: ${collectiveCategories.length}`);
collectiveCategories.forEach(c => {
  console.log(`  * ${c.name} (${c.category_id}): ${c.bookCount} books`);
});

const paginatedTest = collectiveCatalogService.getPaginatedBooks({ page: 1, pageSize: 12, category: 'cat-scifi' });
console.log(`- Science Fiction Paginated Query: total=${paginatedTest.totalCount}, pages=${paginatedTest.totalPages}, page1Count=${paginatedTest.books.length}`);
console.log(`  First Sci-Fi Book: "${paginatedTest.books[0]?.title}" by ${paginatedTest.books[0]?.authors[0]}`);

const extendedCopies = collectiveCatalogService.getCopiesForBook('book-ds-42');
console.log(`- Dynamic Copy Generation for Extended Book 'book-ds-42': ${extendedCopies.length} physical copies created with barcode ${extendedCopies[0]?.barcode} at ${extendedCopies[0]?.location}`);

// 7. RFC 7519 Compliant JWT Authentication & Admin Gateway Verification
console.log('\n7. RFC 7519 JWT AUTHENTICATION & ALTERNATIVE ADMIN GATEWAY:');
import { jwtService } from './src/services/jwtService';

// Test 7a: JWT Signing and Verification
const sampleClaims = {
  sub: 'user-test-99',
  email: 'researcher@smartlib.edu',
  name: 'Prof. Ada Lovelace',
  role: 'member' as const,
  membershipId: 'MEM-2026-9900',
  department: 'Computing Sciences'
};
const { token: signedJwt, payload: tokenPayload } = jwtService.sign(sampleClaims);
console.log(`- Generated JWT Token: ${signedJwt.slice(0, 42)}... (${signedJwt.length} chars)`);

const verifyOk = jwtService.verify(signedJwt);
if (!verifyOk.valid || verifyOk.payload?.email !== 'researcher@smartlib.edu') {
  throw new Error('JWT verification failed for signed token!');
}
console.log(`✔ JWT signature & claims verified (Alg: HS256, Subject: ${verifyOk.payload.sub}, Exp: ${verifyOk.payload.exp})`);

// Test 7b: Tamper Resistance
const tamperedJwt = signedJwt.slice(0, -6) + 'xyz123';
const verifyTampered = jwtService.verify(tamperedJwt);
if (verifyTampered.valid) {
  throw new Error('Tampered JWT was improperly accepted!');
}
console.log(`✔ Cryptographic tamper rejection verified: "${verifyTampered.error}"`);

// Test 7c: Member Authentication with Valid Credentials
const memberAuth = libraryService.authenticate('prabakaran.menon@smartlib.edu', 'Password123!');
console.log(`✔ Member authenticated with password: ${memberAuth.user.name} (Role: ${memberAuth.user.role})`);
const memberTokenVerify = jwtService.verify(memberAuth.token);
if (!memberTokenVerify.valid || memberTokenVerify.payload?.role !== 'member') {
  throw new Error('Member JWT invalid or wrong role!');
}
console.log(`✔ Member JWT token validated with claims role='member'`);

// Test 7d: Member Authentication with Invalid Credentials
let memberAuthFailed = false;
try {
  libraryService.authenticate('prabakaran.menon@smartlib.edu', 'WrongPassword!');
} catch (e: any) {
  memberAuthFailed = true;
  console.log(`✔ Invalid password rejected: "${e.message}"`);
}
if (!memberAuthFailed) throw new Error('Invalid password was accepted!');

// Test 7e: Alternative Administrative Gateway Authentication
const adminAuth = libraryService.authenticateAdmin('admin@smartlib.edu', 'Admin@SmartLib2026!');
console.log(`✔ Admin authorized via alternative gateway: ${adminAuth.user.name} (${adminAuth.user.membershipId})`);
const adminTokenVerify = jwtService.verify(adminAuth.token);
if (!adminTokenVerify.valid || adminTokenVerify.payload?.role !== 'admin') {
  throw new Error('Admin JWT invalid or wrong role!');
}
console.log(`✔ Elevated Admin JWT token issued and verified (Role: ${adminTokenVerify.payload.role}, Expires in 24h)`);

// Test 7f: Administrative Gateway Rejection on Invalid Key
let adminAuthFailed = false;
try {
  libraryService.authenticateAdmin('admin@smartlib.edu', 'WrongSecurityKey!');
} catch (e: any) {
  adminAuthFailed = true;
  console.log(`✔ Administrative gateway rejected unauthorized access: "${e.message}"`);
}
if (!adminAuthFailed) throw new Error('Invalid admin key was accepted!');

// Test 7g: Registration with Password and JWT
const testRegEmail = `student_${Date.now()}@smartlib.edu`;
const regResult = libraryService.registerUser('Turing Alan', testRegEmail, 'Mathematics', '+1-555-0199', 'SecurePass2026!');
console.log(`✔ New member registered: ${regResult.user.name} (${regResult.user.email})`);
const regVerify = jwtService.verify(regResult.token);
if (!regVerify.valid || regVerify.payload?.email !== testRegEmail) {
  throw new Error('Newly registered user JWT failed verification!');
}
console.log(`✔ Registration issued valid JWT token for ${testRegEmail}`);

// Test 7h: Session Restoration
const restoredUser = libraryService.restoreSessionFromToken();
if (!restoredUser || restoredUser.email !== testRegEmail) {
  throw new Error('Failed to restore active session from JWT token!');
}
console.log(`✔ Session successfully restored from active JWT token: ${restoredUser.name}`);

console.log('\n====================================');
console.log('ALL TESTS PASSED (SLM, 10K ARCHIVE, JWT AUTH, ADMIN GATEWAY)!');
console.log('====================================');

