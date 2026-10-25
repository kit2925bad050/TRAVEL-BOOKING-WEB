import React from 'react';
import { ArrowLeftRight, Calendar, MapPin, Filter, Bus as BusIcon, Search } from 'lucide-react';
import { POPULAR_CITIES } from '../data/mockData';
import { BusType } from '../types';

interface BusSearchProps {
  source: string;
  setSource: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  travelDate: string;
  setTravelDate: (val: string) => void;
  selectedBusType: string;
  setSelectedBusType: (val: string) => void;
  onSearch: () => void;
  onSwapCities: () => void;
}

const BUS_TYPES: ('All' | BusType)[] = [
  'All',
  'Multi-Axle Volvo AC',
  'AC Sleeper',
  'Electric Luxury AC',
  'Semi-Sleeper AC'
];

export const BusSearch: React.FC<BusSearchProps> = ({
  source,
  setSource,
  destination,
  setDestination,
  travelDate,
  setTravelDate,
  selectedBusType,
  setSelectedBusType,
  onSearch,
  onSwapCities
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BusIcon className="w-5 h-5 text-emerald-400" />
              Book Bus Tickets & Check Seat Availability
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant reservation with zero booking fee • Guardian Verified Fleet
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
              ⚡ Real-time MySQL Seat Sync
            </span>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 items-end">
          {/* Origin */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              FROM (BOARDING CITY)
            </label>
            <div className="relative">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
              >
                <option value="All">All Origins</option>
                {POPULAR_CITIES.map(city => (
                  <option key={`src-${city}`} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="hidden md:flex md:col-span-1 justify-center items-center pb-2">
            <button
              type="button"
              onClick={onSwapCities}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 hover:bg-slate-750 transition-all cursor-pointer shadow-md"
              title="Swap Origin and Destination"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              TO (DESTINATION CITY)
            </label>
            <div className="relative">
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
              >
                <option value="All">All Destinations</option>
                {POPULAR_CITIES.map(city => (
                  <option key={`dst-${city}`} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              DATE OF JOURNEY
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Search CTA */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={onSearch}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <Search className="w-4 h-4" />
              Search Buses
            </button>
          </div>
        </div>

        {/* Bus Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter Coach:
          </span>
          {BUS_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedBusType(type)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedBusType === type
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 border border-slate-700/60 hover:text-white hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
