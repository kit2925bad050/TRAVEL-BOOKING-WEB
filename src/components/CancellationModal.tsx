import React, { useState, useEffect } from 'react';
import { X, Search, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Receipt } from 'lucide-react';
import { Booking, CancellationRecord } from '../types';
import { dbSimulator } from '../services/dbSimulator';

interface CancellationModalProps {
  initialPnr?: string;
  isOpen: boolean;
  onClose: () => void;
  onCancellationComplete?: (record: CancellationRecord) => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  initialPnr = '',
  isOpen,
  onClose,
  onCancellationComplete
}) => {
  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedSeatsToCancel, setSelectedSeatsToCancel] = useState<string[]>([]);
  const [reason, setReason] = useState('Change of travel plan');
  const [errorMsg, setErrorMsg] = useState('');
  const [cancellationResult, setCancellationResult] = useState<CancellationRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCancellationResult(null);
      setErrorMsg('');
      if (initialPnr) {
        setPnrInput(initialPnr);
        handleSearch(initialPnr);
      } else {
        setBooking(null);
        setSelectedSeatsToCancel([]);
      }
    } else {
      setCancellationResult(null);
      setBooking(null);
      setErrorMsg('');
    }
  }, [initialPnr, isOpen]);

  if (!isOpen) return null;

  const handleSearch = (pnrToSearch?: string) => {
    const pnr = (pnrToSearch || pnrInput).trim().toUpperCase();
    if (!pnr) {
      setErrorMsg('Please enter a valid PNR number.');
      return;
    }

    try {
      const found = dbSimulator.lookupBookingByPnr(pnr);
      if (!found) {
        setErrorMsg(`No active booking found with PNR "${pnr}". Please check and try again.`);
        setBooking(null);
        return;
      }

      if (found.status === 'CANCELLED' || found.bookingStatus === 'cancelled') {
        setErrorMsg(`Booking ${pnr} has already been cancelled.`);
        setBooking(found);
        setSelectedSeatsToCancel([]);
        return;
      }

      setBooking(found);
      setSelectedSeatsToCancel(Array.isArray(found.seatNumbers) ? [...found.seatNumbers] : []);
      setErrorMsg('');
      setCancellationResult(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error looking up booking.');
    }
  };

  const toggleSeatSelection = (seatNo: string) => {
    setErrorMsg('');
    if (selectedSeatsToCancel.includes(seatNo)) {
      if (selectedSeatsToCancel.length === 1) {
        setErrorMsg('You must select at least one seat to cancel.');
        return;
      }
      setSelectedSeatsToCancel(selectedSeatsToCancel.filter(s => s !== seatNo));
    } else {
      setSelectedSeatsToCancel([...selectedSeatsToCancel, seatNo]);
    }
  };

  // Compute refund preview safely
  const calculateRefundPreview = () => {
    if (!booking || !selectedSeatsToCancel || selectedSeatsToCancel.length === 0) {
      return { refund: 0, fee: 0, pct: 90 };
    }

    const availableSeatsCount = (booking.seatNumbers && booking.seatNumbers.length > 0) ? booking.seatNumbers.length : 1;
    const proportion = Math.min(1, Math.max(0, selectedSeatsToCancel.length / availableSeatsCount));
    const totalAmt = Number(booking.totalAmount) || 0;
    const baseValue = Number((totalAmt * proportion).toFixed(2));

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

    let pct = 90;
    if (diffHours >= 24) pct = 90;
    else if (diffHours >= 12) pct = 75;
    else if (diffHours >= 2) pct = 50;
    else pct = 0;

    const refund = Number(((baseValue * pct) / 100).toFixed(2));
    const fee = Number((baseValue - refund).toFixed(2));

    return { refund, fee, pct };
  };

  const { refund: estimatedRefund, fee: estimatedFee, pct: refundPercentage } = calculateRefundPreview();

  const handleExecuteCancellation = () => {
    if (!booking) return;

    if (selectedSeatsToCancel.length === 0) {
      setErrorMsg('Please select at least one seat to cancel.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = dbSimulator.cancelBooking(booking.pnr, selectedSeatsToCancel, reason);
      setIsProcessing(false);

      if (res.success && res.cancellation) {
        setCancellationResult(res.cancellation);
        onCancellationComplete?.(res.cancellation);
      } else {
        setErrorMsg(res.message || 'Failed to process cancellation.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Error occurred while executing cancellation.');
    }
  };

  const handleResetModal = () => {
    setBooking(null);
    setPnrInput('');
    setCancellationResult(null);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Ticket Cancellation & Refund Portal
              </h3>
              <p className="text-xs text-slate-400">
                Guardian Travels Instant Seat Release & Refund Processing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cancellation Success Receipt */}
          {cancellationResult ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                  REFUND PROCESSED
                </span>
                <h4 className="text-xl font-bold text-white mt-2">
                  Cancellation Confirmed
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Seats have been released back to real-time seat inventory.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cancellation Reference:</span>
                  <span className="font-mono font-bold text-white">{cancellationResult.cancellationId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PNR Number:</span>
                  <span className="font-mono font-bold text-emerald-400">{cancellationResult.pnr || booking?.pnr || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cancelled Seats:</span>
                  <span className="font-bold text-white">
                    {Array.isArray(cancellationResult.cancelledSeats) ? cancellationResult.cancelledSeats.join(', ') : 'Seats released'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Original Amount:</span>
                  <span className="font-mono text-white">₹{Number(cancellationResult.originalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cancellation Fee Deducted:</span>
                  <span className="font-mono text-rose-400">-₹{Number(cancellationResult.cancellationFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                  <span className="text-white">Net Refund Amount:</span>
                  <span className="font-mono text-emerald-400 text-base">
                    ₹{Number(cancellationResult.refundAmount || 0).toFixed(2)} ({cancellationResult.refundPercentage || 0}%)
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 text-slate-500 font-mono">
                  <span>Txn Reference:</span>
                  <span>{cancellationResult.refundTransactionId || 'TXN-COMPLETED'}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel Another Ticket
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: PNR Search */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ENTER BOOKING PNR
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. GT9842105"
                      value={pnrInput}
                      onChange={(e) => setPnrInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase tracking-wider outline-none focus:border-rose-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Find Booking
                  </button>
                </div>
              </div>

              {/* Step 2: Booking Details Found */}
              {booking && (
                <div className="space-y-4">
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-mono text-emerald-400 font-bold">PNR: {booking.pnr}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        booking.status === 'CANCELLED' || booking.bookingStatus === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {booking.status || 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[10px]">ROUTE</span>
                        <span className="font-semibold">{booking.source || ''} ➔ {booking.destination || ''}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">DATE & TIME</span>
                        <span className="font-semibold">{booking.journeyDate || booking.travelDate || ''} • {booking.departureTime || ''}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">PASSENGER NAME</span>
                        <span>{booking.passengerName || 'Traveler'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">TOTAL AMOUNT PAID</span>
                        <span className="font-bold text-white">₹{Number(booking.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Selection for Cancellation */}
                  {booking.status !== 'CANCELLED' && booking.bookingStatus !== 'cancelled' && (
                    <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white">
                          Select Seat(s) to Cancel:
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {selectedSeatsToCancel.length} of {booking.seatNumbers?.length || 1} Selected
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(booking.seatNumbers || []).map((seatNo) => {
                          const isChecked = selectedSeatsToCancel.includes(seatNo);
                          return (
                            <button
                              key={`can-seat-${seatNo}`}
                              type="button"
                              onClick={() => toggleSeatSelection(seatNo)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isChecked
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>Seat {seatNo}</span>
                              {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Reason */}
                      <div className="pt-2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Cancellation Reason
                        </label>
                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none focus:border-rose-500 cursor-pointer"
                        >
                          <option value="Change of travel plan">Change of travel plan</option>
                          <option value="Emergency or sickness">Emergency or sickness</option>
                          <option value="Booking error / duplicate booking">Booking error / duplicate booking</option>
                          <option value="Found alternative transit">Found alternative transit</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Refund Calculator Card */}
                      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-300">Guardian Refund Slab:</span>
                          <span className="text-emerald-400 font-bold">{refundPercentage}% Refund</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Cancellation Fee:</span>
                            <span className="font-mono text-rose-400 font-semibold">₹{Number(estimatedFee || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Net Credit Refund:</span>
                            <span className="font-mono text-emerald-400 text-base font-black">₹{Number(estimatedRefund || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-tight">
                          Refund is instantly approved and processed to the original payment source.
                        </p>
                      </div>

                      {/* Submit Action */}
                      <button
                        type="button"
                        onClick={handleExecuteCancellation}
                        disabled={isProcessing}
                        className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Processing Cancellation & Refund...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            Confirm Cancellation & Process ₹{Number(estimatedRefund || 0).toFixed(2)} Refund
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Policy Explanation */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Guardian Travels Official Cancellation Policy
                </h5>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400">
                  <li><strong>&gt; 24 Hours before departure:</strong> 90% refund (10% penalty)</li>
                  <li><strong>12 to 24 Hours before departure:</strong> 75% refund (25% penalty)</li>
                  <li><strong>2 to 12 Hours before departure:</strong> 50% refund (50% penalty)</li>
                  <li><strong>Less than 2 Hours:</strong> Non-refundable</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
