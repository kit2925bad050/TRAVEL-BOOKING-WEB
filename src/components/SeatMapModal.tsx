import React, { useState, useEffect } from 'react';
import { X, Disc, Check, Layers, Bus as BusIcon, ArrowRight, Lock, AlertCircle, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { Bus, Seat } from '../types';

interface SeatMapModalProps {
  bus: Bus;
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (selectedSeats: Seat[]) => void;
}

export const SeatMapModal: React.FC<SeatMapModalProps> = ({
  bus,
  isOpen,
  onClose,
  onProceedToBooking
}) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');
  const [bookedWarning, setBookedWarning] = useState<string | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);

  // Reset selected seats when modal opens or bus changes
  useEffect(() => {
    if (isOpen) {
      setSelectedSeats([]);
      setActiveDeck('lower');
      setBookedWarning(null);
    }
  }, [isOpen, bus.id]);

  // Clear booked seat warning automatically after 4 seconds
  useEffect(() => {
    if (bookedWarning) {
      const timer = setTimeout(() => setBookedWarning(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [bookedWarning]);

  if (!isOpen) return null;

  const toggleSeat = (seat: Seat) => {
    if (seat.isBooked) {
      setBookedWarning(`Seat ${seat.seatNumber} is ALREADY BOOKED & OCCUPIED. Please choose any green Available seat.`);
      return;
    }

    const isAlreadySelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
    if (isAlreadySelected) {
      setSelectedSeats(prev => prev.filter(s => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 6) {
        setBookedWarning('Maximum 6 seats can be selected per booking.');
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
      setBookedWarning(null);
    }
  };

  const isSelected = (seat: Seat) => selectedSeats.some(s => s.seatNumber === seat.seatNumber);

  const lowerSeats = bus.seats.filter(s => s.deck === 'lower');
  const upperSeats = bus.seats.filter(s => s.deck === 'upper');
  const seatsToRender = activeDeck === 'lower' ? lowerSeats : upperSeats;

  // Inventory stats for this bus & active deck
  const totalDeckSeats = seatsToRender.length;
  const bookedDeckSeats = seatsToRender.filter(s => s.isBooked).length;
  const availableDeckSeats = seatsToRender.filter(s => !s.isBooked).length;
  const ladiesDeckSeats = seatsToRender.filter(s => s.isFemaleReserved && !s.isBooked).length;

  // Group seats by row for 2D bus layout rendering
  const maxRow = Math.max(...seatsToRender.map(s => s.row), 1);
  const rows = Array.from({ length: maxRow }, (_, i) => i + 1);

  const totalSelectedPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleProceed = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedSeats.length === 0) {
      setBookedWarning('Please click on at least one green available seat to proceed.');
      return;
    }
    onProceedToBooking(selectedSeats);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <div className="flex items-center gap-2">
              <BusIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                Select Your Seats • {bus.busName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {bus.source} ➔ {bus.destination} • {bus.busNumber} • Departure: {bus.departureTime}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Seat Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deck Switcher & Inventory Counters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-2.5 gap-3">
          {bus.hasUpperDeck ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveDeck('lower')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDeck === 'lower'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Lower Deck ({lowerSeats.filter(s => !s.isBooked).length} Free)
              </button>
              <button
                type="button"
                onClick={() => setActiveDeck('upper')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDeck === 'upper'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Upper Deck ({upperSeats.filter(s => !s.isBooked).length} Free)
              </button>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Single Deck Coach Layout
            </div>
          )}

          {/* Filter toggle: Highlight/Only Available */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                showOnlyAvailable
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Filter className="w-3 h-3" />
              {showOnlyAvailable ? 'Showing Free Seats Only' : 'Filter: All Seats'}
            </button>
          </div>
        </div>

        {/* High-Contrast Legend Bar & Seat Counters */}
        <div className="bg-slate-950/60 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. AVAILABLE (UNBOOKED) */}
            <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/60 px-2.5 py-1 rounded-lg">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span className="text-emerald-300 font-bold">Unbooked (Available): {availableDeckSeats}</span>
            </div>

            {/* 2. BOOKED (OCCUPIED) */}
            <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-600/70 px-2.5 py-1 rounded-lg">
              <Lock className="w-3 h-3 text-rose-400" />
              <span className="text-rose-300 font-bold">Booked (Occupied): {bookedDeckSeats}</span>
            </div>

            {/* 3. SELECTED */}
            <div className="flex items-center gap-1.5 bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg font-black shadow-sm">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Selected: {selectedSeats.length}</span>
            </div>

            {/* 4. LADIES */}
            {ladiesDeckSeats > 0 && (
              <div className="flex items-center gap-1.5 bg-pink-950/40 border border-pink-500/70 px-2.5 py-1 rounded-lg">
                <span className="text-pink-300 font-bold">♀ Ladies Reserved: {ladiesDeckSeats}</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            💡 Green = Click to Book • Red/Lock = Already Booked
          </div>
        </div>

        {/* Alert Notification if user clicked a booked seat */}
        {bookedWarning && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">{bookedWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setBookedWarning(null)}
              className="text-amber-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bus Layout Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-950/30">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl relative">
            {/* Bus Exterior Header / Driver Cabin */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono uppercase bg-slate-800/80 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                FRONT / PASSENGER ENTRANCE
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg text-slate-300 font-semibold" title="Driver Cabin">
                <Disc className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>STEERING / DRIVER</span>
              </div>
            </div>

            {/* Matrix of Seats */}
            <div className="space-y-3.5">
              {rows.map((rowNum) => {
                const rowSeats = seatsToRender.filter(s => s.row === rowNum);
                const leftSide = rowSeats.filter(s => s.col < 2);
                const rightSide = rowSeats.filter(s => s.col >= 2);

                return (
                  <div key={`row-${rowNum}`} className="flex items-center justify-between gap-4">
                    {/* Left Column(s) */}
                    <div className="flex items-center gap-2.5">
                      {leftSide.map((seat) => {
                        const selected = isSelected(seat);
                        const isSleeper = seat.type === 'sleeper';
                        const isHidden = showOnlyAvailable && seat.isBooked;

                        if (isHidden) {
                          return (
                            <div
                              key={seat.id}
                              className={`flex items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-[10px] text-slate-700 select-none ${
                                isSleeper ? 'w-24 h-12' : 'w-12 h-12'
                              }`}
                            >
                              <Lock className="w-3 h-3 text-slate-800" />
                            </div>
                          );
                        }

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSeat(seat);
                            }}
                            title={
                              seat.isBooked
                                ? `Seat ${seat.seatNumber} is ALREADY BOOKED & OCCUPIED`
                                : selected
                                ? `Seat ${seat.seatNumber} is SELECTED • Click to remove`
                                : `Seat ${seat.seatNumber} is AVAILABLE • Click to select (₹${seat.price})`
                            }
                            className={`group relative transition-all flex flex-col items-center justify-center rounded-xl select-none active:scale-95 ${
                              isSleeper ? 'w-24 h-12' : 'w-12 h-12'
                            } ${
                              seat.isBooked
                                ? 'bg-rose-950/20 border-2 border-rose-900/60 opacity-60 cursor-not-allowed hover:border-rose-500/80 hover:opacity-90'
                                : selected
                                ? 'bg-emerald-500 border-2 border-white text-slate-950 font-black shadow-lg shadow-emerald-500/50 scale-105 ring-2 ring-emerald-300 cursor-pointer'
                                : seat.isFemaleReserved
                                ? 'bg-pink-950/40 border-2 border-pink-500 hover:border-pink-300 text-pink-200 hover:bg-pink-600 hover:text-white hover:scale-105 shadow-sm cursor-pointer'
                                : 'bg-slate-900 border-2 border-emerald-500/70 hover:border-emerald-300 hover:bg-emerald-600 hover:text-white text-white hover:scale-105 shadow-sm shadow-emerald-950/40 cursor-pointer'
                            }`}
                          >
                            {/* Seat Number Header */}
                            <div className="text-xs font-bold flex items-center gap-1">
                              {seat.isBooked ? (
                                <span className="line-through text-rose-300/70 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                                  {seat.seatNumber}
                                </span>
                              ) : (
                                <span className={selected ? 'text-slate-950 font-black' : 'text-white font-bold'}>
                                  {seat.seatNumber}
                                </span>
                              )}
                              {selected && <Check className="w-3.5 h-3.5 stroke-[3] text-slate-950" />}
                            </div>

                            {/* Status Subtitle: BOOKED badge vs Price */}
                            {seat.isBooked ? (
                              <div className="text-[9px] font-extrabold text-rose-300 bg-rose-950/90 border border-rose-800/80 px-1 py-0.2 rounded mt-0.5 tracking-wider uppercase">
                                BOOKED
                              </div>
                            ) : selected ? (
                              <div className="text-[10px] font-black font-mono text-slate-950 mt-0.5">
                                ₹{seat.price}
                              </div>
                            ) : (
                              <div className="text-[10px] font-bold font-mono text-emerald-400 group-hover:text-white mt-0.5">
                                ₹{seat.price}
                              </div>
                            )}

                            {/* Ladies indicator pill */}
                            {seat.isFemaleReserved && !seat.isBooked && !selected && (
                              <span className="absolute -top-1.5 -right-1 text-[9px] bg-pink-500 text-white rounded-full px-1 py-0 font-bold shadow">
                                ♀
                              </span>
                            )}

                            {/* Unbooked green pulse dot indicator */}
                            {!seat.isBooked && !selected && (
                              <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Aisle / Gangway Walkway */}
                    <div className="flex-1 flex justify-center items-center py-1 border-dashed border-y border-slate-800/80">
                      <span className="text-[10px] tracking-widest text-slate-400 font-mono select-none">
                        AISLE
                      </span>
                    </div>

                    {/* Right Column(s) */}
                    <div className="flex items-center gap-2.5">
                      {rightSide.map((seat) => {
                        const selected = isSelected(seat);
                        const isSleeper = seat.type === 'sleeper';
                        const isHidden = showOnlyAvailable && seat.isBooked;

                        if (isHidden) {
                          return (
                            <div
                              key={seat.id}
                              className={`flex items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-[10px] text-slate-700 select-none ${
                                isSleeper ? 'w-24 h-12' : 'w-12 h-12'
                              }`}
                            >
                              <Lock className="w-3 h-3 text-slate-800" />
                            </div>
                          );
                        }

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSeat(seat);
                            }}
                            title={
                              seat.isBooked
                                ? `Seat ${seat.seatNumber} is ALREADY BOOKED & OCCUPIED`
                                : selected
                                ? `Seat ${seat.seatNumber} is SELECTED • Click to remove`
                                : `Seat ${seat.seatNumber} is AVAILABLE • Click to select (₹${seat.price})`
                            }
                            className={`group relative transition-all flex flex-col items-center justify-center rounded-xl select-none active:scale-95 ${
                              isSleeper ? 'w-24 h-12' : 'w-12 h-12'
                            } ${
                              seat.isBooked
                                ? 'bg-rose-950/20 border-2 border-rose-900/60 opacity-60 cursor-not-allowed hover:border-rose-500/80 hover:opacity-90'
                                : selected
                                ? 'bg-emerald-500 border-2 border-white text-slate-950 font-black shadow-lg shadow-emerald-500/50 scale-105 ring-2 ring-emerald-300 cursor-pointer'
                                : seat.isFemaleReserved
                                ? 'bg-pink-950/40 border-2 border-pink-500 hover:border-pink-300 text-pink-200 hover:bg-pink-600 hover:text-white hover:scale-105 shadow-sm cursor-pointer'
                                : 'bg-slate-900 border-2 border-emerald-500/70 hover:border-emerald-300 hover:bg-emerald-600 hover:text-white text-white hover:scale-105 shadow-sm shadow-emerald-950/40 cursor-pointer'
                            }`}
                          >
                            {/* Seat Number Header */}
                            <div className="text-xs font-bold flex items-center gap-1">
                              {seat.isBooked ? (
                                <span className="line-through text-rose-300/70 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                                  {seat.seatNumber}
                                </span>
                              ) : (
                                <span className={selected ? 'text-slate-950 font-black' : 'text-white font-bold'}>
                                  {seat.seatNumber}
                                </span>
                              )}
                              {selected && <Check className="w-3.5 h-3.5 stroke-[3] text-slate-950" />}
                            </div>

                            {/* Status Subtitle: BOOKED badge vs Price */}
                            {seat.isBooked ? (
                              <div className="text-[9px] font-extrabold text-rose-300 bg-rose-950/90 border border-rose-800/80 px-1 py-0.2 rounded mt-0.5 tracking-wider uppercase">
                                BOOKED
                              </div>
                            ) : selected ? (
                              <div className="text-[10px] font-black font-mono text-slate-950 mt-0.5">
                                ₹{seat.price}
                              </div>
                            ) : (
                              <div className="text-[10px] font-bold font-mono text-emerald-400 group-hover:text-white mt-0.5">
                                ₹{seat.price}
                              </div>
                            )}

                            {/* Ladies indicator pill */}
                            {seat.isFemaleReserved && !seat.isBooked && !selected && (
                              <span className="absolute -top-1.5 -right-1 text-[9px] bg-pink-500 text-white rounded-full px-1 py-0 font-bold shadow">
                                ♀
                              </span>
                            )}

                            {/* Unbooked green pulse dot indicator */}
                            {!seat.isBooked && !selected && (
                              <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rear of Bus */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 font-mono uppercase flex items-center justify-center gap-3">
              <span>REAR OF COACH</span>
              <span>•</span>
              <span>EMERGENCY EXIT & LUGGAGE BAY</span>
            </div>
          </div>
        </div>

        {/* Footer / Selected seats checkout bar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Selected Seats ({selectedSeats.length}):</span>
              {selectedSeats.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSeats([])}
                  className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {selectedSeats.length > 0 ? (
                selectedSeats.map(s => (
                  <span
                    key={`badge-${s.id}`}
                    className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5"
                  >
                    <span>Seat {s.seatNumber}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">₹{s.price}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-400/90 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Click any green unbooked seat above to select it
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Fare</span>
              <span className="text-xl font-black text-white">₹{totalSelectedPrice}</span>
            </div>

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={handleProceed}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 scale-100 hover:scale-102 active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              Proceed to Book ({selectedSeats.length})
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
