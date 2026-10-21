import React, { useState, useEffect } from 'react';
import { Facility } from '../types';
import { 
  MapPin, 
  Search, 
  Filter, 
  Phone, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Navigation, 
  Building2, 
  Recycle,
  Sparkles,
  Map as MapIcon,
  List
} from 'lucide-react';

interface RecyclingLocatorPageProps {
  onNavigate: (tab: string) => void;
}

export const RecyclingLocatorPage: React.FC<RecyclingLocatorPageProps> = ({ onNavigate }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeFacility, setActiveFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  // User simulated GPS coordinates (Bengaluru Center: 12.9716, 77.5946)
  const userLat = 12.9716;
  const userLng = 77.5946;

  const facilityTypes = [
    { id: 'all', label: 'All Facility Types' },
    { id: 'Composting', label: 'Composting & Organic Hubs' },
    { id: 'E-Waste', label: 'Certified E-Waste Centers' },
    { id: 'Plastic', label: 'Plastic Recovery Plants' },
    { id: 'Paper', label: 'Paper & Metal Aggregators' },
    { id: 'Hazardous', label: 'Hazardous & Battery Depots' },
    { id: 'Glass', label: 'Glass Cullet Stations' },
    { id: 'Municipal', label: 'Municipal MRF Centers' }
  ];

  const commonMaterials = [
    'PET Bottles', 'Lithium Batteries', 'Smartphones', 'Cardboard Boxes', 'Wet Organic Waste', 'Fluorescent CFL Bulbs', 'Used Vegetable Oil'
  ];

  useEffect(() => {
    fetchFacilities();
  }, [selectedType, selectedMaterial]);

  const fetchFacilities = () => {
    setLoading(true);
    let url = '/api/facilities?';
    if (selectedType !== 'all') url += `facility_type=${encodeURIComponent(selectedType)}&`;
    if (searchCity.trim()) url += `city=${encodeURIComponent(searchCity.trim())}&`;
    if (selectedMaterial !== 'all') url += `material=${encodeURIComponent(selectedMaterial)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setFacilities(data);
        if (data.length > 0 && !activeFacility) {
          setActiveFacility(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacilities();
  };

  // Calculate approximate distance in km (Haversine formula)
  const calculateDistance = (lat: number, lng: number) => {
    const R = 6371; // km
    const dLat = (lat - userLat) * Math.PI / 180;
    const dLon = (lng - userLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d.toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-700" /> Facility Directory
            </span>
            <span className="text-xs text-gray-500 font-medium">Verified Recycling Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
            Recycling Center Locator
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            Find verified drop-off hubs, composting units, certified e-waste recyclers, and hazardous collection depots with operating hours.
          </p>
        </div>

        {/* View toggle */}
        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex items-center text-xs">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              viewMode === 'list' 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={14} />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              viewMode === 'map' 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapIcon size={14} />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-8 space-y-4">
        <form onSubmit={handleSearch} className="grid sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search by city, locality or postal code (e.g. Indiranagar, Whitefield, 560034)..."
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              {facilityTypes.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition"
            >
              Filter Centers
            </button>
          </div>
        </form>

        {/* Material Tags Filter */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-gray-400 font-medium shrink-0">Filter Material:</span>
          <button
            onClick={() => setSelectedMaterial('all')}
            className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition ${
              selectedMaterial === 'all'
                ? 'bg-emerald-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Materials
          </button>
          {commonMaterials.map((mat, i) => (
            <button
              key={i}
              onClick={() => setSelectedMaterial(selectedMaterial === mat ? 'all' : mat)}
              className={`px-2.5 py-1 rounded-full font-medium shrink-0 transition ${
                selectedMaterial === mat
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Content: List or Map View */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-48 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
          <MapPin size={36} className="mx-auto text-gray-400" />
          <h3 className="text-lg font-bold text-gray-800">No verified facilities found for criteria</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try resetting your city or material filters to explore all available verified recycling centers.
          </p>
          <button
            onClick={() => { setSearchCity(''); setSelectedType('all'); setSelectedMaterial('all'); }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition"
          >
            View All Facilities
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {facilities.map((fac) => {
            const dist = calculateDistance(fac.latitude, fac.longitude);
            return (
              <div
                key={fac.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between text-left space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {fac.facility_type}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">
                        {fac.name}
                      </h3>
                    </div>
                    <span className="shrink-0 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1">
                      <Navigation size={12} /> ~{dist} km
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-2">
                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{fac.address}, {fac.city} {fac.postal_code}</span>
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{fac.operating_hours}</span>
                    </div>
                    {fac.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-emerald-600 shrink-0" />
                        <span>{fac.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Supported Materials Tags */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Accepted Streams:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {fac.supported_materials.map((mat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] bg-gray-50 border border-gray-200 text-gray-700 font-medium"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 size={13} /> Verified Municipal Partner
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <span>Directions</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Interactive Simulated Map View */
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Map Left List (4 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {facilities.map((fac) => {
              const isSelected = activeFacility?.id === fac.id;
              const dist = calculateDistance(fac.latitude, fac.longitude);
              return (
                <div
                  key={fac.id}
                  onClick={() => setActiveFacility(fac)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-800 uppercase text-[10px]">{fac.facility_type}</span>
                    <span className="font-semibold text-gray-500">~{dist} km</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{fac.name}</h4>
                  <p className="text-xs text-gray-500 truncate mt-1">{fac.address}</p>
                </div>
              );
            })}
          </div>

          {/* Map Visualization Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 min-h-[500px] relative overflow-hidden flex flex-col justify-between">
            {/* Grid background simulation */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
                Interactive Geographic Matrix
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Centered on City Hub (12.97°N, 77.59°E)
              </span>
            </div>

            {/* Pins on canvas */}
            <div className="relative z-10 my-12 h-64 border border-slate-800/80 rounded-xl bg-slate-950/40 p-4 relative flex items-center justify-center">
              {/* User location pin */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-500/30 animate-pulse" />
                <span className="text-[10px] font-bold text-blue-300 mt-1 bg-slate-900/90 px-1.5 py-0.5 rounded">You</span>
              </div>

              {/* Sample facility scatter pins */}
              {facilities.map((fac, idx) => {
                const isSelected = activeFacility?.id === fac.id;
                // Distributed coordinates projection for mock visual
                const offsets = [
                  { x: '25%', y: '30%' },
                  { x: '75%', y: '40%' },
                  { x: '35%', y: '70%' },
                  { x: '80%', y: '20%' },
                  { x: '20%', y: '80%' },
                  { x: '65%', y: '75%' },
                  { x: '50%', y: '15%' },
                  { x: '85%', y: '85%' },
                ];
                const pos = offsets[idx % offsets.length];

                return (
                  <button
                    key={fac.id}
                    onClick={() => setActiveFacility(fac)}
                    style={{ left: pos.x, top: pos.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-400 text-slate-950 scale-125 z-20 shadow-lg shadow-emerald-400/50 ring-4 ring-emerald-400/30'
                        : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-600'
                    }`}
                    title={fac.name}
                  >
                    <MapPin size={isSelected ? 16 : 12} />
                  </button>
                );
              })}
            </div>

            {/* Selected Pin Details Box */}
            {activeFacility && (
              <div className="relative z-10 bg-slate-800/90 backdrop-blur-md rounded-xl p-4 border border-slate-700 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-300 text-sm">{activeFacility.name}</h4>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeFacility.latitude},${activeFacility.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-md transition flex items-center gap-1"
                  >
                    Open Map <ExternalLink size={12} />
                  </a>
                </div>
                <p className="text-xs text-gray-300">{activeFacility.address}, {activeFacility.city}</p>
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span>Hours: {activeFacility.operating_hours}</span>
                  {activeFacility.phone && <span>Tel: {activeFacility.phone}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
