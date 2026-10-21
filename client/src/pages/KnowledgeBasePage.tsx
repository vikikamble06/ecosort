import React, { useState, useEffect } from 'react';
import { WasteItem, WasteCategory } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Sparkles, 
  X, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  MapPin, 
  Layers, 
  HelpCircle,
  ArrowRight,
  Globe,
  Building2
} from 'lucide-react';

interface KnowledgeBasePageProps {
  onNavigate: (tab: string) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<WasteItem[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [popularOnly, setPopularOnly] = useState(false);
  const [jurisdictionMode, setJurisdictionMode] = useState<'universal' | 'municipal'>('municipal');
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Recent searches in session
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Banana peel', 'Plastic bottle', 'Lithium battery', 'Cooking oil'
  ]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);

    fetchItems();
  }, [selectedCategory, popularOnly]);

  const fetchItems = () => {
    setLoading(true);
    let url = '/api/waste-items?';
    if (selectedCategory) url += `category_id=${selectedCategory}&`;
    if (popularOnly) url += `popular_only=true&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchItems();
      return;
    }

    setLoading(true);
    // Add to recent
    if (!recentSearches.includes(searchQuery.trim())) {
      setRecentSearches([searchQuery.trim(), ...recentSearches.slice(0, 3)]);
    }

    let url = `/api/waste-items/search?q=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory) url += `&category_id=${selectedCategory}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const openItemDetail = (itemId: number) => {
    fetch(`/api/waste-items/${itemId}`)
      .then(res => res.json())
      .then(data => setSelectedItem(data))
      .catch(console.error);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <BookOpen size={14} className="text-emerald-700" /> Waste Encyclopedia
            </span>
            <span className="text-xs text-gray-500 font-medium">Verified Segregation Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
            Smart Waste Disposal Guide
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            Search any household item, packaging, or scrap to discover the verified bin requirements, preparation steps, and processing facilities.
          </p>
        </div>

        {/* Local Rules Mode Toggle (Competition Differentiator) */}
        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex items-center text-xs">
          <button
            onClick={() => setJurisdictionMode('municipal')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              jurisdictionMode === 'municipal' 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 size={13} />
            <span>Local Municipal Rules</span>
          </button>
          <button
            onClick={() => setJurisdictionMode('universal')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              jurisdictionMode === 'universal' 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe size={13} />
            <span>Universal Standard</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-8 space-y-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search waste item (e.g. banana peel, medicine, pizza box, lithium battery, aerosol can)..."
            className="w-full pl-12 pr-28 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition"
          >
            Search
          </button>
        </form>

        {/* Recent & Popular Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-gray-500 font-semibold flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-600" /> Quick Lookups:
          </span>
          {recentSearches.map((tag, i) => (
            <button
              key={i}
              onClick={() => {
                setSearchQuery(tag);
                let url = `/api/waste-items/search?q=${encodeURIComponent(tag)}`;
                fetch(url).then(res => res.json()).then(setItems);
              }}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium transition"
            >
              {tag}
            </button>
          ))}
          <button
            onClick={() => setPopularOnly(!popularOnly)}
            className={`px-3 py-1 rounded-full font-semibold border transition ml-auto ${
              popularOnly 
                ? 'bg-emerald-800 text-white border-emerald-800' 
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {popularOnly ? 'Showing Most Common' : 'Filter: Most Common Discards'}
          </button>
        </div>

        {/* Category Pills */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
              selectedCategory === null 
                ? 'bg-emerald-900 text-white shadow-xs' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories ({items.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                  isSelected 
                    ? 'shadow-xs font-bold' 
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.color : cat.bg_color,
                  color: isSelected ? '#ffffff' : cat.color,
                  border: `1px solid ${isSelected ? cat.color : '#e5e7eb'}`
                }}
              >
                <CategoryIcon name={cat.icon} size={13} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
          <HelpCircle size={36} className="mx-auto text-gray-400" />
          <h3 className="text-lg font-bold text-gray-800">No matching waste items found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try searching with broader keywords like "paper", "oil", "glass", or clear your category filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); fetchItems(); }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => openItemDetail(item.id)}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold"
                    style={{ backgroundColor: item.category_bg_color, color: item.category_color }}
                  >
                    <CategoryIcon name={item.category_icon} size={12} />
                    {item.category_name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                    {item.bin_name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  Aliases: {item.aliases}
                </p>

                {item.warnings && (
                  <div className="mt-2.5 p-2 bg-red-50 rounded-lg border border-red-100 flex items-center gap-1.5 text-[11px] font-bold text-red-700">
                    <ShieldAlert size={13} className="shrink-0" />
                    <span className="truncate">{item.warnings}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-800">
                  {item.recyclability_status}
                </span>
                <span className="text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition font-bold flex items-center gap-0.5">
                  Guide <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Decision Drawer / Modal: WHAT SHOULD I DO WITH THIS? */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden max-h-[90vh] flex flex-col text-left">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1.5 text-white shadow-xs"
                  style={{ backgroundColor: selectedItem.category_color }}
                >
                  <CategoryIcon name={selectedItem.category_icon} size={14} />
                  {selectedItem.category_name}
                </span>
                <span className="text-xs text-emerald-200 font-medium">
                  Jurisdiction: {selectedItem.region}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {selectedItem.name}
              </h2>
              <p className="text-xs text-emerald-100 mt-1">
                Also known as: {selectedItem.aliases}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Warnings if any */}
              {selectedItem.warnings && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-950 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-red-700">
                    <ShieldAlert size={16} /> CRITICAL SAFETY WARNING:
                  </div>
                  <p className="text-red-900 leading-relaxed font-medium">
                    {selectedItem.warnings}
                  </p>
                </div>
              )}

              {/* WHAT SHOULD I DO WITH THIS? Four Clear Steps */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-700" />
                  What Should I Do With This?
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
                      Step 1: Prepare the Item
                    </div>
                    <p className="text-gray-700 pl-6 leading-relaxed">
                      {selectedItem.preparation_steps}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
                      Step 2: Segregate & Select Bin
                    </div>
                    <div className="pl-6 flex items-center gap-2">
                      <span className="text-gray-600">Place inside:</span>
                      <span 
                        className="font-bold px-2.5 py-0.5 rounded text-white shadow-xs"
                        style={{ backgroundColor: selectedItem.bin_color }}
                      >
                        {selectedItem.bin_name}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">3</span>
                      Step 3: Disposal & Collection Route
                    </div>
                    <p className="text-gray-700 pl-6 leading-relaxed">
                      {selectedItem.disposal_method}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">4</span>
                      Step 4: Certified Processing Hub
                    </div>
                    <div className="pl-6 flex items-center justify-between">
                      <span className="text-gray-700">
                        {selectedItem.facility_type_needed || "Standard Municipal MRF"}
                      </span>
                      <button
                        onClick={() => { setSelectedItem(null); onNavigate('locator'); }}
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        Find Centers <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related items */}
              {selectedItem.related_items && selectedItem.related_items.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-gray-700">Related Items in Same Stream:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.related_items.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => openItemDetail(rel.id)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 rounded-lg border border-gray-200 transition font-medium"
                      >
                        {rel.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer source note */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Guidance Source: {selectedItem.source}</span>
                <span>Recyclability: {selectedItem.recyclability_status}</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
