import React, { useState } from 'react';
import { Bus as BusIcon, Search, ArrowLeftRight, Clock, Star, MapPin, Wifi, Zap, Droplets, Shield, Navigation, Filter, ArrowUpDown, ChevronDown, ChevronUp, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';
import { Bus } from '../types';
import { POPULAR_CITIES } from '../data/mockData';

interface BusSearchResultsProps {
  buses: Bus[];
  source: string;
  setSource: (s: string) => void;
  destination: string;
  setDestination: (d: string) => void;
  travelDate: string;
  setTravelDate: (d: string) => void;
  onSelectSeats: (bus: Bus) => void;
  onViewBusDetails: (bus: Bus) => void;
  onTrackBus: (bus: Bus) => void;
}

export const BusSearchResults: React.FC<BusSearchResultsProps> = ({
  buses,
  source,
  setSource,
  destination,
  setDestination,
  travelDate,
  setTravelDate,
  onSelectSeats,
  onViewBusDetails,
  onTrackBus
}) => {
  // Filters
  const [selectedBusType, setSelectedBusType] = useState('All');
  const [departureTimeFilter, setDepartureTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedAmenity, setSelectedAmenity] = useState('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'cheapest' | 'earliest' | 'fastest'>('recommended');

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  // Filter logic
  let filtered = buses.filter(bus => {
    if (source !== 'All' && bus.source.toLowerCase() !== source.toLowerCase()) return false;
    if (destination !== 'All' && bus.destination.toLowerCase() !== destination.toLowerCase()) return false;
    if (selectedBusType !== 'All' && bus.busType !== selectedBusType) return false;
    if (bus.baseFare > maxPrice) return false;

    if (departureTimeFilter !== 'all') {
      const hour = parseInt(bus.departureTime.split(':')[0], 10);
      if (departureTimeFilter === 'morning' && (hour < 6 || hour >= 12)) return false;
      if (departureTimeFilter === 'afternoon' && (hour < 12 || hour >= 17)) return false;
      if (departureTimeFilter === 'evening' && (hour < 17 || hour >= 21)) return false;
      if (departureTimeFilter === 'night' && (hour >= 6 && hour < 21)) return false;
    }

    if (selectedAmenity !== 'All') {
      if (!bus.amenities.some(a => a.toLowerCase().includes(selectedAmenity.toLowerCase()))) {
        return false;
      }
    }

    return true;
  });

  // Sort logic
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'cheapest') return a.baseFare - b.baseFare;
    if (sortBy === 'earliest') return a.departureTime.localeCompare(b.departureTime);
    if (sortBy === 'fastest') {
      const getMin = (dur: string) => {
        const parts = dur.split('h');
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]?.replace('m', '')) || 0;
        return h * 60 + m;
      };
      return getMin(a.duration) - getMin(b.duration);
    }
    // recommended
    return b.rating - a.rating;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP MODIFY SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">FROM</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="All">All Cities</option>
                {POPULAR_CITIES.map(c => <option key={`src-flt-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="hidden md:flex md:col-span-1 justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Swap Cities"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">TO</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="All">All Cities</option>
                {POPULAR_CITIES.map(c => <option key={`dst-flt-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">DATE</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => {
                setSource('All');
                setDestination('All');
                setSelectedBusType('All');
                setDepartureTimeFilter('all');
                setMaxPrice(2000);
              }}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {/* 2. RESULTS MAIN AREA (FILTERS LEFT + RESULTS RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR FILTERS */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-sky-600" />
              Filter Coaches
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {filtered.length} found
            </span>
          </div>

          {/* Departure Time Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Departure Time
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {[
                { id: 'all', label: 'All Times' },
                { id: 'morning', label: 'Morning (6am-12pm)' },
                { id: 'afternoon', label: 'Afternoon (12-5pm)' },
                { id: 'evening', label: 'Evening (5-9pm)' },
                { id: 'night', label: 'Night (9pm-6am)' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDepartureTimeFilter(t.id as any)}
                  className={`p-2 rounded-xl text-left border transition-colors cursor-pointer ${
                    departureTimeFilter === t.id
                      ? 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bus Type Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Bus Class / Type
            </label>
            <div className="space-y-1 text-xs">
              {['All', 'Multi-Axle Volvo AC', 'AC Sleeper', 'Electric Luxury AC'].map(type => (
                <label key={type} className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="busTypeFilter"
                    checked={selectedBusType === type}
                    onChange={() => setSelectedBusType(type)}
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>{type === 'All' ? 'All Coach Classes' : type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700 uppercase">Max Base Fare</label>
              <span className="font-mono font-bold text-emerald-700">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="400"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹400</span>
              <span>₹2000</span>
            </div>
          </div>

          {/* Amenities Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Specific Amenity
            </label>
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="All">Any Amenities</option>
              <option value="Wi-Fi">Free Wi-Fi</option>
              <option value="Charging">USB Charging</option>
              <option value="Water">Mineral Water</option>
              <option value="Curtain">Private Sleeper Curtains</option>
              <option value="SOS">Emergency SOS</option>
            </select>
          </div>
        </aside>

        {/* RIGHT RESULTS LIST */}
        <div className="lg:col-span-9 space-y-4">
          {/* Header & Sort Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Available Coaches</span>
                <span className="text-xs bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {filtered.length} Buses
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                {source !== 'All' ? source : 'All'} ➔ {destination !== 'All' ? destination : 'All'} • {travelDate}
              </p>
            </div>

            {/* Sort Segmented Control */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase hidden sm:inline">SORT BY:</span>
              <div className="flex p-1 bg-slate-100 rounded-xl font-semibold">
                {[
                  { id: 'recommended', label: 'Recommended' },
                  { id: 'cheapest', label: 'Cheapest' },
                  { id: 'earliest', label: 'Earliest' },
                  { id: 'fastest', label: 'Fastest' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSortBy(s.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      sortBy === s.id
                        ? 'bg-white text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Cards */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <BusIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No buses found for this filter criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try switching origin/destination to &ldquo;All Cities&rdquo; or relaxing price and departure time filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSource('All');
                  setDestination('All');
                  setSelectedBusType('All');
                  setDepartureTimeFilter('all');
                  setMaxPrice(2000);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((bus) => {
                const isFillingFast = bus.availableSeats <= 8;
                return (
                  <div
                    key={bus.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-slate-900">{bus.busName}</h3>
                          <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-semibold">
                            {bus.busNumber}
                          </span>
                          <span className="text-[11px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md font-bold">
                            {bus.busType}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            ON TIME
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span>Operated by <strong>{bus.operator}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            Captain: {bus.driverName} ({bus.driverPhone})
                          </span>
                        </div>
                      </div>

                      {/* Rating & Fare */}
                      <div className="flex items-center sm:items-end justify-between sm:flex-col gap-1">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{bus.rating.toFixed(1)}</span>
                          <span className="text-slate-400 text-[10px]">(480+ verified)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">FARES FROM</span>
                          <span className="text-2xl font-black text-slate-900 font-mono">₹{bus.baseFare}</span>
                          <span className="text-[10px] text-slate-400 block">+ GST 5%</span>
                        </div>
                      </div>
                    </div>

                    {/* Route & Timing Middle Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-1 text-xs">
                      {/* Departure */}
                      <div className="md:col-span-3">
                        <div className="text-xl font-black text-slate-900 font-mono">{bus.departureTime}</div>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{bus.source}</div>
                        <div className="text-slate-500 truncate text-[11px] mt-0.5" title={bus.boardingPoints[0]}>
                          {bus.boardingPoints[0]}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="md:col-span-3 text-center">
                        <span className="text-slate-500 text-[11px] font-semibold">{bus.duration}</span>
                        <div className="w-full flex items-center my-1">
                          <div className="h-[2px] flex-1 bg-slate-200" />
                          <div className="w-2 h-2 rounded-full bg-slate-400 mx-1" />
                          <div className="h-[2px] flex-1 bg-slate-200" />
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                          DIRECT EXPRESS
                        </span>
                      </div>

                      {/* Arrival */}
                      <div className="md:col-span-3 md:text-right">
                        <div className="text-xl font-black text-slate-900 font-mono">{bus.arrivalTime}</div>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{bus.destination}</div>
                        <div className="text-slate-500 truncate text-[11px] mt-0.5" title={bus.droppingPoints[0]}>
                          {bus.droppingPoints[0]}
                        </div>
                      </div>

                      {/* Seat Occupancy Badge */}
                      <div className="md:col-span-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                        <div className="flex justify-between items-center text-xs mb-1 font-bold">
                          <span className="text-slate-600">Available:</span>
                          <span className={isFillingFast ? 'text-amber-700' : 'text-emerald-700'}>
                            {bus.availableSeats} / {bus.totalSeats}
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${isFillingFast ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.round(((bus.totalSeats - bus.availableSeats) / bus.totalSeats) * 100)}%` }}
                          />
                        </div>

                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {isFillingFast ? '⚠️ Few seats remaining' : 'Seats available now'}
                        </span>
                      </div>
                    </div>

                    {/* Live Highway Landmark Indicator */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono uppercase">
                          LIVE LOCATION:
                        </span>
                        <span className="font-medium text-slate-800 truncate max-w-sm sm:max-w-md" title={bus.currentLocation}>
                          {bus.currentLocation}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">
                        {bus.currentSpeedKmH} km/h • ETA: {bus.etaMinutes} mins
                      </span>
                    </div>

                    {/* Footer Row: Amenities & CTAs */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-slate-500 text-xs flex-wrap">
                        <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-slate-400" /> WiFi</span>
                        <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-slate-400" /> Charging</span>
                        <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-slate-400" /> Water</span>
                        {bus.hasUpperDeck && (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            Lower + Upper Decks
                          </span>
                        )}
                      </div>

                      {/* Three CTAs as specifically requested in Section 10 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 1. Track Bus */}
                        <button
                          type="button"
                          onClick={() => onTrackBus(bus)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Track live GPS radar"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Track Bus</span>
                        </button>

                        {/* 2. View Details */}
                        <button
                          type="button"
                          onClick={() => onViewBusDetails(bus)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Details
                        </button>

                        {/* 3. Primary: Select Seat */}
                        <button
                          type="button"
                          onClick={() => onSelectSeats(bus)}
                          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md shadow-slate-900/10 cursor-pointer transition-colors"
                        >
                          SELECT SEAT
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
