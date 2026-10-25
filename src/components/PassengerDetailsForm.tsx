import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Tag, ShieldCheck, CreditCard, ArrowLeft, CheckCircle2, Shield, AlertCircle, Sparkles, Phone, Mail } from 'lucide-react';
import { Bus, Seat, Passenger, BookedPassenger } from '../types';

interface PassengerDetailsFormProps {
  bus: Bus;
  selectedSeats: Seat[];
  currentUser: Passenger | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (data: {
    passengers: BookedPassenger[];
    boardingPoint: string;
    droppingPoint: string;
    totalAmount: number;
    baseFare: number;
    taxes: number;
    insuranceOpted: boolean;
    insuranceFee: number;
  }) => void;
}

export const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({
  bus,
  selectedSeats,
  currentUser,
  isOpen,
  onClose,
  onConfirmBooking
}) => {
  const [passengers, setPassengers] = useState<BookedPassenger[]>([]);
  const [boardingPoint, setBoardingPoint] = useState(bus.boardingPoints[0] || bus.source);
  const [droppingPoint, setDroppingPoint] = useState(bus.droppingPoints[0] || bus.destination);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [insuranceOpted, setInsuranceOpted] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setContactEmail(currentUser.email || '');
      setContactPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedSeats.length > 0) {
      setPassengers(
        selectedSeats.map((seat, index) => ({
          seatNumber: seat.seatNumber,
          name: index === 0 && currentUser ? currentUser.fullName : '',
          age: index === 0 && currentUser ? currentUser.age : 28,
          gender: index === 0 && currentUser ? (currentUser.gender as 'Male' | 'Female' | 'Other') : 'Male',
          fare: seat.price || seat.fare || bus.baseFare
        }))
      );
    }
  }, [selectedSeats, currentUser, bus.baseFare]);

  if (!isOpen) return null;

  const handlePassengerChange = (index: number, field: keyof BookedPassenger, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const baseFare = selectedSeats.reduce((acc, seat) => acc + (seat.price || seat.fare || bus.baseFare), 0);
  const gstRate = 0.05;
  const taxes = Math.round(baseFare * gstRate);
  const insurancePerPax = 29;
  const insuranceFee = insuranceOpted ? passengers.length * insurancePerPax : 0;
  const grandTotal = baseFare + taxes + insuranceFee;

  const validateAndProceed = () => {
    const errors: Record<string, string> = {};
    if (!contactEmail || !contactEmail.includes('@')) {
      errors.email = 'Please provide a valid contact email';
    }
    if (!contactPhone || contactPhone.trim().length < 10) {
      errors.phone = 'Valid 10-digit mobile number required';
    }

    passengers.forEach((p, idx) => {
      if (!p.name.trim()) {
        errors[`name_${idx}`] = `Passenger ${idx + 1} name is required`;
      }
      if (!p.age || p.age < 1 || p.age > 120) {
        errors[`age_${idx}`] = `Valid age required for passenger ${idx + 1}`;
      }
    });

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      if (isSubmitting) return;
      setIsSubmitting(true);
      onConfirmBooking({
        passengers,
        boardingPoint,
        droppingPoint,
        totalAmount: grandTotal,
        baseFare,
        taxes,
        insuranceOpted,
        insuranceFee
      });
      // Reset submitting status after brief delay in case form remains open
      setTimeout(() => setIsSubmitting(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-600 px-2 py-0.5 rounded text-white">Step 2 of 3</span>
              <h2 className="text-lg font-bold">Passenger Details & Travel Insurance</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {bus.busName} • {bus.source} → {bus.destination} • {selectedSeats.length} {selectedSeats.length > 1 ? 'Seats' : 'Seat'} selected ({selectedSeats.map(s => s.seatNumber).join(', ')})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">

          {/* Contact Details Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Contact Information (Ticket will be dispatched here)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="traveler@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Boarding and Dropping Points */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Select Boarding & Dropping Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Boarding Point ({bus.source})</label>
                <select
                  value={boardingPoint}
                  onChange={(e) => setBoardingPoint(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {bus.boardingPoints.map((bp, idx) => (
                    <option key={idx} value={bp}>
                      {bp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dropping Point ({bus.destination})</label>
                <select
                  value={droppingPoint}
                  onChange={(e) => setDroppingPoint(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {bus.droppingPoints.map((dp, idx) => (
                    <option key={idx} value={dp}>
                      {dp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Passenger Details
            </h3>

            {passengers.map((passenger, index) => (
              <div key={passenger.seatNumber} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </span>
                    Passenger {index + 1}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-900 text-white rounded-md">
                    Seat: {passenger.seatNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formErrors[`name_${index}`] && (
                      <p className="text-xs text-red-500 mt-1">{formErrors[`name_${index}`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Age *</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={passenger.age || ''}
                      onChange={(e) => handlePassengerChange(index, 'age', parseInt(e.target.value) || 0)}
                      placeholder="28"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formErrors[`age_${index}`] && (
                      <p className="text-xs text-red-500 mt-1">{formErrors[`age_${index}`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                    <div className="flex gap-2">
                      {(['Male', 'Female', 'Other'] as const).map((genderOption) => (
                        <button
                          key={genderOption}
                          type="button"
                          onClick={() => handlePassengerChange(index, 'gender', genderOption)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${
                            passenger.gender === genderOption
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {genderOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TRAVEL INSURANCE OPT-IN SECTION */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Guardian Protect Comprehensive Travel Insurance</h4>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Powered by Guardian Travel Assist • 24x7 Roadside & Medical Emergency Assistance across Indian National Highways
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Emergency Medical: <strong>₹3,00,000</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Accidental Cover: <strong>₹6,00,000</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Baggage Loss: <strong>₹10,000</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opt-in Toggle */}
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-slate-900">₹{insurancePerPax} <span className="text-xs font-normal text-slate-500">/ person</span></div>
                <div className="text-xs text-emerald-700 font-semibold mb-2">Total: ₹{passengers.length * insurancePerPax}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={insuranceOpted}
                  onChange={(e) => setInsuranceOpted(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Yes, secure my travel with Guardian Protect Travel Insurance for ₹{insurancePerPax} per passenger
                </span>
              </label>

              {!insuranceOpted && (
                <span className="text-[11px] text-amber-700 font-medium">
                  ⚠️ Travelling without insurance cover
                </span>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Fare Breakdown</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
                <span className="font-semibold text-slate-800">₹{baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Integrated GST & Highway Tolls (5%)</span>
                <span className="font-semibold text-slate-800">₹{taxes.toLocaleString('en-IN')}</span>
              </div>
              {insuranceOpted ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Guardian Protect Travel Insurance ({passengers.length} × ₹{insurancePerPax})
                  </span>
                  <span className="font-semibold">₹{insuranceFee}</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>Travel Insurance</span>
                  <span>Not opted</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-blue-600 font-black text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Seat Selection
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Payable</p>
              <p className="text-lg font-black text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</p>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={validateAndProceed}
              className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-[0.98] text-sm ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {isSubmitting ? 'Confirming Ticket...' : 'Proceed to Booking Confirmation'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
