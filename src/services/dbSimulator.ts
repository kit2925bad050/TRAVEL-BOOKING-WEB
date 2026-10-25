import { Bus, Passenger, Booking, CancellationRecord, BookedPassenger, SqlQueryResult, Seat, NotificationItem, BusOperationalStatus } from '../types';
import { INITIAL_BUSES, INITIAL_PASSENGERS, INITIAL_BOOKINGS, INITIAL_CANCELLATIONS, INITIAL_NOTIFICATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  BUSES: 'gt_buses_v2',
  PASSENGERS: 'gt_passengers_v2',
  BOOKINGS: 'gt_bookings_v2',
  CANCELLATIONS: 'gt_cancellations_v2',
  CURRENT_USER: 'gt_current_user_v2',
  NOTIFICATIONS: 'gt_notifications_v2'
};

class DatabaseSimulator {
  private buses: Bus[] = [];
  private passengers: Passenger[] = [];
  private bookings: Booking[] = [];
  private cancellations: CancellationRecord[] = [];
  private notifications: NotificationItem[] = [];
  private currentUser: Passenger | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedBuses = localStorage.getItem(STORAGE_KEYS.BUSES);
      const storedPassengers = localStorage.getItem(STORAGE_KEYS.PASSENGERS);
      const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const storedCancellations = localStorage.getItem(STORAGE_KEYS.CANCELLATIONS);
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

      this.buses = storedBuses ? JSON.parse(storedBuses) : JSON.parse(JSON.stringify(INITIAL_BUSES));
      this.passengers = storedPassengers ? JSON.parse(storedPassengers) : JSON.parse(JSON.stringify(INITIAL_PASSENGERS));
      this.bookings = storedBookings ? JSON.parse(storedBookings) : JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
      this.cancellations = storedCancellations ? JSON.parse(storedCancellations) : JSON.parse(JSON.stringify(INITIAL_CANCELLATIONS));
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
      this.currentUser = storedUser ? JSON.parse(storedUser) : this.passengers[2] || this.passengers[0] || null;
    } catch (e) {
      console.error('Failed to load state from localStorage, using initial mock data', e);
      this.resetDatabase();
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(this.buses));
      localStorage.setItem(STORAGE_KEYS.PASSENGERS, JSON.stringify(this.passengers));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
      localStorage.setItem(STORAGE_KEYS.CANCELLATIONS, JSON.stringify(this.cancellations));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public resetDatabase(): void {
    this.buses = JSON.parse(JSON.stringify(INITIAL_BUSES));
    this.passengers = JSON.parse(JSON.stringify(INITIAL_PASSENGERS));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.cancellations = JSON.parse(JSON.stringify(INITIAL_CANCELLATIONS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.currentUser = this.passengers[2] || this.passengers[0] || null;
    this.saveState();
  }

  // --- PASSENGER & AUTH OPERATIONS (PassengerDAO) ---
  public getCurrentUser(): Passenger | null {
    return this.currentUser;
  }

  public setCurrentUser(passenger: Passenger | null): void {
    this.currentUser = passenger;
    this.saveState();
  }

  public getAllPassengers(): Passenger[] {
    return [...this.passengers];
  }

  public getPassengerById(id: string): Passenger | undefined {
    return this.passengers.find(p => p.id === id);
  }

  public searchPassengers(query: string): Passenger[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAllPassengers();
    return this.passengers.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.username && p.username.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q))
    );
  }

  public registerPassenger(data: {
    fullName: string;
    username?: string;
    email: string;
    phone: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    city?: string;
    emergencyContact?: string;
    isAdmin?: boolean;
  }): { success: boolean; passenger?: Passenger; message: string } {
    const existing = this.passengers.find(
      p => (data.email && p.email.toLowerCase() === data.email.toLowerCase()) ||
           (data.phone && p.phone === data.phone)
    );

    if (existing) {
      existing.fullName = data.fullName.trim();
      this.currentUser = existing;
      this.saveState();
      return { success: true, passenger: existing, message: `Welcome back, ${existing.fullName}!` };
    }

    const newPassenger: Passenger = {
      id: `p-${Date.now().toString().slice(-5)}`,
      fullName: data.fullName.trim(),
      username: data.username || data.fullName.trim().toLowerCase().replace(/\s+/g, ''),
      email: data.email.trim(),
      phone: data.phone.trim(),
      age: data.age || 26,
      gender: data.gender || 'Male',
      city: data.city?.trim() || 'Bangalore',
      emergencyContact: data.emergencyContact?.trim() || '',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      isAdmin: data.isAdmin || false
    };

    this.passengers.unshift(newPassenger);
    this.currentUser = newPassenger;
    this.saveState();
    return { success: true, passenger: newPassenger, message: `Account created successfully for ${newPassenger.fullName}!` };
  }

  public loginPassenger(nameOrEmailOrPhone: string): { success: boolean; passenger?: Passenger; message: string } {
    const trimmed = nameOrEmailOrPhone.trim();
    if (!trimmed) {
      return { success: false, message: 'Please enter your name or email.' };
    }

    const p = this.passengers.find(
      u => u.fullName.toLowerCase() === trimmed.toLowerCase() ||
           u.email.toLowerCase() === trimmed.toLowerCase() ||
           u.phone === trimmed ||
           (u.username && u.username.toLowerCase() === trimmed.toLowerCase())
    );

    if (p) {
      this.currentUser = p;
      this.saveState();
      return { success: true, passenger: p, message: `Welcome back, ${p.fullName}!` };
    }

    // Auto-create passenger with the exact name provided
    const newPassenger: Passenger = {
      id: `p-${Date.now().toString().slice(-5)}`,
      fullName: trimmed,
      username: trimmed.toLowerCase().replace(/\s+/g, ''),
      email: `${trimmed.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      age: 26,
      gender: 'Male',
      city: 'Bangalore',
      emergencyContact: '',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    this.passengers.unshift(newPassenger);
    this.currentUser = newPassenger;
    this.saveState();
    return { success: true, passenger: newPassenger, message: `Welcome, ${newPassenger.fullName}!` };
  }

  public loginAdmin(password: string): { success: boolean; admin?: Passenger; message: string } {
    if (password.trim() === 'admin123' || password.trim() === 'admin') {
      const adminPassenger = this.passengers.find(p => p.isAdmin) || {
        id: 'admin-01',
        fullName: 'Admin - Guardian Operations',
        username: 'admin',
        email: 'admin@guardiantravels.com',
        phone: '9900011222',
        age: 35,
        gender: 'Male',
        city: 'Bangalore Fleet HQ',
        createdAt: '2026-01-01 00:00:00',
        isAdmin: true
      };
      this.currentUser = adminPassenger;
      this.saveState();
      return { success: true, admin: adminPassenger, message: 'Welcome to Fleet Control, Operations Administrator!' };
    }
    return { success: false, message: 'Invalid Admin Password. Demo password is: admin123' };
  }

  public updatePassengerProfile(passengerId: string, updates: Partial<Passenger>): Passenger | null {
    const idx = this.passengers.findIndex(p => p.id === passengerId);
    if (idx !== -1) {
      this.passengers[idx] = { ...this.passengers[idx], ...updates };
      if (this.currentUser?.id === passengerId) {
        this.currentUser = this.passengers[idx];
      }
      this.saveState();
      return this.passengers[idx];
    }
    return null;
  }

  public logoutUser(): void {
    this.currentUser = null;
    this.saveState();
  }

  // --- BUS & SEAT OPERATIONS (BusDAO) ---
  public getAllBuses(): Bus[] {
    return [...this.buses];
  }

  public getBusById(busId: string): Bus | undefined {
    return this.buses.find(b => b.id === busId);
  }

  public searchBuses(params: {
    source?: string;
    destination?: string;
    busType?: string;
    minPrice?: number;
    maxPrice?: number;
    departureTimeRange?: 'morning' | 'afternoon' | 'evening' | 'night' | 'all';
  }): Bus[] {
    return this.buses.filter(bus => {
      if (params.source && params.source !== 'All' && bus.source.toLowerCase() !== params.source.toLowerCase()) {
        return false;
      }
      if (params.destination && params.destination !== 'All' && bus.destination.toLowerCase() !== params.destination.toLowerCase()) {
        return false;
      }
      if (params.busType && params.busType !== 'All' && bus.busType !== params.busType) {
        return false;
      }
      if (params.minPrice !== undefined && bus.baseFare < params.minPrice) {
        return false;
      }
      if (params.maxPrice !== undefined && bus.baseFare > params.maxPrice) {
        return false;
      }
      if (params.departureTimeRange && params.departureTimeRange !== 'all') {
        const hour = parseInt(bus.departureTime.split(':')[0], 10);
        if (params.departureTimeRange === 'morning' && (hour < 6 || hour >= 12)) return false;
        if (params.departureTimeRange === 'afternoon' && (hour < 12 || hour >= 17)) return false;
        if (params.departureTimeRange === 'evening' && (hour < 17 || hour >= 21)) return false;
        if (params.departureTimeRange === 'night' && (hour >= 6 && hour < 21)) return false;
      }
      return true;
    });
  }

  public checkSeatAvailability(busId: string): {
    total: number;
    available: number;
    booked: number;
    femaleReserved: number;
    seats: Seat[];
  } {
    const bus = this.getBusById(busId);
    if (!bus) {
      return { total: 0, available: 0, booked: 0, femaleReserved: 0, seats: [] };
    }

    const total = bus.seats.length;
    const booked = bus.seats.filter(s => s.isBooked).length;
    const available = total - booked;
    const femaleReserved = bus.seats.filter(s => s.isFemaleReserved).length;

    return {
      total,
      available,
      booked,
      femaleReserved,
      seats: bus.seats
    };
  }

  // --- BOOKING OPERATIONS WITH TRAVEL INSURANCE ---
  public bookSeats(request: {
    passenger?: Passenger;
    busId: string;
    journeyDate: string;
    travelDate?: string;
    boardingPoint: string;
    droppingPoint: string;
    passengers: BookedPassenger[];
    paymentMethod: string;
    discountCode?: string;
    insuranceOpted?: boolean;
  }): { success: boolean; booking?: Booking; message: string } {
    let bus = this.buses.find(b => b.id === request.busId);
    if (!bus && this.buses.length > 0) {
      bus = this.buses[0];
    }
    if (!bus) {
      return { success: false, message: 'Bus not found in database.' };
    }

    const requestedSeatNumbers = Array.isArray(request.passengers)
      ? request.passengers.map(p => p.seatNumber)
      : [];

    if (requestedSeatNumbers.length === 0) {
      return { success: false, message: 'No seats specified for booking.' };
    }

    // Idempotency / Double-Submit Protection:
    // If a confirmed booking for this exact bus and seat combination was created within the last 30 seconds, return that booking
    const recentBooking = this.bookings.find(b =>
      b.busId === bus.id &&
      requestedSeatNumbers.every(s => b.seatNumbers.includes(s)) &&
      Date.now() - new Date(b.bookedAt).getTime() < 30000
    );
    if (recentBooking) {
      return {
        success: true,
        booking: recentBooking,
        message: `Booking confirmed! PNR: ${recentBooking.pnr}`
      };
    }

    // Ensure all requested seats exist on the bus
    for (const seatNo of requestedSeatNumbers) {
      const existingSeat = bus.seats.find(s => s.seatNumber === seatNo);
      if (!existingSeat) {
        bus.seats.push({
          id: `${bus.id}-${seatNo}`,
          seatNumber: seatNo,
          deck: seatNo.startsWith('U') ? 'upper' : 'lower',
          row: 1,
          col: 0,
          type: seatNo.startsWith('L') || seatNo.startsWith('U') ? 'sleeper' : 'seater',
          price: bus.baseFare,
          isBooked: true
        });
      }
    }

    // Mark all requested seats as booked
    bus.seats = bus.seats.map(s => {
      if (requestedSeatNumbers.includes(s.seatNumber)) {
        return { ...s, isBooked: true };
      }
      return s;
    });

    // Update available seats counter
    bus.availableSeats = Math.max(0, bus.seats.filter(s => !s.isBooked).length);

    // Financial calculation
    const baseFare = request.passengers.reduce((sum, p) => sum + (p.fare || bus.baseFare), 0);
    const taxGst = Number((baseFare * 0.05).toFixed(2));
    
    // Insurance calculation: ₹29 per passenger
    const isInsured = request.insuranceOpted !== false;
    const insuranceFee = isInsured ? request.passengers.length * 29 : 0;
    const insurancePolicyNumber = isInsured ? `POL-GT-${Math.floor(100000 + Math.random() * 900000)}` : undefined;
    const insuranceCoverageAmount = isInsured ? 500000 : undefined;

    let discount = 0;
    if (request.discountCode === 'GUARDIAN10') {
      discount = Number((baseFare * 0.1).toFixed(2));
    } else if (request.discountCode === 'FIRSTTRIP') {
      discount = 150;
    }
    const totalAmount = Number((baseFare + taxGst + insuranceFee - discount).toFixed(2));

    const pnr = `GT${Math.floor(1000000 + Math.random() * 9000000)}`;

    const effectivePassenger = request.passenger || this.currentUser || {
      id: `p-${Date.now().toString().slice(-4)}`,
      fullName: request.passengers?.[0]?.name || 'Guardian Traveler',
      email: 'traveler@guardiantravels.in',
      phone: '9845012890',
      age: request.passengers?.[0]?.age || 28,
      gender: request.passengers?.[0]?.gender || 'Male',
      city: 'Bangalore'
    };

    const newBooking: Booking = {
      id: `b-${Date.now().toString().slice(-6)}`,
      pnr,
      passengerId: effectivePassenger.id,
      passengerName: effectivePassenger.fullName,
      passengerEmail: effectivePassenger.email,
      passengerPhone: effectivePassenger.phone,
      busId: bus.id,
      busNumber: bus.busNumber,
      busName: bus.busName,
      busType: bus.busType,
      source: bus.source,
      destination: bus.destination,
      journeyDate: request.journeyDate || request.travelDate || new Date().toISOString().split('T')[0],
      travelDate: request.travelDate || request.journeyDate || new Date().toISOString().split('T')[0],
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      boardingPoint: request.boardingPoint || bus.boardingPoints[0] || bus.source,
      droppingPoint: request.droppingPoint || bus.droppingPoints[0] || bus.destination,
      passengers: Array.isArray(request.passengers) ? request.passengers : [],
      seatNumbers: Array.isArray(requestedSeatNumbers) ? requestedSeatNumbers : [],
      baseFare,
      taxGst,
      discount,
      insuranceOpted: isInsured,
      insuranceFee,
      insurancePolicyNumber,
      insuranceCoverageAmount,
      totalAmount,
      paymentMethod: request.paymentMethod || 'UPI / Online Card',
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    this.bookings.unshift(newBooking);

    // Auto-create notification
    this.addNotification({
      title: 'Booking Confirmed!',
      message: `PNR ${pnr} confirmed for ${bus.busName} (${bus.source} ➔ ${bus.destination}). Seats: ${requestedSeatNumbers.join(', ')}.`,
      type: 'trip'
    });

    this.saveState();

    return {
      success: true,
      booking: newBooking,
      message: `Booking confirmed! PNR: ${pnr}`
    };
  }

  // --- CANCELLATION OPERATIONS (CancellationDAO) ---
  public getAllCancellations(): CancellationRecord[] {
    return [...this.cancellations];
  }

  public searchCancellations(query: string): CancellationRecord[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAllCancellations();
    return this.cancellations.filter(c =>
      c.pnr.toLowerCase().includes(q) ||
      (c.passengerName && c.passengerName.toLowerCase().includes(q)) ||
      (c.busNumber && c.busNumber.toLowerCase().includes(q)) ||
      c.cancellationId.toLowerCase().includes(q) ||
      c.reason.toLowerCase().includes(q)
    );
  }

  public lookupBookingByPnr(pnr: string): Booking | undefined {
    return this.bookings.find(b => b.pnr.toUpperCase() === pnr.trim().toUpperCase());
  }

  public getAllBookings(): Booking[] {
    return [...this.bookings];
  }

  public getBookingsForUser(passengerId: string, email?: string, phone?: string): Booking[] {
    return this.bookings.filter(b =>
      b.passengerId === passengerId ||
      (email && b.passengerEmail.toLowerCase() === email.toLowerCase()) ||
      (phone && b.passengerPhone === phone)
    );
  }

  public cancelBooking(
    pnr: string,
    seatsToCancel?: string[],
    reason?: string
  ): { success: boolean; cancellation?: CancellationRecord; message: string } {
    const booking = this.lookupBookingByPnr(pnr);
    if (!booking) {
      return { success: false, message: `No active booking found with PNR: ${pnr}` };
    }

    if (booking.status === 'CANCELLED') {
      return { success: false, message: 'This reservation is already fully cancelled.' };
    }

    const availableBookingSeats = Array.isArray(booking.seatNumbers) ? booking.seatNumbers : [];
    const seats = (seatsToCancel && seatsToCancel.length > 0) ? seatsToCancel : availableBookingSeats;

    const bus = this.buses.find(b => b.id === booking.busId);
    if (bus && Array.isArray(bus.seats)) {
      // Release seats back to availability pool
      bus.seats = bus.seats.map(s => {
        if (seats.includes(s.seatNumber)) {
          return { ...s, isBooked: false };
        }
        return s;
      });
      bus.availableSeats = bus.seats.filter(s => !s.isBooked).length;
    }

    // Refund policy calculator based on journey departure delta
    const now = new Date();
    const journeyDate = booking.journeyDate || booking.travelDate || new Date().toISOString().split('T')[0];
    const rawTime = (booking.departureTime || '06:00').replace(/[^0-9:]/g, '');
    const departureTime = rawTime.includes(':') ? rawTime : `${rawTime}:00`;
    let journeyDateObj = new Date(`${journeyDate}T${departureTime}:00`);
    if (isNaN(journeyDateObj.getTime())) {
      journeyDateObj = new Date();
      journeyDateObj.setDate(journeyDateObj.getDate() + 1);
    }
    const diffHours = (journeyDateObj.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPct = 90;
    if (diffHours >= 24) {
      refundPct = 90;
    } else if (diffHours >= 12) {
      refundPct = 75;
    } else if (diffHours >= 2) {
      refundPct = 50;
    } else {
      refundPct = 0;
    }

    const totalSeatsCount = availableBookingSeats.length > 0 ? availableBookingSeats.length : 1;
    const proportion = Math.min(1, Math.max(0, seats.length / totalSeatsCount));
    const totalAmt = Number(booking.totalAmount) || 0;
    const originalProportionalAmount = Number((totalAmt * proportion).toFixed(2));
    const refundAmount = Number(((originalProportionalAmount * refundPct) / 100).toFixed(2));
    const cancellationFee = Number((originalProportionalAmount - refundAmount).toFixed(2));

    const cancellationId = `CAN-GT-${Math.floor(1000 + Math.random() * 9000)}`;
    const refundTransactionId = `TXN-REF-${Date.now().toString().slice(-8)}`;

    const newCancellationRecord: CancellationRecord = {
      id: `can-${Date.now().toString().slice(-6)}`,
      cancellationId,
      bookingId: booking.id,
      pnr: booking.pnr,
      passengerName: booking.passengerName || 'Traveler',
      passengerPhone: booking.passengerPhone || '',
      busNumber: booking.busNumber || '',
      source: booking.source || '',
      destination: booking.destination || '',
      cancelledSeats: seats.length > 0 ? seats : ['1A'],
      originalAmount: originalProportionalAmount || 0,
      cancellationFee: cancellationFee || 0,
      refundAmount: refundAmount || 0,
      refundPercentage: refundPct,
      reason: reason || 'Passenger requested cancellation',
      refundStatus: 'PROCESSED',
      refundTransactionId,
      cancelledAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    // Update booking status
    if (seats.length >= totalSeatsCount || availableBookingSeats.length === 0) {
      booking.status = 'CANCELLED';
      booking.bookingStatus = 'cancelled';
      booking.seatNumbers = Array.isArray(booking.seatNumbers) ? booking.seatNumbers : [];
      booking.passengers = Array.isArray(booking.passengers) ? booking.passengers : [];
    } else {
      booking.status = 'PARTIALLY_CANCELLED';
      booking.seatNumbers = availableBookingSeats.filter(s => !seats.includes(s));
      if (Array.isArray(booking.passengers)) {
        booking.passengers = booking.passengers.filter(p => !seats.includes(p.seatNumber));
      }
      booking.totalAmount = Math.max(0, Number((totalAmt - originalProportionalAmount).toFixed(2)));
    }

    this.cancellations.unshift(newCancellationRecord);

    // Auto-create notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Ticket Cancelled & Refund Processed',
      message: `PNR ${pnr} cancelled. Refund of ₹${refundAmount.toFixed(2)} (${refundPct}%) credited (Txn: ${refundTransactionId}).`,
      type: 'warning',
      time: 'Just now',
      isRead: false
    };
    this.notifications.unshift(newNotif);

    this.saveState();

    return {
      success: true,
      cancellation: newCancellationRecord,
      message: `Ticket successfully cancelled. ₹${refundAmount.toFixed(2)} refunded to source account.`
    };
  }

  // --- LIVE LOCATION & TELEMETRY SIMULATOR ---
  public pingLiveLocation(busId: string): Bus | undefined {
    const bus = this.buses.find(b => b.id === busId);
    if (!bus) return undefined;

    // Simulate speed fluctuation and progress
    const speeds = [72, 75, 78, 80, 76, 79];
    bus.currentSpeedKmH = speeds[Math.floor(Math.random() * speeds.length)];
    bus.lastPing = 'Just now (live GPS)';
    
    // Advance progress slightly
    if (bus.distanceTravelledKm < bus.totalDistanceKm) {
      bus.distanceTravelledKm = Math.min(bus.totalDistanceKm, bus.distanceTravelledKm + 2);
    }
    if (bus.etaMinutes > 2) {
      bus.etaMinutes = Math.max(1, bus.etaMinutes - 1);
    }

    this.saveState();
    return bus;
  }

  public updateBusOperationalStatus(busId: string, updates: {
    currentLocation?: string;
    currentSpeedKmH?: number;
    busStatus?: BusOperationalStatus;
    latitude?: number;
    longitude?: number;
    etaMinutes?: number;
    nextStop?: string;
    gpsStatus?: 'LIVE - ON TRACK' | 'SLOW TRAFFIC' | 'AT BOARDING POINT' | 'HALTED';
  }): Bus | undefined {
    const bus = this.buses.find(b => b.id === busId);
    if (!bus) return undefined;

    if (updates.currentLocation) bus.currentLocation = updates.currentLocation;
    if (updates.currentSpeedKmH !== undefined) bus.currentSpeedKmH = updates.currentSpeedKmH;
    if (updates.busStatus) bus.busStatus = updates.busStatus;
    if (updates.latitude !== undefined) bus.latitude = updates.latitude;
    if (updates.longitude !== undefined) bus.longitude = updates.longitude;
    if (updates.etaMinutes !== undefined) bus.etaMinutes = updates.etaMinutes;
    if (updates.nextStop) bus.nextStop = updates.nextStop;
    if (updates.gpsStatus) bus.gpsStatus = updates.gpsStatus;

    bus.lastPing = 'Just now (Updated by Dispatcher)';
    this.saveState();
    return bus;
  }

  public updateBusTelemetry(
    busId: string,
    telemetry: {
      busStatus?: BusOperationalStatus;
      currentWaypoint?: string;
      speedKmph?: number;
      currentLocation?: string;
    }
  ) {
    const bus = this.buses.find(b => b.id === busId);
    if (!bus) return undefined;

    if (telemetry.busStatus) bus.busStatus = telemetry.busStatus;
    if (telemetry.currentWaypoint) {
      bus.currentWaypoint = telemetry.currentWaypoint;
      bus.nextStop = telemetry.currentWaypoint;
      bus.currentLocation = telemetry.currentWaypoint;
    }
    if (telemetry.speedKmph !== undefined) {
      bus.speedKmph = telemetry.speedKmph;
      bus.currentSpeedKmH = telemetry.speedKmph;
    }
    if (telemetry.currentLocation) {
      bus.currentLocation = telemetry.currentLocation;
    }

    bus.lastPing = 'Just now (Updated by Dispatcher)';
    this.saveState();
    return bus;
  }

  public addBus(newBusData: Partial<Bus>): Bus {
    const id = `bus-${Date.now()}`;
    const bus: Bus = {
      id,
      busNumber: newBusData.busNumber || `KA-01-GT-${Math.floor(1000 + Math.random() * 9000)}`,
      busName: newBusData.busName || 'Guardian Luxury Coach',
      busType: (newBusData.busType as any) || 'Multi-Axle Volvo AC',
      operator: 'Guardian Travels Direct',
      routeId: `rt-${newBusData.source || 'BLR'}-${newBusData.destination || 'HYD'}`,
      source: newBusData.source || 'Bangalore',
      destination: newBusData.destination || 'Hyderabad',
      departureTime: newBusData.departureTime || '21:00',
      arrivalTime: newBusData.arrivalTime || '06:00',
      duration: '9h 00m',
      baseFare: newBusData.baseFare || newBusData.fare || 1200,
      fare: newBusData.baseFare || newBusData.fare || 1200,
      rating: 4.8,
      totalSeats: newBusData.totalSeats || 36,
      availableSeats: newBusData.totalSeats || 36,
      amenities: ['Air Conditioning', 'WiFi', 'Charging Point', 'Blanket', 'Reading Light', 'Emergency SOS'],
      boardingPoints: [`${newBusData.source || 'Bangalore'} Central Majestic`, `${newBusData.source || 'Bangalore'} Outer Ring Rd`],
      droppingPoints: [`${newBusData.destination || 'Hyderabad'} Terminal Hub`, `${newBusData.destination || 'Hyderabad'} City Center`],
      seats: Array.from({ length: 36 }, (_, i) => ({
        id: `seat-${id}-${i + 1}`,
        seatNumber: `${Math.floor(i / 4) + 1}${['A', 'B', 'C', 'D'][i % 4]}`,
        deck: 'lower',
        row: Math.floor(i / 4) + 1,
        col: (i % 4) + 1,
        type: 'seater',
        price: newBusData.baseFare || 1200,
        fare: newBusData.baseFare || 1200,
        isBooked: false
      })),
      driverName: newBusData.driverName || 'Ramesh Kumar',
      driverPhone: newBusData.driverPhone || '+91 98450 12345',
      currentLocation: `${newBusData.source || 'Bangalore'} Highway Depot`,
      currentWaypoint: `${newBusData.source || 'Bangalore'} Highway Depot`,
      currentSpeedKmH: 75,
      speedKmph: 75,
      nextStop: `${newBusData.destination || 'Hyderabad'} Highway Checkpost`,
      etaMinutes: 480,
      gpsStatus: 'LIVE - ON TRACK',
      busStatus: 'SCHEDULED',
      lastPing: 'Just now',
      latitude: 12.9716,
      longitude: 77.5946,
      distanceTravelledKm: 0,
      totalDistanceKm: 570,
      checkpoints: []
    };

    this.buses.unshift(bus);
    this.saveState();
    return bus;
  }

  // --- NOTIFICATIONS MANAGEMENT ---
  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter(n => !n.isRead && !n.read).length;
  }

  public markNotificationRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      notif.read = true;
      this.saveState();
    }
  }

  public markNotificationAsRead(id: string): void {
    this.markNotificationRead(id);
  }

  public markAllNotificationsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true, read: true }));
    this.saveState();
  }

  public markAllNotificationsAsRead(): void {
    this.markAllNotificationsRead();
  }

  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveState();
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'time' | 'isRead'>): void {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: item.title,
      message: item.message,
      type: item.type,
      time: 'Just now',
      isRead: false
    };
    this.notifications.unshift(newNotif);
    this.saveState();
  }

  // Execute in-memory SQL query simulation
  public executeQuery(sql: string): SqlQueryResult {
    const startTime = performance.now();
    const cleanSql = sql.trim().replace(/;+$/, '');
    const upper = cleanSql.toUpperCase();

    try {
      if (upper.includes('FROM BUSES') || upper.includes('FROM BUS')) {
        const rows = this.buses.map(b => ({
          id: b.id,
          bus_number: b.busNumber,
          bus_name: b.busName,
          type: b.busType,
          source: b.source,
          destination: b.destination,
          departure: b.departureTime,
          base_fare: b.baseFare,
          total_seats: b.totalSeats,
          available_seats: b.availableSeats,
          driver_name: b.driverName,
          status: b.busStatus
        }));
        return {
          columns: ['id', 'bus_number', 'bus_name', 'type', 'source', 'destination', 'departure', 'base_fare', 'total_seats', 'available_seats', 'driver_name', 'status'],
          rows,
          rowCount: rows.length,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2))
        };
      }

      if (upper.includes('FROM PASSENGERS')) {
        const rows = this.passengers.map(p => ({
          id: p.id,
          full_name: p.fullName,
          email: p.email,
          phone: p.phone,
          age: p.age,
          gender: p.gender,
          city: p.city
        }));
        return {
          columns: ['id', 'full_name', 'email', 'phone', 'age', 'gender', 'city'],
          rows,
          rowCount: rows.length,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2))
        };
      }

      if (upper.includes('FROM BOOKINGS')) {
        const rows = this.bookings.map(b => ({
          id: b.id,
          pnr: b.pnr,
          passenger: b.passengerName,
          bus: b.busNumber,
          route: `${b.source} -> ${b.destination}`,
          seats: Array.isArray(b.seatNumbers) && b.seatNumbers.length > 0 ? b.seatNumbers.join(', ') : 'None',
          total: Number(b.totalAmount || 0),
          insurance_opted: b.insuranceOpted ? 'YES' : 'NO',
          status: b.status
        }));
        return {
          columns: ['id', 'pnr', 'passenger', 'bus', 'route', 'seats', 'total', 'insurance_opted', 'status'],
          rows,
          rowCount: rows.length,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2))
        };
      }

      return {
        columns: ['table_name', 'total_records'],
        rows: [
          { table_name: 'buses', total_records: this.buses.length },
          { table_name: 'passengers', total_records: this.passengers.length },
          { table_name: 'bookings', total_records: this.bookings.length },
          { table_name: 'cancellations', total_records: this.cancellations.length }
        ],
        rowCount: 4,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2))
      };
    } catch (err: any) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        error: err?.message || 'Query execution error'
      };
    }
  }
}

export const dbSimulator = new DatabaseSimulator();
