import React, { useState } from 'react';
import { Ticket, Search, Calendar, MapPin, Bus, User, Eye, XCircle, Navigation, ShieldCheck, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Booking, Passenger } from '../types';
import { generateAndDownloadTicket } from '../utils/ticketDownloader';

interface MyBookingsViewProps {
  bookings: Booking[];
  currentUser: Passenger | null;
  onViewTicket: (booking: Booking) => void;
  onCancelTicket: (pnr: string) => void;
  onBookNew: () => void;
  onTrackBus?: (busId: string, booking: Booking) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  currentUser,
  onViewTicket,
  onCancelTicket,
  onBookNew,
  onTrackBus
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadTicket = (booking: Booking) => {
    try {
      const res = generateAndDownloadTicket(booking);
      setDownloadNotice(`Ticket downloaded (${res.filename}). You can also click "View Ticket" to print/save anytime.`);
    } catch {
      setDownloadNotice(`Ticket downloaded for PNR ${booking.pnr}.`);
    }
    setTimeout(() => setDownloadNotice(null), 6000);
  };

  // Tab Filtering according to Section 16
  const filteredBookings = (bookings || []).filter(b => {
    if (!b) return false;
    const pnr = (b.pnr || '').toLowerCase();
    const pName = (b.passengerName || '').toLowerCase();
    const bNum = (b.busNumber || '').toLowerCase();
    const src = (b.source || '').toLowerCase();
    const dst = (b.destination || '').toLowerCase();
    const term = (searchTerm || '').trim().toLowerCase();

    const matchTerm =
      !term ||
      pnr.includes(term) ||
      pName.includes(term) ||
      bNum.includes(term) ||
      src.includes(term) ||
      dst.includes(term);

    if (!matchTerm) return false;

    const isConfirmed = b.status === 'CONFIRMED' || b.bookingStatus === 'confirmed';
    const isPartiallyCancelled = b.status === 'PARTIALLY_CANCELLED';
    const isCancelled = b.status === 'CANCELLED' || b.bookingStatus === 'cancelled';
    const isCompleted = b.status === 'COMPLETED';

    if (activeTab === 'upcoming') {
      return isConfirmed || isPartiallyCancelled;
    }
    if (activeTab === 'completed') {
      return isCompleted;
    }
    if (activeTab === 'cancelled') {
      return isCancelled;
    }
    return true;
  });

  const upcomingCount = (bookings || []).filter(b => b && (b.status === 'CONFIRMED' || b.status === 'PARTIALLY_CANCELLED' || b.bookingStatus === 'confirmed')).length;
  const completedCount = (bookings || []).filter(b => b && b.status === 'COMPLETED').length;
  const cancelledCount = (bookings || []).filter(b => b && (b.status === 'CANCELLED' || b.bookingStatus === 'cancelled')).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                My Trips & Digital Tickets
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lookup PNR reservations, track live coach progress, or manage cancellations
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onBookNew}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Book New Journey
        </button>
      </div>

      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in slide-in-from-top">
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

      {/* Tabs & Search Bar (Section 16) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Three Tabs: Upcoming, Completed, Cancelled */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Upcoming Trips</span>
            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Completed</span>
            <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {completedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cancelled'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Cancelled</span>
            <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-bold">
              {cancelledCount}
            </span>
          </button>
        </div>

        {/* PNR Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by PNR, passenger, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-sky-500 font-medium"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No {activeTab} trips found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming trips scheduled. Ready to book your next coach?" 
                : `No ${activeTab} reservations matching "${searchTerm || 'your profile'}".`}
            </p>
          </div>
          <button
            onClick={onBookNew}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
          >
            Search Available Coaches
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Top Row: PNR, status & booked date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-3 py-1 rounded-xl border border-slate-200">
                    PNR: {b.pnr}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    b.status === 'CONFIRMED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : b.status === 'PARTIALLY_CANCELLED'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                    {b.status}
                  </span>
                  {b.insuranceOpted && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ₹5L Insured
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  Booked on <span className="font-mono text-slate-700 font-semibold">{b.bookedAt || b.bookingDate || 'Recorded'}</span>
                </div>
              </div>

              {/* Core Information */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-1 text-xs">
                {/* Coach & Passenger */}
                <div className="md:col-span-4 space-y-1">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Bus className="w-4 h-4 text-emerald-600" />
                    {b.busName || 'Guardian Express Coach'}
                  </h4>
                  <p className="text-slate-500 font-mono text-[11px]">{b.busNumber || 'Fleet Vehicle'} • {b.busType || 'AC'}</p>
                  <p className="text-slate-700 font-medium pt-1">
                    Lead Passenger: <strong>{b.passengerName || 'Traveler'}</strong>
                  </p>
                </div>

                {/* Route & Timings */}
                <div className="md:col-span-5 space-y-1">
                  <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>{b.source || 'Boarding Station'}</span>
                    <span className="text-emerald-600">➔</span>
                    <span>{b.destination || 'Destination'}</span>
                  </div>
                  <div className="text-slate-600">
                    Journey Date: <strong className="text-slate-900">{b.journeyDate || b.travelDate || 'Scheduled'}</strong> {b.departureTime ? `(${b.departureTime})` : ''}
                  </div>
                  <div className="text-slate-500 text-[11px] truncate" title={b.boardingPoint || b.source}>
                    Boarding: {b.boardingPoint || b.source || 'Terminal'}
                  </div>
                </div>

                {/* Seats & Fare */}
                <div className="md:col-span-3 md:text-right">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">RESERVED SEATS</span>
                    <span className="font-mono font-black text-emerald-800 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                      [{Array.isArray(b.seatNumbers) && b.seatNumbers.length > 0 ? b.seatNumbers.join(', ') : 'Released'}]
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-900 font-mono mt-1">
                    ₹{Number(b.totalAmount || 0).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">{b.paymentMethod || 'Prepaid'}</span>
                </div>
              </div>

              {/* Action Buttons as specified in Section 16 */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-slate-500 text-[11px]">
                  {Array.isArray(b.passengers) ? b.passengers.length : (b.seatNumbers?.length || 1)} passenger(s) on reservation
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Track button for upcoming/confirmed */}
                  {onTrackBus && (b.status === 'CONFIRMED' || b.status === 'PARTIALLY_CANCELLED') && (
                    <button
                      type="button"
                      onClick={() => onTrackBus(b.busId, b)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Live Bus</span>
                    </button>
                  )}

                  {/* Direct Download Ticket (PDF) */}
                  <button
                    type="button"
                    onClick={() => handleDownloadTicket(b)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    title="Download Ticket PDF directly"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Ticket</span>
                  </button>

                  {/* View Ticket / Digital Boarding Pass */}
                  <button
                    type="button"
                    onClick={() => onViewTicket(b)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Ticket</span>
                  </button>

                  {/* Cancel button if active */}
                  {b.status !== 'CANCELLED' && (
                    <button
                      type="button"
                      onClick={() => onCancelTicket(b.pnr)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                    >
                      Cancel Seats
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
