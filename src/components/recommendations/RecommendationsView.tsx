import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, BookOpen, Star, TrendingUp, Zap, Cpu, Layers, CheckCircle } from 'lucide-react';
import { Book, User } from '../../types';
import { libraryService } from '../../services/libraryService';

interface RecommendationsViewProps {
  currentUser: User | null;
  onSelectBook: (bookId: string) => void;
  onAskAI: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  currentUser,
  onSelectBook,
  onAskAI,
}) => {
  const sections = libraryService.getRecommendations(currentUser?.id);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filterKeywords: Record<string, string[]> = {
    'all': [],
    'fiction': ['cat-bestseller', 'cat-literature', 'cat-fantasy'],
    'thriller': ['cat-thriller'],
    'tech': ['cat-cs', 'cat-ai'],
    'crit': ['cat-litcrit', 'cat-history', 'cat-social', 'cat-science'],
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E06953]">
              Machine-Learned Catalog Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              SLM Token Optimized
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1D1D1F] tracking-tight">
            Curated For You
          </h1>
          <p className="text-xs sm:text-sm text-[#656157] mt-1">
            Algorithmic recommendations combining active reading patterns, department curricula, and the enriched Kaggle Google Books dataset.
          </p>
        </div>

        <button
          onClick={onAskAI}
          className="px-5 py-2.5 bg-[#1D1D1F] text-white text-xs font-medium rounded-full shadow-xs hover:bg-[#333336] flex items-center gap-2 self-start md:self-auto cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4 text-[#E06953]" />
          <span>Ask SLM Assistant for Tailored Titles</span>
        </button>
      </div>

      {/* SLM Model & Dataset Highlights Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FAF9F5] via-[#FFFDF7] to-[#F7F4EB] border border-[#EAE7DF] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-[#E06953]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
                <span>Google Books Kaggle Dataset & SLM Edge Grounding Pipeline</span>
              </h3>
              <p className="text-[11px] text-[#8A857A]">
                Extracted via <code className="font-mono text-[10px] text-[#1D1D1F] bg-stone-100 px-1 py-0.5 rounded">book-dataset.ipynb</code> • Subword BPE Vectorization • Real-time Physical Shelf Verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE7DF]">
              <span className="text-[9px] text-[#8A857A] block uppercase font-bold">Catalog</span>
              <span className="font-mono font-bold text-[#1D1D1F]">33 Volumes</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE7DF]">
              <span className="text-[9px] text-[#8A857A] block uppercase font-bold">Physical Barcodes</span>
              <span className="font-mono font-bold text-[#1D1D1F]">100 Tracked</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[9px] text-emerald-800 block uppercase font-bold">Token Reduction</span>
              <span className="font-mono font-bold text-emerald-700">-78% Over Raw</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[9px] text-amber-800 block uppercase font-bold">Target Inference</span>
              <span className="font-mono font-bold text-amber-900">Gemma 2B / Phi-3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#1D1D1F] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-[#EAE7DF] hover:bg-[#FAF9F5]'
          }`}
        >
          All Recommendations
        </button>
        <button
          onClick={() => setSelectedFilter('fiction')}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'fiction'
              ? 'bg-[#1D1D1F] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-[#EAE7DF] hover:bg-[#FAF9F5]'
          }`}
        >
          📖 Fiction Bestsellers & Literature
        </button>
        <button
          onClick={() => setSelectedFilter('thriller')}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'thriller'
              ? 'bg-[#1D1D1F] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-[#EAE7DF] hover:bg-[#FAF9F5]'
          }`}
        >
          🔍 Mystery & Crime Thrillers
        </button>
        <button
          onClick={() => setSelectedFilter('tech')}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'tech'
              ? 'bg-[#1D1D1F] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-[#EAE7DF] hover:bg-[#FAF9F5]'
          }`}
        >
          💻 Computer Science & AI
        </button>
        <button
          onClick={() => setSelectedFilter('crit')}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'crit'
              ? 'bg-[#1D1D1F] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-[#EAE7DF] hover:bg-[#FAF9F5]'
          }`}
        >
          📜 Philosophy & Criticism
        </button>
      </div>

      {/* Sections */}
      {sections.map((sec, idx) => {
        const displayedBooks = sec.books.filter(b => {
          if (selectedFilter === 'all') return true;
          const allowedCats = filterKeywords[selectedFilter] || [];
          return allowedCats.includes(b.category_id);
        });

        if (displayedBooks.length === 0) return null;

        return (
          <div key={idx} className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1D1D1F]">
                {sec.title}
              </h2>
              <p className="text-xs text-[#8A857A]">
                {sec.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {displayedBooks.map((book) => (
                <div
                  key={book.book_id}
                  onClick={() => onSelectBook(book.book_id)}
                  className="cursor-pointer group flex flex-col justify-between bg-white p-3.5 rounded-2xl border border-[#EAE7DF] hover:border-[#D6D2C4] shadow-xs hover:shadow-md transition-all"
                >
                  <div>
                    <div className="w-full aspect-[2/3] rounded-md overflow-hidden book-card-shadow bg-[#232323] mb-3 relative">
                      <img
                        src={book.image_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                        ★ {book.rating}
                      </div>

                      {/* SLM Footprint tag */}
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold bg-stone-900/80 text-amber-300 backdrop-blur-xs flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" />
                        ~{book.slm_tokens || 45} tok
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06953] truncate block">
                      {book.category_name}
                    </span>
                    <h3 className="text-xs font-serif font-bold text-[#1D1D1F] line-clamp-1 group-hover:text-[#E06953] transition-colors mt-0.5">
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-[#8A857A] truncate">
                      {book.authors.join(', ')}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#F0EEE6] flex items-center justify-between text-[10px]">
                    <span className={`font-semibold ${book.availableCopies > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {book.availableCopies > 0 ? `${book.availableCopies} Copies Available` : 'On Loan'}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-[#8A857A]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
