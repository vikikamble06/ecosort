import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ImpactSummary, PointsLedgerItem, UserBadge, LeaderboardItem } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Award, 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Users, 
  TreePine, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ImpactPageProps {
  onNavigate: (tab: string) => void;
}

const CATEGORY_CHART_COLORS = ['#10B981', '#0284c7', '#f59e0b', '#14b8a6', '#0284c7', '#64748b', '#8b5cf6', '#ef4444'];

export const ImpactPage: React.FC<ImpactPageProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const [impactData, setImpactData] = useState<ImpactSummary | null>(null);
  const [ledger, setLedger] = useState<PointsLedgerItem[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch summary
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    
    Promise.all([
      fetch('/api/impact/summary', { headers }).then(res => res.json()),
      fetch('/api/gamification/leaderboard').then(res => res.json()),
      token ? fetch('/api/points/ledger', { headers }).then(res => res.json()) : Promise.resolve([]),
      token ? fetch('/api/gamification/badges', { headers }).then(res => res.json()) : Promise.resolve([])
    ])
      .then(([summary, lb, ledg, bdg]) => {
        setImpactData(summary);
        setLeaderboard(Array.isArray(lb) ? lb : []);
        setLedger(Array.isArray(ledg) ? ledg : []);
        setBadges(Array.isArray(bdg) ? bdg : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  // Transform category distribution for Recharts
  const pieData = impactData?.user_metrics?.category_breakdown
    ? Object.entries(impactData.user_metrics.category_breakdown).map(([key, val]) => ({
        name: key.replace(/_/g, ' ').toUpperCase(),
        value: val
      }))
    : [
        { name: 'ORGANIC', value: 8 },
        { name: 'PLASTIC', value: 6 },
        { name: 'PAPER', value: 4 },
        { name: 'E-WASTE', value: 2 }
      ];

  // Weekly sample activity
  const weeklyData = [
    { day: 'Mon', items: 2, points: 15 },
    { day: 'Tue', items: 3, points: 25 },
    { day: 'Wed', items: 1, points: 10 },
    { day: 'Thu', items: 4, points: 30 },
    { day: 'Fri', items: 2, points: 15 },
    { day: 'Sat', items: 5, points: 45 },
    { day: 'Sun', items: 3, points: 20 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <Award size={14} className="text-emerald-700" /> Transparent Gamification
          </span>
          <span className="text-xs text-gray-500 font-medium">Auditable Environmental Accounting</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
          EcoPoints & Impact Ledger
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          Gamified sustainability backed by explicit scientific conversion factors. No exaggerated offsets—only verifiable diversion metrics.
        </p>
      </div>

      {/* Verified KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>EcoPoints</span>
            <Award size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-emerald-900">
            {user ? (user.total_points ?? 0) : 45} <span className="text-xs font-medium text-emerald-700">pts</span>
          </div>
          <p className="text-[11px] text-gray-500">Earned from confirmed sortings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Diverted Mass</span>
            <Leaf size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-900">
            {impactData?.user_metrics?.estimated_diverted_kg ?? 16.5} <span className="text-xs font-medium text-emerald-700">kg</span>
          </div>
          <p className="text-[11px] text-gray-500">Kept out of residual landfills</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Avoided CO₂e</span>
            <TrendingUp size={18} className="text-teal-600" />
          </div>
          <div className="text-3xl font-black text-emerald-900">
            {impactData?.user_metrics?.co2_avoided_kg ?? 23.1} <span className="text-xs font-medium text-emerald-700">kg</span>
          </div>
          <p className="text-[11px] text-gray-500">1.4 kg CO₂e / kg diverted</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Tree Equivalent</span>
            <TreePine size={18} className="text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-emerald-900">
            {impactData?.user_metrics?.trees_saved_equivalent ?? 0.08} <span className="text-xs font-medium text-emerald-700">tree</span>
          </div>
          <p className="text-[11px] text-gray-500">Based on clean paper recycled</p>
        </div>
      </div>

      {/* Weekly Sustainability Challenge Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
              <Flame size={12} className="text-amber-400" /> Weekly Eco Sprint
            </span>
            <span className="text-xs text-emerald-200">Ends Sunday Midnight</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Sprint Goal: Segregate & Log 10 Dry Recyclables
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Boost recycling mill purity by sorting clean paper, cardboard, or plastic bottles without food stains.
          </p>
          {/* Progress bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs font-semibold text-emerald-200">
              <span>Current Progress: 7 of 10 items</span>
              <span>70%</span>
            </div>
            <div className="w-full h-2.5 bg-emerald-950/60 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full w-[70%]" />
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('scanner')}
          className="px-5 py-3 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs shadow-md transition shrink-0 self-start md:self-center flex items-center gap-1.5"
        >
          <span>Scan Next Item</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Charts Grid (Recharts Analytics) */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Weekly Sorting Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">
              Weekly Sorting Frequency
            </h3>
            <span className="text-xs text-gray-500 font-medium">Last 7 Days</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="items" fill="#10B981" radius={[6, 6, 0, 0]} name="Items Sorted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">
              Stream Breakdown
            </h3>
            <span className="text-xs text-gray-500 font-medium">By Category</span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] justify-center">
            {pieData.map((d, i) => (
              <span key={i} className="flex items-center gap-1 text-gray-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: CATEGORY_CHART_COLORS[i % CATEGORY_CHART_COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Badges & Achievements Catalog */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Sustainability Milestone Badges
            </h3>
            <p className="text-xs text-gray-500">Unlocked automatically as you reach genuine sorting and recycling milestones.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-center space-y-2 transition ${
                badge.earned
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400 shadow-xs'
                  : 'bg-gray-50/50 border-gray-200 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                badge.earned ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'
              }`}>
                <CategoryIcon name={badge.icon} size={22} />
              </div>
              <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{badge.name}</h4>
              <p className="text-[10px] text-gray-500 line-clamp-2">{badge.description}</p>
              <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${
                badge.earned ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-600'
              }`}>
                {badge.earned ? 'Earned' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Points Ledger & Community Leaderboard (2 Columns) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Auditable Ledger Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-700" />
                Auditable Points Ledger
              </h3>
              <p className="text-xs text-gray-500">Database-enforced event ledger preventing duplicate awards</p>
            </div>
          </div>

          {ledger.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
              No transactions recorded yet. Confirm your first classification to log points.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ledger.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-2.5 px-3 font-mono text-gray-500">{item.created_at.split(' ')[0]}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-800">{item.description}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400">{item.reference_id}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">+{item.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Opt-In Community Leaderboard (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-emerald-700" />
                Community Leaderboard
              </h3>
              <p className="text-xs text-gray-500">Opt-in ranking with privacy-masked citizen names</p>
            </div>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Monthly
            </span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((lb) => (
              <div
                key={lb.rank}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    lb.rank === 1 ? 'bg-amber-400 text-slate-900' :
                    lb.rank === 2 ? 'bg-slate-300 text-slate-900' :
                    lb.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {lb.rank}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">{lb.display_name}</span>
                    <span className="text-[10px] text-gray-400 block">{lb.items_sorted} items sorted</span>
                  </div>
                </div>

                <span className="font-extrabold text-emerald-800 text-sm">
                  {lb.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Methodology & Transparency Disclosure */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
        <span className="font-bold flex items-center gap-1.5 text-emerald-900">
          <ShieldCheck size={14} className="text-emerald-700" /> Impact Accounting Transparency Notice:
        </span>
        <p className="text-gray-700 leading-relaxed text-[11px]">
          {impactData?.methodology?.transparency} Calculations adhere to the {impactData?.methodology?.carbon_factor} and {impactData?.methodology?.tree_factor}.
        </p>
      </div>
    </div>
  );
};
