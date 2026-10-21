import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminOverview, PickupBooking, WasteItem, WasteCategory, Facility, AuditLogItem } from '../types';
import { 
  ShieldCheck, 
  Users, 
  CalendarClock, 
  BookOpen, 
  MapPin, 
  Award, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, token, demoLogin } = useAuth();
  
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'pickups' | 'kb' | 'facilities' | 'audit'>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [bookings, setBookings] = useState<PickupBooking[]>([]);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemAliases, setNewItemAliases] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<number>(1);
  const [newItemPrep, setNewItemPrep] = useState('');
  const [newItemMethod, setNewItemMethod] = useState('');
  const [newItemRecyclability, setNewItemRecyclability] = useState('High Recyclability');
  const [newItemWarnings, setNewItemWarnings] = useState('');
  const [newItemSource, setNewItemSource] = useState('Municipal Guidelines');
  const [creatingItem, setCreatingItem] = useState(false);
  const [itemSuccessMsg, setItemSuccessMsg] = useState<string | null>(null);

  // Reset Demo Data
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user, token, activeAdminTab]);

  const loadAdminData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    if (activeAdminTab === 'overview') {
      fetch('/api/admin/overview', { headers })
        .then(res => res.json())
        .then(data => { setOverview(data); setLoading(false); })
        .catch(console.error);
    } else if (activeAdminTab === 'pickups') {
      fetch('/api/bookings', { headers })
        .then(res => res.json())
        .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(console.error);
    } else if (activeAdminTab === 'kb') {
      Promise.all([
        fetch('/api/waste-items').then(res => res.json()),
        fetch('/api/categories').then(res => res.json())
      ]).then(([items, cats]) => {
        setWasteItems(items);
        setCategories(cats);
        setLoading(false);
      });
    } else if (activeAdminTab === 'facilities') {
      fetch('/api/facilities')
        .then(res => res.json())
        .then(data => { setFacilities(data); setLoading(false); })
        .catch(console.error);
    } else if (activeAdminTab === 'audit') {
      fetch('/api/admin/audit-logs', { headers })
        .then(res => res.json())
        .then(data => { setAuditLogs(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(console.error);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWasteItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingItem(true);
    try {
      const res = await fetch('/api/admin/waste-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newItemName,
          aliases: newItemAliases,
          category_id: newItemCategory,
          preparation_steps: newItemPrep,
          disposal_method: newItemMethod,
          recyclability_status: newItemRecyclability,
          warnings: newItemWarnings.trim() || undefined,
          source: newItemSource
        })
      });

      if (res.ok) {
        setItemSuccessMsg(`Added '${newItemName}' to knowledge base.`);
        setNewItemName('');
        setNewItemAliases('');
        setNewItemPrep('');
        setNewItemMethod('');
        setNewItemWarnings('');
        loadAdminData();
        setTimeout(() => setItemSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleDeleteWasteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to remove this item from the knowledge base?')) return;
    try {
      const res = await fetch(`/api/admin/waste-items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setWasteItems(wasteItems.filter(w => w.id !== itemId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset entire demonstration database to fresh competition state?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-demo-data', { method: 'POST' });
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  // If user is not admin, show access guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">
          Admin Authentication Required
        </h2>
        <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
          The Admin Operations Console is restricted to verified municipal sustainability administrators and judges. Ordinary citizen profiles cannot access or modify these endpoints.
        </p>
        <div className="pt-2">
          <button
            onClick={() => demoLogin('admin')}
            className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-700/20 transition flex items-center gap-2 mx-auto"
          >
            <ShieldCheck size={16} />
            <span>Switch to Demo Admin (admin@ecosort.org)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-8">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-purple-100 text-purple-800 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-purple-700" /> Admin Console
            </span>
            <span className="text-xs text-gray-500 font-medium">Logged in as: {user.full_name}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Municipal Operations Dashboard
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            Manage dispatch pickups, curate the centralized waste knowledge base, inspect certified recycling centers, and review security audit logs.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-xs sm:text-sm shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <RotateCcw size={15} className={resetting ? "animate-spin" : ""} />
          <span>{resetting ? 'Resetting...' : 'Reset Demo Data to Seed'}</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Demonstration database reset to pristine state. Reloading...</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'overview', label: 'Operational Overview', icon: Users },
          { id: 'pickups', label: 'Pickup Bookings Queue', icon: CalendarClock },
          { id: 'kb', label: 'Knowledge Base Editor', icon: BookOpen },
          { id: 'facilities', label: 'Facility Directory', icon: MapPin },
          { id: 'audit', label: 'Security Audit Log', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition shrink-0 ${
                isActive
                  ? 'bg-purple-900 text-white border-b-2 border-purple-500 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Citizens</span>
              <div className="text-2xl font-black text-purple-950">{overview.metrics.citizens_count}</div>
              <p className="text-[10px] text-gray-400">Registered</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Classifications</span>
              <div className="text-2xl font-black text-purple-950">{overview.metrics.classifications_count}</div>
              <p className="text-[10px] text-gray-400">Total Scanned</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Pending Pickups</span>
              <div className="text-2xl font-black text-amber-600">{overview.metrics.pending_pickups}</div>
              <p className="text-[10px] text-gray-400">Awaiting Dispatch</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Completed</span>
              <div className="text-2xl font-black text-emerald-700">{overview.metrics.completed_pickups}</div>
              <p className="text-[10px] text-gray-400">Pickups Done</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Points Distributed</span>
              <div className="text-2xl font-black text-purple-950">{overview.metrics.points_distributed}</div>
              <p className="text-[10px] text-gray-400">EcoPoints in Ledger</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Knowledge Base</span>
              <div className="text-2xl font-black text-purple-950">{overview.metrics.kb_items_count}</div>
              <p className="text-[10px] text-gray-400">Disposal Items</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              Waste Stream Distribution
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {overview.category_distribution.map((cat, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800">{cat.name}</span>
                  <span className="font-bold text-purple-800">{cat.count} items</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PICKUPS QUEUE */}
      {activeAdminTab === 'pickups' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">
              All Citizen Doorstep Collection Bookings
            </h3>
            <span className="text-xs text-gray-500 font-semibold">{bookings.length} Bookings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Citizen Contact</th>
                  <th className="py-2.5 px-3">Waste Stream</th>
                  <th className="py-2.5 px-3">Scheduled Slot</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-purple-900">{b.booking_reference}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{b.user_name}</div>
                      <div className="text-[11px] text-gray-500">{b.user_phone}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-800">{b.category_name} (~{b.estimated_weight_kg}kg)</td>
                    <td className="py-3 px-3">{b.preferred_date} <br /><span className="text-gray-400 text-[10px]">{b.time_slot}</span></td>
                    <td className="py-3 px-3 max-w-xs truncate text-gray-600">{b.pickup_address}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'requested' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'assigned')}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold"
                          >
                            Assign Driver
                          </button>
                        )}
                        {b.status === 'assigned' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'collected')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                          >
                            Mark Collected
                          </button>
                        )}
                        {b.status !== 'cancelled' && b.status !== 'collected' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                            className="px-2 py-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: KNOWLEDGE BASE EDITOR */}
      {activeAdminTab === 'kb' && (
        <div className="space-y-6">
          {/* Add Item Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Plus size={18} className="text-purple-700" />
              Add Item to Waste Knowledge Base
            </h3>

            {itemSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>{itemSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateWasteItem} className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Broken Ceramic Mug"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Search Aliases (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={newItemAliases}
                  onChange={(e) => setNewItemAliases(e.target.value)}
                  placeholder="e.g. coffee cup, porcelain shard"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Waste Stream Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.bin_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Recyclability Status</label>
                <input
                  type="text"
                  value={newItemRecyclability}
                  onChange={(e) => setNewItemRecyclability(e.target.value)}
                  placeholder="e.g. Non-recyclable residual"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Step-by-Step Preparation</label>
                <input
                  type="text"
                  required
                  value={newItemPrep}
                  onChange={(e) => setNewItemPrep(e.target.value)}
                  placeholder="e.g. Wrap shards in newspaper to protect handlers"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Disposal & Processing Route</label>
                <input
                  type="text"
                  required
                  value={newItemMethod}
                  onChange={(e) => setNewItemMethod(e.target.value)}
                  placeholder="e.g. Black residual bin"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Safety Warnings (Optional)</label>
                <input
                  type="text"
                  value={newItemWarnings}
                  onChange={(e) => setNewItemWarnings(e.target.value)}
                  placeholder="e.g. Sharp edge puncture hazard for sanitation workers"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={creatingItem}
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {creatingItem ? 'Saving...' : 'Add Waste Item to Live Database'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing KB Items */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Existing Knowledge Base Items ({wasteItems.length})
            </h3>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {wasteItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-[11px] text-gray-500">Category: {item.category_name} | Bin: {item.bin_name}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWasteItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FACILITIES */}
      {activeAdminTab === 'facilities' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900">
            Registered Recycling Facilities ({facilities.length})
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {facilities.map((fac) => (
              <div key={fac.id} className="p-4 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="font-bold text-sm text-gray-900">{fac.name}</div>
                <div className="text-purple-700 font-semibold">{fac.facility_type}</div>
                <div className="text-gray-500">{fac.address}, {fac.city}</div>
                <div className="text-gray-400 text-[11px]">Hours: {fac.operating_hours}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">
              Administrative Security & Audit Log
            </h3>
            <span className="text-xs text-gray-500">Immutable Relational Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">{log.created_at}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-purple-950">{log.admin_email}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800">{log.action}</td>
                    <td className="py-2.5 px-3 text-gray-600">{log.target_entity} #{log.target_id}</td>
                    <td className="py-2.5 px-3 font-sans text-gray-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
