import React, { useState } from 'react';
import { 
  X, Eye, EyeOff, Lock, Mail, User as UserIcon, Phone, ArrowRight, 
  Sparkles, Shield, CheckCircle2, KeyRound, Building2
} from 'lucide-react';
import { libraryService } from '../../services/libraryService';
import { User, AuthResult } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess: (user: User) => void;
  // Optional pre-selected role if opened from Admin port or specific button
  initialRole?: 'admin' | 'member';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
  initialRole,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState(initialRole === 'admin' ? 'admin@smartlib.edu' : '');
  const [password, setPassword] = useState(initialRole === 'admin' ? 'Admin@SmartLib2026!' : '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  // Determine detected role from input
  const cleanEmail = email.trim().toLowerCase();
  const isAdminTarget = cleanEmail === 'admin' || 
    cleanEmail === 'admin@smartlib.edu' || 
    cleanEmail.startsWith('adm-') ||
    cleanEmail.includes('radhakrishnan');

  const handleSelectQuickAccount = (accountEmail: string, accountPass: string) => {
    setEmail(accountEmail);
    setPassword(accountPass);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      try {
        if (mode === 'signup') {
          if (!name.trim() || !email.trim() || !password) {
            setError('Please fill in all mandatory fields.');
            setLoading(false);
            return;
          }
          if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
          }
          if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
          }

          // Register new member and issue JWT
          const result: AuthResult = libraryService.registerUser(name, email, department, phone, password);
          onSuccess(result.user);
          onClose();
        } else {
          // Unified Sign In (Handles both Admin and Member automatically)
          if (!email.trim() || !password) {
            setError('Please enter your university email or ID and password.');
            setLoading(false);
            return;
          }

          const result: AuthResult = libraryService.authenticate(email, password);
          onSuccess(result.user);
          onClose();
        }
      } catch (err: any) {
        setError(err?.message || 'Authentication failed. Please verify your credentials.');
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-[#EAE7DF] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#E06953]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5F4EE] hover:bg-[#EAE8E0] text-[#656157] flex items-center justify-center transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            {isAdminTarget ? (
              <Shield className="w-5 h-5 text-[#E06953]" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#E06953]" />
            )}
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1D1D1F]">
            {mode === 'signin' ? 'Institutional Sign In' : 'Join the Smart Library'}
          </h2>
          <p className="text-xs text-[#8A857A]">
            {mode === 'signin' 
              ? 'Unified portal login. Admins route to Command, members route to Dashboard.'
              : 'Create your academic profile to borrow books and access the AI.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex rounded-full bg-[#F5F4EE] p-1 mb-5 border border-[#E8E6DF]">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
              mode === 'signin' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#656157] hover:text-[#1D1D1F]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
              mode === 'signup' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#656157] hover:text-[#1D1D1F]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Account Selector (1-Click Fill) */}
        {mode === 'signin' && (
          <div className="mb-5 p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#656157]">
              <span>Quick Demo Accounts (1-Click Fill):</span>
              <span className="text-[10px] text-[#8A857A]">Kerala Faculty & Students</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectQuickAccount('admin@smartlib.edu', 'Admin@SmartLib2026!')}
                className={`p-2 rounded-xl text-left border transition-all text-xs flex items-start gap-2 ${
                  cleanEmail === 'admin@smartlib.edu'
                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                    : 'bg-white text-[#1D1D1F] border-[#E2DFD6] hover:border-[#1D1D1F]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#E06953] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold truncate text-[11px]">Dr. K. S. Radhakrishnan</div>
                  <div className={`text-[10px] truncate ${cleanEmail === 'admin@smartlib.edu' ? 'text-white/70' : 'text-[#8A857A]'}`}>
                    Admin Portal
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('prabakaran.menon@smartlib.edu', 'Password123!')}
                className={`p-2 rounded-xl text-left border transition-all text-xs flex items-start gap-2 ${
                  cleanEmail === 'prabakaran.menon@smartlib.edu'
                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                    : 'bg-white text-[#1D1D1F] border-[#E2DFD6] hover:border-[#1D1D1F]'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold truncate text-[11px]">Prabakaran Menon</div>
                  <div className={`text-[10px] truncate ${cleanEmail === 'prabakaran.menon@smartlib.edu' ? 'text-white/70' : 'text-[#8A857A]'}`}>
                    Student / Member
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('anjali.nair@smartlib.edu', 'Password123!')}
                className={`p-2 rounded-xl text-left border transition-all text-xs flex items-start gap-2 ${
                  cleanEmail === 'anjali.nair@smartlib.edu'
                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                    : 'bg-white text-[#1D1D1F] border-[#E2DFD6] hover:border-[#1D1D1F]'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold truncate text-[11px]">Anjali Nair</div>
                  <div className={`text-[10px] truncate ${cleanEmail === 'anjali.nair@smartlib.edu' ? 'text-white/70' : 'text-[#8A857A]'}`}>
                    Cognitive Science
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('rahul.pillai@smartlib.edu', 'Password123!')}
                className={`p-2 rounded-xl text-left border transition-all text-xs flex items-start gap-2 ${
                  cleanEmail === 'rahul.pillai@smartlib.edu'
                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                    : 'bg-white text-[#1D1D1F] border-[#E2DFD6] hover:border-[#1D1D1F]'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold truncate text-[11px]">Rahul Pillai</div>
                  <div className={`text-[10px] truncate ${cleanEmail === 'rahul.pillai@smartlib.edu' ? 'text-white/70' : 'text-[#8A857A]'}`}>
                    Literature Dept
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Role Detected Banner */}
        {mode === 'signin' && email.trim() && (
          <div className={`mb-4 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between border ${
            isAdminTarget 
              ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              {isAdminTarget ? (
                <Shield className="w-4 h-4 text-[#E06953]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span className="font-semibold">
                {isAdminTarget ? 'Administrative Account Detected' : 'Student / Member Account'}
              </span>
            </div>
            <span className="text-[10px] opacity-80">
              {isAdminTarget ? 'Routes to Operations Command' : 'Routes to Member Dashboard'}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#656157] mb-1">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8A857A] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sreehari Nambiar"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#656157] mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full px-3 py-2 text-sm bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#656157] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94470 12345"
                    className="w-full px-3 py-2 text-sm bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#656157] mb-1">
              {mode === 'signin' ? 'Institutional Email or Staff ID *' : 'University Email *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A857A] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@smartlib.edu or admin@smartlib.edu"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#656157]">Password *</label>
              {mode === 'signin' && (
                <span className="text-[10px] text-[#8A857A]">
                  Default: <code className="text-[#1D1D1F]">Password123!</code> / <code className="text-[#1D1D1F]">Admin@SmartLib2026!</code>
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A857A] absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#8A857A] hover:text-[#1D1D1F]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#656157] mb-1">Confirm Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-[#F5F4EE] border border-[#DDD9CE] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]"
              />
            </div>
          )}

          {mode === 'signin' && (
            <div className="flex items-center justify-between text-xs text-[#656157] pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#1D1D1F]" />
                <span>Keep me signed in</span>
              </label>
              <span className="text-[11px] text-[#8A857A]">
                JWT Session Secured (RFC 7519)
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white text-sm font-medium rounded-full transition-all shadow-md flex items-center justify-center gap-2 mt-3 disabled:opacity-50 ${
              isAdminTarget 
                ? 'bg-[#1D1D1F] hover:bg-[#333336] ring-2 ring-[#E06953]/30'
                : 'bg-[#1D1D1F] hover:bg-[#333336]'
            }`}
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>
                  {mode === 'signup' 
                    ? 'Create Member Account'
                    : isAdminTarget
                    ? 'Sign In to Operations Command'
                    : 'Sign In to Member Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
