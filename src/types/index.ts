export type BusType = 'AC Sleeper' | 'Multi-Axle Volvo AC' | 'Electric Luxury AC' | 'Semi-Sleeper AC' | 'Non-AC Seater';

export type DeckType = 'lower' | 'upper';
export type SeatType = 'seater' | 'sleeper' | 'semi-sleeper';

export interface Seat {
  id: string;
  seatNumber: string;
  deck: DeckType;
  row: number;
  col: number;
  type: SeatType;
  price: number;
  fare?: number; // alias for price
  isBooked: boolean;
  isFemaleReserved?: boolean;
  bookedGender?: 'male' | 'female' | 'other';
}

export interface RouteCheckpoint {
  stopName: string;
  landmark: string;
  passed: boolean;
  isCurrent: boolean;
  scheduledTime: string;
  distanceKm: number;
}

export type BusOperationalStatus = 
  | 'SCHEDULED' 
  | 'BOARDING' 
  | 'DEPARTED' 
  | 'ON_ROUTE' 
  | 'DELAYED' 
  | 'ARRIVING' 
  | 'COMPLETED' 
  | 'CANCELLED'
  | 'On Schedule'
  | 'Running Early'
  | 'Slight Delay'
  | 'Halted'
  | 'Arrived';

export interface Bus {
  id: string;
  busNumber: string;
  busName: string;
  busType: BusType;
  type?: string; // alias
  operator: string;
  routeId: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  baseFare: number;
  fare?: number; // alias
  rating: number;
  totalSeats: number;
  availableSeats: number;
  amenities: string[];
  boardingPoints: string[];
  droppingPoints: string[];
  seats: Seat[];
  hasUpperDeck?: boolean;
  
  // Live Location & Driver details
  driverName: string;
  driverPhone: string;
  coDriverName?: string;
  coDriverPhone?: string;
  currentLocation: string;
  currentWaypoint?: string;
  currentSpeedKmH: number;
  speedKmph?: number; // alias
  nextStop: string;
  etaMinutes: number;
  gpsStatus: 'LIVE - ON TRACK' | 'SLOW TRAFFIC' | 'AT BOARDING POINT' | 'HALTED';
  busStatus: BusOperationalStatus;
  lastPing: string;
  cabinTempC?: number;
  latitude: number;
  longitude: number;
  distanceTravelledKm: number;
  totalDistanceKm: number;
  checkpoints: RouteCheckpoint[];
}

export interface Passenger {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  city: string;
  emergencyContact?: string;
  createdAt: string;
  isAdmin?: boolean;
  role?: 'user' | 'admin';
}

export interface BookedPassenger {
  seatNumber: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  fare: number;
}

export interface Booking {
  id: string;
  pnr: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  busId: string;
  busNumber: string;
  busName: string;
  busType: BusType;
  source: string;
  destination: string;
  journeyDate: string;
  travelDate?: string; // alias
  departureTime: string;
  arrivalTime: string;
  boardingPoint: string;
  droppingPoint: string;
  passengers: BookedPassenger[];
  seatNumbers: string[];
  baseFare: number;
  taxGst: number;
  taxes?: number; // alias
  discount: number;
  
  // Insurance details
  insuranceOpted: boolean;
  insuranceFee: number;
  insurancePolicyNumber?: string;
  insuranceCoverageAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PARTIALLY_CANCELLED' | 'COMPLETED';
  bookingStatus?: 'confirmed' | 'cancelled'; // alias
  bookedAt: string;
  bookingDate?: string; // alias
}

export interface CancellationRecord {
  id: string;
  cancellationId: string;
  bookingId: string;
  pnr: string;
  passengerName?: string;
  passengerPhone?: string;
  busNumber?: string;
  source?: string;
  destination?: string;
  cancelledSeats: string[];
  originalAmount: number;
  cancellationFee: number;
  refundAmount: number;
  refundPercentage: number;
  reason: string;
  refundStatus: 'PROCESSED' | 'PENDING';
  refundTransactionId: string;
  cancelledAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time?: string;
  timestamp?: string; // alias
  type: 'info' | 'success' | 'warning' | 'trip' | 'alert';
  isRead?: boolean;
  read?: boolean; // alias
}

export interface SqlQueryResult {
  query?: string;
  columns?: string[];
  rowCount: number;
  rows: any[];
  executionTimeMs?: number;
  error?: string;
}
