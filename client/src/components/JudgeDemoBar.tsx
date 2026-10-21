import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, CheckCircle2, RotateCcw, ChevronDown, ChevronUp, ShieldAlert, ArrowRight, Award } from 'lucide-react';

interface JudgeDemoBarProps {
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export const JudgeDemoBar: React.FC<JudgeDemoBarProps> = ({ onNavigate, activeTab }) => {
  const { user, demoLogin } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const demoSteps = [
    { id: 'scanner', title: '1. AI Scanner', desc: 'Scan waste & test deterministic fallback' },
    { id: 'knowledge', title: '2. Disposal Guide', desc: 'Interactive decision tree & local rules' },
    { id: 'locator', title: '3. Recycling Locator', desc: 'Certified collection hubs & materials' },
    { id: 'pickup', title: '4. Pickup Booking', desc: 'Doorstep collection scheduling & slots' },
    { id: 'impact', title: '5. Impact & Ledger', desc: 'Transparent CO2e metrics & points ledger' },
    { id: 'admin', title: '6. Admin Console', desc: 'Role-based moderation & audit logs' },
  ];

  const handleResetData = async () => {
    if (!confirm('Reset EcoSort demonstration data to pristine competition state?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-demo-data', { method: 'POST' });
      if (res.ok) {
        setResetMessage('Demo data restored to pristine state!');
        setTimeout(() => setResetMessage(null), 4000);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border-b border-emerald-800/40 shadow-lg sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              <Sparkles size={13} className="text-emerald-400" />
              Competition Judge Walkthrough
            </span>
            <span className="hidden md:inline text-xs text-gray-300">
              Logged in as: <strong className="text-white">{user ? `${user.full_name} (${user.role})` : 'Guest Visitor'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => demoLogin('citizen')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center gap-1"
                >
                  Demo Citizen
                </button>
                <button
                  onClick={() => demoLogin('admin')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-700 hover:bg-purple-600 text-white transition flex items-center gap-1"
                >
                  Demo Admin
                </button>
              </div>
            ) : user.role === 'citizen' ? (
              <button
                onClick={() => demoLogin('admin')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-700 hover:bg-purple-600 text-white transition"
              >
                Switch to Admin Mode
              </button>
            ) : (
              <button
                onClick={() => demoLogin('citizen')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-700 hover:bg-emerald-600 text-white transition"
              >
                Switch to Citizen Mode
              </button>
            )}

            <button
              onClick={handleResetData}
              disabled={resetting}
              title="Reset demonstration database"
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 transition flex items-center gap-1"
            >
              <RotateCcw size={12} className={resetting ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-400 hover:text-white rounded"
              aria-label="Toggle demo bar"
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="mt-2 py-1 px-3 bg-emerald-500/20 text-emerald-300 text-xs rounded border border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>{resetMessage}</span>
          </div>
        )}

        {isOpen && (
          <div className="mt-2 pt-2 border-t border-emerald-900/60 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {demoSteps.map((step) => {
              const isCurrent = activeTab === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => onNavigate(step.id)}
                  className={`text-left p-2 rounded-lg transition border text-xs ${
                    isCurrent
                      ? 'bg-emerald-800/60 border-emerald-500 text-white font-medium shadow-sm ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/40 border-slate-800 text-gray-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-emerald-300 flex items-center justify-between">
                    <span>{step.title}</span>
                    {isCurrent && <CheckCircle2 size={12} className="text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 truncate">{step.desc}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
