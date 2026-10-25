import React, { useState } from 'react';
import { UserCheck, KeyRound, LogIn, UserPlus, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight, Sparkles, Navigation, Bus, Clock, Shield, Award, Users, HeartHandshake } from 'lucide-react';
import { Passenger } from '../types';
import { dbSimulator } from '../services/dbSimulator';

interface SignInPageProps {
  currentUser: Passenger | null;
  onUserChange: (user: Passenger | null) => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  onNavigateBook: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  currentUser,
  onUserChange,
  onNavigateHome,
  onNavigateAdmin,
  onNavigateBook
}) => {
  // Portal Tab: 'user' (Traveler) vs 'admin' (Fleet Ops)
  const [activePortal, setActivePortal] = useState<'user' | 'admin'>('user');
  
  // User Mode: 'login' vs 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState(currentUser && !currentUser.isAdmin ? currentUser.fullName : '');
  const [loginPassword, setLoginPassword] = useState('travel2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration Form States
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Admin Login States
  const [adminEmail, setAdminEmail] = useState('admin@guardiantravels.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Notification States
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 10) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };
  const regStrength = getPasswordStrength(regPassword);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = loginIdentifier.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your username, email, or full name.');
      return;
    }

    const res = dbSimulator.loginPassenger(trimmed);
    if (res.success && res.passenger) {
      setSuccessMsg(`Welcome, ${res.passenger.fullName}! You are now signed in.`);
      onUserChange(res.passenger);
      setTimeout(() => {
        onNavigateHome();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleGuestLogin = () => {
    const guestName = 'Traveler ' + Math.floor(100 + Math.random() * 900);
    const res = dbSimulator.loginPassenger(guestName);
    if (res.success && res.passenger) {
      setSuccessMsg(`Signed in as Guest: ${res.passenger.fullName}`);
      onUserChange(res.passenger);
      setTimeout(() => {
        onNavigateHome();
      }, 600);
    }
  };

  const handleUserRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }
    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    const res = dbSimulator.registerPassenger({
      fullName: regFullName.trim(),
      username: regUsername.trim() || regFullName.trim().toLowerCase().replace(/\s+/g, ''),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      age: 26,
      gender: 'Male',
      city: 'Bangalore'
    });

    if (res.success && res.passenger) {
      setSuccessMsg(`Welcome, ${res.passenger.fullName}! Account created.`);
      onUserChange(res.passenger);
      setTimeout(() => {
        onNavigateHome();
      }, 800);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = dbSimulator.loginAdmin(adminPassword.trim());
    if (res.success && res.admin) {
      setSuccessMsg(res.message);
      onUserChange(res.admin);
      setTimeout(() => {
        onNavigateAdmin();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleOneClickAdmin = () => {
    const res = dbSimulator.loginAdmin('admin123');
    if (res.success && res.admin) {
      setSuccessMsg('Logged in as Fleet Operations Administrator!');
      onUserChange(res.admin);
      setTimeout(() => {
        onNavigateAdmin();
      }, 600);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 animate-in fade-in duration-200">
      {/* Active User Notice Banner if already logged in */}
      {currentUser && (
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
              currentUser.isAdmin ? 'bg-amber-600' : 'bg-slate-900'
            }`}>
              {currentUser.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Currently Signed In As</span>
              <strong className="text-slate-900 text-sm font-bold block">{currentUser.fullName}</strong>
              <span className="text-slate-500 text-[11px]">{currentUser.email} • {currentUser.isAdmin ? 'Fleet Operations Admin' : 'Passenger Account'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => currentUser.isAdmin ? onNavigateAdmin() : onNavigateHome()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Go to {currentUser.isAdmin ? 'Operations Dashboard' : 'Travel Dashboard'} ➔
            </button>
            <button
              onClick={() => {
                dbSimulator.setCurrentUser(null);
                onUserChange(null);
                setSuccessMsg('Signed out successfully.');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-rose-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Switch Account
            </button>
          </div>
        </div>
      )}

      {/* Main Split Authentication Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* LEFT COLUMN: VISUAL TRAVEL BRANDING */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative geometric background elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block">
                  GUARDIAN <span className="text-emerald-400 font-normal">TRAVELS</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                  Intercity Coach Network
                </span>
              </div>
            </div>

            <div className="pt-8">
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase block">
                PREMIUM PASSENGER EXPERIENCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
                Travel Smarter.<br />Travel Safer.
              </h2>
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                Your journey begins here. Direct express coaches, live radar GPS telemetry, verified driver contacts, and instant cashless refunds.
              </p>
            </div>
          </div>

          {/* Middle Travel Features List */}
          <div className="relative z-10 py-8 space-y-3 text-xs text-slate-300 border-y border-slate-800/80 my-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <span>Live highway coach tracking with real-time ETA</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>₹5,00,000 Guardian Protect travel insurance cover</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span>99.4% on-time departures across South & West India</span>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="relative z-10 text-[11px] text-slate-400">
            <span>24x7 Commuter Support: <strong>1800-425-9900</strong></span>
            <div className="text-[10px] text-slate-500 mt-1">
              &copy; 2026 Guardian Travels Line. All rights reserved.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION CARD */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Portal Tab Switcher (Passenger vs Admin) */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setActivePortal('user'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activePortal === 'user'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Passenger Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActivePortal('admin'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activePortal === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Fleet Operations HQ</span>
                </button>
              </div>

              {activePortal === 'user' && (
                <div className="text-xs font-bold text-slate-600">
                  {authMode === 'login' ? (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-sky-600 hover:underline cursor-pointer"
                    >
                      New user? Register
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-sky-600 hover:underline cursor-pointer"
                    >
                      Have account? Sign In
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2 font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CASE 1: PASSENGER LOGIN */}
            {activePortal === 'user' && authMode === 'login' && (
              <div className="mt-6 space-y-5">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Welcome back</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sign in to manage bookings, track buses, or reserve tickets.
                  </p>
                </div>

                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Username / Email / Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. Rahul Sharma or Elayanithish"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold outline-none focus:border-sky-500 focus:bg-white transition-all shadow-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Your display name will appear on boarding passes, tickets, and top navigation.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('For this demo, you can enter any name or password to log in instantly!')}
                        className="text-[11px] text-sky-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono outline-none focus:border-sky-500 focus:bg-white transition-all shadow-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                      />
                      <span>Remember this browser</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-lg shadow-slate-900/20 cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>SIGN IN AS &ldquo;{loginIdentifier.trim() || 'PASSENGER'}&rdquo;</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>

                  <div className="relative my-4 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-3 text-[11px] uppercase font-bold text-slate-400">
                      OR
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Continue as Guest Passenger</span>
                  </button>
                </form>
              </div>
            )}

            {/* CASE 2: PASSENGER REGISTRATION */}
            {activePortal === 'user' && authMode === 'register' && (
              <div className="mt-6 space-y-5">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Create passenger profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Register once to access digital tickets, fast checkout, and loyalty discounts.
                  </p>
                </div>

                <form onSubmit={handleUserRegister} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">FULL NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elayanithish"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">MOBILE NUMBER *</label>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">PASSWORD</label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">CONFIRM PASSWORD</label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Password strength bar */}
                  {regPassword && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Password strength:</span>
                        <span className="font-bold">{regStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${regStrength.color} transition-all`}
                          style={{ width: `${(regStrength.score / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-lg shadow-slate-900/20 cursor-pointer transition-all mt-3"
                  >
                    CREATE ACCOUNT & SIGN IN
                  </button>
                </form>
              </div>
            )}

            {/* CASE 3: ADMIN FLEET OPERATIONS LOGIN */}
            {activePortal === 'admin' && (
              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                      RESTRICTED OPERATIONS
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">Fleet Operations Hub</h3>
                  <p className="text-xs text-slate-500">
                    Real-time coach tracking, dispatch control, passenger manifests, and cancellations audit.
                  </p>
                </div>

                <form onSubmit={handleAdminSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      ADMIN EMAIL *
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      ADMIN PASSWORD *
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono outline-none focus:border-amber-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Default demo password: <code>admin123</code></span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-sm rounded-xl shadow-lg cursor-pointer transition-all"
                    >
                      LOGIN TO FLEET HQ
                    </button>

                    <button
                      type="button"
                      onClick={handleOneClickAdmin}
                      className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>⚡ 1-Click Instant Admin Access</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Quick preset passenger profiles picker */}
          <div className="pt-6 border-t border-slate-200 mt-6">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Demo Quick Profile Switcher:
            </span>
            <div className="flex flex-wrap gap-2">
              {dbSimulator.getAllPassengers().slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    dbSimulator.setCurrentUser(p);
                    onUserChange(p);
                    setSuccessMsg(`Switched to profile: ${p.fullName}`);
                    setLoginIdentifier(p.fullName);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{p.fullName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
