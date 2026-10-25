import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Shield,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Bus,
  Sparkles,
  Award,
  ChevronLeft
} from 'lucide-react';
import { Passenger } from '../types';
import { dbSimulator } from '../services/dbSimulator';

interface WelcomeAuthPageProps {
  onLoginSuccess: (user: Passenger, role: 'user' | 'admin') => void;
}

type AuthScreen = 'welcome-choice' | 'user-login' | 'user-register' | 'admin-login';

export const WelcomeAuthPage: React.FC<WelcomeAuthPageProps> = ({ onLoginSuccess }) => {
  const [screen, setScreen] = useState<AuthScreen>('welcome-choice');

  // User Login State
  const [userIdentifier, setUserIdentifier] = useState('');
  const [userPassword, setUserPassword] = useState('pass123');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // User Register State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status & Error Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle User Login
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = userIdentifier.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your Username, Email, or Phone.');
      return;
    }

    const res = dbSimulator.loginPassenger(trimmed);
    if (res.success && res.passenger) {
      setSuccessMsg(`Welcome, ${res.passenger.fullName}! Connecting to User Dashboard...`);
      setTimeout(() => {
        onLoginSuccess(res.passenger!, 'user');
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Quick Demo User Login
  const handleDemoUserLogin = (name: string) => {
    setUserIdentifier(name);
    const res = dbSimulator.loginPassenger(name);
    if (res.success && res.passenger) {
      setSuccessMsg(`Logged in as ${res.passenger.fullName}`);
      setTimeout(() => {
        onLoginSuccess(res.passenger!, 'user');
      }, 400);
    }
  };

  // Handle User Registration
  const handleUserRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setErrorMsg('Please provide your Full Name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Please provide a valid Email Address.');
      return;
    }
    if (!regPhone.trim() || regPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const res = dbSimulator.registerPassenger({
      fullName: regFullName,
      username: regUsername || regFullName.toLowerCase().replace(/\s+/g, ''),
      email: regEmail,
      phone: regPhone,
      age: 26,
      gender: 'Male',
      city: 'Salem'
    });

    if (res.success) {
      setSuccessMsg(`Registration successful! Welcome to Guardian Travels. Please log in.`);
      // Return to user login screen per Section 5
      setTimeout(() => {
        setUserIdentifier(regFullName);
        setScreen('user-login');
        setSuccessMsg('Account created. Enter your password to continue.');
      }, 900);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Handle Admin Login (Enforces database role per Section 6)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Query MySQL/Simulator database for users with role = 'ADMIN'
    const res = dbSimulator.loginAdmin(adminPassword);
    if (res.success && res.admin) {
      // Double check role authorization from database
      if (res.admin.isAdmin || res.admin.role === 'admin') {
        setSuccessMsg(`Admin verified: Welcome, ${res.admin.fullName}!`);
        setTimeout(() => {
          onLoginSuccess(res.admin!, 'admin');
        }, 500);
      } else {
        setErrorMsg('Access Denied: This account does not possess ADMIN permissions in the database.');
      }
    } else {
      setErrorMsg('Invalid Admin credentials. (Default demo password is: admin123)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Decorative Ambient Layers */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* BRAND HERO SECTION (Left Column) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  GUARDIAN TRAVELS
                </h1>
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                  Travel Smarter. Travel Safer.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-full">
                Commercial Transport Network
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Intercity Bus Booking & Live Fleet Tracking
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seamless real-time connectivity between MySQL database, passenger bookings, automated QR tickets, and live highway telemetry.
              </p>
            </div>
          </div>

          {/* Operational Trust Indicators */}
          <div className="pt-8 mt-6 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct database synchronization</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Live GPS speed governors & driver contact</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Guardian Protect comprehensive insurance</span>
            </div>
          </div>
        </div>

        {/* AUTH WORKSPACE (Right Column) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/90">
          
          {/* Messages */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. WELCOME CHOICE SCREEN (First Screen per Spec) */}
          {screen === 'welcome-choice' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Welcome to Guardian Travels
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  How would you like to continue today?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: USER */}
                <div
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setScreen('user-login');
                  }}
                  className="p-6 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/60 cursor-pointer transition-all group flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        USER PORTAL
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Book buses, manage trips and track your journey.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <span>Continue as User</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Option 2: ADMIN */}
                <div
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setScreen('admin-login');
                  }}
                  className="p-6 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 cursor-pointer transition-all group flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        ADMIN PORTAL
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Manage buses, schedules, bookings and operations.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <span>Continue as Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Demo Travelers */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Quick Access Demo Accounts:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoUserLogin('Elayanithish')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    Passenger: Elayanithish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoUserLogin('Rahul Sharma')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    Passenger: Rahul Sharma
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. USER LOGIN SCREEN */}
          {screen === 'user-login' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setScreen('welcome-choice');
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to Welcome Choice
                  </button>
                  <h3 className="text-2xl font-black text-white">Passenger Sign In</h3>
                  <p className="text-xs text-slate-400">Sign in to book buses and view your tickets</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold">
                  User Mode
                </span>
              </div>

              <form onSubmit={handleUserLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Username / Email / Mobile Phone *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={userIdentifier}
                      onChange={(e) => setUserIdentifier(e.target.value)}
                      placeholder="e.g. Elayanithish or elayanithishd@gmail.com"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('For this demo, your password is saved as: pass123')}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showUserPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                    >
                      {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-blue-600"
                    />
                    <span>Remember me on this browser</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  SIGN IN TO USER HOME
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setScreen('user-register');
                    }}
                    className="font-bold text-blue-400 hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* 3. USER REGISTRATION SCREEN */}
          {screen === 'user-register' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setScreen('user-login');
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to User Login
                  </button>
                  <h3 className="text-2xl font-black text-white">Create Passenger Account</h3>
                  <p className="text-xs text-slate-400">Join Guardian Travels for direct bookings</p>
                </div>
              </div>

              <form onSubmit={handleUserRegister} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Sundar Pichai"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="sundarp"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="passenger@example.com"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Phone Number (10 Digits) *</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Password *</label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Confirm Password *</label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition mt-2"
                >
                  CREATE ACCOUNT & RETURN TO LOGIN
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setScreen('user-login')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Already registered? <span className="text-blue-400 font-bold">Sign In here</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. ADMIN LOGIN SCREEN */}
          {screen === 'admin-login' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setScreen('welcome-choice');
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to Welcome Choice
                  </button>
                  <h3 className="text-2xl font-black text-white">Fleet Admin Login</h3>
                  <p className="text-xs text-slate-400">Strictly authorized operations personnel only</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold font-mono">
                  ROLE: ADMIN
                </span>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Admin Username
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="admin123"
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-medium font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Demo Administrator Password: <span className="font-mono text-cyan-400 font-bold">admin123</span>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Shield className="w-4 h-4" />
                  AUTHENTICATE AS ADMIN & OPEN FLEET HQ
                </button>
              </form>

              <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Role-based access enforced by MySQL users table. Only registered users with database role = ADMIN can access Fleet Command.
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
