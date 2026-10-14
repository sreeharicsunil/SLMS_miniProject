import React from 'react';
import { 
  BookOpen, Sparkles, ArrowRight, ShieldCheck, Shield, Clock, Bookmark, 
  Search, Layers, Cpu, TrendingUp, Users, CheckCircle2, ChevronRight,
  Library, ArrowUpRight
} from 'lucide-react';
import { Book } from '../../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreCatalogue: () => void;
  featuredBooks: Book[];
  onSelectBook: (bookId: string) => void;
  onOpenAdminGateway?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onExploreCatalogue,
  featuredBooks,
  onSelectBook,
  onOpenAdminGateway,
}) => {
  return (
    <div className="min-h-screen bg-[#F5F4EE] text-[#1D1D1F] flex flex-col selection:bg-[#E06953]/20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F5F4EE]/90 backdrop-blur-md border-b border-[#E8E6DF] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Custom Logo mark matching the scribble/hand style in reference image */}
            <div className="w-10 h-10 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c-4.5 0-8 3.5-8 8 0 3.5 2 6 4 7.5V21h8v-2.5c2-1.5 4-4 4-7.5 0-4.5-3.5-8-8-8z"/>
                <path d="M9 10h6"/>
                <path d="M10 14h4"/>
              </svg>
            </div>
            <div>
              <div className="font-serif text-xl font-bold tracking-tight text-[#1D1D1F] leading-none">
                Smart Library
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#8A857A] font-semibold">
                Intelligence & Circulation
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#656157]">
            <a href="#hero" className="text-[#1D1D1F] font-semibold hover:text-[#E06953] transition-colors">Home</a>
            <button onClick={onExploreCatalogue} className="hover:text-[#1D1D1F] transition-colors">Browse Books</button>
            <a href="#features" className="hover:text-[#1D1D1F] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#1D1D1F] transition-colors">How it Works</a>
            <a href="#ai-intelligence" className="hover:text-[#1D1D1F] transition-colors">AI Assistant</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="px-5 py-2 text-sm font-medium text-[#1D1D1F] hover:bg-[#EAE8E0] rounded-full transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 text-sm font-medium bg-[#1D1D1F] text-white hover:bg-[#333336] rounded-full shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-12 pb-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE8E0] text-[#555047] text-xs font-semibold tracking-wide border border-[#DFDCD2]">
              <Sparkles className="w-3.5 h-3.5 text-[#E06953]" />
              <span>Next-Gen Academic Library Management</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#1D1D1F] tracking-tight leading-[1.06]">
              Your Library, <br />
              <span className="italic font-normal text-[#E06953]">Smarter.</span>
            </h1>

            <p className="text-lg text-[#656157] max-w-xl leading-relaxed">
              Discover, borrow, reserve, and explore books through an intelligent digital library experience. Track physical copies by shelf, receive machine-learned recommendations, and chat with an authoritative AI assistant.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="px-7 py-3.5 bg-[#1D1D1F] text-white rounded-full font-medium text-base hover:bg-[#333336] transition-all shadow-md flex items-center gap-2 group hover:scale-[1.02]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreCatalogue}
                className="px-7 py-3.5 bg-white text-[#1D1D1F] border border-[#DDD9CE] rounded-full font-medium text-base hover:bg-[#F0EEE6] transition-all shadow-sm flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-[#8A857A]" />
                <span>Explore Catalogue</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E8E6DF]">
              <div>
                <div className="text-2xl font-serif font-bold text-[#1D1D1F]">10K+</div>
                <div className="text-xs text-[#8A857A] uppercase tracking-wider font-medium mt-0.5">Academic Volumes</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-[#1D1D1F]">100%</div>
                <div className="text-xs text-[#8A857A] uppercase tracking-wider font-medium mt-0.5">Physical Barcode Sync</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-[#1D1D1F]">98.4%</div>
                <div className="text-xs text-[#8A857A] uppercase tracking-wider font-medium mt-0.5">Availability Accuracy</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Visual showcase echoing the prototype UI */}
          <div className="lg:col-span-6 relative">
            {/* Layered Card Container matching the uploaded design */}
            <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAE7DF] overflow-hidden">
              {/* Decorative top bar badge */}
              <div className="flex items-center justify-between pb-6 border-b border-[#F0EEE6]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E06953] flex items-center justify-center text-white text-xs font-bold">
                    SL
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1D1D1F]">Live Library Reader</div>
                    <div className="text-[11px] text-[#8A857A]">Circulation & Catalog Preview</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#F5F4EE] text-[#656157] text-xs font-medium rounded-full border border-[#E8E6DF]">
                  Active Session
                </span>
              </div>

              {/* Main Featured Book in Hero */}
              <div className="mt-6 flex flex-col sm:flex-row gap-6 items-center">
                <div 
                  onClick={() => onSelectBook('book-hp-6')}
                  className="w-40 sm:w-44 shrink-0 cursor-pointer group"
                >
                  <div className="relative rounded-lg overflow-hidden book-card-shadow aspect-[2/3] bg-[#2A2A2A]">
                    <img
                      src="https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&w=600&q=80"
                      alt="Harry Potter: Half Blood Prince"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-[11px] text-white font-medium">Click to inspect</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <span className="px-2.5 py-0.5 bg-[#F5F4EE] text-[#8A857A] rounded-full text-xs font-semibold uppercase tracking-wider">
                    Featured Fantasy Classic
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#1D1D1F] leading-tight">
                    Harry Potter: Half Blood Prince
                  </h3>
                  <p className="text-xs text-[#8A857A] font-medium">By J.K. Rowling • 345 pages • ISBN 978-0-43978</p>
                  <p className="text-sm text-[#656157] line-clamp-3 leading-relaxed">
                    Uncover the dark secrets and Horcruxes in Harry’s sixth year at Hogwarts. Two physical copies currently available in Stacks F-12.
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => onSelectBook('book-hp-6')}
                      className="px-4 py-2 bg-[#1D1D1F] text-white text-xs font-medium rounded-full flex items-center gap-1.5 hover:bg-[#333336] transition-all"
                    >
                      <span>Start reading</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectBook('book-hp-6')}
                      className="px-3 py-2 bg-[#F5F4EE] hover:bg-[#EAE8E0] text-[#1D1D1F] text-xs font-medium rounded-full transition-all"
                    >
                      View Copies (4)
                    </button>
                  </div>
                </div>
              </div>

              {/* Mini Shelf Row matching Image 2 "Popular Now" */}
              <div className="mt-8 pt-6 border-t border-[#F0EEE6]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A857A]">
                    Popular in Stacks Today
                  </h4>
                  <button onClick={onExploreCatalogue} className="text-xs text-[#E06953] font-semibold hover:underline">
                    View all
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {featuredBooks.slice(1, 5).map((b) => (
                    <div
                      key={b.book_id}
                      onClick={() => onSelectBook(b.book_id)}
                      className="cursor-pointer group flex flex-col items-center text-center"
                    >
                      <div className="w-full aspect-[2/3] rounded-md overflow-hidden book-card-shadow bg-[#2A2A2A] mb-2">
                        <img
                          src={b.image_url}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[11px] font-serif font-semibold text-[#1D1D1F] line-clamp-1 group-hover:text-[#E06953] transition-colors">
                        {b.title}
                      </span>
                      <span className="text-[10px] text-[#8A857A] line-clamp-1">
                        {b.authors[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating pill badge */}
            <div className="absolute -bottom-5 -left-4 bg-[#1D1D1F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs hidden sm:flex border border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-semibold block">Authoritative AI Grounding</span>
                <span className="text-white/60 text-[11px]">Directly synced with SQL database inventory</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-[#EFECE4] border-y border-[#E2DFD5]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-[#E06953]">
              Platform Architecture
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif text-[#1D1D1F] tracking-tight">
              Designed for Scholars, Built for Librarians
            </h2>
            <p className="text-base text-[#656157]">
              Eliminate disjointed tools. Our integrated platform bridges public discovery, physical barcode management, and intelligent reader assistance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-[#EAE7DF] shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5F4EE] flex items-center justify-center text-[#1D1D1F]">
                <Layers className="w-6 h-6 text-[#E06953]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">Smart Catalogue</h3>
              <p className="text-sm text-[#656157] leading-relaxed">
                Full-text search across titles, ISBNs, author taxonomies, and Dewey-style categories with real-time multi-copy counts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-[#EAE7DF] shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5F4EE] flex items-center justify-center text-[#1D1D1F]">
                <Clock className="w-6 h-6 text-[#E06953]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">Physical Copy Tracking</h3>
              <p className="text-sm text-[#656157] leading-relaxed">
                Separates abstract book titles from physical barcodes (e.g. Copy #001 vs Copy #002) with precise shelf locations and condition flags.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-[#EAE7DF] shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5F4EE] flex items-center justify-center text-[#1D1D1F]">
                <Bookmark className="w-6 h-6 text-[#E06953]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">Automated Reservations</h3>
              <p className="text-sm text-[#656157] leading-relaxed">
                Fair FIFO hold queues with automated notifications when returned copies are sanitized and placed on hold shelves.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 border border-[#EAE7DF] shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5F4EE] flex items-center justify-center text-[#1D1D1F]">
                <Cpu className="w-6 h-6 text-[#E06953]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">AI Library Assistant</h3>
              <p className="text-sm text-[#656157] leading-relaxed">
                Ask questions like &ldquo;Show me beginner-friendly Python textbooks&rdquo; and receive recommendations grounded strictly in actual catalog availability.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 border border-[#EAE7DF] shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5F4EE] flex items-center justify-center text-[#1D1D1F]">
                <ShieldCheck className="w-6 h-6 text-[#E06953]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">Fine & Damage Handling</h3>
              <p className="text-sm text-[#656157] leading-relaxed">
                Dedicated fine management with overdue day calculations ($1.50/day), waiver workflows, and physical damage inspection records.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 border border-[#EAE7DF] shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5F4EE] flex items-center justify-center text-[#1D1D1F]">
                <TrendingUp className="w-6 h-6 text-[#E06953]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">Librarian Analytics</h3>
              <p className="text-sm text-[#656157] leading-relaxed">
                Real-time loan velocities, category utilization ratios, overdue forecasts, and immutable administrative audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-[#E06953]">
              Seamless Workflow
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif text-[#1D1D1F] tracking-tight">
              How Smart Library Works
            </h2>
            <p className="text-base text-[#656157]">
              From digital discovery to returning physical copies on time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#EAE7DF] relative">
              <span className="text-3xl font-serif font-bold text-[#E06953]/30 absolute top-4 right-5">01</span>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8A857A] mb-2">Step 01</div>
              <h4 className="text-lg font-serif font-bold text-[#1D1D1F] mb-2">Discover</h4>
              <p className="text-xs text-[#656157] leading-relaxed">
                Browse our curated categories, filter by publication year, or ask the AI assistant for customized reading recommendations.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#EAE7DF] relative">
              <span className="text-3xl font-serif font-bold text-[#E06953]/30 absolute top-4 right-5">02</span>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8A857A] mb-2">Step 02</div>
              <h4 className="text-lg font-serif font-bold text-[#1D1D1F] mb-2">Reserve</h4>
              <p className="text-xs text-[#656157] leading-relaxed">
                Place a hold if all physical copies are on loan. Track your exact queue position and receive a ready alert the moment a copy is scanned.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#EAE7DF] relative">
              <span className="text-3xl font-serif font-bold text-[#E06953]/30 absolute top-4 right-5">03</span>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8A857A] mb-2">Step 03</div>
              <h4 className="text-lg font-serif font-bold text-[#1D1D1F] mb-2">Borrow</h4>
              <p className="text-xs text-[#656157] leading-relaxed">
                Pick up your assigned physical barcode at the circulation desk or checkout rack. Enjoy standard 14-day loan terms.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#EAE7DF] relative">
              <span className="text-3xl font-serif font-bold text-[#E06953]/30 absolute top-4 right-5">04</span>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8A857A] mb-2">Step 04</div>
              <h4 className="text-lg font-serif font-bold text-[#1D1D1F] mb-2">Read & Review</h4>
              <p className="text-xs text-[#656157] leading-relaxed">
                Track your active reading chapter, log ratings, leave chapter notes, and return with 1-click status validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Intelligence Spotlight */}
      <section id="ai-intelligence" className="py-20 px-6 lg:px-12 bg-[#1D1D1F] text-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#E06953]" />
              <span>Grounded Conversational Search</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-serif tracking-tight leading-tight">
              Your Library, <br />
              <span className="italic text-[#E06953]">With Intelligence.</span>
            </h2>

            <p className="text-base text-white/70 leading-relaxed">
              Unlike generic chatbots that hallucinate book titles and false availability, <strong>Library AI</strong> queries our PostgreSQL database and physical inventory in real-time. It only recommends volumes that genuinely exist on our shelves.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E06953] shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">Semantic topic and author matching across academic abstracts.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E06953] shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">Exact shelf location guidance (e.g. &ldquo;Floor 3, Shelf C-01&rdquo;).</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E06953] shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">Zero phantom inventories or non-existent edition citations.</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 bg-[#E06953] text-white rounded-full text-sm font-semibold hover:bg-[#D45943] transition-all shadow-md flex items-center gap-2"
              >
                <span>Try Library AI Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="space-y-4">
              {/* Simulated Chat Dialogue */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">
                  AM
                </div>
                <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/90 max-w-md">
                  &ldquo;Show me beginner-friendly software engineering and clean coding books.&rdquo;
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E06953] text-xs flex items-center justify-center font-bold text-white shadow-sm">
                  AI
                </div>
                <div className="bg-white text-[#1D1D1F] rounded-2xl rounded-tl-sm p-4 text-sm max-w-md shadow-lg space-y-3">
                  <p className="text-xs leading-relaxed">
                    For foundational coding principles, I recommend <strong>Clean Code</strong> by Robert C. Martin. We currently have <strong>3 physical copies available</strong> on Floor 3, Shelf C-01.
                  </p>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F5F4EE] border border-[#E8E6DF]">
                    <img 
                      src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=120&q=80" 
                      alt="Clean Code" 
                      className="w-10 h-14 object-cover rounded shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#1D1D1F] truncate">Clean Code</div>
                      <div className="text-[10px] text-[#656157]">Status: 3 Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 text-center bg-[#F5F4EE]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-5xl font-serif text-[#1D1D1F] tracking-tight">
            Ready to explore the intelligent library?
          </h2>
          <p className="text-base text-[#656157]">
            Sign up in seconds as a university member with your institutional credentials to borrow and explore books.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 bg-[#1D1D1F] text-white rounded-full font-medium text-base hover:bg-[#333336] transition-all shadow-md"
            >
              Get Started Free
            </button>
            <button
              onClick={onSignIn}
              className="px-8 py-3.5 bg-white text-[#1D1D1F] border border-[#DDD9CE] rounded-full font-medium text-base hover:bg-[#F0EEE6] transition-all shadow-sm"
            >
              Sign In to Your Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8E6DF] bg-white px-6 lg:px-12 py-12 text-xs text-[#8A857A]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          <div className="space-y-3">
            <div className="font-serif font-bold text-sm text-[#1D1D1F]">Smart Library</div>
            <p className="text-xs leading-relaxed">
              Intelligent academic circulation, physical copy tracking, and conversational book discovery.
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider">Catalogue</div>
            <div><button onClick={onExploreCatalogue} className="hover:text-[#1D1D1F]">Computer Science</button></div>
            <div><button onClick={onExploreCatalogue} className="hover:text-[#1D1D1F]">Artificial Intelligence</button></div>
            <div><button onClick={onExploreCatalogue} className="hover:text-[#1D1D1F]">Fantasy & Sci-Fi</button></div>
            <div><button onClick={onExploreCatalogue} className="hover:text-[#1D1D1F]">Physics & Philosophy</button></div>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider">Platform</div>
            <div><a href="#features" className="hover:text-[#1D1D1F]">Physical Copy Tracking</a></div>
            <div><a href="#how-it-works" className="hover:text-[#1D1D1F]">Reservation Queues</a></div>
            <div><a href="#ai-intelligence" className="hover:text-[#1D1D1F]">Library AI</a></div>
            <div><span className="text-[#8A857A]">Institutional Research</span></div>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider">Legal & Access</div>
            <div><span className="text-[#8A857A]">Circulation Terms</span></div>
            <div><span className="text-[#8A857A]">Overdue Fine Schedule</span></div>
            <div><span className="text-[#8A857A]">Privacy & Data Policy</span></div>
            <div><span className="text-[#8A857A]">MCA Project 2026</span></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-[#F0EEE6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Smart Library Management & Recommendation System. All rights reserved.</div>
          <div className="flex gap-6 items-center">
            <button
              type="button"
              onClick={onOpenAdminGateway}
              title="Institutional Custodian Access (Ctrl+Shift+A)"
              className="text-[#8A857A] hover:text-[#1D1D1F] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3 h-3 text-[#8A857A]/50 hover:text-[#E06953]" />
              <span>Version 2.4.0 (Enterprise Desktop Edition)</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
