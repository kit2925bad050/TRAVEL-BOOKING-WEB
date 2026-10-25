import React, { useState } from 'react';
import { Bus as BusIcon, Clock, Wifi, Zap, Droplets, Shield, Star, MapPin, ChevronDown, ChevronUp, Navigation, Phone } from 'lucide-react';
import { Bus } from '../types';

interface BusCardProps {
  bus: Bus;
  onSelectSeats: (bus: Bus) => void;
  onQuickCheck: (bus: Bus) => void;
  onTrackBus?: (bus: Bus) => void;
}

export const BusCard: React.FC<BusCardProps> = ({
  bus,
  onSelectSeats,
  onQuickCheck,
  onTrackBus
}) => {
  const [showStops, setShowStops] = useState(false);

  const occupancyRatio = (bus.totalSeats - bus.availableSeats) / bus.totalSeats;
  const isFillingFast = bus.availableSeats <= 8;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all hover:shadow-xl relative overflow-hidden group">
      {/* Top Banner with bus name & badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
              {bus.busName}
            </h3>
            <span className="font-mono text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-md">
              {bus.busNumber}
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold">
              {bus.busType}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            Operated by <span className="text-slate-300 font-medium">{bus.operator}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Phone className="w-3 h-3" /> Driver: {bus.driverName} ({bus.driverPhone})
            </span>
          </p>
        </div>

        {/* Rating and Fare */}
        <div className="flex items-center sm:items-end justify-between sm:flex-col gap-1">
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{bus.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[10px]">(520+ reviews)</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Starting from </span>
            <span className="text-2xl font-black text-white">₹{bus.baseFare}</span>
            <span className="text-[11px] text-slate-500 block">+ GST 5%</span>
          </div>
        </div>
      </div>

      {/* Route & Timing Section */}
      <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Departure */}
        <div className="md:col-span-3 text-left">
          <div className="text-xl font-black text-white">{bus.departureTime}</div>
          <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {bus.source}
          </div>
          <div className="text-xs text-slate-400 truncate mt-0.5" title={bus.boardingPoints[0]}>
            {bus.boardingPoints[0]}
          </div>
        </div>

        {/* Duration / Arrow Bar */}
        <div className="md:col-span-3 flex flex-col items-center justify-center">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {bus.duration}
          </div>
          <div className="w-full flex items-center my-1.5">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-emerald-500/40 via-teal-500/80 to-emerald-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
            <div className="h-[2px] flex-1 bg-gradient-to-r from-emerald-500/40 via-teal-500/80 to-emerald-500/40" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Direct Express
          </span>
        </div>

        {/* Arrival */}
        <div className="md:col-span-3 text-left md:text-right">
          <div className="text-xl font-black text-white">{bus.arrivalTime}</div>
          <div className="text-sm font-semibold text-teal-400 flex items-center gap-1 md:justify-end">
            <MapPin className="w-3.5 h-3.5" /> {bus.destination}
          </div>
          <div className="text-xs text-slate-400 truncate mt-0.5" title={bus.droppingPoints[0]}>
            {bus.droppingPoints[0]}
          </div>
        </div>

        {/* Real-time Seat Availability Indicator */}
        <div className="md:col-span-3 bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 text-center">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">Available Seats:</span>
            <span className={`font-bold ${isFillingFast ? 'text-amber-400' : 'text-emerald-400'}`}>
              {bus.availableSeats} of {bus.totalSeats}
            </span>
          </div>

          {/* Occupancy progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full transition-all rounded-full ${
                isFillingFast ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.round(occupancyRatio * 100)}%` }}
            />
          </div>

          {isFillingFast ? (
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
              ⚠️ Filling Fast! Only {bus.availableSeats} left
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              Good availability
            </span>
          )}
        </div>
      </div>

      {/* Amenities & Action Buttons */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Amenities Icons */}
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <span className="flex items-center gap-1 hover:text-emerald-400 transition-colors" title="Free High Speed WiFi">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" /> WiFi
          </span>
          <span className="flex items-center gap-1 hover:text-emerald-400 transition-colors" title="Fast Charging Sockets">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Charging
          </span>
          <span className="flex items-center gap-1 hover:text-emerald-400 transition-colors" title="Complimentary Mineral Water">
            <Droplets className="w-3.5 h-3.5 text-blue-400" /> Water
          </span>
          {bus.hasUpperDeck && (
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              Lower + Upper Sleeper
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowStops(!showStops)}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            {showStops ? 'Hide Stops' : 'Stops'}
            {showStops ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {onTrackBus && (
            <button
              type="button"
              onClick={() => onTrackBus(bus)}
              className="text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Track live GPS location and view driver phone"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Live Track
            </button>
          )}

          <button
            type="button"
            onClick={() => onQuickCheck(bus)}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            Availability
          </button>

          <button
            type="button"
            onClick={() => onSelectSeats(bus)}
            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BusIcon className="w-3.5 h-3.5" />
            Select Seats & Book
          </button>
        </div>
      </div>

      {/* Expandable stops details */}
      {showStops && (
        <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Boarding Points ({bus.source})
            </h4>
            <ul className="space-y-1 text-slate-300">
              {bus.boardingPoints.map((pt, i) => (
                <li key={`bp-${i}`} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-teal-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Dropping Points ({bus.destination})
            </h4>
            <ul className="space-y-1 text-slate-300">
              {bus.droppingPoints.map((pt, i) => (
                <li key={`dp-${i}`} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
