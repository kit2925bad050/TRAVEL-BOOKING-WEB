import React, { useState, useEffect } from 'react';
import {
  Bus,
  Passenger,
  Booking,
  Seat,
  CancellationRecord,
  NotificationItem,
  BusOperationalStatus
} from './types';
import { dbSimulator } from './services/dbSimulator';
import { WelcomeAuthPage } from './components/WelcomeAuthPage';
import { SidebarNav, ActiveTab } from './components/SidebarNav';
import { HomePage } from './components/HomePage';
import { BusSearch } from './components/BusSearch';
import { BusCard } from './components/BusCard';
import { SeatMapModal } from './components/SeatMapModal';
import { PassengerDetailsForm } from './components/PassengerDetailsForm';
import { BookingTicketModal } from './components/BookingTicketModal';
import { CancellationModal } from './components/CancellationModal';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { NotificationsView } from './components/NotificationsView';
import { EmergencyView } from './components/EmergencyView';
import { ProfileView } from './components/ProfileView';
import {
  ShieldCheck,
  Award,
  Clock,
  HeartHandshake,
  Bus as BusIcon,
  Search,
  Navigation,
  Bell,
  Menu,
  X,
  PhoneCall,
  User,
  Layers,
  Sparkles,
  LogOut,
  MapPin
} from 'lucide-react';

export default function App() {
  // App authentication state - ALWAYS starts with Welcome/Login per Section 1:
  // "When the application starts: ALWAYS show: GUARDIAN TRAVELS LOGIN / WELCOME PAGE. Never directly open Dashboard."
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  // Navigation tab for authenticated users/admins
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Database live state
  const [buses, setBuses] = useState<Bus[]>(() => dbSimulator.getAllBuses());
  const [bookings, setBookings] = useState<Booking[]>(() => dbSimulator.getAllBookings());
  const [cancellations, setCancellations] = useState<CancellationRecord[]>(() => dbSimulator.getAllCancellations());
  const [currentUser, setCurrentUser] = useState<Passenger | null>(() => dbSimulator.getCurrentUser());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => dbSimulator.getNotifications());

  // Search parameters
  const [source, setSource] = useState('All');
  const [destination, setDestination] = useState('All');
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [selectedBusType, setSelectedBusType] = useState('All');

  // Modal states
  const [selectedBusForSeats, setSelectedBusForSeats] = useState<Bus | null>(null);
  const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);

  const [selectedSeatsForBooking, setSelectedSeatsForBooking] = useState<Seat[]>([]);
  const [isPassengerFormOpen, setIsPassengerFormOpen] = useState(false);

  const [activeTicket, setActiveTicket] = useState<Booking | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const [cancellationPnr, setCancellationPnr] = useState('');
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

  // Live Tracking Modal State
  const [selectedBusForTracking, setSelectedBusForTracking] = useState<Bus | null>(null);
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState<Booking | null>(null);
  const [isLiveTrackingOpen, setIsLiveTrackingOpen] = useState(false);

  // Global In-App Toast (eliminates window.alert in iframes)
  const [appToast, setAppToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAppToast({ message, type });
    setTimeout(() => setAppToast(null), 5000);
  };

  // Subscribe to db simulator updates (MySQL simulation)
  useEffect(() => {
    const unsubscribe = dbSimulator.subscribe(() => {
      setBuses(dbSimulator.getAllBuses());
      setBookings(dbSimulator.getAllBookings());
      setCancellations(dbSimulator.getAllCancellations());
      setCurrentUser(dbSimulator.getCurrentUser());
      setNotifications(dbSimulator.getNotifications());
    });
    return unsubscribe;
  }, []);

  // Keep selectedBusForSeats synchronized with live bus inventory
  useEffect(() => {
    if (selectedBusForSeats) {
      const live = buses.find((b) => b.id === selectedBusForSeats.id);
      if (live && live !== selectedBusForSeats) {
        setSelectedBusForSeats(live);
      }
    }
  }, [buses, selectedBusForSeats]);

  const liveBusForSeats = selectedBusForSeats
    ? (buses.find((b) => b.id === selectedBusForSeats.id) || selectedBusForSeats)
    : null;

  // Filtered buses (Dynamic from Database)
  const filteredBuses = dbSimulator.searchBuses({
    source: source !== 'All' ? source : undefined,
    destination: destination !== 'All' ? destination : undefined,
    busType: selectedBusType !== 'All' ? selectedBusType : undefined
  });

  const handleSwapCities = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleOpenSeatMap = (bus: Bus) => {
    setSelectedBusForSeats(bus);
    setIsSeatMapOpen(true);
  };

  const handleProceedToBooking = (seats: Seat[]) => {
    if (!seats || seats.length === 0) {
      showToast('Please select at least one seat to proceed.', 'error');
      return;
    }
    setSelectedSeatsForBooking(seats);
    setIsSeatMapOpen(false);
    setIsPassengerFormOpen(true);
  };

  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const handleConfirmBooking = (bookingData: any) => {
    if (isBookingSubmitting) return;
    setIsBookingSubmitting(true);

    try {
      const activeBus = liveBusForSeats || selectedBusForSeats;
      const effectivePassenger = currentUser || dbSimulator.getCurrentUser() || {
        id: 'p-guest',
        fullName: bookingData.passengers?.[0]?.name || 'Guardian Traveler',
        email: 'traveler@guardiantravels.in',
        phone: '9845012890',
        age: 28,
        gender: 'Male',
        city: 'Bangalore'
      };

      const result = dbSimulator.bookSeats({
        ...bookingData,
        passenger: effectivePassenger,
        busId: activeBus?.id || '',
        busName: activeBus?.busName,
        busNumber: activeBus?.busNumber,
        source: activeBus?.source,
        destination: activeBus?.destination,
        departureTime: activeBus?.departureTime,
        arrivalTime: activeBus?.arrivalTime,
        journeyDate: travelDate,
        travelDate: travelDate
      });

      setIsPassengerFormOpen(false);

      if (result.success && result.booking) {
        // Refresh fleet and selected bus immediately with booked seats
        const updatedBuses = dbSimulator.getAllBuses();
        setBuses(updatedBuses);
        if (activeBus) {
          const fresh = updatedBuses.find(b => b.id === activeBus.id);
          if (fresh) setSelectedBusForSeats(fresh);
        }
        setActiveTicket(result.booking);
        setIsTicketModalOpen(true);
        showToast('Booking successfully confirmed & ticket generated!', 'success');
      } else {
        showToast(`Booking Error: ${result.message}`, 'error');
      }
    } finally {
      setTimeout(() => setIsBookingSubmitting(false), 600);
    }
  };

  const handleOpenCancellation = (pnr: string = '') => {
    setCancellationPnr(pnr);
    setIsCancellationModalOpen(true);
  };

  // Live Tracking Handlers
  const handleTrackBus = (busOrId: Bus | string, booking?: Booking) => {
    let targetBus: Bus | undefined;
    if (typeof busOrId === 'string') {
      targetBus = buses.find((b) => b.id === busOrId);
    } else {
      targetBus = busOrId;
    }

    if (targetBus) {
      setSelectedBusForTracking(targetBus);
      setSelectedBookingForTracking(booking || null);
      setIsLiveTrackingOpen(true);
    } else {
      showToast('Coach details not found for live tracking.', 'info');
    }
  };

  const handleOpenGeneralLiveTracking = () => {
    if (buses.length > 0) {
      setSelectedBusForTracking(buses[0]);
      setSelectedBookingForTracking(null);
      setIsLiveTrackingOpen(true);
    }
  };

  const handleSearchFromHome = (src: string, dst: string, dt: string) => {
    setSource(src);
    setDestination(dst);
    setTravelDate(dt);
    setActiveTab('search');
  };

  const handleLoginSuccess = (user: Passenger, role: 'user' | 'admin') => {
    dbSimulator.setCurrentUser(user);
    setCurrentUser(user);
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    dbSimulator.logoutUser();
    setIsAuthenticated(false);
    setUserRole('user');
    setActiveTab('home');
  };

  const handleCancelBookingFromAdmin = (pnr: string) => {
    const result = dbSimulator.cancelBooking(pnr);
    if (result.success) {
      showToast(`Booking ${pnr} has been successfully cancelled and refund initiated.`, 'success');
    } else {
      showToast(`Error cancelling booking: ${result.message}`, 'error');
    }
  };

  // ADMIN ACTION: Update Bus Location in MySQL -> Automatically reflects on User side
  const handleUpdateBusLocationFromAdmin = (
    busId: string,
    status: BusOperationalStatus,
    nextStop: string,
    speed: number
  ) => {
    dbSimulator.updateBusTelemetry(busId, {
      busStatus: status,
      currentWaypoint: nextStop,
      speedKmph: speed,
      currentLocation: nextStop
    });
    showToast(`Bus location updated to "${nextStop}". Automatically reflected on passenger live tracking!`, 'success');
  };

  // ADMIN ACTION: Add Bus in MySQL -> Automatically reflects on User search
  const handleAddNewBusFromAdmin = (newBus: Partial<Bus>) => {
    dbSimulator.addBus(newBus);
    showToast('New bus added to fleet and live database schedules!', 'success');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read && !n.isRead).length;

  // Filter bookings for current logged-in user
  const userBookings = currentUser
    ? bookings.filter(
        (b) => b && ((currentUser.email && b.passengerEmail === currentUser.email) || (currentUser.phone && b.passengerPhone === currentUser.phone))
      )
    : [];

  // 1. APPLICATION START FLOW PER SPEC:
  // "When the application starts: ALWAYS show: GUARDIAN TRAVELS LOGIN / WELCOME PAGE. Never directly open Dashboard."
  if (!isAuthenticated) {
    return <WelcomeAuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white relative">
      {/* Global In-App Toast Notification Banner */}
      {appToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm sm:max-w-md animate-in slide-in-from-top duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs font-bold text-white border border-white/20 ${
            appToast.type === 'error'
              ? 'bg-rose-600 shadow-rose-600/30'
              : appToast.type === 'success'
              ? 'bg-emerald-600 shadow-emerald-600/30'
              : 'bg-blue-600 shadow-blue-600/30'
          }`}>
            <span>{appToast.message}</span>
            <button
              type="button"
              onClick={() => setAppToast(null)}
              className="text-white/80 hover:text-white underline cursor-pointer text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow">
            GT
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none">GUARDIAN TRAVELS</h1>
            <span className="text-[10px] text-blue-300">
              {userRole === 'admin' ? 'Admin Fleet Command' : 'Passenger Portal'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userRole !== 'admin' && (
            <button
              onClick={() => setActiveTab('notifications')}
              className="p-2 rounded-lg text-slate-300 hover:text-white relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Nav Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm pt-16 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            {userRole === 'admin' ? (
              <>
                <button
                  onClick={() => { setActiveTab('admin-dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-800"
                >
                  Admin Operations HQ
                </button>
                <button
                  onClick={() => { handleOpenGeneralLiveTracking(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:bg-slate-800"
                >
                  Live Fleet Radar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-800"
                >
                  Home
                </button>
                <button
                  onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:bg-slate-800"
                >
                  Search Buses
                </button>
                <button
                  onClick={() => { setActiveTab('my-trips'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:bg-slate-800"
                >
                  My Trips
                </button>
                <button
                  onClick={() => { setActiveTab('my-tickets'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:bg-slate-800"
                >
                  My Tickets
                </button>
                <button
                  onClick={() => { handleOpenGeneralLiveTracking(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:bg-slate-800"
                >
                  Live Tracking
                </button>
                <button
                  onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:bg-slate-800"
                >
                  Notifications
                </button>
                <button
                  onClick={() => { setActiveTab('emergency'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-rose-400 hover:bg-slate-800"
                >
                  Emergency SOS
                </button>
                <button
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:bg-slate-800"
                >
                  Profile
                </button>
              </>
            )}

            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2 bg-rose-900/60 text-rose-300 rounded-xl text-xs font-bold"
              >
                Sign Out
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Shell Sidebar (Dedicated per role) */}
      <div className="hidden md:block">
        <SidebarNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          currentUser={currentUser}
          onLogout={handleLogout}
          unreadNotificationsCount={unreadNotificationsCount}
          openAdminLoginModal={() => {}}
        />
      </div>

      {/* Main Workspace / Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Top Appbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 hidden md:flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight capitalize">
              {activeTab === 'home' && 'Guardian Travels • Travel Smarter. Travel Safer.'}
              {activeTab === 'search' && 'Intercity Coach Search & Live Seat Map'}
              {activeTab === 'live-tracking' && 'Highway GPS Radar & Live Coach Telemetry'}
              {activeTab === 'my-trips' && 'Passenger Reservations & Trip History'}
              {activeTab === 'my-tickets' && 'Digital Boarding Passes & Itineraries'}
              {activeTab === 'notifications' && 'Operational Travel Alerts'}
              {activeTab === 'emergency' && 'Highway SOS & Emergency Assistance'}
              {activeTab === 'profile' && 'Traveler Account & Profile Settings'}
              {activeTab === 'admin-dashboard' && 'Fleet Operations Command & Dispatch Center'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Live GPS Tracking Button */}
            <button
              onClick={handleOpenGeneralLiveTracking}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs border border-blue-200 transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              Live Radar
            </button>

            {/* Emergency Hotline Button */}
            {userRole !== 'admin' && (
              <button
                onClick={() => setActiveTab('emergency')}
                className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                1800-200-8899
              </button>
            )}

            {/* Notification Bell */}
            {userRole !== 'admin' && (
              <button
                onClick={() => setActiveTab('notifications')}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>
            )}

            {/* User Profile Pill & Sign Out */}
            <div className="flex items-center gap-2 pl-3 pr-2 py-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800">
              <span className="max-w-[120px] truncate">{currentUser?.fullName || 'Traveler'}</span>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser?.fullName?.charAt(0) || 'G'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic View Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {/* USER & ADMIN HOME & EXPLORE PAGE */}
          {activeTab === 'home' && (
            <HomePage
              buses={buses}
              currentUser={currentUser}
              userBookings={userBookings}
              onSearchBuses={handleSearchFromHome}
              onSelectSeats={handleOpenSeatMap}
              onTrackBus={handleTrackBus}
              onViewTicket={(b) => {
                setActiveTicket(b);
                setIsTicketModalOpen(true);
              }}
              onGoToSignIn={handleLogout}
              onGoToAdmin={() => setActiveTab('admin-dashboard')}
            />
          )}

          {/* USER BUS SEARCH & RESULTS (Section 15) */}
          {activeTab === 'search' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Search Widget */}
              <BusSearch
                source={source}
                setSource={setSource}
                destination={destination}
                setDestination={setDestination}
                travelDate={travelDate}
                setTravelDate={setTravelDate}
                selectedBusType={selectedBusType}
                setSelectedBusType={setSelectedBusType}
                onSearch={() => {}}
                onSwapCities={handleSwapCities}
              />

              {/* Results Top Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Available Scheduled Coaches
                    <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                      {filteredBuses.length} Buses Available
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live seat inventory & real-time GPS telemetry from database.
                  </p>
                </div>
              </div>

              {/* Bus Cards List (Section 15: Name, Number, Source->Dest, Dep/Arr, Duration, Fare, Seats, Status, Location) */}
              {filteredBuses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                  <BusIcon className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">No coaches found for this route</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try switching the origin or destination cities to &quot;All&quot; or select Salem &rarr; Coimbatore to see our newly registered fleet.
                  </p>
                  <button
                    onClick={() => { setSource('All'); setDestination('All'); setSelectedBusType('All'); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBuses.map((bus) => (
                    <BusCard
                      key={bus.id}
                      bus={bus}
                      onSelectSeats={handleOpenSeatMap}
                      onQuickCheck={() => handleOpenSeatMap(bus)}
                      onTrackBus={handleTrackBus}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIVE TRACKING (FULLSCREEN MAP/RADAR) */}
          {activeTab === 'live-tracking' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    Live Fleet Highway Telemetry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select any operational coach to track waypoint progression, driver details, and ETA.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buses.map((bus) => (
                  <div key={bus.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
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

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                      <p>Current Waypoint: <strong>{bus.currentLocation || bus.source}</strong></p>
                      <p>Driver: <strong>{bus.driverName}</strong> ({bus.driverPhone})</p>
                      <p>Speed: <strong>{bus.speedKmph || bus.currentSpeedKmH || 75} km/h</strong></p>
                    </div>

                    <button
                      onClick={() => handleTrackBus(bus)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Navigation className="w-4 h-4" />
                      Open Live GPS Radar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MY TRIPS & DIGITAL TICKETS (Section 20) */}
          {(activeTab === 'my-trips' || activeTab === 'my-tickets') && (
            <div className="max-w-5xl mx-auto">
              <MyBookingsView
                bookings={bookings}
                currentUser={currentUser}
                onViewTicket={(b) => {
                  setActiveTicket(b);
                  setIsTicketModalOpen(true);
                }}
                onCancelTicket={(pnr) => handleOpenCancellation(pnr)}
                onBookNew={() => setActiveTab('search')}
                onTrackBus={handleTrackBus}
              />
            </div>
          )}

          {/* NOTIFICATIONS VIEW (Section 31) */}
          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAsRead={(id) => dbSimulator.markNotificationAsRead(id)}
              onMarkAllAsRead={() => dbSimulator.markAllNotificationsAsRead()}
              onClearAll={() => dbSimulator.clearAllNotifications()}
              onNavigateToTrip={() => setActiveTab('my-trips')}
            />
          )}

          {/* EMERGENCY 24X7 SOS (Section 32) */}
          {activeTab === 'emergency' && (
            <EmergencyView currentUser={currentUser} />
          )}

          {/* PROFILE VIEW */}
          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              userBookings={userBookings}
              onUpdateProfile={(updated) => {
                if (currentUser) {
                  dbSimulator.updatePassengerProfile(currentUser.id, updated);
                }
              }}
              onNavigateToTrips={() => setActiveTab('my-trips')}
            />
          )}

          {/* ADMIN OPERATIONS DASHBOARD (Section 9 - 14, 23 - 29) */}
          {activeTab === 'admin-dashboard' && (
            <AdminDashboard
              passengers={dbSimulator.getAllPassengers()}
              bookings={bookings}
              buses={buses}
              onCancelBooking={handleCancelBookingFromAdmin}
              onUpdateBusLocation={handleUpdateBusLocationFromAdmin}
              onAddNewBus={handleAddNewBusFromAdmin}
              onOpenLiveTracking={handleTrackBus}
              onSelectSeats={handleOpenSeatMap}
              onGoToHome={() => setActiveTab('home')}
            />
          )}
        </main>
      </div>

      {/* MODAL 1: VISUAL SEAT MAP (Section 16: Driver, Rows, Available, Selected, Booked, Blocked, Summary) */}
      {liveBusForSeats && (
        <SeatMapModal
          bus={liveBusForSeats}
          isOpen={isSeatMapOpen}
          onClose={() => setIsSeatMapOpen(false)}
          onProceedToBooking={handleProceedToBooking}
        />
      )}

      {/* MODAL 2: PASSENGER DETAILS FORM (Section 17: Name, Age, Gender, Phone, Insurance) */}
      {liveBusForSeats && (
        <PassengerDetailsForm
          bus={liveBusForSeats}
          selectedSeats={selectedSeatsForBooking}
          currentUser={currentUser}
          isOpen={isPassengerFormOpen}
          onClose={() => setIsPassengerFormOpen(false)}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* MODAL 3: DIGITAL TICKET & QR CODE (Section 19: QR Code, PNR, Seats, Print/PDF) */}
      <BookingTicketModal
        booking={activeTicket}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onTrackBus={(busId) => {
          setIsTicketModalOpen(false);
          handleTrackBus(busId);
        }}
      />

      {/* MODAL 4: CANCELLATION MODAL */}
      <CancellationModal
        initialPnr={cancellationPnr}
        isOpen={isCancellationModalOpen}
        onClose={() => {
          setIsCancellationModalOpen(false);
          setCancellationPnr('');
        }}
        onCancellationComplete={(record) => {
          showToast(`PNR ${record.pnr} cancellation confirmed. ₹${Number(record.refundAmount || 0).toFixed(2)} refund processed!`, 'success');
          if (activeTicket && activeTicket.pnr === record.pnr) {
            const updated = dbSimulator.lookupBookingByPnr(record.pnr);
            setActiveTicket(updated || null);
          }
        }}
      />

      {/* MODAL 5: LIVE GPS TRACKING & MOVEMENT MODAL (Section 21, 22, 24) */}
      <LiveTrackingModal
        bus={selectedBusForTracking}
        booking={selectedBookingForTracking}
        isOpen={isLiveTrackingOpen}
        onClose={() => setIsLiveTrackingOpen(false)}
      />
    </div>
  );
}
