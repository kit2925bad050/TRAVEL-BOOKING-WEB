import React, { useState, useEffect } from 'react';
import { X, UserPlus, LogIn, UserCheck, CheckCircle2, AlertCircle, ShieldAlert, KeyRound, ShieldCheck } from 'lucide-react';
import { Passenger } from '../types';
import { dbSimulator } from '../services/dbSimulator';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Passenger | null;
  onUserChange: (user: Passenger | null) => void;
  initialMode?: 'user' | 'admin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  initialMode = 'user'
}) => {
  const [mode, setMode] = useState<'user' | 'register' | 'admin'>(initialMode);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | ''>(26);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [city, setCity] = useState('Bangalore');
  const [emergencyContact, setEmergencyContact] = useState('');

  // User Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState(currentUser?.fullName || '');

  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState('admin@guardiantravels.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (currentUser?.fullName && !currentUser.isAdmin) {
      setFullName(currentUser.fullName);
      setLoginIdentifier(currentUser.fullName);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanEmail = email.trim() || `${fullName.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const cleanPhone = phone.trim() || `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    const res = dbSimulator.registerPassenger({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      age: Number(age) || 26,
      gender,
      city: city.trim() || 'Bangalore',
      emergencyContact,
      isAdmin: false
    });

    if (res.success && res.passenger) {
      setSuccessMsg(`Welcome, ${res.passenger.fullName}! Registration completed.`);
      onUserChange(res.passenger);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      const loginRes = dbSimulator.loginPassenger(fullName.trim());
      if (loginRes.success && loginRes.passenger) {
        setSuccessMsg(`Welcome back, ${loginRes.passenger.fullName}!`);
        onUserChange(loginRes.passenger);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    const res = dbSimulator.loginPassenger(loginIdentifier.trim());
    if (res.success && res.passenger) {
      setSuccessMsg(`Logged in successfully as ${res.passenger.fullName}!`);
      onUserChange(res.passenger);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = dbSimulator.loginAdmin(adminPassword.trim());
    if (res.success && res.admin) {
      setSuccessMsg(res.message);
      onUserChange(res.admin);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickSwitch = (p: Passenger) => {
    dbSimulator.setCurrentUser(p);
    onUserChange(p);
    setSuccessMsg(`Active user changed to ${p.fullName}`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const allPassengers = dbSimulator.getAllPassengers().filter(p => !p.isAdmin);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Guardian Travels Authentication Portal
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sign in as a Passenger or access Admin Operations Control
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('user'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'user'
                ? 'bg-slate-900 text-emerald-400 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            User Login
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-slate-900 text-emerald-400 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            User Register
          </button>

          <button
            type="button"
            onClick={() => { setMode('admin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'admin'
                ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-500'
                : 'text-amber-500/80 hover:text-amber-300'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Admin Login
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. USER LOGIN */}
          {mode === 'user' && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enter Your Name or Email Address *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Elayanithish or Nitish"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Whatever name you enter will immediately display on tickets and in the top header.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Sign In as &ldquo;{loginIdentifier.trim() || 'Passenger'}&rdquo;
              </button>
            </form>
          )}

          {/* 2. USER REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elayanithish"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  placeholder="Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                Register & Sign In
              </button>
            </form>
          )}

          {/* 3. ADMIN LOGIN */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Fleet Control & Administrator Access
                </span>
                <p className="text-[11px] text-amber-200/80">
                  Admins can view registered passengers directory, track live GPS locations of all coaches, see driver phone numbers, and inspect all cancellations & refund requests.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Email *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Password *
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default demo password: <code>admin123</code></span>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Sign In as Fleet Administrator
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const res = dbSimulator.loginAdmin('admin123');
                    if (res.success && res.admin) {
                      setSuccessMsg('Logged in as Fleet Operations Administrator!');
                      onUserChange(res.admin);
                      setTimeout(() => onClose(), 600);
                    }
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  ⚡ One-Click Demo Admin Login
                </button>
              </div>
            </form>
          )}

          {/* Quick Switch Profiles (for User mode) */}
          {mode === 'user' && (
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Or Switch to Saved Passenger Profile:
              </span>
              <div className="space-y-1.5">
                {allPassengers.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleQuickSwitch(p)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      currentUser?.id === p.id && !currentUser.isAdmin
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{p.fullName}</span>
                      <span className="text-[10px] text-slate-400 block">{p.email} • {p.city}</span>
                    </div>
                    {currentUser?.id === p.id && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
