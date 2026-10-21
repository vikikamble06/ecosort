import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PickupBooking, WasteCategory } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { 
  CalendarClock, 
  MapPin, 
  Clock, 
  Phone, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface PickupSchedulerPageProps {
  onNavigate: (tab: string) => void;
}

export const PickupSchedulerPage: React.FC<PickupSchedulerPageProps> = ({ onNavigate }) => {
  const { user, token, setShowAuthModal, setAuthModalMode } = useAuth();
  
  const [bookings, setBookings] = useState<PickupBooking[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState<number>(3); // Paper & Cardboard default
  const [estimatedWeight, setEstimatedWeight] = useState<string>('5.0');
  const [pickupAddress, setPickupAddress] = useState<string>(user?.address || 'Flat 402, Green Meadows, 5th Main Road, Bengaluru');
  
  // Tomorrow's date formatted as YYYY-MM-DD as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  const [preferredDate, setPreferredDate] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 12:00 PM');
  const [contactPreference, setContactPreference] = useState<string>('Phone Call');
  const [notes, setNotes] = useState<string>('');
  
  // Submission & feedback
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);

  // Cancellation modal
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Change of schedule');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);

    if (token) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchBookings = () => {
    setLoading(true);
    fetch('/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }

    setBookingError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          waste_category_id: categoryId,
          estimated_weight_kg: parseFloat(estimatedWeight) || 5.0,
          pickup_address: pickupAddress,
          preferred_date: preferredDate,
          time_slot: timeSlot,
          contact_preference: contactPreference,
          notes: notes.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.detail || 'Failed to schedule pickup.');
      } else {
        setConfirmedBookingRef(data.booking_reference);
        setShowBookingForm(false);
        fetchBookings();
      }
    } catch {
      setBookingError('Network error connecting to booking service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;
    try {
      const res = await fetch(`/api/bookings/${cancellingBookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cancellation_reason: cancelReason })
      });
      if (res.ok) {
        setCancellingBookingId(null);
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending Review</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Confirmed Slot</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Vehicle Dispatched</span>;
      case 'collected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 size={12} /> Collected</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <CalendarClock size={14} className="text-emerald-700" /> Doorstep Logistics
            </span>
            <span className="text-xs text-gray-500 font-medium">Bulk Recyclables & E-Waste</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
            Waste Pickup Scheduler
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            Schedule convenient doorstep collections for large volumes of cardboard, segregated plastics, bulky e-waste, or batteries.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              setAuthModalMode('login');
              setShowAuthModal(true);
            } else {
              setShowBookingForm(!showBookingForm);
              setConfirmedBookingRef(null);
            }
          }}
          className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>{showBookingForm ? 'Close Booking Form' : 'Schedule New Pickup'}</span>
        </button>
      </div>

      {/* Confirmation Banner if just booked */}
      {confirmedBookingRef && (
        <div className="mb-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-extrabold text-base text-emerald-900">
                Pickup Booking Requested! Reference: <span className="font-mono">{confirmedBookingRef}</span>
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Your collection order has been scheduled into the dispatch queue. A municipal collection partner will arrive during your selected window.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-200/60 text-emerald-900 text-xs font-bold rounded-lg shrink-0 self-start sm:self-auto">
            Order Reference Saved
          </span>
        </div>
      )}

      {/* Booking Form Card */}
      {showBookingForm && (
        <div className="mb-10 bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-xl animate-fade-in text-left">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-emerald-700" />
              Book Doorstep Collection
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Fill in your scrap specifications and address. Collections are verified upon weight handoff.
            </p>
          </div>

          {bookingError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <form onSubmit={handleCreateBooking} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Waste Material Stream
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full p-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.bin_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated weight */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Estimated Quantity / Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="500"
                  required
                  value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(e.target.value)}
                  placeholder="e.g. 5.0"
                  className="w-full p-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Preferred Pickup Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Available Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM (Morning Slot)</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Mid-day Slot)</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon Slot)</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening Slot)</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Pickup Address (Flat/Door, Building, Street, Locality)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Enter full collection address"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Contact preference */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Driver Contact Preference
                </label>
                <select
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Phone Call">Phone Call before arrival</option>
                  <option value="SMS">SMS Notification</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Special Instructions / Item Description (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 3 boxes stacked near apartment lobby, 1 broken microwave"
                  className="w-full p-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
              >
                {submitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm & Generate Booking Reference</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? 'Your Pickup Bookings' : 'Sample Active Bookings (Sign In to View Yours)'}
          </h2>
          <span className="text-xs text-gray-500 font-semibold">
            {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'} Logged
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
            <CalendarClock size={36} className="mx-auto text-gray-400" />
            <h3 className="text-lg font-bold text-gray-800">No pickup bookings yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Ready to clear out recyclable packaging or old e-waste? Click "Schedule New Pickup" above to book your collection slot.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-emerald-200 transition text-left flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded bg-gray-100 text-gray-800">
                      {booking.booking_reference}
                    </span>
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold"
                      style={{ backgroundColor: `${booking.category_color}15`, color: booking.category_color }}
                    >
                      <CategoryIcon name={booking.category_icon} size={12} />
                      {booking.category_name}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 font-medium pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-emerald-700" />
                      {booking.preferred_date} ({booking.time_slot})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers size={13} className="text-emerald-700" />
                      ~{booking.estimated_weight_kg} kg estimated
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 flex items-start gap-1.5">
                    <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{booking.pickup_address}</span>
                  </p>

                  {booking.notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg italic">
                      Notes: "{booking.notes}"
                    </p>
                  )}

                  {booking.cancellation_reason && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg font-medium">
                      Cancellation Reason: {booking.cancellation_reason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {booking.status === 'collected' ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <Sparkles size={13} /> +15 EcoPoints Awarded
                    </span>
                  ) : booking.status !== 'cancelled' ? (
                    <button
                      onClick={() => setCancellingBookingId(booking.id)}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-gray-600 font-semibold text-xs rounded-lg border border-gray-200 transition"
                    >
                      Cancel Pickup
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 text-left space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 text-red-700">
              <XCircle size={20} /> Cancel Pickup Booking
            </h3>
            <p className="text-xs text-gray-600">
              Please let our logistics dispatch team know why you are cancelling this appointment:
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Reason for cancellation..."
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
