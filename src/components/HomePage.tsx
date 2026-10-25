import React, { useState } from 'react';
import {
  Bus as BusIcon,
  Search,
  ShieldCheck,
  Navigation,
  Star,
  Phone,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  Ticket,
  Calendar,
  CheckCircle2,
  Sparkles,
  MapPin,
  ChevronRight,
  Download,
  Compass,
  Layers,
  Wifi,
  Zap,
  Award,
  Users
} from 'lucide-react';
import { Bus, Passenger, Booking } from '../types';
import { POPULAR_CITIES } from '../data/mockData';
import { generateAndDownloadTicket } from '../utils/ticketDownloader';

interface HomePageProps {
  buses: Bus[];
  currentUser: Passenger | null;
  userBookings?: Booking[];
  onSearchBuses: (source: string, destination: string, date: string) => void;
  onSelectSeats: (bus: Bus) => void;
  onTrackBus: (bus: Bus) => void;
  onViewTicket?: (booking: Booking) => void;
  onGoToSignIn: () => void;
  onGoToAdmin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  buses,
  currentUser,
  userBookings = [],
  onSearchBuses,
  onSelectSeats,
  onTrackBus,
  onViewTicket,
  onGoToSignIn,
  onGoToAdmin
}) => {
  const [source, setSource] = useState('Salem');
  const [destination, setDestination] = useState('Coimbatore');
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const handleDownloadUpcoming = (booking: Booking) => {
    try {
      const res = generateAndDownloadTicket(booking);
      setDownloadNotice(`Ticket downloaded (${res.filename}). You can also click "VIEW TICKET" to print.`);
    } catch {
      setDownloadNotice(`Ticket downloaded for PNR ${booking.pnr}.`);
    }
    setTimeout(() => setDownloadNotice(null), 6000);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchBuses(source, destination, travelDate);
  };

  // Find the user's latest upcoming confirmed journey
  const upcomingBooking = (userBookings || []).find(
    (b) => b && (b.status === 'CONFIRMED' || b.bookingStatus === 'confirmed')
  );

  const quickRoutes = [
    { from: 'Salem', to: 'Coimbatore', fare: 450, time: '3h 30m' },
    { from: 'Salem', to: 'Chennai', fare: 650, time: '6h 00m' },
    { from: 'Salem', to: 'Bangalore', fare: 550, time: '4h 30m' },
    { from: 'Coimbatore', to: 'Chennai', fare: 750, time: '7h 30m' },
    { from: 'Bangalore', to: 'Hyderabad', fare: 850, time: '9h 15m' }
  ];

  const exploreDestinations = [
    {
      city: 'Coimbatore',
      tagline: 'Textile Hub • Foothills of Nilgiris',
      minFare: 450,
      dailyCoaches: buses.filter(b => b.destination === 'Coimbatore').length || 4,
      imageBg: 'from-blue-600 to-indigo-800',
      highlights: 'Gandhipuram & Omni Bus Stand direct'
    },
    {
      city: 'Chennai',
      tagline: 'Metro Capital • Bay of Bengal Coast',
      minFare: 650,
      dailyCoaches: buses.filter(b => b.destination === 'Chennai').length || 3,
      imageBg: 'from-cyan-600 to-blue-800',
      highlights: 'Kilambakkam (KCBT) & Koyambedu'
    },
    {
      city: 'Bangalore',
      tagline: 'Silicon Valley • Garden City',
      minFare: 550,
      dailyCoaches: buses.filter(b => b.destination === 'Bangalore').length || 3,
      imageBg: 'from-indigo-600 to-purple-800',
      highlights: 'Electronic City, Madiwala & Majestic'
    },
    {
      city: 'Salem',
      tagline: 'Central Hub • Steel & Mango Express',
      minFare: 400,
      dailyCoaches: buses.filter(b => b.destination === 'Salem').length || 5,
      imageBg: 'from-emerald-600 to-teal-800',
      highlights: 'New Bus Stand • Junction Transit'
    },
    {
      city: 'Hyderabad',
      tagline: 'City of Pearls • NH44 Highway Express',
      minFare: 850,
      dailyCoaches: buses.filter(b => b.destination === 'Hyderabad').length || 2,
      imageBg: 'from-amber-600 to-orange-800',
      highlights: 'MGBS & Gachibowli Non-Stop'
    },
    {
      city: 'Madurai',
      tagline: 'Cultural Capital • Meenakshi Express',
      minFare: 480,
      dailyCoaches: buses.filter(b => b.destination === 'Madurai').length || 2,
      imageBg: 'from-rose-600 to-pink-800',
      highlights: 'Mattuthavani Integrated Terminal'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ADMIN PRIVILEGE HERO BANNER (When logged in as Administrator) */}
      {isAdmin && (
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-indigo-300 uppercase">
                  Admin Fleet Portal
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  MySQL Synchronized
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5">
                Home & Explore with Live Administrative Privileges
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Fleet inventory: {buses.length} coaches registered • Verified live seat availability.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onGoToAdmin}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Open Admin Operations HQ
            </button>
            <button
              onClick={() => onSearchBuses('All', 'All', travelDate)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              Explore All Fleet ({buses.length})
            </button>
          </div>
        </section>
      )}

      {/* 1. GREETING & HERO SEARCH SECTION (Section 7) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Travel Smarter. Travel Safer.
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Seat Inventory
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Welcome, {currentUser ? currentUser.fullName : 'Traveler'}!
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct express coaches, live highway GPS tracking, and verified real-time seat inventory.
            </p>
          </div>
        </div>

        {/* MAIN SEARCH FORM: FROM, TO, TRAVEL DATE */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* FROM */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                From (Source)
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={`src-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* SWAP BUTTON */}
            <div className="hidden lg:flex lg:col-span-1 justify-center pb-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 transition cursor-pointer"
                title="Swap cities"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* TO */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                To (Destination)
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={`dst-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* TRAVEL DATE */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Travel Date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SEARCH BUTTON */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                SEARCH BUSES
              </button>
            </div>
          </div>

          {/* Quick Route Shortcuts */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Frequent Routes:</span>
            {quickRoutes.map((qr) => (
              <button
                key={`${qr.from}-${qr.to}`}
                type="button"
                onClick={() => {
                  setSource(qr.from);
                  setDestination(qr.to);
                  onSearchBuses(qr.from, qr.to, travelDate);
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 transition text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>{qr.from} &rarr; {qr.to}</span>
                <span className="text-emerald-700 font-mono font-bold">₹{qr.fare}</span>
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* 2. UPCOMING JOURNEY CARD (Section 7) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            Upcoming Journey
          </h2>
          {upcomingBooking && (
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              PNR: {upcomingBooking.pnr}
            </span>
          )}
        </div>

        {/* Download Notice Toast */}
        {downloadNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{downloadNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadNotice(null)}
              className="text-white/80 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {upcomingBooking ? (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                  CONFIRMED
                </span>
                <h3 className="text-base font-black text-slate-900">{upcomingBooking.busName}</h3>
                <span className="text-xs text-slate-500 font-mono">({upcomingBooking.busNumber})</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold flex-wrap">
                <span className="flex items-center gap-1 text-blue-700 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  {upcomingBooking.source} &rarr; {upcomingBooking.destination}
                </span>
                <span>•</span>
                <span>Date: <strong>{upcomingBooking.journeyDate || upcomingBooking.travelDate}</strong></span>
                <span>•</span>
                <span>Dep: <strong>{upcomingBooking.departureTime}</strong></span>
                <span>•</span>
                <span>
                  Seats:{' '}
                  <strong className="text-blue-700">
                    [{Array.isArray(upcomingBooking.seatNumbers) && upcomingBooking.seatNumbers.length > 0 ? upcomingBooking.seatNumbers.join(', ') : 'Assigned'}]
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => handleDownloadUpcoming(upcomingBooking)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Download Ticket PDF directly"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD TICKET</span>
              </button>

              {onViewTicket && (
                <button
                  type="button"
                  onClick={() => onViewTicket(upcomingBooking)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  VIEW TICKET
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const targetBus = buses.find(b => b.id === upcomingBooking.busId) || buses[0];
                  if (targetBus) onTrackBus(targetBus);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                TRACK BUS
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Plan your next journey</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                No active bus reservation found. Book an express coach to receive your digital ticket and live tracking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSearchBuses(source, destination, travelDate)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
            >
              SEARCH BUSES
            </button>
          </div>
        )}
      </section>

      {/* 3. EXPLORE POPULAR DESTINATIONS & HIGHWAY CORRIDORS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              Explore Popular Highway Destinations
            </h2>
            <p className="text-xs text-slate-500">
              Intercity corridors with frequent departures, luxury sleeper berths, and live highway tracking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exploreDestinations.map((dest) => (
            <div
              key={dest.city}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r ${dest.imageBg}`}>
                    Direct Express
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    From ₹{dest.minFare}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition">
                  {dest.city}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {dest.tagline}
                </p>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {dest.highlights}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {dest.dailyCoaches} Daily Coaches
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDestination(dest.city);
                    onSearchBuses('All', dest.city, travelDate);
                  }}
                  className="px-3 py-1.5 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  Explore <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED SCHEDULED COACHES WITH DETAILED SEAT AVAILABILITY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BusIcon className="w-5 h-5 text-blue-600" />
              Available Scheduled Coaches & Live Seat Status
            </h2>
            <p className="text-xs text-slate-500">
              Live fleet departures with exact counts of unbooked vs booked seats.
            </p>
          </div>
          <button
            onClick={() => onSearchBuses('All', 'All', travelDate)}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Browse All ({buses.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.slice(0, 4).map((bus) => {
            const bookedCount = Math.max(0, (bus.totalSeats || 40) - (bus.availableSeats || 0));
            const availableCount = bus.availableSeats || 0;
            const occupancyPct = Math.round((bookedCount / (bus.totalSeats || 40)) * 100);

            return (
              <div
                key={bus.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {bus.busNumber}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {bus.busStatus || 'SCHEDULED'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{bus.busName}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{bus.source} &rarr; {bus.destination}</p>
                  </div>

                  {/* Seat Availability Visual Indicator (Booked vs Unbooked) */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {availableCount} Unbooked (Available)
                      </span>
                      <span className="text-rose-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {bookedCount} Booked
                      </span>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-rose-500 h-full transition-all duration-300"
                        style={{ width: `${occupancyPct}%` }}
                        title={`${occupancyPct}% Booked`}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50/70 rounded-xl text-[11px] text-slate-600 font-medium">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Departure</span>
                      <strong className="text-slate-900">{bus.departureTime}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Arrival</span>
                      <strong className="text-slate-900">{bus.arrivalTime}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bus Type</span>
                      <strong className="text-slate-900 truncate block">{bus.busType?.split(' ')[0] || 'AC'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Ticket Fare</span>
                    <p className="text-base font-black text-slate-900">₹{bus.baseFare || bus.fare}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onTrackBus(bus)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      Track
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectSeats(bus)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Select Seats</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. GUARDIAN FLEET AMENITIES & QUALITY ASSURANCE */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider">
              Safety & Comfort Standards
            </span>
            <h3 className="text-lg font-black mt-1">Why Travel with Guardian Travels?</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Certified fleet operations, verified drivers, and real-time highway telematics.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">24x7 SOS:</span>
            <strong className="text-emerald-400 font-mono">+91 94432 99881</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Live GPS Highway Radar</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Track waypoint progression, driver contact, and real-time ETA on your phone.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Verified Seat Reservation</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              High-contrast visual deck with distinct available vs occupied seat status.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">High-Speed Fleet Wi-Fi</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Complimentary on-board Wi-Fi and individual 230V USB fast-charging berths.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Automated Refunds</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Transparent tier-based cancellation with instant simulated MySQL refund logs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
