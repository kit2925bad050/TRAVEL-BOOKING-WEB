import React, { useState } from 'react';
import { Bus as BusIcon, CheckCircle2, Layers, MapPin, ArrowRight, Lock, AlertCircle, Info } from 'lucide-react';
import { Bus, Seat } from '../types';
import { dbSimulator } from '../services/dbSimulator';

interface SeatAvailabilityViewProps {
  buses: Bus[];
  onSelectSeats: (bus: Bus) => void;
}

export const SeatAvailabilityView: React.FC<SeatAvailabilityViewProps> = ({
  buses,
  onSelectSeats
}) => {
  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0]?.id || '');
  const selectedBus = buses.find(b => b.id === selectedBusId) || buses[0];

  const availability = selectedBus ? dbSimulator.checkSeatAvailability(selectedBus.id) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BusIcon className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">
                Live Seat-Availability Checking
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time seat status inquiry • Select any coach to view free seats and reserve immediately
            </p>
          </div>

          {selectedBus && (
            <button
              onClick={() => onSelectSeats(selectedBus)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
            >
              <BusIcon className="w-4 h-4" />
              Book Seats on This Bus
            </button>
          )}
        </div>

        {/* Bus Selector Pills */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-400">
            Select Coach to Inspect Real-time Seat Availability:
          </label>
          <div className="flex flex-wrap gap-2">
            {buses.map((bus) => (
              <button
                key={bus.id}
                type="button"
                onClick={() => setSelectedBusId(bus.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 border ${
                  selectedBusId === bus.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{bus.busName}</span>
                <span className="font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-bold">
                  {bus.availableSeats} Free
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Bus Availability Breakdown */}
      {selectedBus && availability && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold text-white">{selectedBus.busName}</h3>
                <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {selectedBus.busNumber}
                </span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold">
                  {selectedBus.busType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedBus.source} ➔ {selectedBus.destination}</span>
                <span>•</span>
                <span>Departure: {selectedBus.departureTime}</span>
                <span>•</span>
                <span>Arrival: {selectedBus.arrivalTime}</span>
                <span>•</span>
                <span className="text-white font-bold">Fare: ₹{selectedBus.baseFare}</span>
              </p>
            </div>

            <button
              onClick={() => onSelectSeats(selectedBus)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
            >
              Select Seats & Proceed
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Availability Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">TOTAL SEATS</span>
              <span className="text-2xl font-black text-white mt-1 block">{availability.total}</span>
              <span className="text-[10px] text-slate-500">Coach Capacity</span>
            </div>

            <div className="bg-slate-850 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
              <span className="text-[11px] font-semibold text-emerald-400 block">AVAILABLE SEATS</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{availability.available}</span>
              <span className="text-[10px] text-emerald-300 font-medium">Ready for Booking</span>
            </div>

            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">OCCUPIED</span>
              <span className="text-2xl font-black text-slate-300 mt-1 block">{availability.booked}</span>
              <span className="text-[10px] text-slate-500">Confirmed Bookings</span>
            </div>

            <div className="bg-slate-850 p-4 rounded-2xl border border-pink-500/30 bg-pink-950/20">
              <span className="text-[11px] font-semibold text-pink-400 block">LADIES RESERVED</span>
              <span className="text-2xl font-black text-pink-400 mt-1 block">{availability.femaleReserved}</span>
              <span className="text-[10px] text-pink-300 font-medium">Designated Safety</span>
            </div>
          </div>

          {/* Seat Grid View */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Live Seat Inventory Matrix
              </h4>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/60 px-2 py-0.5 rounded-lg text-emerald-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Available (Unbooked): {availability.available}
                </div>
                <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-600/70 px-2 py-0.5 rounded-lg text-rose-300 font-semibold">
                  <Lock className="w-2.5 h-2.5 text-rose-400" />
                  Booked (Occupied): {availability.booked}
                </div>
                {availability.femaleReserved > 0 && (
                  <div className="flex items-center gap-1.5 bg-pink-950/40 border border-pink-500/70 px-2 py-0.5 rounded-lg text-pink-300 font-semibold">
                    <span>♀ Ladies Reserved</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
              {availability.seats.map((seat) => (
                <button
                  key={seat.id}
                  type="button"
                  disabled={seat.isBooked}
                  onClick={() => onSelectSeats(selectedBus)}
                  className={`p-2.5 rounded-xl border-2 text-center transition-all select-none ${
                    seat.isBooked
                      ? 'bg-rose-950/20 border-rose-900/60 opacity-60 text-rose-300 cursor-not-allowed'
                      : seat.isFemaleReserved
                      ? 'bg-pink-950/40 border-pink-500/80 text-pink-200 hover:border-pink-300 hover:bg-pink-600 hover:text-white hover:scale-105 shadow-sm cursor-pointer'
                      : 'bg-slate-900 border-emerald-500/70 hover:border-emerald-300 hover:bg-emerald-600 hover:text-white text-emerald-200 hover:scale-105 shadow-sm shadow-emerald-950/30 cursor-pointer'
                  }`}
                  title={
                    seat.isBooked
                      ? `Seat ${seat.seatNumber} is ALREADY BOOKED & OCCUPIED`
                      : `Click to Book Seat ${seat.seatNumber} (Available • ₹${seat.price})`
                  }
                >
                  <div className="font-bold text-xs flex items-center justify-center gap-1">
                    {seat.isBooked ? (
                      <span className="line-through text-rose-400/80 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                        {seat.seatNumber}
                      </span>
                    ) : (
                      <span>{seat.seatNumber}</span>
                    )}
                  </div>
                  <div className="text-[10px] mt-0.5 font-mono">
                    {seat.isBooked ? (
                      <span className="text-[9px] uppercase font-bold text-rose-300 bg-rose-950/90 border border-rose-800/80 px-1 py-0.2 rounded inline-block">
                        BOOKED
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-400">
                        ₹{seat.price}
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] uppercase font-medium mt-0.5 opacity-70">
                    {seat.deck} • {seat.type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
