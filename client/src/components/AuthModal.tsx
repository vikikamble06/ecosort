import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, MapPin, Phone, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authModalMode, 
    setAuthModalMode, 
    login, 
    register, 
    demoLogin 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (authModalMode === 'login') {
      const res = await login(email, password);
      if (!res.success) setError(res.error || 'Login failed');
    } else {
      const res = await register({ email, password, full_name: fullName, address, phone });
      if (!res.success) setError(res.error || 'Registration failed');
    }
    setLoading(false);
  };

  const handleDemo = async (role: 'citizen' | 'admin') => {
    setError(null);
    setLoading(true);
    await demoLogin(role);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white text-center relative">
          <button 
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-300/30 mb-2">
            <Sparkles className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {authModalMode === 'login' ? 'Welcome to EcoSort' : 'Join EcoSort Today'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            {authModalMode === 'login' ? 'Access your sustainability profile & impact ledger' : 'Start sorting smarter and earning verified EcoPoints'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => { setAuthModalMode('login'); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              authModalMode === 'login' 
                ? 'text-emerald-800 border-b-2 border-emerald-600 bg-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalMode('register'); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              authModalMode === 'register' 
                ? 'text-emerald-800 border-b-2 border-emerald-600 bg-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Access Bar for Competition Judges */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" /> Instant Demo Sign-In
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Competition Ready</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('citizen')}
              disabled={loading}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <UserIcon size={13} className="text-emerald-600" /> Citizen (Demo)
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              disabled={loading}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-900 border border-emerald-800 text-white hover:bg-emerald-950 shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={13} className="text-emerald-400" /> Admin (Demo)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Green"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {authModalMode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Address (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Apt, Street, City"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : authModalMode === 'login' ? (
              'Sign In to Dashboard'
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
