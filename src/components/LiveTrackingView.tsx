import React, { useState, useEffect } from 'react';
import { Navigation, Phone, ShieldCheck, Clock, Gauge, Thermometer, MapPin, CheckCircle2, Radio, User, RefreshCw, Bus as BusIcon, Play, Pause, AlertTriangle, ArrowRight } from 'lucide-react';
import { Bus, Booking } from '../types';
import { dbSimulator } from '../services/dbSimulator';

interface LiveTrackingViewProps {
  buses: Bus[];
  initialBus?: Bus | null;
  initialBooking?: Booking | null;
  onSelectBusToBook?: (bus: Bus) => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  buses,
  initialBus,
  initialBooking,
  onSelectBusToBook
}) => {
  const [selectedBusId, setSelectedBusId] = useState<string>(initialBus?.id || buses[0]?.id || '');
  const [isSimulating, setIsSimulating] = useState(true);
  const [callAlert, setCallAlert] = useState('');

  const currentBus = buses.find(b => b.id === selectedBusId) || buses[0];

  // Subtle real-time heartbeat simulation (every 5s if active)
  useEffect(() => {
    if (!isSimulating || !currentBus) return;
    const interval = setInterval(() => {
      dbSimulator.pingLiveLocation(currentBus.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [isSimulating, currentBus?.id]);

  if (!currentBus) return null;

  const handleCallDriver = (phone: string, name: string) => {
    setCallAlert(`Connecting secure call to driver ${name} at ${phone}... (Copied to clipboard)`);
    navigator.clipboard?.writeText(phone);
    setTimeout(() => setCallAlert(''), 4500);
  };

  const distancePct = Math.round((currentBus.distanceTravelledKm / (currentBus.totalDistanceKm || 1)) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Bus Selector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Live Highway Radar & Bus Tracking</h2>
              <p className="text-xs text-slate-500">
                Satellite GPS telemetry streaming every 10 seconds with speed governing & ETA
              </p>
            </div>
          </div>
        </div>

        {/* Coach Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 uppercase">Select Coach:</label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
          >
            {buses.map(b => (
              <option key={`track-sel-${b.id}`} value={b.id}>
                {b.busName} ({b.busNumber}) - {b.source} ➔ {b.destination}
              </option>
            ))}
          </select>
        </div>
      </div>

      {callAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <Phone className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{callAlert}</span>
        </div>
      )}

      {/* Main Tracking Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: ROUTE VISUALIZATION (MAP-LIKE VIEW) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header of Coach Tracking */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">{currentBus.busName}</h3>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                  {currentBus.busNumber}
                </span>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {currentBus.busStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span>{currentBus.source}</span>
                <span className="text-emerald-600 font-bold">➔</span>
                <span>{currentBus.destination}</span>
                <span>•</span>
                <span>Departure: {currentBus.departureTime}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isSimulating ? 'Pause Radar' : 'Resume Live'}</span>
              </button>

              <button
                type="button"
                onClick={() => dbSimulator.pingLiveLocation(currentBus.id)}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Force refresh telemetry"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Location Box */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
                CURRENT HIGHWAY LOCATION
              </span>
              <h4 className="text-base font-black text-white mt-0.5">
                {currentBus.currentLocation}
              </h4>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-2 flex-wrap">
                <span>Next Stop: <strong className="text-white">{currentBus.nextStop}</strong></span>
                <span>•</span>
                <span>ETA: <strong className="text-emerald-400 font-mono">~{currentBus.etaMinutes} mins</strong></span>
                <span>•</span>
                <span>Last Updated: <span className="font-mono text-slate-400">{currentBus.lastPing}</span></span>
              </div>
            </div>
          </div>

          {/* Distance Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600">Journey Progress ({distancePct}% Completed):</span>
              <span className="text-slate-900 font-mono">
                {currentBus.distanceTravelledKm} km of {currentBus.totalDistanceKm} km
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, distancePct))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Origin ({currentBus.source})</span>
              <span>{currentBus.totalDistanceKm - currentBus.distanceTravelledKm} km remaining</span>
              <span>Terminal ({currentBus.destination})</span>
            </div>
          </div>

          {/* ROUTE PROGRESSION TIMELINE (SECTION 17) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              Route Checkpoint Progression (Highway Map)
            </h4>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="relative pl-7 space-y-6 border-l-2 border-slate-300 ml-3">
                {currentBus.checkpoints.map((cp, idx) => (
                  <div key={`track-cp-${idx}`} className="relative flex items-start justify-between gap-4">
                    {/* Circle pin on line */}
                    <div className={`absolute -left-[35px] w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      cp.passed
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : cp.isCurrent
                        ? 'bg-amber-500 border-white text-slate-950 ring-4 ring-amber-200 animate-pulse'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      {cp.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      ) : cp.isCurrent ? (
                        <BusIcon className="w-3 h-3 text-slate-950" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Landmark details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${cp.isCurrent ? 'text-amber-900 font-black' : cp.passed ? 'text-slate-800' : 'text-slate-500'}`}>
                          {cp.stopName}
                        </span>
                        {cp.isCurrent && (
                          <span className="text-[10px] font-mono bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded shadow-xs">
                            🚌 COACH HERE NOW
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {cp.landmark} • {cp.distanceKm} km from origin
                      </span>
                    </div>

                    {/* Timing & Status */}
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-800 block">
                        {cp.scheduledTime}
                      </span>
                      <span className={`text-[10px] font-semibold ${cp.passed ? 'text-emerald-700' : cp.isCurrent ? 'text-amber-700' : 'text-slate-400'}`}>
                        {cp.passed ? 'Passed Stop' : cp.isCurrent ? 'Live Position' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: DRIVER DIRECTORY & TELEMETRY GAUGES */}
        <div className="lg:col-span-4 space-y-5">
          {/* Telemetry Gauge Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-600" /> SPEEDOMETER
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {currentBus.currentSpeedKmH} <span className="text-xs text-slate-500 font-normal">km/h</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">Speed Governed &le; 80</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" /> ARRIVAL ETA
              </span>
              <span className="text-2xl font-black text-sky-900 font-mono mt-1 block">
                ~{currentBus.etaMinutes} <span className="text-xs text-slate-500 font-normal">mins</span>
              </span>
              <span className="text-[10px] text-slate-500 truncate block" title={currentBus.nextStop}>
                To {currentBus.nextStop}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-blue-600" /> CABIN CLIMATE
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {currentBus.cabinTempC || 22}&deg;C
              </span>
              <span className="text-[10px] text-blue-700 font-semibold">Regulated AC</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-teal-600" /> GPS PRECISION
              </span>
              <span className="text-sm font-bold text-slate-900 mt-1.5 block">
                &plusmn;3 meters
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">Dual Satellite Lock</span>
            </div>
          </div>

          {/* DRIVER CONTACT CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                Captain & Crew Directory
              </h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            {/* Lead Captain */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {currentBus.driverName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{currentBus.driverName}</span>
                  <span className="font-mono text-[11px] text-emerald-700 font-semibold block">{currentBus.driverPhone}</span>
                  <span className="text-[10px] text-slate-500">Lead Pilot (12+ Yrs Exp)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCallDriver(currentBus.driverPhone, currentBus.driverName)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Phone className="w-3 h-3" /> Call
              </button>
            </div>

            {/* Co-Driver / Conductor */}
            {currentBus.coDriverName && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {currentBus.coDriverName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{currentBus.coDriverName}</span>
                    <span className="font-mono text-[11px] text-slate-600 block">{currentBus.coDriverPhone || '+91 1800-425-9900'}</span>
                    <span className="text-[10px] text-slate-500">Luggage & Passenger Crew</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCallDriver(currentBus.coDriverPhone || '+91 1800-425-9900', currentBus.coDriverName || 'Attendant')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Phone className="w-3 h-3" /> Call
                </button>
              </div>
            )}
          </div>

          {/* Quick Book CTA for this coach */}
          {onSelectBusToBook && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Reserve a Seat on This Coach</span>
                <h4 className="font-bold text-sm text-white mt-0.5">{currentBus.busName}</h4>
                <p className="text-xs text-slate-300 mt-1">Starting from ₹{currentBus.baseFare} with {currentBus.availableSeats} seats remaining.</p>
              </div>

              <button
                type="button"
                onClick={() => onSelectBusToBook(currentBus)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Select Seats on This Coach</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
