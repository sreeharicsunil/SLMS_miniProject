import React, { useState } from 'react';
import { 
  ArrowUpRight, ChevronLeft, ChevronRight, MoreHorizontal,
  Bookmark, Check, Clock, AlertTriangle, BookOpen, Sparkles
} from 'lucide-react';
import { Book, User, BorrowTransaction, Reservation, Fine } from '../../types';

interface MemberDashboardProps {
  currentUser: User;
  books: Book[];
  transactions: BorrowTransaction[];
  reservations: Reservation[];
  fines: Fine[];
  onSelectBook: (bookId: string) => void;
  onNavigateTab: (tab: any) => void;
  onStartReading: (bookId: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentUser,
  books,
  transactions,
  reservations,
  fines,
  onSelectBook,
  onNavigateTab,
  onStartReading,
}) => {
  // Reading calendar state matching image 2
  const [selectedDay, setSelectedDay] = useState<number>(13);
  const calendarDays = [
    { name: 'Sun', num: 11 },
    { name: 'Mon', num: 12 },
    { name: 'Tue', num: 13 },
    { name: 'Wed', num: 14 },
    { name: 'Thu', num: 15 },
    { name: 'Fri', num: 16 },
    { name: 'Sat', num: 17 },
  ];

  // Specific books from the reference image
  const hpBook = books.find(b => b.book_id === 'book-hp-2') || books[0];
  const popularNowBooks = [
    books.find(b => b.book_id === 'book-got-world') || books[2],
    books.find(b => b.book_id === 'book-fantastic-beasts-2') || books[3],
    books.find(b => b.book_id === 'book-got-vol3') || books[4],
    books.find(b => b.book_id === 'book-wise-mans-fear') || books[5],
  ].filter(Boolean) as Book[];

  const iceHorseBook = books.find(b => b.book_id === 'book-ice-horse') || books[6];

  const activeLoans = transactions.filter(t => t.status === 'ACTIVE' || t.status === 'OVERDUE');
  const unpaidFines = fines.filter(f => f.status === 'UNPAID');

  return (
    <div className="space-y-10">
      {/* Top Banner & Interactive Open Book Spread - Replicating Image 2 */}
      <section className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Welcome Header */}
        <div className="lg:col-span-4 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-serif text-[#1D1D1F] tracking-tight leading-[1.1]">
            Happy reading, <br />
            <span className="italic font-normal">Harvey</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#656157] leading-relaxed max-w-sm">
            Wow! you&apos;ve delved deep into the wizarding world&apos;s secrets. Have Harry&apos;s parents died yet? Oops, looks like you&apos;re not there yet. Get reading now!
          </p>

          <div className="pt-2">
            <button
              onClick={() => onStartReading(hpBook.book_id)}
              className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-xs font-medium hover:bg-[#333336] transition-all shadow-sm flex items-center gap-2 group hover:scale-[1.02]"
            >
              <span>Start reading</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Center & Right: Two-page Open Book Presentation */}
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center gap-6 bg-white/50 p-4 rounded-3xl border border-[#EAE7DF]">
          {/* Open Book Object */}
          <div className="relative shrink-0 w-72 sm:w-88 aspect-[1.35/1] rounded-r-md rounded-l-md flex shadow-2xl overflow-hidden bg-[#FBF9F2] open-book-spine border border-[#E0DDD3]">
            {/* Left Page (Typography text with drop cap) */}
            <div className="flex-1 p-4 border-r border-[#DED9CC] flex flex-col justify-between text-[8px] sm:text-[9px] text-[#4A453A] leading-relaxed relative bg-[#FAF7EF]">
              <div className="text-[7px] text-[#8A857A] uppercase tracking-widest text-center border-b border-[#EAE5D9] pb-1">
                Chapter 5 • Diagon Alley
              </div>
              <div className="space-y-1 my-auto">
                <p>
                  <span className="float-left text-xl font-serif leading-none mr-1 font-bold text-[#1D1D1F]">H</span>
                  arry woke early next morning. Although he could tell it was daylight, he kept his eyes shut tight.
                </p>
                <p>
                  &ldquo;It was a dream,&rdquo; he told himself firmly. &ldquo;I dreamed a giant called Hagrid came to tell me I was going to a school for wizards.&rdquo;
                </p>
                <p className="hidden sm:block">
                  When he opened his eyes, he was lying on the soft sofa, and the sunlight fell across a large letter seal...
                </p>
              </div>
              <div className="text-center text-[7px] text-[#A39E93]">Page 154</div>
            </div>

            {/* Right Page (Illustration matching Image 2) */}
            <div className="flex-1 p-2 bg-[#F3EFE4] flex flex-col justify-between relative overflow-hidden">
              <div className="w-full h-full rounded overflow-hidden shadow-inner border border-[#DFD8C7] relative">
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
                  alt="Diagon Alley Illustration"
                  className="w-full h-full object-cover brightness-95 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Center Spine Shadow overlay */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 pointer-events-none bg-gradient-to-r from-black/15 via-black/5 to-black/15" />
          </div>

          {/* Current Book Info Card */}
          <div className="space-y-2 flex-1">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1D1D1F] leading-snug">
              The Camber of Secrets
            </h3>
            <div className="text-xs font-semibold text-[#E06953]">
              154 / 300 pages
            </div>
            <p className="text-xs text-[#656157] leading-relaxed line-clamp-3">
              Harry as he returns to Hogwarts school of witchcraft and wizardry for his 2nd year, only to discover that..
            </p>
            <div className="text-xs text-[#8A857A] italic font-serif">
              - JK Rowlings
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Section (Popular Now & New Series) vs Right Section (Schedule & Reader Friends) */}
      <section className="grid lg:grid-cols-12 gap-10">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-10">
          {/* Popular Now Row */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-serif font-bold text-[#1D1D1F]">
                Popular Now
              </h2>
              <button 
                onClick={() => onNavigateTab('catalog')}
                className="text-[#8A857A] hover:text-[#1D1D1F] transition-colors p-1"
                title="View more"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Book covers with deep 3D spine shadow matching reference */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {popularNowBooks.map((book) => (
                <div
                  key={book.book_id}
                  onClick={() => onSelectBook(book.book_id)}
                  className="cursor-pointer group flex flex-col"
                >
                  <div className="w-full aspect-[2/3] rounded-md overflow-hidden book-card-shadow bg-[#232323] mb-3 relative">
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-semibold text-white">
                      {book.availableCopies} left
                    </div>
                  </div>
                  <h4 className="text-xs font-serif font-bold text-[#1D1D1F] line-clamp-1 group-hover:text-[#E06953] transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-[#8A857A] line-clamp-1">
                    {book.authors[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* New Series Collection Card matching Image 2 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-[#1D1D1F]">
                New Series Collection
              </h2>
              <button className="text-[#8A857A] hover:text-[#1D1D1F] p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div 
              onClick={() => onSelectBook(iceHorseBook.book_id)}
              className="bg-white rounded-2xl p-4 border border-[#EAE7DF] flex items-center justify-between cursor-pointer hover:border-[#D6D2C4] transition-all shadow-sm group"
            >
              <div className="flex items-center gap-4">
                {/* 2 vol boxed book graphics */}
                <div className="flex -space-x-4">
                  <div className="w-12 h-16 rounded shadow-md overflow-hidden border border-white rotate-[-4deg]">
                    <img
                      src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=120&q=80"
                      alt="Vol 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-12 h-16 rounded shadow-md overflow-hidden border border-white rotate-[3deg]">
                    <img
                      src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80"
                      alt="Vol 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-serif font-bold text-[#1D1D1F] group-hover:text-[#E06953] transition-colors">
                    A Legend of Ice and Fire: The Ice Horse
                  </h4>
                  <p className="text-xs text-[#8A857A]">
                    8 chapters each vol • Historical George R.R. Martin lore
                  </p>
                </div>
              </div>

              <span className="text-xs font-medium text-[#8A857A] px-3 py-1 bg-[#F5F4EE] rounded-full">
                2 vol
              </span>
            </div>
          </div>

          {/* Quick Circulation Stats Row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div 
              onClick={() => onNavigateTab('my-books')}
              className="bg-white rounded-2xl p-4 border border-[#EAE7DF] cursor-pointer hover:border-[#D6D2C4] transition-all"
            >
              <div className="text-[11px] text-[#8A857A] uppercase tracking-wider font-semibold">Active Loans</div>
              <div className="text-2xl font-serif font-bold text-[#1D1D1F] mt-1">{activeLoans.length} Books</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">14-day loan status</div>
            </div>

            <div 
              onClick={() => onNavigateTab('reservations')}
              className="bg-white rounded-2xl p-4 border border-[#EAE7DF] cursor-pointer hover:border-[#D6D2C4] transition-all"
            >
              <div className="text-[11px] text-[#8A857A] uppercase tracking-wider font-semibold">Holds & Queues</div>
              <div className="text-2xl font-serif font-bold text-[#1D1D1F] mt-1">{reservations.length} Reserved</div>
              <div className="text-[10px] text-[#8A857A] mt-0.5">1 Ready on hold shelf</div>
            </div>

            <div 
              onClick={() => onNavigateTab('fines')}
              className="bg-white rounded-2xl p-4 border border-[#EAE7DF] cursor-pointer hover:border-[#D6D2C4] transition-all"
            >
              <div className="text-[11px] text-[#8A857A] uppercase tracking-wider font-semibold">Overdue Fines</div>
              <div className="text-2xl font-serif font-bold text-[#E06953] mt-1">
                ₹{unpaidFines.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-[#8A857A] mt-0.5">1 overdue transaction</div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) - Schedule Reading & Reader Friends Feed */}
        <div className="lg:col-span-5 space-y-10">
          {/* Schedule Reading Calendar Strip */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE7DF] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#1D1D1F]">
                Schedule Reading
              </h3>
              <div className="flex items-center gap-1 text-[#8A857A]">
                <button className="p-1 hover:text-[#1D1D1F] rounded-lg">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:text-[#1D1D1F] rounded-lg">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day Pills matching the reference */}
            <div className="flex items-center justify-between pt-1">
              {calendarDays.map((day) => {
                const isSelected = selectedDay === day.num;
                return (
                  <button
                    key={day.num}
                    onClick={() => setSelectedDay(day.num)}
                    className={`flex flex-col items-center py-2.5 px-2 rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-[#FAF7EF] ring-1 ring-[#D8D3C4] shadow-xs'
                        : 'hover:bg-[#F5F4EE]'
                    }`}
                  >
                    <span className={`text-[11px] ${isSelected ? 'font-semibold text-[#E06953]' : 'text-[#8A857A]'}`}>
                      {day.name}
                    </span>
                    <span className={`text-sm mt-1 font-bold ${isSelected ? 'text-[#1D1D1F]' : 'text-[#656157]'}`}>
                      {day.num}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#F0EEE6] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E06953]" />
                <span className="text-[#656157]">Target: 45 min reading session</span>
              </div>
              <span className="font-semibold text-[#1D1D1F]">Day 13 Planned</span>
            </div>
          </div>

          {/* Reader Friends Community Feed matching Image 2 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#1D1D1F]">
                Reader Friends
              </h3>
              <button className="text-[#8A857A] hover:text-[#1D1D1F] p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Review 1 - Rahul Pillai */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Rahul Pillai"
                  className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-[#DDD9CE]"
                />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1D1F]">Rahul Pillai</span>
                    <span className="text-[10px] text-[#8A857A]">2 min ago</span>
                  </div>

                  <p className="text-xs text-[#656157] leading-relaxed">
                    What a delightful and magical chapter it is! It indeed transports readers to the wizarding world.
                  </p>

                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#E06953]">
                    <Check className="w-3 h-3" />
                    <span>Chapter Five: Diagon Alley</span>
                  </div>
                </div>
              </div>

              {/* Review 2 - Anjali Nair */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Anjali Nair"
                  className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-[#DDD9CE]"
                />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1D1F]">Anjali Nair</span>
                    <span className="text-[10px] text-[#8A857A]">15 min ago</span>
                  </div>

                  <p className="text-xs text-[#656157] leading-relaxed">
                    I finished reading the chapter last night and the potion classroom scene had me completely absorbed.
                  </p>

                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#E06953]">
                    <Check className="w-3 h-3" />
                    <span>Chapter Twelve: The Polyjuice Potion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
