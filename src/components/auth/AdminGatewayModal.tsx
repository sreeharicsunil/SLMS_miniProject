import React, { useState } from 'react';
import { X, Shield, KeyRound, Lock, UserCheck, AlertTriangle, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';
import { libraryService } from '../../services/libraryService';
import { User, AuthResult } from '../../types';

interface AdminGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: User, token: string) => void;
}

export const AdminGatewayModal: React.FC<AdminGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [identifier, setIdentifier] = useState('admin@smartlib.edu');
  const [securityKey, setSecurityKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!identifier.trim() || !securityKey.trim()) {
      setError('Please provide your staff administrator ID and institutional security key.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const result: AuthResult = libraryService.authenticateAdmin(identifier, securityKey);
        setSuccessInfo(`Staff Identity Verified: ${result.user.name} (${result.user.membershipId})`);
        
        setTimeout(() => {
          onSuccess(result.user, result.token);
          onClose();
        }, 600);
      } catch (err: any) {
        setError(err?.message || 'Access Denied: Invalid administrative credentials.');
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#121316] text-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-white/10 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#E06953]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 flex items-center justify-center transition-colors"
          title="Exit Gateway"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold border border-white/10">
            <Shield className="w-3.5 h-3.5 text-[#E06953]" />
            <span>Institutional Staff & Administrative Gateway</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Restricted Admin Console
          </h2>
          <p className="text-xs text-white/60 leading-relaxed">
            Elevated JWT authorization for circulation desk managers, collection curators, and academic librarians.
          </p>
        </div>

        {/* Status / Error Notifications */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {successInfo && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-snug">{successInfo}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center justify-between">
              <span>Staff ID / Institutional Email</span>
              <span className="text-[10px] text-white/40">e.g. admin@smartlib.edu or ADM-1001-CHIEF</span>
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@smartlib.edu"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E06953] text-white placeholder-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center justify-between">
              <span>Administrative Security Key</span>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[10px] text-[#E06953] hover:underline"
              >
                {showKey ? 'Hide Key' : 'Reveal Key'}
              </button>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E06953] text-white placeholder-white/30 font-mono"
              />
            </div>
            <div className="text-[11px] text-white/40 mt-1 flex items-center justify-between">
              <span>Default key: <code className="text-white/60 font-mono">Admin@SmartLib2026!</code></span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E06953] hover:bg-[#D45943] text-white text-sm font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Validating Cryptographic Signature...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize Administrative Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security telemetry metadata footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#E06953]" />
            <span>JWT Protocol: HS256 / SHA-256</span>
          </div>
          <span className="font-mono">Vault ID: #ADM-GW-SEC</span>
        </div>
      </div>
    </div>
  );
};
