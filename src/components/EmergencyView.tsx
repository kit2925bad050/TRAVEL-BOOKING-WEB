import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  Ambulance,
  LifeBuoy,
  PhoneForwarded,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Passenger } from '../types';

interface EmergencyViewProps {
  currentUser: Passenger | null;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({ currentUser }) => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosSentTime, setSosSentTime] = useState<string | null>(null);

  const handleTriggerSOS = () => {
    setSosTriggered(true);
    setSosSentTime(new Date().toLocaleTimeString());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Alert Header */}
      <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-950 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider">
              24x7 Transit Safety
            </span>
            <span className="text-xs text-rose-200">Guardian Highway Response Network</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Emergency & Roadside Assistance</h2>
          <p className="text-xs text-rose-100/90 mt-1 max-w-xl">
            In case of medical emergency, mechanical breakdown, or safety concerns during your journey,
            our Highway Emergency Ops Center connects directly to state police and ambulance networks.
          </p>
        </div>

        <div className="shrink-0">
          {!sosTriggered ? (
            <button
              onClick={handleTriggerSOS}
              className="px-6 py-3.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 text-sm"
            >
              <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
              TRIGGER INSTANT SOS
            </button>
          ) : (
            <div className="bg-rose-500/30 border border-white/20 p-3 rounded-xl text-center">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                SOS Beacon Active ({sosSentTime})
              </span>
              <p className="text-[10px] text-rose-200 mt-0.5">Control room is dispatching nearest unit</p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Emergency Hotlines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Guardian 24x7 Control Room</h3>
            <p className="text-xs text-slate-500 mt-1">Dedicated fleet dispatch, passenger safety, route assistance.</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <a
              href="tel:18002008899"
              className="text-base font-black text-blue-600 flex items-center gap-2 hover:underline"
            >
              1800-200-8899
            </a>
            <span className="text-[10px] text-slate-400">Toll-Free Across India</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Ambulance className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Medical & Insurance Desk</h3>
            <p className="text-xs text-slate-500 mt-1">Guardian Protect cashless hospital admission & trauma response.</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <a
              href="tel:18004254827"
              className="text-base font-black text-emerald-600 flex items-center gap-2 hover:underline"
            >
              1800-425-4827
            </a>
            <span className="text-[10px] text-slate-400">TPA Claims & Medical SOS</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">National Emergency Services</h3>
            <p className="text-xs text-slate-500 mt-1">Direct dial to police, national highway patrol (NHAI), and fire.</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div>
                <a href="tel:112" className="text-base font-black text-rose-600 hover:underline">112</a>
                <span className="text-[10px] text-slate-400 block">All Emergency</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <a href="tel:1033" className="text-base font-black text-amber-600 hover:underline">1033</a>
                <span className="text-[10px] text-slate-400 block">NHAI Highway</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Protocols Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-blue-600" />
          Onboard Safety Features in Every Guardian Coach
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-900">🚨 Physical SOS Panic Buttons</p>
            <p>Every window row and sleeper berth includes a tactile red SOS button that immediately alerts the driver cabin and cloud ops.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-900">📡 Dual GPS & Speed Governors</p>
            <p>Real-time telemetry reports speed, engine diagnostics, and route deviations every 3 seconds to our Bangalore central room.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-900">👩 Safe Women Travelers Protocol</p>
            <p>Berths marked for female travelers are strictly monitored; co-passengers adjacent to solo women travelers are verified.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-900">🧯 Fire Retardant & Auto-Suppression</p>
            <p>Engines equipped with automatic aerosol fire suppression and manual extinguishers positioned at front and emergency exits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
