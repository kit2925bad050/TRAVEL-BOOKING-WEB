import React from 'react';
import { X, Bus, MapPin, Clock, ShieldCheck, CheckCircle2, Wifi, Zap, Droplets, Tv, Award, ArrowRight } from 'lucide-react';
import { Bus as BusType } from '../types';

interface BusDetailsModalProps {
  bus: BusType | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSeats: (bus: BusType) => void;
  onTrackBus: (bus: BusType) => void;
}

export const BusDetailsModal: React.FC<BusDetailsModalProps> = ({
  bus,
  isOpen,
  onClose,
  onSelectSeats,
  onTrackBus
}) => {
  if (!isOpen || !bus) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-full">
                {bus.busType}
              </span>
              <span className="text-xs text-slate-400 font-mono">{bus.busNumber}</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1.5">{bus.busName}</h3>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
              <span>{bus.source}</span>
              <span className="text-sky-400">➔</span>
              <span>{bus.destination}</span>
              <span className="text-slate-500">•</span>
              <span>{bus.duration}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Departure</span>
              <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">{bus.departureTime}</span>
              <span className="text-[11px] text-slate-600 truncate block">{bus.source}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Arrival</span>
              <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">{bus.arrivalTime}</span>
              <span className="text-[11px] text-slate-600 truncate block">{bus.destination}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Base Fare</span>
              <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">₹{bus.baseFare}</span>
              <span className="text-[10px] text-slate-500">+ 5% GST</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Availability</span>
              <span className="text-base font-black text-sky-700 mt-0.5 block">{bus.availableSeats} Seats</span>
              <span className="text-[10px] text-slate-500">of {bus.totalSeats} total</span>
            </div>
          </div>

          {/* Route Timeline */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-600" />
              Route Checkpoints & Highway Schedule
            </h4>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
                {bus.checkpoints.map((cp, idx) => (
                  <div key={`modal-cp-${idx}`} className="relative flex items-start justify-between gap-3">
                    <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${
                      cp.passed
                        ? 'bg-emerald-600 border-emerald-500'
                        : cp.isCurrent
                        ? 'bg-amber-500 border-amber-400 ring-2 ring-amber-300'
                        : 'bg-white border-slate-300'
                    }`} />

                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{cp.stopName}</span>
                        {cp.isCurrent && (
                          <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            CURRENT POSITION
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-[11px] block">{cp.landmark} • {cp.distanceKm} km</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800">{cp.scheduledTime}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {cp.passed ? 'Departed' : cp.isCurrent ? 'At Location' : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Boarding and Dropping points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-2">Boarding Points</span>
              <ul className="space-y-1.5 text-slate-600">
                {bus.boardingPoints.map((pt, i) => (
                  <li key={`b-pt-${i}`} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-2">Dropping Points</span>
              <ul className="space-y-1.5 text-slate-600">
                {bus.droppingPoints.map((pt, i) => (
                  <li key={`d-pt-${i}`} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Amenities & Comfort */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2.5">Onboard Amenities & Equipment</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {bus.amenities.map((am, i) => (
                <div key={`am-${i}`} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Cancellation Policy */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-amber-950 space-y-1.5">
            <h5 className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Standard Cancellation & Refund Policy
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-500 block">&gt; 24h prior</span>
                <strong className="text-emerald-700 font-bold">90% Refund</strong>
              </div>
              <div>
                <span className="text-slate-500 block">12 - 24h prior</span>
                <strong className="text-amber-800 font-bold">75% Refund</strong>
              </div>
              <div>
                <span className="text-slate-500 block">2 - 12h prior</span>
                <strong className="text-amber-800 font-bold">50% Refund</strong>
              </div>
              <div>
                <span className="text-slate-500 block">&lt; 2h prior</span>
                <strong className="text-rose-700 font-bold">No Refund</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onTrackBus(bus);
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs cursor-pointer transition-colors"
          >
            Track Live Coach
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectSeats(bus);
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/20 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Select Seats (₹{bus.baseFare})</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
