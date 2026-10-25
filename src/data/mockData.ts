import { Bus, Passenger, Booking, CancellationRecord, Seat, RouteCheckpoint, NotificationItem } from '../types';

export const POPULAR_CITIES = [
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Mumbai',
  'Pune',
  'Goa',
  'Coimbatore',
  'Kochi',
  'Salem',
  'Namakkal',
  'Erode'
];

export function generateSleeperSeats(busId: string, bookedNumbers: string[] = []): Seat[] {
  const seats: Seat[] = [];
  const bookedSet = new Set(bookedNumbers);

  for (let row = 1; row <= 5; row++) {
    const l1 = `L${(row - 1) * 3 + 1}`;
    seats.push({
      id: `${busId}-${l1}`,
      seatNumber: l1,
      deck: 'lower',
      row,
      col: 0,
      type: 'sleeper',
      price: 1150,
      isBooked: bookedSet.has(l1),
      isFemaleReserved: row === 1,
    });

    const l2 = `L${(row - 1) * 3 + 2}`;
    seats.push({
      id: `${busId}-${l2}`,
      seatNumber: l2,
      deck: 'lower',
      row,
      col: 3,
      type: 'sleeper',
      price: 1100,
      isBooked: bookedSet.has(l2),
    });

    const l3 = `L${(row - 1) * 3 + 3}`;
    seats.push({
      id: `${busId}-${l3}`,
      seatNumber: l3,
      deck: 'lower',
      row,
      col: 4,
      type: 'sleeper',
      price: 1200,
      isBooked: bookedSet.has(l3),
    });
  }

  for (let row = 1; row <= 5; row++) {
    const u1 = `U${(row - 1) * 3 + 1}`;
    seats.push({
      id: `${busId}-${u1}`,
      seatNumber: u1,
      deck: 'upper',
      row,
      col: 0,
      type: 'sleeper',
      price: 1250,
      isBooked: bookedSet.has(u1),
      isFemaleReserved: row === 1,
    });

    const u2 = `U${(row - 1) * 3 + 2}`;
    seats.push({
      id: `${busId}-${u2}`,
      seatNumber: u2,
      deck: 'upper',
      row,
      col: 3,
      type: 'sleeper',
      price: 1200,
      isBooked: bookedSet.has(u2),
    });

    const u3 = `U${(row - 1) * 3 + 3}`;
    seats.push({
      id: `${busId}-${u3}`,
      seatNumber: u3,
      deck: 'upper',
      row,
      col: 4,
      type: 'sleeper',
      price: 1250,
      isBooked: bookedSet.has(u3),
    });
  }

  return seats;
}

export function generateSeaterSeats(busId: string, bookedNumbers: string[] = []): Seat[] {
  const seats: Seat[] = [];
  const bookedSet = new Set(bookedNumbers);

  const cols = ['A', 'B', 'C', 'D'];
  for (let row = 1; row <= 9; row++) {
    cols.forEach((colLetter, cIndex) => {
      const seatNo = `${row}${colLetter}`;
      const isWindow = colLetter === 'A' || colLetter === 'D';
      seats.push({
        id: `${busId}-${seatNo}`,
        seatNumber: seatNo,
        deck: 'lower',
        row,
        col: cIndex,
        type: 'seater',
        price: isWindow ? 850 : 800,
        isBooked: bookedSet.has(seatNo),
        isFemaleReserved: row === 1 && (colLetter === 'A' || colLetter === 'B'),
      });
    });
  }

  return seats;
}

export const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-101',
    busNumber: 'GT-KA-01-5050',
    busName: 'Guardian Airavat Club Class Multi-Axle',
    busType: 'Multi-Axle Volvo AC',
    operator: 'Guardian Travels Premier',
    routeId: 'route-blr-hyd',
    source: 'Bangalore',
    destination: 'Hyderabad',
    departureTime: '21:15',
    arrivalTime: '06:30',
    duration: '9h 15m',
    baseFare: 850,
    rating: 4.8,
    totalSeats: 36,
    availableSeats: 26,
    amenities: ['Emergency SOS', 'High-Speed Wi-Fi', 'Charging Points', 'Blanket & Pillow', 'Mineral Water', 'Live GPS Tracking'],
    boardingPoints: ['Majestic Terminal 3 (21:15)', 'Hebbal Flyover (21:45)', 'Yelahanka Bypass (22:05)', 'KIAL Airport Toll (22:25)'],
    droppingPoints: ['Shamshabad Airport (05:30)', 'Gachibowli Outer Ring (05:55)', 'Ameerpet Metro (06:15)', 'Secunderabad Junction (06:30)'],
    seats: generateSeaterSeats('bus-101', ['1A', '1B', '2C', '3D', '4A', '4B', '6C', '7A', '8B', '9D']),
    hasUpperDeck: false,
    driverName: 'Manjunath Gowda',
    driverPhone: '+91 98450 12890',
    coDriverName: 'Suresh Patil',
    coDriverPhone: '+91 98450 12891',
    currentLocation: 'Passing Devanahalli Airport Toll - NH 44 (Heading North)',
    currentSpeedKmH: 78,
    nextStop: 'Bagepalli Toll Plaza',
    etaMinutes: 24,
    gpsStatus: 'LIVE - ON TRACK',
    busStatus: 'ON_ROUTE',
    lastPing: 'Just now (12s ago)',
    cabinTempC: 22,
    latitude: 13.2458,
    longitude: 77.7126,
    distanceTravelledKm: 38,
    totalDistanceKm: 570,
    checkpoints: [
      { stopName: 'Majestic Terminal 3', landmark: 'Platform 18', passed: true, isCurrent: false, scheduledTime: '21:15', distanceKm: 0 },
      { stopName: 'Hebbal Flyover', landmark: 'Below Esteem Mall', passed: true, isCurrent: false, scheduledTime: '21:45', distanceKm: 12 },
      { stopName: 'Devanahalli Toll', landmark: 'NH-44 Highway', passed: false, isCurrent: true, scheduledTime: '22:25', distanceKm: 38 },
      { stopName: 'Anantapur Bypass', landmark: 'Hotel Amaravathi', passed: false, isCurrent: false, scheduledTime: '01:30', distanceKm: 215 },
      { stopName: 'Kurnool Outer Ring', landmark: 'Toll Gate', passed: false, isCurrent: false, scheduledTime: '03:45', distanceKm: 360 },
      { stopName: 'Shamshabad Airport', landmark: 'Hyderabad Entry', passed: false, isCurrent: false, scheduledTime: '05:30', distanceKm: 540 },
      { stopName: 'Secunderabad Station', landmark: 'Final Terminal', passed: false, isCurrent: false, scheduledTime: '06:30', distanceKm: 570 }
    ]
  },
  {
    id: 'bus-102',
    busNumber: 'GT-TS-09-9922',
    busName: 'Guardian Royal Star AC Sleeper (2+1)',
    busType: 'AC Sleeper',
    operator: 'Guardian Express Luxury',
    routeId: 'route-blr-hyd',
    source: 'Bangalore',
    destination: 'Hyderabad',
    departureTime: '22:00',
    arrivalTime: '07:15',
    duration: '9h 15m',
    baseFare: 1150,
    rating: 4.9,
    totalSeats: 30,
    availableSeats: 21,
    amenities: ['Private Curtain', 'Snack Pack', 'USB-C Fast Charging', 'Individual TV Screens', 'Clean Linen', 'Live Tracking'],
    boardingPoints: ['Electronic City Toll (21:30)', 'Silk Board (22:00)', 'Indiranagar Metro (22:30)', 'Tin Factory (22:50)'],
    droppingPoints: ['Aramghar (06:20)', 'Mehdipatnam (06:45)', 'Lakdikapul (07:00)', 'Kukatpally (07:25)'],
    seats: generateSleeperSeats('bus-102', ['L1', 'L3', 'L5', 'U1', 'U2', 'U6', 'U10', 'U12', 'L11']),
    hasUpperDeck: true,
    driverName: 'Venkatesh Rao',
    driverPhone: '+91 97422 55190',
    coDriverName: 'Mohd. Imran',
    coDriverPhone: '+91 97422 55192',
    currentLocation: 'At Silk Board Junction (Passenger Boarding in Progress)',
    currentSpeedKmH: 15,
    nextStop: 'Indiranagar 100ft Rd Metro',
    etaMinutes: 18,
    gpsStatus: 'AT BOARDING POINT',
    busStatus: 'BOARDING',
    lastPing: '20s ago',
    cabinTempC: 21,
    latitude: 12.9172,
    longitude: 77.6228,
    distanceTravelledKm: 9,
    totalDistanceKm: 575,
    checkpoints: [
      { stopName: 'Electronic City Toll', landmark: 'Gate 2', passed: true, isCurrent: false, scheduledTime: '21:30', distanceKm: 0 },
      { stopName: 'Silk Board', landmark: 'Central Flyover', passed: false, isCurrent: true, scheduledTime: '22:00', distanceKm: 9 },
      { stopName: 'Indiranagar Metro', landmark: 'Pillar 120', passed: false, isCurrent: false, scheduledTime: '22:30', distanceKm: 18 },
      { stopName: 'Chikkaballapur', landmark: 'Highway Stop', passed: false, isCurrent: false, scheduledTime: '23:45', distanceKm: 70 },
      { stopName: 'Mehdipatnam', landmark: 'Pillar 45', passed: false, isCurrent: false, scheduledTime: '06:45', distanceKm: 550 },
      { stopName: 'Kukatpally Y-Junction', landmark: 'Final Stop', passed: false, isCurrent: false, scheduledTime: '07:25', distanceKm: 575 }
    ]
  },
  {
    id: 'bus-103',
    busNumber: 'GT-MH-12-8811',
    busName: 'Guardian EV Hyper-Glide AC Luxury',
    busType: 'Electric Luxury AC',
    operator: 'Guardian Green Fleet',
    routeId: 'route-mum-pune',
    source: 'Mumbai',
    destination: 'Pune',
    departureTime: '06:30',
    arrivalTime: '10:00',
    duration: '3h 30m',
    baseFare: 550,
    rating: 4.7,
    totalSeats: 36,
    availableSeats: 29,
    amenities: ['100% Zero Emission', 'Air Suspension', 'Free Bottled Water', 'Onboard Refreshments', 'Reading Lights'],
    boardingPoints: ['Borivali West (06:30)', 'Andheri East (07:00)', 'Dadar Asiad Stand (07:30)', 'Vashi Plaza (08:10)'],
    droppingPoints: ['Wakad Bridge (09:15)', 'Shivaji Nagar (09:40)', 'Pune Station (10:00)', 'Swargate (10:20)'],
    seats: generateSeaterSeats('bus-103', ['2A', '2B', '3A', '5C', '5D', '7B', '9A']),
    hasUpperDeck: false,
    driverName: 'Sachin Kadam',
    driverPhone: '+91 99201 44882',
    coDriverName: 'Anil Shinde',
    currentLocation: 'Mumbai-Pune Expressway (Khalapur Toll Plaza)',
    currentSpeedKmH: 79,
    nextStop: 'Lonavala Ghat Rest Stop',
    etaMinutes: 20,
    gpsStatus: 'LIVE - ON TRACK',
    busStatus: 'ON_ROUTE',
    lastPing: '5s ago',
    cabinTempC: 23,
    latitude: 18.8142,
    longitude: 73.2844,
    distanceTravelledKm: 95,
    totalDistanceKm: 160,
    checkpoints: [
      { stopName: 'Borivali West', landmark: 'National Park', passed: true, isCurrent: false, scheduledTime: '06:30', distanceKm: 0 },
      { stopName: 'Dadar Asiad', landmark: 'TT Circle', passed: true, isCurrent: false, scheduledTime: '07:30', distanceKm: 32 },
      { stopName: 'Vashi Plaza', landmark: 'Toll Plaza', passed: true, isCurrent: false, scheduledTime: '08:10', distanceKm: 60 },
      { stopName: 'Khalapur Toll', landmark: 'Expressway Midpoint', passed: false, isCurrent: true, scheduledTime: '08:45', distanceKm: 95 },
      { stopName: 'Wakad Bridge', landmark: 'Pune Highway', passed: false, isCurrent: false, scheduledTime: '09:15', distanceKm: 140 },
      { stopName: 'Pune Station', landmark: 'Bus Terminus', passed: false, isCurrent: false, scheduledTime: '10:00', distanceKm: 160 }
    ]
  },
  {
    id: 'bus-104',
    busNumber: 'GT-TN-02-7744',
    busName: 'Guardian Scania Multi-Axle Night Cruiser',
    busType: 'Multi-Axle Volvo AC',
    routeId: 'route-chn-blr',
    source: 'Chennai',
    destination: 'Bangalore',
    operator: 'Guardian Travels Premier',
    departureTime: '23:00',
    arrivalTime: '05:30',
    duration: '6h 30m',
    baseFare: 780,
    rating: 4.8,
    totalSeats: 36,
    availableSeats: 30,
    amenities: ['Ergonomic Semi-Sleeper', 'Movie Streaming', 'Charging Points', 'Mineral Water', 'Clean Linen'],
    boardingPoints: ['Koyambedu CMBT (23:00)', 'Ashok Nagar (23:20)', 'Guindy Metro (23:40)', 'Sriperumbudur Toll (00:20)'],
    droppingPoints: ['Hosur Border (04:30)', 'Electronic City Toll (05:00)', 'Silk Board (05:15)', 'Majestic (05:30)'],
    seats: generateSeaterSeats('bus-104', ['1A', '3B', '4C', '5D', '8A', '8B']),
    hasUpperDeck: false,
    driverName: 'Muruganandam',
    driverPhone: '+91 94440 33112',
    coDriverName: 'G. Selvam',
    coDriverPhone: '+91 94440 33114',
    currentLocation: 'Ranipet Highway Bypass Toll (En Route Bangalore)',
    currentSpeedKmH: 74,
    nextStop: 'Vellore Golden Temple Bypass',
    etaMinutes: 32,
    gpsStatus: 'LIVE - ON TRACK',
    busStatus: 'ON_ROUTE',
    lastPing: '15s ago',
    cabinTempC: 22,
    latitude: 12.9298,
    longitude: 79.3332,
    distanceTravelledKm: 110,
    totalDistanceKm: 345,
    checkpoints: [
      { stopName: 'Koyambedu CMBT', landmark: 'Platform 4', passed: true, isCurrent: false, scheduledTime: '23:00', distanceKm: 0 },
      { stopName: 'Sriperumbudur', landmark: 'Toll Plaza', passed: true, isCurrent: false, scheduledTime: '00:20', distanceKm: 42 },
      { stopName: 'Ranipet Bypass', landmark: 'NH-48 Midpoint', passed: false, isCurrent: true, scheduledTime: '01:30', distanceKm: 110 },
      { stopName: 'Vellore Bypass', landmark: 'Green Circle', passed: false, isCurrent: false, scheduledTime: '02:15', distanceKm: 140 },
      { stopName: 'Krishnagiri Toll', landmark: 'Flyover', passed: false, isCurrent: false, scheduledTime: '03:45', distanceKm: 250 },
      { stopName: 'Silk Board', landmark: 'Bangalore Entry', passed: false, isCurrent: false, scheduledTime: '05:15', distanceKm: 335 },
      { stopName: 'Majestic Bus Stand', landmark: 'Final Terminal', passed: false, isCurrent: false, scheduledTime: '05:30', distanceKm: 345 }
    ]
  },
  {
    id: 'bus-105',
    busNumber: 'GT-GA-03-6622',
    busName: 'Guardian Goa Coastal Dream Sleeper (2+1)',
    busType: 'AC Sleeper',
    routeId: 'route-blr-goa',
    source: 'Bangalore',
    destination: 'Goa',
    operator: 'Guardian Holidays Express',
    departureTime: '19:30',
    arrivalTime: '07:30',
    duration: '12h 00m',
    baseFare: 1450,
    rating: 4.9,
    totalSeats: 30,
    availableSeats: 16,
    amenities: ['Individual AC Vents', 'Charging Sockets', 'Blanket & Fresh Pillow', 'Reading Light', 'Complimentary Water', 'Live GPS Radar'],
    boardingPoints: ['Yeshwantpur Govardhan (19:30)', 'Goraguntepalya (19:45)', 'Nelamangala Toll (20:15)'],
    droppingPoints: ['Canacona (06:00)', 'Madgaon KTC Stand (06:45)', 'Panjim Bus Stand (07:30)', 'Mapusa (08:00)'],
    seats: generateSleeperSeats('bus-105', ['L2', 'L3', 'L6', 'L7', 'L9', 'U1', 'U2', 'U3', 'U5', 'U7', 'U9', 'U11', 'L12', 'U12']),
    hasUpperDeck: true,
    driverName: 'Anthony D\'Souza',
    driverPhone: '+91 98221 77209',
    coDriverName: 'Rocky Fernandes',
    currentLocation: 'Hubli Outer Bypass - Highway Dhaba Dinner Stop',
    currentSpeedKmH: 0,
    nextStop: 'Dharwad Toll Plaza',
    etaMinutes: 35,
    gpsStatus: 'HALTED',
    busStatus: 'ON_ROUTE',
    lastPing: '1m ago',
    cabinTempC: 24,
    latitude: 15.3647,
    longitude: 75.1240,
    distanceTravelledKm: 410,
    totalDistanceKm: 580,
    checkpoints: [
      { stopName: 'Yeshwantpur', landmark: 'Metro Station', passed: true, isCurrent: false, scheduledTime: '19:30', distanceKm: 0 },
      { stopName: 'Tumkur Bypass', landmark: 'Toll Plaza', passed: true, isCurrent: false, scheduledTime: '21:00', distanceKm: 70 },
      { stopName: 'Chitradurga', landmark: 'Highway Hotel', passed: true, isCurrent: false, scheduledTime: '23:30', distanceKm: 200 },
      { stopName: 'Hubli Bypass', landmark: 'Dinner Stop', passed: false, isCurrent: true, scheduledTime: '02:45', distanceKm: 410 },
      { stopName: 'Madgaon KTC', landmark: 'Goa South', passed: false, isCurrent: false, scheduledTime: '06:45', distanceKm: 540 },
      { stopName: 'Panjim KTC', landmark: 'Mandovi Bridge', passed: false, isCurrent: false, scheduledTime: '07:30', distanceKm: 580 }
    ]
  },
  {
    id: 'bus-106',
    busNumber: 'GT-TN-57-1234',
    busName: 'Guardian Express Salem-Kovai Highway Jet',
    busType: 'Multi-Axle Volvo AC',
    routeId: 'route-slm-cbe',
    source: 'Salem',
    destination: 'Coimbatore',
    operator: 'Guardian Travels Tamil Nadu',
    departureTime: '06:30',
    arrivalTime: '10:00',
    duration: '3h 30m',
    baseFare: 450,
    rating: 4.9,
    totalSeats: 36,
    availableSeats: 32,
    amenities: ['Multi-Axle Air Suspension', 'Fast USB-C Charging', 'Free Mineral Water', 'Live GPS Tracking', 'Speed Governed'],
    boardingPoints: ['Salem New Bus Stand (06:30)', 'Kondalampatti Bypass (06:45)', 'Sankari Toll (07:15)'],
    droppingPoints: ['Perundurai Bypass (08:20)', 'Avinashi Highway (09:00)', 'KMCH Hospital (09:35)', 'Gandhipuram Central (10:00)'],
    seats: generateSeaterSeats('bus-106', ['1A', '1B', '2C', '4D']),
    hasUpperDeck: false,
    driverName: 'R. Velusamy',
    driverPhone: '+91 94432 11890',
    coDriverName: 'M. Senthil',
    currentLocation: 'Namakkal Highway Junction - NH 544 (On Time)',
    currentSpeedKmH: 76,
    nextStop: 'Erode Perundurai Bypass',
    etaMinutes: 25,
    gpsStatus: 'LIVE - ON TRACK',
    busStatus: 'ON_ROUTE',
    lastPing: 'Just now (8s ago)',
    cabinTempC: 22,
    latitude: 11.2189,
    longitude: 78.1674,
    distanceTravelledKm: 55,
    totalDistanceKm: 165,
    checkpoints: [
      { stopName: 'Salem New Bus Stand', landmark: 'Platform 5', passed: true, isCurrent: false, scheduledTime: '06:30', distanceKm: 0 },
      { stopName: 'Namakkal Highway', landmark: 'NH-544 Toll', passed: false, isCurrent: true, scheduledTime: '07:15', distanceKm: 55 },
      { stopName: 'Erode Perundurai', landmark: 'Flyover Stop', passed: false, isCurrent: false, scheduledTime: '08:20', distanceKm: 105 },
      { stopName: 'Avinashi Bypass', landmark: 'Highway Checkpost', passed: false, isCurrent: false, scheduledTime: '09:00', distanceKm: 135 },
      { stopName: 'Gandhipuram Terminal', landmark: 'Coimbatore Heart', passed: false, isCurrent: false, scheduledTime: '10:00', distanceKm: 165 }
    ]
  }
];

export const INITIAL_PASSENGERS: Passenger[] = [
  {
    id: 'p-101',
    fullName: 'Rahul Sharma',
    username: 'rahulsharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    age: 29,
    gender: 'Male',
    city: 'Bangalore',
    emergencyContact: '9876543211',
    createdAt: '2026-09-15 10:30:00',
    isAdmin: false
  },
  {
    id: 'p-102',
    fullName: 'Priya Sundaram',
    username: 'priyas',
    email: 'priya.s@example.com',
    phone: '9845012345',
    age: 26,
    gender: 'Female',
    city: 'Hyderabad',
    emergencyContact: '9845098765',
    createdAt: '2026-09-20 14:15:00',
    isAdmin: false
  },
  {
    id: 'p-103',
    fullName: 'Elayanithish',
    username: 'elayanithish',
    email: 'elayanithishd@gmail.com',
    phone: '9840123456',
    age: 25,
    gender: 'Male',
    city: 'Salem',
    emergencyContact: '9840123450',
    createdAt: '2026-10-01 09:00:00',
    isAdmin: false
  },
  {
    id: 'admin-01',
    fullName: 'Admin - Guardian Operations',
    username: 'admin',
    email: 'admin@guardiantravels.com',
    phone: '9900011222',
    age: 35,
    gender: 'Male',
    city: 'Bangalore Fleet HQ',
    emergencyContact: '1800-425-9900',
    createdAt: '2026-01-01 00:00:00',
    isAdmin: true
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-901',
    pnr: 'GT9842105',
    passengerId: 'p-101',
    passengerName: 'Rahul Sharma',
    passengerEmail: 'rahul.sharma@example.com',
    passengerPhone: '9876543210',
    busId: 'bus-101',
    busNumber: 'GT-KA-01-5050',
    busName: 'Guardian Airavat Club Class Multi-Axle',
    busType: 'Multi-Axle Volvo AC',
    source: 'Bangalore',
    destination: 'Hyderabad',
    journeyDate: '2026-10-12',
    departureTime: '21:15',
    arrivalTime: '06:30',
    boardingPoint: 'Majestic Terminal 3 (21:15)',
    droppingPoint: 'Ameerpet Metro (06:15)',
    passengers: [
      { seatNumber: '1A', name: 'Rahul Sharma', age: 29, gender: 'Male', fare: 850 },
      { seatNumber: '1B', name: 'Vikram Mehta', age: 31, gender: 'Male', fare: 800 }
    ],
    seatNumbers: ['1A', '1B'],
    baseFare: 1650,
    taxGst: 82.5,
    discount: 100,
    insuranceOpted: true,
    insuranceFee: 58,
    insurancePolicyNumber: 'POL-GT-984211',
    insuranceCoverageAmount: 500000,
    totalAmount: 1690.5,
    paymentMethod: 'UPI / NetBanking',
    status: 'CONFIRMED',
    bookedAt: '2026-10-01 11:20:00'
  },
  {
    id: 'b-902',
    pnr: 'GT7719240',
    passengerId: 'p-102',
    passengerName: 'Priya Sundaram',
    passengerEmail: 'priya.s@example.com',
    passengerPhone: '9845012345',
    busId: 'bus-102',
    busNumber: 'GT-TS-09-9922',
    busName: 'Guardian Royal Star AC Sleeper (2+1)',
    busType: 'AC Sleeper',
    source: 'Bangalore',
    destination: 'Hyderabad',
    journeyDate: '2026-10-14',
    departureTime: '22:00',
    arrivalTime: '07:15',
    boardingPoint: 'Indiranagar Metro (22:30)',
    droppingPoint: 'Lakdikapul (07:00)',
    passengers: [
      { seatNumber: 'L1', name: 'Priya Sundaram', age: 26, gender: 'Female', fare: 1150 }
    ],
    seatNumbers: ['L1'],
    baseFare: 1150,
    taxGst: 57.5,
    discount: 50,
    insuranceOpted: true,
    insuranceFee: 29,
    insurancePolicyNumber: 'POL-GT-771924',
    insuranceCoverageAmount: 500000,
    totalAmount: 1186.5,
    paymentMethod: 'Credit Card',
    status: 'CONFIRMED',
    bookedAt: '2026-10-02 16:45:00'
  },
  {
    id: 'b-903',
    pnr: 'GT5588310',
    passengerId: 'p-103',
    passengerName: 'Elayanithish',
    passengerEmail: 'elayanithishd@gmail.com',
    passengerPhone: '9840123456',
    busId: 'bus-106',
    busNumber: 'GT-TN-57-1234',
    busName: 'Guardian Express Salem-Kovai Highway Jet',
    busType: 'Multi-Axle Volvo AC',
    source: 'Salem',
    destination: 'Coimbatore',
    journeyDate: '2026-10-08',
    departureTime: '06:30',
    arrivalTime: '10:00',
    boardingPoint: 'Salem New Bus Stand (06:30)',
    droppingPoint: 'Gandhipuram Central (10:00)',
    passengers: [
      { seatNumber: '1A', name: 'Elayanithish', age: 25, gender: 'Male', fare: 450 }
    ],
    seatNumbers: ['1A'],
    baseFare: 450,
    taxGst: 22.5,
    discount: 0,
    insuranceOpted: true,
    insuranceFee: 29,
    insurancePolicyNumber: 'POL-GT-558831',
    insuranceCoverageAmount: 500000,
    totalAmount: 501.5,
    paymentMethod: 'UPI / Google Pay',
    status: 'CONFIRMED',
    bookedAt: '2026-10-05 18:30:00'
  }
];

export const INITIAL_CANCELLATIONS: CancellationRecord[] = [
  {
    id: 'c-501',
    cancellationId: 'CAN-GT-8812',
    bookingId: 'b-old-01',
    pnr: 'GT6634120',
    passengerName: 'Ananya Deshmukh',
    passengerPhone: '9822099182',
    busNumber: 'GT-KA-01-5050',
    source: 'Bangalore',
    destination: 'Hyderabad',
    cancelledSeats: ['3C'],
    originalAmount: 850,
    cancellationFee: 85,
    refundAmount: 765,
    refundPercentage: 90,
    reason: 'Change of travel schedule',
    refundStatus: 'PROCESSED',
    refundTransactionId: 'TXN-REF-9920119',
    cancelledAt: '2026-09-29 14:10:00'
  },
  {
    id: 'c-502',
    cancellationId: 'CAN-GT-4491',
    bookingId: 'b-old-02',
    pnr: 'GT3319082',
    passengerName: 'Karthik Raja',
    passengerPhone: '9789012399',
    busNumber: 'GT-TN-02-7744',
    source: 'Chennai',
    destination: 'Bangalore',
    cancelledSeats: ['2A', '2B'],
    originalAmount: 1560,
    cancellationFee: 156,
    refundAmount: 1404,
    refundPercentage: 90,
    reason: 'Family emergency',
    refundStatus: 'PROCESSED',
    refundTransactionId: 'TXN-REF-8812001',
    cancelledAt: '2026-10-03 08:30:00'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Trip Reminder: Salem → Coimbatore',
    message: 'Your upcoming journey on Guardian Express (TN57AB1234) is on schedule for 06:30 AM.',
    time: '15 mins ago',
    type: 'trip',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Coach Departed on Time',
    message: 'Guardian Airavat Club Class has departed Bangalore Majestic Terminal 3 on schedule.',
    time: '1 hour ago',
    type: 'info',
    isRead: false
  },
  {
    id: 'notif-3',
    title: 'Travel Insurance Active',
    message: 'Guardian Protect Insurance policy #POL-GT-558831 is now active for your trip with ₹5,00,000 cover.',
    time: '3 hours ago',
    type: 'success',
    isRead: true
  },
  {
    id: 'notif-4',
    title: 'Speed Governor Monitored',
    message: 'All Guardian coaches are currently operating within the highway 80 km/h safety limit.',
    time: '5 hours ago',
    type: 'info',
    isRead: true
  }
];
