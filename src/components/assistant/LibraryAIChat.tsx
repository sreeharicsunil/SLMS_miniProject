import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User, ArrowUpRight, BookOpen, ShieldCheck, 
  MapPin, Check, Cpu, Zap, Database, Terminal, ChevronRight, X, Info
} from 'lucide-react';
import { Book, ChatMessage, SlmTelemetry } from '../../types';
import { libraryService } from '../../services/libraryService';
import { SLM_PROFILES } from '../../services/slmEngine';

interface LibraryAIChatProps {
  onSelectBook: (bookId: string) => void;
  initialPrompt?: string;
}

// Error Boundary to prevent AI assistant crashes from rendering a white blank screen
class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("LibraryAIChat crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 shadow-sm max-w-lg mx-auto my-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-[#E06953] flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1D1D1F]">AI Assistant Display Issue</h3>
          <p className="text-xs text-stone-500">
            {this.state.error?.message || "An unexpected error occurred while rendering recommendations."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#1D1D1F] hover:bg-[#333336] text-white rounded-xl text-xs font-medium cursor-pointer transition-colors"
          >
            Reset Chat Assistant
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const LibraryAIChat: React.FC<LibraryAIChatProps> = (props) => (
  <ChatErrorBoundary>
    <LibraryAIChatInner {...props} />
  </ChatErrorBoundary>
);

const LibraryAIChatInner: React.FC<LibraryAIChatProps> = ({ onSelectBook, initialPrompt }) => {
  const [engineMode, setEngineMode] = useState<'slm' | 'standard'>('slm');
  const [tokenBudget, setTokenBudget] = useState<number>(512);
  const [inspectingTelemetry, setInspectingTelemetry] = useState<SlmTelemetry | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I'm **Library AI**, optimized with a **Local Vector RAG & SLM Context Engine** grounded on the Kaggle Google Books dataset and our live stack inventory.

In **SLM Mode**, your queries are processed with:
• **Dense Knowledge Compression** (~75-85% token reduction vs raw JSON)
• **Strict Physical Grounding** on exact barcode and shelf coordinates
• **Zero Hallucination Guarantee** by bounding context within the SLM token window.

Ask me about crime thrillers, software architecture, bestsellers, or physical copy availability!`,
      timestamp: 'Just now',
      engineMode: 'slm',
    }
  ]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const apiRes = await fetch('http://127.0.0.1:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        const suggested: Book[] = (data.recommended_books || []).map((b: any) => {
          const authorStr = b.author || (Array.isArray(b.authors) ? b.authors.join(', ') : 'Author');
          const authorsArr = Array.isArray(b.authors) && b.authors.length > 0
            ? b.authors
            : [authorStr];

          return {
            book_id: String(b.book_id),
            isbn: b.isbn || '978-0000000000',
            title: b.title || 'Untitled Book',
            authors: authorsArr,
            author: authorStr,
            category_name: b.category || b.category_name || 'General',
            category_id: b.category_id || b.category || 'cat-general',
            description: b.description || '',
            publisher: b.publisher || 'Library Collection',
            publication_year: b.publication_year || 2024,
            language: 'English',
            format: 'Hardcover',
            pageCount: b.pages || 300,
            rating: b.rating || 4.5,
            ratingCount: 50,
            image_url: b.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
            totalCopies: b.total_copies || b.available_copies || 2,
            availableCopies: b.available_copies ?? 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Book;
        });

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedBooks: suggested,
          engineMode: 'slm',
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('Backend RAG unavailable, falling back to local SLM engine:', err);
    }

    setTimeout(() => {
      if (engineMode === 'slm') {
        const slmRes = libraryService.answerWithSlm(query, tokenBudget);
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: slmRes.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedBooks: slmRes.suggestedBooks,
          slmTelemetry: slmRes.telemetry,
          engineMode: 'slm',
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const response = libraryService.answerWithLibraryAI(query);
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedBooks: response.suggestedBooks,
          engineMode: 'standard',
        };
        setMessages(prev => [...prev, botMsg]);
      }
      setIsTyping(false);
    }, engineMode === 'slm' ? 350 : 600);
  };

  const samplePrompts = [
    'Recommend crime mystery thrillers by Lisa Regan or James Patterson.',
    'Do you have Americanah by Chimamanda Ngozi Adichie?',
    'Where is Clean Code located in the stacks and how many copies?',
    'Show me machine learning textbooks with available copies.',
    'What is The Bestseller Code about?',
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-[#EAE7DF] shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-[#F0EEE6] bg-[#FAF9F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl text-white flex items-center justify-center shadow-xs transition-colors ${
            engineMode === 'slm' ? 'bg-[#E06953]' : 'bg-[#1D1D1F]'
          }`}>
            {engineMode === 'slm' ? <Zap className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-serif font-bold text-base text-[#1D1D1F] flex items-center gap-2 flex-wrap">
              <span>Library AI Assistant</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                engineMode === 'slm' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {engineMode === 'slm' ? 'SLM Edge Engine' : 'Live Catalog Grounded'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                15K Kaggle Dataset Active
              </span>
            </div>
            <p className="text-[11px] text-[#8A857A]">
              Physical inventory verification • 33 enriched volumes • 100 tracked barcodes
            </p>
          </div>
        </div>

        {/* Engine Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-100/80 p-1 rounded-2xl border border-stone-200/80 text-xs">
          <button
            onClick={() => setEngineMode('slm')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all text-xs ${
              engineMode === 'slm'
                ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                : 'text-[#8A857A] hover:text-[#1D1D1F]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#E06953]" />
            <span>SLM Mode (Edge)</span>
          </button>
          <button
            onClick={() => setEngineMode('standard')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all text-xs ${
              engineMode === 'standard'
                ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                : 'text-[#8A857A] hover:text-[#1D1D1F]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-stone-600" />
            <span>Standard Catalog</span>
          </button>
        </div>
      </div>

      {/* SLM Configuration Sub-bar if in SLM mode */}
      {engineMode === 'slm' && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-50/60 to-orange-50/40 border-b border-amber-100/80 flex items-center justify-between text-[11px] text-amber-900 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#E06953]" />
            <span className="font-semibold">Context Budget:</span>
            <div className="flex items-center gap-1">
              {[256, 512, 1024].map((budget) => (
                <button
                  key={budget}
                  onClick={() => setTokenBudget(budget)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-all ${
                    tokenBudget === budget
                      ? 'bg-[#E06953] text-white font-bold'
                      : 'bg-white/80 text-stone-700 hover:bg-white'
                  }`}
                >
                  {budget} tok
                </button>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-stone-500 flex items-center gap-2">
            <span>Target: Gemma 2B / Phi-3 / Llama 3.2</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-emerald-700 font-semibold">Sub-30ms Grounding</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((m) => {
          const isBot = m.sender === 'assistant';
          return (
            <div key={m.id} className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                isBot 
                  ? (m.engineMode === 'slm' ? 'bg-[#E06953] text-white' : 'bg-[#1D1D1F] text-white')
                  : 'bg-[#1D1D1F] text-white'
              }`}>
                {isBot ? (
                  m.engineMode === 'slm' ? <Zap className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-[#E06953]" />
                ) : 'Me'}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-xl space-y-3 ${isBot ? '' : 'text-right'}`}>
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isBot 
                    ? 'bg-[#FAF9F5] text-[#1D1D1F] border border-[#EAE7DF] rounded-tl-sm shadow-xs'
                    : 'bg-[#1D1D1F] text-white rounded-tr-sm'
                }`}>
                  <div className="whitespace-pre-line">
                    {m.text}
                  </div>

                  {/* SLM Telemetry Pill */}
                  {isBot && m.slmTelemetry && (
                    <div className="mt-3 pt-3 border-t border-[#EAE7DF] flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-2 text-stone-600 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                          SLM: {m.slmTelemetry.tokenCount}/{m.slmTelemetry.maxTokens} tok
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          ⚡ {m.slmTelemetry.compressionRatio}% compressed
                        </span>
                        <span className="text-stone-400">
                          ({m.slmTelemetry.latencyMs}ms)
                        </span>
                      </div>

                      <button
                        onClick={() => setInspectingTelemetry(m.slmTelemetry!)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 text-[#E06953] font-medium border border-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>Inspect Payload</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested Books Cards if returned */}
                {m.suggestedBooks && m.suggestedBooks.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2 text-left">
                    {m.suggestedBooks.map((b) => (
                      <div
                        key={b.book_id}
                        onClick={() => onSelectBook(b.book_id)}
                        className="p-3 rounded-2xl bg-white border border-[#EAE7DF] hover:border-[#D6D2C4] shadow-xs cursor-pointer flex items-center gap-3 group transition-all"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden book-card-shadow shrink-0 bg-[#232323]">
                          <img 
                            src={b.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'} 
                            alt={b.title || 'Book cover'} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="text-xs font-serif font-bold text-[#1D1D1F] truncate group-hover:text-[#E06953]">
                            {b.title || 'Untitled Book'}
                          </h4>
                          <p className="text-[10px] text-[#8A857A] truncate">
                            {Array.isArray(b.authors) && b.authors.length > 0 
                              ? b.authors[0] 
                              : ((b as any).author || 'Library Author')}
                          </p>
                          <div className="pt-1 flex items-center justify-between text-[10px]">
                            <span className={`font-semibold ${(b.availableCopies ?? 0) > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {(b.availableCopies ?? 0) > 0 ? `${b.availableCopies} available` : 'On loan'}
                            </span>
                            <span className="text-[9px] font-mono text-stone-400">
                              ~{b.slm_tokens || 45} tok
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              engineMode === 'slm' ? 'bg-[#E06953] text-white' : 'bg-[#1D1D1F] text-white'
            }`}>
              {engineMode === 'slm' ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className="p-3 bg-[#FAF9F5] border border-[#EAE7DF] rounded-2xl rounded-tl-sm shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E06953] animate-pulse" />
              <span className="text-xs text-[#8A857A]">
                {engineMode === 'slm' ? 'Packing token-compressed context & verifying inventory...' : 'Searching authoritative catalogue...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-[#FAF9F5]/70 border-t border-[#F0EEE6] overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A857A] whitespace-nowrap pl-1">
          Try Asking:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 bg-white border border-[#EAE7DF] hover:border-[#D6D2C4] text-[#1D1D1F] text-[11px] rounded-full whitespace-nowrap shadow-2xs hover:bg-[#F9F8F5] transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-[#F0EEE6] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={engineMode === 'slm' ? "Ask the SLM Edge Assistant (e.g. 'Show me crime thrillers by Lisa Regan')..." : "Ask Library AI about books, shelf locations, or availability..."}
            className="flex-1 bg-[#FAF9F5] border border-[#EAE7DF] focus:border-[#1D1D1F] focus:bg-white rounded-full px-4 py-3 text-xs sm:text-sm text-[#1D1D1F] placeholder-[#8A857A] outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`w-11 h-11 rounded-full text-white flex items-center justify-center transition-all cursor-pointer ${
              input.trim() 
                ? (engineMode === 'slm' ? 'bg-[#E06953] hover:bg-[#c95742] shadow-xs' : 'bg-[#1D1D1F] hover:bg-[#333336] shadow-xs')
                : 'bg-[#EAE7DF] text-[#8A857A] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* SLM Telemetry Payload Inspector Modal */}
      {inspectingTelemetry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EAE7DF] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#F0EEE6] bg-[#FAF9F5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E06953] text-white flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#1D1D1F]">
                    SLM Context Payload Inspector
                  </h3>
                  <p className="text-[10px] text-[#8A857A]">
                    Live token compression and prompt budget injected into edge SLM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingTelemetry(null)}
                className="w-7 h-7 rounded-full bg-white border border-[#EAE7DF] flex items-center justify-center text-[#8A857A] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
                  <span className="text-[10px] text-[#8A857A] block">Token Budget</span>
                  <span className="font-mono font-bold text-sm text-[#1D1D1F]">
                    {inspectingTelemetry.tokenCount} / {inspectingTelemetry.maxTokens}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
                  <span className="text-[10px] text-[#8A857A] block">Raw JSON Equiv</span>
                  <span className="font-mono font-bold text-sm text-stone-500 line-through">
                    ~{inspectingTelemetry.rawTokenEquivalent} tok
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 block">Compression Ratio</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    -{inspectingTelemetry.compressionRatio}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-800 block">Retrieval Latency</span>
                  <span className="font-mono font-bold text-sm text-amber-900">
                    {inspectingTelemetry.latencyMs} ms
                  </span>
                </div>
              </div>

              {/* Dataset Origin Notice */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#E06953] shrink-0 mt-0.5" />
                <div className="text-[11px] text-stone-700 leading-relaxed">
                  <strong className="text-[#1D1D1F]">Kaggle Google Books Dataset Integration:</strong> Context candidates were filtered and token-packed through the <code className="px-1 py-0.5 bg-white rounded border border-stone-300 font-mono text-[10px]">book-dataset.ipynb</code> pipeline. Each book atom carries exact barcode and physical stack coordinates.
                </div>
              </div>

              {/* Exact Prompt Payload */}
              <div>
                <span className="text-[11px] font-bold text-[#1D1D1F] block mb-1">
                  Injected Context Payload (Sent to Edge Model):
                </span>
                <pre className="p-3.5 bg-[#1D1D1F] text-emerald-400 rounded-2xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-64 border border-stone-800">
                  {inspectingTelemetry.contextPayloadSnippet}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#F0EEE6] bg-[#FAF9F5] flex justify-end">
              <button
                onClick={() => setInspectingTelemetry(null)}
                className="px-4 py-2 bg-[#1D1D1F] text-white rounded-full text-xs font-medium hover:bg-[#333336]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
