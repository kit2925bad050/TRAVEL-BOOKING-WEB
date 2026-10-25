import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Download,
  Printer,
  Share2,
  Copy,
  Check,
  FileText,
  Bus,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  User,
  AlertCircle
} from 'lucide-react';
import { Booking } from '../types';
import {
  generatePdfTicket,
  downloadTicketHtml,
  printTicketDocument,
  copyTicketSummary,
  generateAndDownloadTicket
} from '../utils/ticketDownloader';

interface BookingTicketModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackBus?: (busId: string) => void;
}

export const BookingTicketModal: React.FC<BookingTicketModalProps> = ({
  booking,
  isOpen,
  onClose,
  onTrackBus
}) => {
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const manifestPassengers = Array.isArray(booking.passengers) && booking.passengers.length > 0
    ? booking.passengers
    : [
        {
          seatNumber: Array.isArray(booking.seatNumbers) && booking.seatNumbers[0] ? booking.seatNumbers[0] : '1A',
          name: booking.passengerName || 'Lead Passenger',
          age: 26,
          gender: 'Adult',
          fare: Number(booking.baseFare || 450)
        }
      ];

  const isCancelled = booking.status === 'CANCELLED' || booking.bookingStatus === 'cancelled';

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const res = generatePdfTicket(booking);
      if (res.success) {
        setDownloadSuccessMessage(`PDF Ticket downloaded: ${res.filename}. If your browser blocks iframe downloads, click "Print / Save as PDF".`);
      } else {
        // Fallback to HTML
        downloadTicketHtml(booking);
        setDownloadSuccessMessage(`HTML Ticket downloaded: Guardian_Travels_Ticket_${booking.pnr}.html`);
      }
    } catch {
      downloadTicketHtml(booking);
      setDownloadSuccessMessage(`Ticket downloaded: Guardian_Travels_Ticket_${booking.pnr}.html`);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadSuccessMessage(null), 6000);
    }
  };

  const handleDownloadHtml = () => {
    try {
      const res = downloadTicketHtml(booking);
      setDownloadSuccessMessage(`HTML Ticket downloaded: ${res.filename}`);
      setTimeout(() => setDownloadSuccessMessage(null), 6000);
    } catch (err: any) {
      setDownloadError('Could not trigger HTML download. Try Print / Save as PDF.');
    }
  };

  const handlePrint = () => {
    printTicketDocument(booking);
  };

  const handleCopy = async () => {
    const success = await copyTicketSummary(booking);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      // Fallback copy
      navigator.clipboard?.writeText(
        `Guardian Travels Ticket | PNR: ${booking.pnr} | Coach: ${booking.busName} | Route: ${booking.source} -> ${booking.destination}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Guardian Travels Ticket - ${booking.pnr}`,
        text: `My bus ticket from ${booking.source} to ${booking.destination} on ${booking.journeyDate || booking.travelDate}. PNR: ${booking.pnr}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-6 overflow-hidden flex flex-col print:shadow-none print:border-none print:m-0 print-ticket-root">
        
        {/* Modal Top Actions */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            {isCancelled ? (
              <X className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                {isCancelled ? 'Booking Cancelled & Refund Processed' : 'Booking Confirmed & Dispatched'}
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">PNR: {booking.pnr}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Primary Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              title="Download Ticket as PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>

            {/* Print / Save as PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Copy Ticket Details"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold cursor-pointer"
              title="Share Ticket"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Success / Error Alert Notification */}
        {downloadSuccessMessage && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-bold flex items-center justify-between gap-2 animate-in slide-in-from-top print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadSuccessMessage(null)}
              className="text-white/80 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {downloadError && (
          <div className="bg-amber-600 text-white px-5 py-2.5 text-xs font-bold flex items-center justify-between gap-2 animate-in slide-in-from-top print:hidden">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{downloadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadError(null)}
              className="text-white/80 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Boarding Pass / Ticket Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-slate-50 max-h-[80vh]">

          {/* Ticket Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 skew-x-12 pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
                  GT
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    GUARDIAN TRAVELS
                    <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded uppercase ${
                      isCancelled
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {booking.status || 'CONFIRMED'}
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200">Official Electronic Boarding Pass & Highway Itinerary</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest text-blue-300">Booking Reference</p>
                <p className="text-base sm:text-lg font-mono font-black tracking-wider text-emerald-400">{booking.pnr}</p>
              </div>
            </div>

            {/* Route & Times */}
            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 items-center text-center">
              <div className="text-left">
                <p className="text-[10px] sm:text-[11px] font-semibold text-blue-300 uppercase">Departure</p>
                <p className="text-sm sm:text-base font-bold text-white">{booking.source}</p>
                <p className="text-xs text-blue-200 mt-0.5">{booking.departureTime}</p>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-blue-300 uppercase font-semibold">Scheduled Route</span>
                <div className="w-full flex items-center gap-1 my-1">
                  <div className="h-0.5 bg-blue-400/40 flex-1"></div>
                  <Bus className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="h-0.5 bg-blue-400/40 flex-1"></div>
                </div>
                <span className="text-[10px] text-blue-200 font-medium">{booking.journeyDate || booking.travelDate}</span>
              </div>

              <div className="text-right">
                <p className="text-[10px] sm:text-[11px] font-semibold text-blue-300 uppercase">Arrival Destination</p>
                <p className="text-sm sm:text-base font-bold text-white">{booking.destination}</p>
                <p className="text-xs text-blue-200 mt-0.5">{booking.arrivalTime}</p>
              </div>
            </div>
          </div>

          {/* Coach & Location Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Coach Number</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{booking.busName}</p>
              <p className="text-[10px] text-slate-500 font-mono">{booking.busNumber}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Seats Reserved</p>
              <p className="text-xs font-bold text-blue-600 mt-0.5">
                [{Array.isArray(booking.seatNumbers) && booking.seatNumbers.length > 0 ? booking.seatNumbers.join(', ') : 'Assigned'}]
              </p>
              <p className="text-[10px] text-slate-500">
                {manifestPassengers.length} Passenger(s)
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Boarding Point</p>
              <p className="text-xs font-bold text-slate-900 truncate mt-0.5" title={booking.boardingPoint || booking.source}>
                {booking.boardingPoint || booking.source}
              </p>
              <p className="text-[10px] text-slate-500">Be present 15m early</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Dropping Point</p>
              <p className="text-xs font-bold text-slate-900 truncate mt-0.5" title={booking.droppingPoint || booking.destination}>
                {booking.droppingPoint || booking.destination}
              </p>
              <p className="text-[10px] text-slate-500">{booking.destination}</p>
            </div>
          </div>

          {/* Passenger Manifest */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Passenger Manifest
              </span>
              <span className="text-xs font-medium text-slate-600">
                {manifestPassengers.length} Passenger{manifestPassengers.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {manifestPassengers.map((p, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.gender}, {p.age} years</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded">
                      Seat {p.seatNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRAVEL INSURANCE CERTIFICATE SECTION */}
          {booking.insuranceOpted ? (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">Guardian Protect Travel Insurance Certificate</h4>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active Policy
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Comprehensive coverage for this journey underwritten by Guardian Travel Assist India.
                    </p>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white/90 p-2 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-slate-500 block">Policy Number</span>
                        <span className="font-mono font-bold text-slate-900">{booking.insurancePolicyNumber || `POL-GT-${booking.pnr}`}</span>
                      </div>
                      <div className="bg-white/90 p-2 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-slate-500 block">Emergency Medical</span>
                        <span className="font-bold text-emerald-800">₹3,00,000</span>
                      </div>
                      <div className="bg-white/90 p-2 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-slate-500 block">Accidental Cover</span>
                        <span className="font-bold text-emerald-800">₹6,00,000</span>
                      </div>
                      <div className="bg-white/90 p-2 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-slate-500 block">Total Premium Paid</span>
                        <span className="font-bold text-slate-900">₹{booking.insuranceFee || 29 * booking.passengers.length}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2.5">
                      📞 For 24x7 cashless medical emergency assistance during transit, dial toll-free <strong>1800-425-4827</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">No Travel Insurance Attached</p>
                  <p className="text-[11px] text-amber-700">This itinerary does not have active insurance coverage for medical emergencies or baggage loss.</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded">Uninsured</span>
            </div>
          )}

          {/* Fare Summary & Payment Stamp & QR Verification Code */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-xs text-slate-600 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Base Fare: <strong>₹{(booking.baseFare || (booking.totalAmount - (booking.taxGst || booking.taxes || 0) - (booking.insuranceFee || 0))).toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span>Taxes & GST: <strong>₹{booking.taxGst || booking.taxes || 0}</strong></span>
                {booking.insuranceOpted && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      Insurance: <strong>₹{booking.insuranceFee || 29 * manifestPassengers.length}</strong>
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Payment Mode: Digital UPI / Card (Prepaid) • Status: Confirmed & Committed in Database</p>
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Paid</span>
                <p className="text-2xl font-black text-slate-900">₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Visual Digital Ticket QR Code */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl shrink-0">
              <div className="w-18 h-18 bg-white border border-slate-300 p-1.5 rounded-lg flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                  <rect x="5" y="5" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="14" y="14" width="12" height="12" />
                  <rect x="65" y="5" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="74" y="14" width="12" height="12" />
                  <rect x="5" y="65" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="14" y="74" width="12" height="12" />
                  <rect x="45" y="10" width="8" height="8" />
                  <rect x="45" y="24" width="8" height="8" />
                  <rect x="10" y="45" width="8" height="8" />
                  <rect x="24" y="45" width="8" height="8" />
                  <rect x="42" y="42" width="16" height="16" />
                  <rect x="65" y="45" width="8" height="8" />
                  <rect x="78" y="45" width="10" height="8" />
                  <rect x="45" y="65" width="8" height="8" />
                  <rect x="45" y="80" width="8" height="10" />
                  <rect x="65" y="65" width="12" height="8" />
                  <rect x="82" y="75" width="8" height="14" />
                </svg>
              </div>

              <div className="text-[10px] space-y-0.5 text-slate-600 font-mono">
                <p className="font-bold text-slate-900">DIGITAL BOARDING PASS</p>
                <p>PNR: <strong>{booking.pnr}</strong></p>
                <p>SEATS: <strong>{Array.isArray(booking.seatNumbers) && booking.seatNumbers.length > 0 ? booking.seatNumbers.join(', ') : 'Assigned'}</strong></p>
                <p className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1 py-0.5 rounded text-center">
                  SCAN AT GATE
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions (Live Track, Download PDF, Download HTML, & Print) */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 print:hidden">
            {onTrackBus && (
              <button
                type="button"
                onClick={() => onTrackBus(booking.busId)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition active:scale-[0.99] text-xs cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Live Track Coach</span>
              </button>
            )}

            {/* Primary High-Quality Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating PDF...' : 'Download PDF Ticket'}</span>
            </button>

            {/* Standalone HTML Ticket Download Button */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-xs cursor-pointer border border-slate-200"
              title="Download standalone HTML ticket file"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Download HTML</span>
            </button>

            {/* Print / Save as PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition text-xs cursor-pointer"
              title="Open clean printable ticket page"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
