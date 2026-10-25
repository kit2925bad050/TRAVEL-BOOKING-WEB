import React, { useState, useEffect } from 'react';
import { X, Navigation, Phone, ShieldAlert, Clock, Gauge, Thermometer, MapPin, CheckCircle2, Radio, User, RefreshCw, Bus as BusIcon, AlertTriangle } from 'lucide-react';
import { Bus, Booking } from '../types';
import { dbSimulator } from '../services/dbSimulator';

interface LiveTrackingModalProps {
  bus: Bus | null;
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  bus: initialBus,
  booking,
  isOpen,
  onClose
}) => {
  const [currentBus, setCurrentBus] = useState<Bus | null>(initialBus);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [callAlert, setCallAlert] = useState('');

  useEffect(() => {
    if (initialBus) {
      setCurrentBus(initialBus);
    }
  }, [initialBus]);

  if (!isOpen || !currentBus) return null;

  const handleRefreshGps = () => {
    setIsRefreshing(true);
    const updated = dbSimulator.pingLiveLocation(currentBus.id);
    if (updated) setCurrentBus({ ...updated });
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleCallDriver = (phone: string, name: string) => {
    setCallAlert(`Connecting call to driver ${name} at ${phone}...`);
    navigator.clipboard?.writeText(phone);
    setTimeout(() => setCallAlert(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Live Coach Tracking & GPS Radar
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {currentBus.gpsStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentBus.busName} • <span className="font-mono text-slate-300">{currentBus.busNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshGps}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Refresh GPS telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {callAlert && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
              <Phone className="w-4 h-4 shrink-0" />
              <span>{callAlert} (Number copied to clipboard)</span>
            </div>
          )}

          {/* Passenger Boarding Note if opened from a ticket */}
          {booking && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  YOUR RESERVED BOARDING POINT
                </span>
                <span className="font-bold text-white text-sm">{booking.boardingPoint}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  PNR: <span className="font-mono font-bold text-emerald-300">{booking.pnr}</span> • Seats: {Array.isArray(booking.seatNumbers) ? booking.seatNumbers.join(', ') : 'Assigned'}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">ESTIMATED ARRIVAL AT YOUR STOP</span>
                <span className="text-base font-black text-emerald-400">In ~{currentBus.etaMinutes} mins</span>
              </div>
            </div>
          )}

          {/* Telemetry Status Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" /> SPEEDOMETER
              </span>
              <span className="text-xl font-black text-white mt-1 block font-mono">
                {currentBus.currentSpeedKmH} <span className="text-xs text-slate-400 font-normal">km/h</span>
              </span>
              <span className="text-[10px] text-emerald-400">Speed Governed &le; 80 km/h</span>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> NEXT STOP ETA
              </span>
              <span className="text-xl font-black text-amber-300 mt-1 block">
                {currentBus.etaMinutes} mins
              </span>
              <span className="text-[10px] text-slate-400 truncate block" title={currentBus.nextStop}>
                {currentBus.nextStop}
              </span>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-blue-400" /> CABIN CLIMATE
              </span>
              <span className="text-xl font-black text-white mt-1 block font-mono">
                {currentBus.cabinTempC || 22}&deg;C
              </span>
              <span className="text-[10px] text-blue-400">Climate Controlled AC</span>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-teal-400" /> LAST GPS PING
              </span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">
                {currentBus.lastPing}
              </span>
              <span className="text-[10px] text-teal-400">GPS Accuracy &plusmn;3m</span>
            </div>
          </div>

          {/* Current Live Landmark Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CURRENT HIGHWAY LOCATION
              </span>
              <p className="text-sm font-bold text-white mt-0.5">
                {currentBus.currentLocation}
              </p>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Route: <strong className="text-slate-200">{currentBus.source} &rarr; {currentBus.destination}</strong></span>
                <span>•</span>
                <span>Departure: {currentBus.departureTime}</span>
              </div>
            </div>
          </div>

          {/* Driver & Contact Card */}
          <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Crew & Driver Contact Information
              </h4>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md font-medium">
                Verified Commercial Pilot
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Driver */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                    {currentBus.driverName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {currentBus.driverName}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold block">
                      {currentBus.driverPhone}
                    </span>
                    <span className="text-[10px] text-slate-400">Lead Captain (12+ Yrs Exp)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCallDriver(currentBus.driverPhone, currentBus.driverName)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
              </div>

              {/* Co-Driver / Assistant */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                    {(currentBus.coDriverName || 'Co Pilot').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {currentBus.coDriverName || 'Co-Pilot / Attendant'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300 block">
                      {currentBus.coDriverPhone || '+91 1800-425-9900'}
                    </span>
                    <span className="text-[10px] text-slate-400">Attendant & Luggage Crew</span>
                  </div>
                </div>

                {currentBus.coDriverPhone && (
                  <button
                    type="button"
                    onClick={() => handleCallDriver(currentBus.coDriverPhone!, currentBus.coDriverName || 'Co-Driver')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Visual Route Checkpoint Stepper */}
          <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BusIcon className="w-4 h-4 text-emerald-400" />
                Live Route Progression & Highway Checkpoints
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentBus.checkpoints.length} Stops Total
              </span>
            </h4>

            <div className="relative pl-6 sm:pl-8 space-y-5 border-l-2 border-slate-800 ml-3 py-2">
              {currentBus.checkpoints.map((cp, idx) => (
                <div key={`cp-${idx}`} className="relative flex items-start justify-between gap-4">
                  {/* Pin Circle on line */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      cp.passed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : cp.isCurrent
                        ? 'bg-amber-400 border-white text-slate-950 animate-bounce'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {cp.passed ? (
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Stop detail */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${cp.isCurrent ? 'text-amber-300 font-black' : cp.passed ? 'text-slate-300' : 'text-slate-400'}`}>
                        {cp.stopName}
                      </span>
                      {cp.isCurrent && (
                        <span className="text-[10px] font-mono bg-amber-400 text-slate-950 px-2 py-0.2 rounded font-black">
                          CURRENT BUS POSITION
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {cp.landmark} • {cp.distanceKm} km from origin
                    </span>
                  </div>

                  {/* Timing & Status */}
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-300 block">
                      {cp.scheduledTime}
                    </span>
                    <span className={`text-[10px] font-semibold ${cp.passed ? 'text-emerald-400' : cp.isCurrent ? 'text-amber-400' : 'text-slate-400'}`}>
                      {cp.passed ? 'Passed' : cp.isCurrent ? 'At Location' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>24x7 Safety Helpline: 1800-425-9900</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
