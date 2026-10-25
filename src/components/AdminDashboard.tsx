import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  Ticket,
  Calendar,
  AlertCircle,
  Filter,
  Download,
  ShieldCheck,
  TrendingUp,
  Bus,
  RefreshCw,
  Navigation,
  Plus,
  Clock,
  Route,
  IndianRupee,
  Layers,
  BarChart3,
  MapPin,
  Edit,
  Trash2,
  DollarSign,
  Compass,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Passenger, Booking, Bus as BusType, BusOperationalStatus } from '../types';
import { generateAndDownloadTicket } from '../utils/ticketDownloader';

interface AdminDashboardProps {
  passengers: Passenger[];
  bookings: Booking[];
  buses: BusType[];
  onCancelBooking: (pnr: string) => void;
  onUpdateBusLocation?: (busId: string, status: BusOperationalStatus, nextStop: string, speed: number) => void;
  onAddNewBus?: (newBus: Partial<BusType>) => void;
  onDeleteBus?: (busId: string) => void;
  onOpenLiveTracking?: (busId: string) => void;
  onSelectSeats?: (bus: BusType) => void;
  onGoToHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  passengers,
  bookings,
  buses,
  onCancelBooking,
  onUpdateBusLocation,
  onAddNewBus,
  onDeleteBus,
  onOpenLiveTracking,
  onSelectSeats,
  onGoToHome
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedules' | 'explore' | 'fleet-gps' | 'manifest' | 'users' | 'revenue' | 'add-bus'>('overview');
  const [scheduleFilter, setScheduleFilter] = useState<'today' | 'tomorrow' | 'all'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [exploreCityFilter, setExploreCityFilter] = useState('All');
  const [exploreSearch, setExploreSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'insured'>('all');
  const [confirmPnr, setConfirmPnr] = useState<string | null>(null);

  // Bus edit modal state
  const [selectedBusForUpdate, setSelectedBusForUpdate] = useState<BusType | null>(null);
  const [updateStatus, setUpdateStatus] = useState<BusOperationalStatus>('ON_ROUTE');
  const [updateNextStop, setUpdateNextStop] = useState('');
  const [updateSpeed, setUpdateSpeed] = useState(72);

  // New bus form state
  const [newBusName, setNewBusName] = useState('Guardian Express');
  const [newBusNumber, setNewBusNumber] = useState('TN57AB1234');
  const [newBusType, setNewBusType] = useState('Multi-Axle Volvo AC');
  const [newSource, setNewSource] = useState('Salem');
  const [newDestination, setNewDestination] = useState('Coimbatore');
  const [newDeparture, setNewDeparture] = useState('06:30');
  const [newArrival, setNewArrival] = useState('10:00');
  const [newFare, setNewFare] = useState(450);
  const [newTotalSeats, setNewTotalSeats] = useState(40);
  const [newCurrentLocation, setNewCurrentLocation] = useState('Salem New Bus Stand');
  const [newDriverName, setNewDriverName] = useState('K. Saravanan');
  const [newDriverPhone, setNewDriverPhone] = useState('+91 94432 99881');
  const [addBusSuccess, setAddBusSuccess] = useState(false);

  const isConfirmed = (b: Booking) => Boolean(b && (b.status === 'CONFIRMED' || b.bookingStatus === 'confirmed'));
  const isCancelled = (b: Booking) => Boolean(b && (b.status === 'CANCELLED' || b.bookingStatus === 'cancelled'));

  // Stats calculation
  const totalRevenue = (bookings || []).reduce((sum, b) => (b && isConfirmed(b) ? sum + (Number(b.totalAmount) || 0) : sum), 0);
  const cancelledRevenue = (bookings || []).reduce((sum, b) => (b && isCancelled(b) ? sum + (Number(b.totalAmount) || 0) : sum), 0);
  const totalConfirmed = (bookings || []).filter((b) => b && isConfirmed(b)).length;
  const totalCancelled = (bookings || []).filter((b) => b && isCancelled(b)).length;
  const activeBusesCount = (buses || []).filter(b => b && b.busStatus !== 'CANCELLED' && b.busStatus !== 'Halted').length;

  const filteredBookings = (bookings || []).filter((b) => {
    if (!b) return false;
    const q = (searchTerm || '').trim().toLowerCase();
    const pnr = (b.pnr || '').toLowerCase();
    const pName = (b.passengerName || '').toLowerCase();
    const pPhone = String(b.passengerPhone || '');
    const bName = (b.busName || '').toLowerCase();

    const matchesSearch = !q || pnr.includes(q) || pName.includes(q) || pPhone.includes(q) || bName.includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'confirmed') return isConfirmed(b);
    if (statusFilter === 'cancelled') return isCancelled(b);
    if (statusFilter === 'insured') return Boolean(b.insuranceOpted);
    return true;
  });

  const filteredExploreBuses = (buses || []).filter((b) => {
    if (!b) return false;
    const q = (exploreSearch || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.busName.toLowerCase().includes(q) ||
      b.busNumber.toLowerCase().includes(q) ||
      b.source.toLowerCase().includes(q) ||
      b.destination.toLowerCase().includes(q) ||
      (b.driverName || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (exploreCityFilter !== 'All') {
      const city = exploreCityFilter.toLowerCase();
      if (!b.source.toLowerCase().includes(city) && !b.destination.toLowerCase().includes(city)) {
        return false;
      }
    }

    return true;
  });

  // Calculate unique routes
  const uniqueRouteKeys = Array.from(new Set((buses || []).map(b => `${b.source} -> ${b.destination}`)));
  const totalFleetSeats = (buses || []).reduce((acc, b) => acc + (b.totalSeats || 40), 0);
  const totalAvailableSeats = (buses || []).reduce((acc, b) => acc + (b.availableSeats || 0), 0);
  const totalBookedSeats = Math.max(0, totalFleetSeats - totalAvailableSeats);
  const overallOccupancyPct = totalFleetSeats > 0 ? Math.round((totalBookedSeats / totalFleetSeats) * 100) : 0;

  const handleOpenBusUpdate = (bus: BusType) => {
    setSelectedBusForUpdate(bus);
    setUpdateStatus(bus.busStatus || 'ON_ROUTE');
    setUpdateNextStop(bus.currentWaypoint || bus.nextStop || bus.destination);
    setUpdateSpeed(bus.speedKmph || bus.currentSpeedKmH || 75);
  };

  const handleSaveBusUpdate = () => {
    if (selectedBusForUpdate && onUpdateBusLocation) {
      onUpdateBusLocation(selectedBusForUpdate.id, updateStatus, updateNextStop, updateSpeed);
      setSelectedBusForUpdate(null);
    }
  };

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusName || !newBusNumber) return;

    if (onAddNewBus) {
      onAddNewBus({
        busName: newBusName,
        busNumber: newBusNumber,
        busType: newBusType as any,
        source: newSource,
        destination: newDestination,
        departureTime: newDeparture,
        arrivalTime: newArrival,
        baseFare: newFare,
        fare: newFare,
        totalSeats: newTotalSeats,
        availableSeats: newTotalSeats,
        driverName: newDriverName || 'K. Saravanan',
        driverPhone: newDriverPhone || '+91 94432 99881',
        rating: 4.8,
        busStatus: 'SCHEDULED',
        speedKmph: 0,
        currentLocation: newCurrentLocation,
        currentWaypoint: newCurrentLocation
      });
      setAddBusSuccess(true);
      setTimeout(() => setAddBusSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500 text-slate-950 uppercase tracking-wider">
                Fleet Command
              </span>
              <span className="text-xs text-slate-400">MySQL Database Live Synchronized</span>
            </div>
            <h2 className="text-2xl font-black mt-1">Guardian Travels Operations HQ</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live fleet telemetry, driver controls, schedule dispatch, and passenger reservation manifest.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'explore' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore Routes & Fleet
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'schedules' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Today&apos;s Schedules
            </button>
            <button
              onClick={() => setActiveTab('fleet-gps')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'fleet-gps' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Live Fleet GPS ({buses.length})
            </button>
            <button
              onClick={() => setActiveTab('manifest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'manifest' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Registered Users ({passengers.length})
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'revenue' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Revenue Reports
            </button>
            <button
              onClick={() => setActiveTab('add-bus')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'add-bus' ? 'bg-emerald-600 text-white' : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
              }`}
            >
              + Add Bus & Route
            </button>
            {onGoToHome && (
              <button
                type="button"
                onClick={onGoToHome}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-blue-950/70 border border-blue-500/40 text-blue-300 hover:bg-blue-900/90 shadow-sm cursor-pointer"
                title="Switch to Passenger Home & Explore Portal"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                Traveler Home & Explore
              </button>
            )}
          </div>
        </div>

        {/* 6 Key Operational Metrics (Section 9) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Buses</p>
            <p className="text-2xl font-black text-white mt-1">{buses.length}</p>
            <p className="text-[10px] text-blue-400 font-semibold mt-0.5">Fleet registered</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Active Buses</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{activeBusesCount}</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">In operational service</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Today&apos;s Trips</p>
            <p className="text-2xl font-black text-cyan-400 mt-1">{buses.length}</p>
            <p className="text-[10px] text-cyan-300 font-semibold mt-0.5">Scheduled departures</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</p>
            <p className="text-2xl font-black text-white mt-1">{bookings.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{totalConfirmed} Confirmed</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Today&apos;s Revenue</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Ticket bookings</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Registered Users</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{passengers.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">MySQL User Accounts</p>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & TODAY'S BUS SCHEDULE */}
      {(activeTab === 'overview' || activeTab === 'schedules') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Today&apos;s Bus Schedule & Fleet Departures
              </h3>
              <p className="text-xs text-slate-500">
                Live intercity schedule table. New buses added by Admin automatically appear here and in User Search.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setScheduleFilter('today')}
                  className={`px-3 py-1 rounded-lg transition ${
                    scheduleFilter === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setScheduleFilter('tomorrow')}
                  className={`px-3 py-1 rounded-lg transition ${
                    scheduleFilter === 'tomorrow' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => setScheduleFilter('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    scheduleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All Dates
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Bus / Registration</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Departure & Arrival</th>
                  <th className="p-4">Fare</th>
                  <th className="p-4">Available Seats</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{bus.busName}</p>
                      <p className="font-mono text-xs text-blue-600 font-bold mt-0.5">{bus.busNumber}</p>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {bus.busType}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <span>{bus.source}</span>
                        <span className="text-blue-600">&rarr;</span>
                        <span>{bus.destination}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Loc: {bus.currentLocation || bus.source}
                      </p>
                    </td>

                    <td className="p-4 font-mono">
                      <p className="font-bold text-slate-800 text-xs">Dep: {bus.departureTime}</p>
                      <p className="text-slate-500 text-[11px]">Arr: {bus.arrivalTime}</p>
                    </td>

                    <td className="p-4 font-bold text-slate-900 text-sm">
                      ₹{bus.baseFare || bus.fare}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        {bus.availableSeats} of {bus.totalSeats} Available
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          bus.busStatus === 'ON_ROUTE' || bus.busStatus === 'On Schedule'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bus.busStatus === 'DELAYED' || bus.busStatus === 'Slight Delay'
                            ? 'bg-amber-100 text-amber-800'
                            : bus.busStatus === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {bus.busStatus || 'SCHEDULED'}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenBusUpdate(bus)}
                        className="px-2.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold text-[11px] transition"
                      >
                        Update Location
                      </button>
                      {onOpenLiveTracking && (
                        <button
                          onClick={() => onOpenLiveTracking(bus.id)}
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition"
                        >
                          Live Radar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: EXPLORE ROUTES & FLEET INVENTORY */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Top Route Network Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Corridors</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{uniqueRouteKeys.length}</p>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">Active intercity routes</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Fleet Load Factor</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{overallOccupancyPct}%</p>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">{totalBookedSeats} / {totalFleetSeats} Seats Booked</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Available Inventory</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{totalAvailableSeats}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Unbooked berths & seats</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Ticket Fare</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ₹{buses.length > 0 ? Math.round(buses.reduce((a, b) => a + (b.baseFare || b.fare || 0), 0) / buses.length) : 0}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Across active fleet</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    Operations Route Matrix
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live MySQL Synchronized
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  Fleet Network & Route Explorer
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect route load factor, real-time unbooked vs booked seat distribution, and driver telemetry.
                </p>
              </div>

              {onGoToHome && (
                <button
                  type="button"
                  onClick={onGoToHome}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Traveler Home & Explore
                </button>
              )}
            </div>

            {/* Quick Filter Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search route, city, coach name, or registration..."
                  value={exploreSearch}
                  onChange={(e) => setExploreSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0">City Corridor:</span>
                <select
                  value={exploreCityFilter}
                  onChange={(e) => setExploreCityFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Cities & Routes</option>
                  <option value="Salem">Salem Corridors</option>
                  <option value="Coimbatore">Coimbatore Corridors</option>
                  <option value="Chennai">Chennai Corridors</option>
                  <option value="Bangalore">Bangalore Corridors</option>
                  <option value="Hyderabad">Hyderabad Corridors</option>
                  <option value="Madurai">Madurai Corridors</option>
                </select>
              </div>

              <div className="sm:col-span-3 text-right">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  Showing {filteredExploreBuses.length} Coaches
                </span>
              </div>
            </div>
          </div>

          {/* Route Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExploreBuses.map((bus) => {
              const total = bus.totalSeats || 40;
              const free = bus.availableSeats || 0;
              const booked = Math.max(0, total - free);
              const occPct = Math.round((booked / total) * 100);

              return (
                <div
                  key={`explore-bus-${bus.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-blue-300 transition"
                >
                  {/* Bus Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                        {bus.busNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {bus.busType}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {bus.busStatus || 'SCHEDULED'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{bus.busName}</h4>
                    <p className="text-xs text-blue-700 font-bold flex items-center gap-1.5 mt-0.5">
                      <span>{bus.source}</span>
                      <span>&rarr;</span>
                      <span>{bus.destination}</span>
                    </p>
                  </div>

                  {/* Seat Occupancy Visualizer */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {free} Unbooked (Available)
                      </span>
                      <span className="text-rose-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {booked} Booked ({occPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-rose-500 h-full transition-all"
                        style={{ width: `${occPct}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-medium">
                      <span>Total Capacity: {total} Seats</span>
                      <span>Ticket Fare: ₹{bus.baseFare || bus.fare}</span>
                    </div>
                  </div>

                  {/* Driver & Telemetry */}
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50/70 p-2.5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span>Driver: <strong>{bus.driverName}</strong></span>
                      <span className="font-mono text-slate-500">{bus.driverPhone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Dep: <strong>{bus.departureTime}</strong></span>
                      <span>Current Loc: <strong>{bus.currentLocation || bus.source}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {onSelectSeats && (
                      <button
                        type="button"
                        onClick={() => onSelectSeats(bus)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        title="Open full interactive seat map to inspect booked and unbooked seats"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Seat Map
                      </button>
                    )}

                    {onOpenLiveTracking && (
                      <button
                        type="button"
                        onClick={() => onOpenLiveTracking(bus.id)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Live GPS Radar"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        Radar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenBusUpdate(bus)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Update telemetry and location"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-600" />
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {activeTab === 'fleet-gps' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                Active Highway Fleet & Live Telemetry Controls
              </h3>
              <p className="text-xs text-slate-500">
                Update bus location, waypoint progression, driver contact numbers, and broadcast to User live tracking.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Coach / Registration</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Assigned Driver & Phone</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5">Speed / Telemetry</th>
                  <th className="p-3.5">Occupancy</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buses.map((bus) => {
                  const occupied = bus.totalSeats - bus.availableSeats;
                  const occupancyRate = Math.round((occupied / bus.totalSeats) * 100);

                  return (
                    <tr key={bus.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 text-xs">{bus.busName}</p>
                        <p className="text-[11px] font-mono text-slate-500">{bus.busNumber}</p>
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                          {bus.busType || bus.type}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800">
                          {bus.source} → {bus.destination}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Dep: {bus.departureTime} | Arr: {bus.arrivalTime}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{bus.driverName}</p>
                        <a
                          href={`tel:${bus.driverPhone}`}
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          {bus.driverPhone}
                        </a>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            bus.busStatus === 'On Schedule' || bus.busStatus === 'SCHEDULED' || bus.busStatus === 'ON_ROUTE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bus.busStatus === 'Slight Delay' || bus.busStatus === 'DELAYED'
                              ? 'bg-amber-100 text-amber-800'
                              : bus.busStatus === 'Halted' || bus.busStatus === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {bus.busStatus || 'SCHEDULED'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[120px]">
                          Near: {bus.currentWaypoint || bus.nextStop || bus.currentLocation || bus.source}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-slate-800">{bus.speedKmph || bus.currentSpeedKmH || 75} km/h</p>
                        <p className="text-[10px] text-slate-400">GPS Active (100%)</p>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${occupancyRate}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700">{occupancyRate}%</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {occupied} / {bus.totalSeats} seats
                        </p>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {onOpenLiveTracking && (
                          <button
                            onClick={() => onOpenLiveTracking(bus.id)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition"
                          >
                            Live Map
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenBusUpdate(bus)}
                          className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold text-[11px] transition"
                        >
                          Edit Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANIFEST & ALL BOOKINGS */}
      {activeTab === 'manifest' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Passenger Reservations Manifest</h3>
              <p className="text-xs text-slate-500">
                Real-time booking and cancellation ledger stored in MySQL.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search PNR, Passenger, Phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-1">
                {(['all', 'confirmed', 'cancelled', 'insured'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition ${
                      statusFilter === tab
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">PNR / Ref</th>
                  <th className="p-3.5">Passenger Details</th>
                  <th className="p-3.5">Coach & Seats</th>
                  <th className="p-3.5">Route & Date</th>
                  <th className="p-3.5">Insurance</th>
                  <th className="p-3.5">Total Fare</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {b.pnr}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{b.bookedAt || b.bookingDate}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{b.passengerName}</p>
                      <p className="text-[11px] text-slate-500">{b.passengerPhone}</p>
                      <p className="text-[10px] text-slate-400">{b.passengerEmail}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{b.busName || 'Express Coach'}</p>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        Seats: {Array.isArray(b.seatNumbers) && b.seatNumbers.length > 0 ? b.seatNumbers.join(', ') : 'Assigned'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">
                        {b.source} → {b.destination}
                      </p>
                      <p className="text-[10px] text-slate-500">{b.journeyDate || b.travelDate}</p>
                    </td>

                    <td className="p-3.5">
                      {b.insuranceOpted ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Active (₹{b.insuranceFee || 29})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isConfirmed(b)
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status || b.bookingStatus?.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => generateAndDownloadTicket(b)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1 border border-emerald-200 cursor-pointer"
                          title="Download Passenger Ticket (PDF)"
                        >
                          <Download className="w-3 h-3 text-emerald-600" />
                          <span>Ticket</span>
                        </button>
                        {isConfirmed(b) ? (
                          confirmPnr === b.pnr ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg animate-in fade-in">
                              <span className="text-[10px] text-rose-700 font-bold">Sure?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onCancelBooking(b.pnr);
                                  setConfirmPnr(null);
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmPnr(null)}
                                className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmPnr(b.pnr)}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Cancel reservation and refund"
                            >
                              Cancel
                            </button>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400">Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REGISTERED USERS LEDGER (Section 26) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Registered Travelers & Passengers Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Audited list of all user registrations with booking volume and trip expenditure. Passwords securely hashed.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              {passengers.length} Total Users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Traveler Name</th>
                  <th className="p-4">Username & City</th>
                  <th className="p-4">Contact (Email & Mobile)</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4">Total Trips</th>
                  <th className="p-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passengers.map((p) => {
                  const userTrips = (bookings || []).filter(b => b && (b.passengerEmail === p.email || b.passengerPhone === p.phone));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-slate-900 text-sm">
                        {p.fullName}
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-slate-700">@{p.username || 'user'}</p>
                        <p className="text-slate-400 text-[11px]">{p.city || 'Salem'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-800">{p.email}</p>
                        <p className="text-slate-500 font-mono text-[11px]">{p.phone}</p>
                      </td>
                      <td className="p-4 text-slate-600 text-[11px]">
                        {p.createdAt}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                          {userTrips.length} Bookings
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.isAdmin ? 'ADMIN' : 'PASSENGER'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REVENUE & FINANCIAL REPORTS (Section 27) */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Confirmed Collections</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-1">Across all intercity departures</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Refunded & Cancelled</span>
              <p className="text-3xl font-black text-rose-500 mt-2">₹{cancelledRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-1">Processed per refund policy</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Net Operating Revenue</span>
              <p className="text-3xl font-black text-blue-600 mt-2">₹{(totalRevenue - cancelledRevenue).toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-1">Fiscal year 2026-27 direct bookings</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ADD NEW BUS & ROUTE FORM (Section 10 & 13) */}
      {activeTab === 'add-bus' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Register New Coach & Schedule</h3>
              <p className="text-xs text-slate-500">
                Data saved here writes to the MySQL database and immediately reflects on the User search page.
              </p>
            </div>
          </div>

          {addBusSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>New coach & schedule successfully stored in database and live on passenger portal!</span>
            </div>
          )}

          <form onSubmit={handleCreateBus} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bus Number (Registration Plate) *</label>
                <input
                  type="text"
                  placeholder="e.g. TN57AB1234"
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono uppercase text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bus Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Guardian Express"
                  value={newBusName}
                  onChange={(e) => setNewBusName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bus Type</label>
                <select
                  value={newBusType}
                  onChange={(e) => setNewBusType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Multi-Axle Volvo AC">Multi-Axle Volvo AC</option>
                  <option value="AC Sleeper">AC Sleeper</option>
                  <option value="Electric Luxury AC">Electric Luxury AC</option>
                  <option value="Semi-Sleeper AC">Semi-Sleeper AC</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Source City (From) *</label>
                <input
                  type="text"
                  placeholder="Salem"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination City (To) *</label>
                <input
                  type="text"
                  placeholder="Coimbatore"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Departure Time *</label>
                <input
                  type="text"
                  placeholder="06:30 AM"
                  value={newDeparture}
                  onChange={(e) => setNewDeparture(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Arrival Time *</label>
                <input
                  type="text"
                  placeholder="10:00 AM"
                  value={newArrival}
                  onChange={(e) => setNewArrival(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Base Fare (₹) *</label>
                <input
                  type="number"
                  value={newFare}
                  onChange={(e) => setNewFare(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Seats *</label>
                <input
                  type="number"
                  value={newTotalSeats}
                  onChange={(e) => setNewTotalSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Salem New Bus Stand"
                  value={newCurrentLocation}
                  onChange={(e) => setNewCurrentLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  placeholder="Driver Full Name"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 94432 99881"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Store Bus in MySQL & Publish to User Portal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UPDATE BUS LOCATION & STATUS MODAL (Section 23) */}
      {selectedBusForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-bold uppercase">
                <Navigation className="w-4 h-4" />
                Live Telemetry Dispatcher
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Update Bus Location & Status
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedBusForUpdate.busName} ({selectedBusForUpdate.busNumber})
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Location / Waypoint *</label>
                <input
                  type="text"
                  value={updateNextStop}
                  onChange={(e) => setUpdateNextStop(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  placeholder="e.g. Namakkal or Erode"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Example: Salem &rarr; Namakkal &rarr; Erode &rarr; Coimbatore
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational State</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as BusOperationalStatus)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="BOARDING">BOARDING</option>
                  <option value="ON_ROUTE">ON_ROUTE</option>
                  <option value="DELAYED">DELAYED</option>
                  <option value="ARRIVING">ARRIVING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="Halted">HALTED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Live Speed (km/h)</label>
                <input
                  type="number"
                  value={updateSpeed}
                  onChange={(e) => setUpdateSpeed(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBusForUpdate(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBusUpdate}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow"
                >
                  Save & Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
