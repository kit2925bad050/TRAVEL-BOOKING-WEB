import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, ShieldCheck, MapPin, Award, Edit3, CheckCircle2, Clock, Ticket } from 'lucide-react';
import { Passenger, Booking } from '../types';

interface ProfileViewProps {
  currentUser: Passenger | null;
  userBookings: Booking[];
  onUpdateProfile?: (updatedUser: Partial<Passenger>) => void;
  onNavigateToTrips?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  userBookings,
  onUpdateProfile,
  onNavigateToTrips
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalSpent = (userBookings || []).reduce((sum, b) => sum + (b?.totalAmount || 0), 0);
  const activeBookings = (userBookings || []).filter(b => b && (b.status === 'CONFIRMED' || b.bookingStatus === 'confirmed'));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({ fullName, phone, email });
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Guardian Tier: Gold Traveler
            </span>
          </div>
        </div>

        <div className="px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white border-4 border-white shadow-xl flex items-center justify-center font-black text-3xl">
                {currentUser?.fullName?.charAt(0) || 'G'}
              </div>
              <div className="mb-2">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {currentUser?.fullName || 'Guest Traveler'}
                  {(currentUser?.isAdmin || currentUser?.role === 'admin') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Admin</span>
                  )}
                </h2>
                <p className="text-xs text-slate-500">{currentUser?.email || 'guest@guardiantravels.in'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Profile changes saved successfully!
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Save Profile Information
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{currentUser?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{currentUser?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>KYC & Mobile Verified</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Travel Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
          <p className="text-xl font-black text-slate-900 mt-1">{userBookings.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Trips with Guardian</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming Trips</p>
          <p className="text-xl font-black text-blue-600 mt-1">{activeBookings.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Confirmed boarding passes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spent</p>
          <p className="text-xl font-black text-emerald-600 mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Indian Rupees (INR)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Insurance Enrolled</p>
          <p className="text-xl font-black text-purple-600 mt-1">
            {userBookings.filter(b => b.insuranceOpted).length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Insured journeys</p>
        </div>
      </div>
    </div>
  );
};
