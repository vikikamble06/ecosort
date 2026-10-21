import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClassificationRecord, WasteCategory } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Layers,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface WasteHistoryPageProps {
  onNavigate: (tab: string) => void;
}

export const WasteHistoryPage: React.FC<WasteHistoryPageProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<ClassificationRecord[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);

    fetchHistory();
  }, [selectedCategory, token]);

  const fetchHistory = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let url = '/api/classifications/history?';
    if (selectedCategory) url += `category_id=${selectedCategory}&`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure you want to delete this classification record? Associated points will be removed.')) return;
    try {
      const res = await fetch(`/api/classifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(history.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['ID', 'Date', 'Item Name', 'Category', 'Status', 'Points Awarded', 'Model Provider'];
    const rows = history.map(h => [
      h.id,
      h.created_at,
      `"${h.predicted_item_name.replace(/"/g, '""')}"`,
      `"${(h.confirmed_category_name || h.predicted_category_name || '').replace(/"/g, '""')}"`,
      h.status,
      h.points_awarded,
      `"${h.model_provider.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecosort_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered in-memory records
  const filteredHistory = history.filter(item => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      item.predicted_item_name.toLowerCase().includes(term) ||
      (item.confirmed_category_name && item.confirmed_category_name.toLowerCase().includes(term))
    );
  });

  // Derived explainable insights strictly from user data
  const totalSorted = history.length;
  const totalPoints = history.reduce((sum, h) => sum + (h.points_awarded || 0), 0);
  const categoryCounts: Record<string, number> = {};
  history.forEach(h => {
    const cat = h.confirmed_category_name || h.predicted_category_name || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <History size={14} className="text-emerald-700" /> Personal Activity Log
            </span>
            <span className="text-xs text-gray-500 font-medium">Logged Discards & Verified Sorts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
            Waste Sorting History
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            Review your historical sorting decisions, correct past records, explore data-driven insights, and export your personal waste audit.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={history.length === 0}
          className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold rounded-xl text-xs sm:text-sm shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto disabled:opacity-50"
        >
          <Download size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Personalized Data-Driven Insights Cards */}
      {history.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
            <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" /> Total Verified Actions
            </span>
            <div className="text-2xl font-black text-emerald-950">{totalSorted} items logged</div>
            <p className="text-[11px] text-gray-600">Totaling {totalPoints} verified EcoPoints</p>
          </div>

          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-teal-950 space-y-1">
            <span className="text-xs font-bold text-teal-800 uppercase flex items-center gap-1.5">
              <Layers size={14} className="text-teal-600" /> Primary Discard Stream
            </span>
            <div className="text-2xl font-black text-teal-950">{topCategory ? topCategory[0] : 'None'}</div>
            <p className="text-[11px] text-gray-600">{topCategory ? `${topCategory[1]} items recorded in this stream` : 'Start sorting to see stream patterns'}</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
              <Lightbulb size={14} className="text-amber-600" /> Environmental Advisory
            </span>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Keep segregating batteries and e-waste into designated drop-offs to prevent fire risks in municipal haulers.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="grid sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search history by item name or category..."
              className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="w-full py-2 px-3 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">
            Loading sorting trajectory...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History size={36} className="mx-auto text-gray-400" />
            <h3 className="text-base font-bold text-gray-800">No sorting history matches your filter</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Scan items in the AI Scanner to build your personal verifiable sustainability timeline.
            </p>
            <button
              onClick={() => onNavigate('scanner')}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition"
            >
              Go to AI Scanner
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Confirmed Stream</th>
                  <th className="py-3 px-4">Disposal Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                      {rec.created_at}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {rec.predicted_item_name}
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold"
                        style={{ 
                          backgroundColor: `${rec.confirmed_category_color || rec.predicted_category_color}15`, 
                          color: rec.confirmed_category_color || rec.predicted_category_color 
                        }}
                      >
                        <CategoryIcon name={rec.confirmed_category_icon || rec.predicted_category_icon || 'Recycle'} size={12} />
                        {rec.confirmed_category_name || rec.predicted_category_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {rec.bin_name || "Municipal Collection"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      +{rec.points_awarded}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition"
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
