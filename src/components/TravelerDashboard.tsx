import React, { useState } from 'react';
import { Bus as BusIcon, Search, ArrowLeftRight, Calendar, Users, MapPin, Navigation, Ticket, ShieldCheck, Phone, ArrowRight, Star, Clock, CheckCircle2, AlertTriangle, Shield, Award, Sparkles, Download } from 'lucide-react';
import { Bus, Passenger, Booking } from '../types';
import { POPULAR_CITIES } from '../data/mockData';
import { generateAndDownloadTicket } from '../utils/ticketDownloader';

interface TravelerDashboardProps {
  buses: Bus[];
  currentUser: Passenger | null;
  bookings: Booking[];
  onSearchBuses: (source: string, destination: string, date: string) => void;
  onSelectSeats: (bus: Bus) => void;
  onTrackBus: (bus: Bus | string, booking?: Booking) => void;
  onViewTicket: (booking: Booking) => void;
  onNavigateTab: (tab: any) => void;
}

export const TravelerDashboard: React.FC<TravelerDashboardProps> = ({
  buses,
  currentUser,
  bookings,
  onSearchBuses,
  onSelectSeats,
  onTrackBus,
  onViewTicket,
  onNavigateTab
}) => {
  const [source, setSource] = useState('Salem');
  const [destination, setDestination] = useState('Coimbatore');
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [passengerCount, setPassengerCount] = useState(1);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchBuses(source, destination, travelDate);
  };

  // Find nearest upcoming confirmed booking
  const upcomingTrip = (bookings || []).find(b => b && (b.status === 'CONFIRMED' || b.status === 'PARTIALLY_CANCELLED'));

  const popularRoutes = [
    { from: 'Salem', to: 'Coimbatore', fare: 450, time: '3h 30m', bus: 'GT-TN-57-1234' },
    { from: 'Bangalore', to: 'Hyderabad', fare: 850, time: '9h 15m', bus: 'GT-KA-01-5050' },
    { from: 'Mumbai', to: 'Pune', fare: 550, time: '3h 30m', bus: 'GT-MH-12-8811' },
    { from: 'Chennai', to: 'Bangalore', fare: 780, time: '6h 30m', bus: 'GT-TN-02-7744' },
    { from: 'Bangalore', to: 'Goa', fare: 1450, time: '12h 00m', bus: 'GT-GA-03-6622' }
  ];

  // Greeting time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. GREETING & HERO SEARCH MODULE */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Guardian Travels • India&apos;s Most Punctual Coach Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {getGreeting()}, <span className="text-emerald-400">{currentUser?.fullName || 'Traveler'}</span>
            </h1>
            <p className="text-sm text-slate-300">
              Where are you travelling today? Book direct express coaches with guaranteed seats & live radar.
            </p>
          </div>

          {/* MAIN TRAVEL SEARCH MODULE */}
          <div className="mt-6 pt-2">
            <form onSubmit={handleSearchSubmit} className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* FROM */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    FROM (DEPARTURE)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                    >
                      {POPULAR_CITIES.map(c => (
                        <option key={`src-${c}`} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SWAP BUTTON */}
                <div className="hidden md:flex md:col-span-1 justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Swap Origin and Destination"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* TO */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    TO (DESTINATION)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                    >
                      {POPULAR_CITIES.map(c => (
                        <option key={`dst-${c}`} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* DATE */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    JOURNEY DATE
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                    />
                  </div>
                </div>

                {/* SEARCH CTA */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>SEARCH BUSES</span>
                  </button>
                </div>
              </div>

              {/* Popular quick route tags */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 text-[11px] font-bold uppercase">Popular Routes:</span>
                {popularRoutes.slice(0, 4).map((pr) => (
                  <button
                    key={`${pr.from}-${pr.to}`}
                    type="button"
                    onClick={() => {
                      setSource(pr.from);
                      setDestination(pr.to);
                      onSearchBuses(pr.from, pr.to, travelDate);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>{pr.from} ➔ {pr.to}</span>
                    <span className="font-mono text-emerald-700 font-bold">₹{pr.fare}</span>
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. UPCOMING TRIP CARD (CORE REQUIREMENT) */}
      {upcomingTrip ? (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">Your Upcoming Journey</h2>
              <span className="font-mono text-xs font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-300">
                PNR: {upcomingTrip.pnr}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Reserved for <strong className="text-slate-900">{upcomingTrip.passengerName}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Route & Times */}
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                  <BusIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{upcomingTrip.busName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{upcomingTrip.busNumber} • {upcomingTrip.busType}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">FROM</span>
                  <span className="font-black text-slate-900 text-sm">{upcomingTrip.source}</span>
                  <span className="font-mono text-slate-600 block">{upcomingTrip.departureTime}</span>
                </div>
                <div className="flex-1 text-center border-b border-dashed border-slate-300 relative py-1">
                  <span className="text-[10px] text-slate-400 font-medium">Direct Express</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">TO</span>
                  <span className="font-black text-slate-900 text-sm">{upcomingTrip.destination}</span>
                  <span className="font-mono text-slate-600 block">{upcomingTrip.arrivalTime}</span>
                </div>
              </div>
            </div>

            {/* Travel Date & Seat Info */}
            <div className="md:col-span-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Journey Date:</span>
                <strong className="text-slate-900">{upcomingTrip.journeyDate}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Confirmed Seats:</span>
                <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {Array.isArray(upcomingTrip.seatNumbers) && upcomingTrip.seatNumbers.length > 0 ? upcomingTrip.seatNumbers.join(', ') : 'Assigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Boarding Stop:</span>
                <span className="text-slate-900 font-medium truncate max-w-[130px]" title={upcomingTrip.boardingPoint}>
                  {upcomingTrip.boardingPoint}
                </span>
              </div>
              {upcomingTrip.insuranceOpted && (
                <div className="flex justify-between text-emerald-800 text-[11px] font-semibold pt-1 border-t border-slate-200">
                  <span>Insurance Active:</span>
                  <span>₹5,00,000 Cover</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2 justify-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => generateAndDownloadTicket(upcomingTrip)}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Download Ticket (PDF)"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewTicket(upcomingTrip)}
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-4 h-4 text-emerald-400" />
                  <span>View Pass</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onTrackBus(upcomingTrip.busId, upcomingTrip)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4" />
                <span>Track Coach Live on GPS</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">No Upcoming Trips Booked</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ready for your next journey? Search and reserve luxury coaches in seconds.</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('search')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm whitespace-nowrap"
          >
            Explore Bus Schedules ➔
          </button>
        </section>
      )}

      {/* 3. QUICK ACTIONS GRID */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('search')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 group-hover:scale-105 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Search Buses</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Filter by time, fare & sleeper type</p>
        </div>

        <div
          onClick={() => onNavigateTab('tracking')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
            <Navigation className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Track Live Bus</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Real-time GPS radar & driver contacts</p>
        </div>

        <div
          onClick={() => onNavigateTab('my-trips')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">My Trips & PNR</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Print boarding pass or cancel seats</p>
        </div>

        <div
          onClick={() => onNavigateTab('emergency')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 group-hover:scale-105 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Emergency Hotline</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">24x7 SOS, Police & Guardian Help</p>
        </div>
      </section>

      {/* 4. FEATURED LUXURY BUSES ON POPULAR ROUTES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Featured Luxury Coaches</h2>
            <p className="text-xs text-slate-500">Multi-Axle Volvo AC, Scania Sleepers, and Zero-Emission EV coaches</p>
          </div>
          <button
            onClick={() => onNavigateTab('search')}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Coaches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {buses.slice(0, 3).map((bus) => (
            <div
              key={bus.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-md">
                    {bus.busType}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{bus.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{bus.busName}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{bus.busNumber}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Route:</span>
                    <strong className="text-slate-900">{bus.source} ➔ {bus.destination}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Timing:</span>
                    <span className="font-mono text-slate-900 font-semibold">{bus.departureTime} ({bus.duration})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Captain Driver:</span>
                    <span className="text-slate-800 font-medium">{bus.driverName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">FARES FROM</span>
                  <span className="text-xl font-black text-slate-900 font-mono">₹{bus.baseFare}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onTrackBus(bus)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Live GPS Radar"
                  >
                    <Navigation className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => onSelectSeats(bus)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY GUARDIAN TRAVELS (VALUE PILLARS) */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-bold text-sky-700 uppercase tracking-widest font-mono">
            THE GUARDIAN STANDARD
          </span>
          <h2 className="text-2xl font-black text-slate-900">Why Over 500,000 Commuters Trust Us</h2>
          <p className="text-xs text-slate-500">Benchmark reliability, road safety, and frictionless digital ticketing.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Real-Time Highway GPS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every coach streams telemetry at 80 km/h speed-governed limits with live highway checkpoint updates.
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">₹5 Lakh Travel Insurance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Opt-in Guardian Protect for ₹29/passenger covering accident medical and baggage protection.
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Verified Driver Contacts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct captain phone numbers with 1-click calling so you never miss your boarding checkpoint.
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Instant Cancellation Refunds</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Up to 90% instant credit to original payment source with automatic seat deallocation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
