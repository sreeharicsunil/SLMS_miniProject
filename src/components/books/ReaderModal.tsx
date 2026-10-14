import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Bookmark, Settings, Type, BookOpen } from 'lucide-react';
import { Book } from '../../types';

interface ReaderModalProps {
  book: Book;
  onClose: () => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({ book, onClose }) => {
  const [currentPage, setCurrentPage] = useState(154);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const totalPages = book.pageCount || 345;

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(p => p + 2);
  };

  const handlePrev = () => {
    if (currentPage > 2) setCurrentPage(p => p - 2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1D1F]/90 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fade-in text-[#1D1D1F]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between text-white max-w-5xl w-full mx-auto pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#E06953]" />
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base leading-none">{book.title}</h3>
            <span className="text-[11px] text-neutral-400">By {book.authors.join(', ')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFontSize(f => f === 'normal' ? 'large' : 'normal')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Toggle Font Size"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-xl transition-colors ${isBookmarked ? 'bg-[#E06953] text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            title="Bookmark Page"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Exit Reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reader Spread Canvas */}
      <div className="flex-1 flex items-center justify-center max-w-5xl w-full mx-auto relative my-auto">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentPage <= 2}
          className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shadow-lg hover:scale-105 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 2-Page Open Book Spread */}
        <div className="w-full max-w-4xl aspect-[1.4/1] max-h-[75vh] bg-[#FAF8F2] rounded-r-lg rounded-l-lg shadow-2xl flex border border-[#DDD8C7] overflow-hidden open-book-spine relative">
          {/* Left Page */}
          <div className="flex-1 p-6 sm:p-10 border-r border-[#E0DDD1] flex flex-col justify-between bg-[#FCFAF5] relative">
            <div className="text-[10px] text-[#8A857A] uppercase tracking-widest text-center border-b border-[#EAE6D8] pb-2">
              {book.title} • Chapter Five
            </div>

            <div className={`space-y-4 my-auto ${fontSize === 'large' ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'} text-[#3D3A32] leading-relaxed`}>
              <p>
                <span className="float-left text-3xl sm:text-4xl font-serif font-bold text-[#1D1D1F] mr-2 leading-none">H</span>
                arry woke early the next morning. Although he could tell it was daylight, he kept his eyes shut tight. &ldquo;It was a dream,&rdquo; he told himself firmly. &ldquo;I dreamed a giant called Hagrid came to tell me I was going to a school for wizards. When I open my eyes I&apos;ll be at home in my cupboard under the stairs.&rdquo;
              </p>
              <p>
                There was a sudden loud rapping noise. And there&apos;s Aunt Petunia knocking on the door, Harry thought, his heart sinking. But he still didn&apos;t open his eyes. It had been such a good dream.
              </p>
              <p className="hidden sm:block">
                Tap. Tap. Tap.
                &ldquo;All right,&rdquo; Harry mumbled, &ldquo;I&apos;m getting up.&rdquo; He sat up and Hagrid&apos;s heavy coat fell off him. The hut was full of sunlight, the storm was over, Hagrid himself was asleep on the collapsed sofa, and there was an owl rapping with its claw on the window...
              </p>
            </div>

            <div className="text-center text-[10px] text-[#A39E93]">
              Page {currentPage}
            </div>
          </div>

          {/* Right Page */}
          <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between bg-[#FAF7F0] relative">
            <div className="text-[10px] text-[#8A857A] uppercase tracking-widest text-center border-b border-[#EAE6D8] pb-2">
              Diagon Alley
            </div>

            <div className={`space-y-4 my-auto ${fontSize === 'large' ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'} text-[#3D3A32] leading-relaxed`}>
              <p>
                Harry scrambled to his feet, so happy he felt as though a large balloon were swelling inside him. He went straight to the window and jerked it open. The owl swooped in and dropped the newspaper on top of Hagrid, who didn&apos;t wake up.
              </p>
              <p>
                The owl then fluttered down onto the floor and began to attack Hagrid&apos;s coat.
                &ldquo;Don&apos;t do that,&rdquo; Harry said, trying to wave the owl away, but it snapped its beak fiercely at him and carried on savaging the coat.
              </p>
              <p className="hidden sm:block">
                &ldquo;Hagrid!&rdquo; said Harry loudly. &ldquo;There&apos;s an owl...&rdquo;
                &ldquo;Pay him,&rdquo; Hagrid grunted into the sofa. &ldquo;Check the pockets. Five Knuts...&rdquo;
              </p>
            </div>

            <div className="text-center text-[10px] text-[#A39E93]">
              Page {currentPage + 1}
            </div>
          </div>

          {/* Spine gradient divider */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none bg-gradient-to-r from-black/15 via-black/5 to-black/15" />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shadow-lg hover:scale-105 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Reader Bottom Bar */}
      <div className="max-w-xl w-full mx-auto text-white flex items-center justify-between text-xs pt-3">
        <span className="text-neutral-400">
          Reading Progress: {Math.round((currentPage / totalPages) * 100)}%
        </span>
        <div className="w-48 h-1.5 rounded-full bg-white/20 overflow-hidden mx-4">
          <div
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
            className="h-full bg-[#E06953] rounded-full transition-all"
          />
        </div>
        <span className="font-semibold">{currentPage} / {totalPages} pages</span>
      </div>
    </div>
  );
};
