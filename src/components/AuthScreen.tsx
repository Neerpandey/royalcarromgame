import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Phone, Mail, Lock, User, ShieldCheck, Sparkles, ArrowRight, KeyRound, CheckCircle2, LogIn, MessageSquare } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; email: string; avatar: string; phone?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupStep, setSignupStep] = useState<'phone' | 'otp' | 'details'>('phone');
  
  // Form fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👑');
  
  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpToast, setOtpToast] = useState<string | null>(null);
  
  // Login method toggle
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const avatars = ['👑', '🦁', '🗡️', '🛡️', '⚡', '💎', '🔥', '🦅'];

  // Handle Send OTP (Phone Verification)
  const handleSendOtp = (targetPhone: string) => {
    if (!targetPhone || targetPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      soundManager.playFoulSound();
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    soundManager.playButtonClick();

    setTimeout(() => {
      // Generate fake 6 digit OTP
      const fakeOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fakeOtp);
      setIsLoading(false);
      setSignupStep('otp');

      // Premium OTP Toast notification with atomic fill trigger
      setOtpToast(`👑 Premium OTP: ${fakeOtp}`);
      soundManager.playWinFanfare();

      // Atomic fill after 800ms for magical smooth UX
      setTimeout(() => {
        setEnteredOtp(fakeOtp);
        soundManager.playPlacementTick();

        // Auto verify after 500ms once atomic fill completes
        setTimeout(() => {
          if (isSignUp) {
            setSignupStep('details');
            soundManager.playWinFanfare();
            setOtpToast(null);
          } else {
            const user = {
              name: 'Striker ' + loginPhone.slice(-4),
              email: loginPhone + '@royal.in',
              avatar: '👑',
              phone: loginPhone,
            };
            saveAndComplete(user);
          }
        }, 500);
      }, 800);
    }, 600);
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    if (enteredOtp !== generatedOtp) {
      setErrorMsg('Invalid OTP code. Please check atomic fill.');
      soundManager.playFoulSound();
      return;
    }
    setErrorMsg('');
    soundManager.playButtonClick();
    if (isSignUp) {
      setSignupStep('details');
    } else {
      // Phone login success
      const user = {
        name: 'Striker ' + loginPhone.slice(-4),
        email: loginPhone + '@royal.in',
        avatar: '👑',
        phone: loginPhone,
      };
      saveAndComplete(user);
    }
  };

  // Finalize Signup with Email, Name, Password
  const handleCompleteSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all profile details.');
      soundManager.playFoulSound();
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      soundManager.playFoulSound();
      return;
    }

    const newUser = { name: name.trim(), email: email.trim(), avatar, phone };
    
    // Save to localStorage users database
    try {
      const existingUsers = JSON.parse(localStorage.getItem('royal_carrom_users') || '[]');
      existingUsers.push({ ...newUser, password });
      localStorage.setItem('royal_carrom_users', JSON.stringify(existingUsers));
    } catch (err) {
      console.error(err);
    }

    saveAndComplete(newUser);
  };

  // Handle Email Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter email and password.');
      soundManager.playFoulSound();
      return;
    }

    try {
      const existingUsers = JSON.parse(localStorage.getItem('royal_carrom_users') || '[]');
      const found = existingUsers.find((u: any) => u.email === loginEmail.trim() && u.password === loginPassword);
      
      if (found) {
        saveAndComplete({ name: found.name, email: found.email, avatar: found.avatar || '👑', phone: found.phone });
      } else {
        // Fallback default login if user doesn't exist yet
        const defaultUser = {
          name: loginEmail.split('@')[0] || 'Maharaja User',
          email: loginEmail.trim(),
          avatar: '👑',
        };
        saveAndComplete(defaultUser);
      }
    } catch {
      saveAndComplete({ name: 'Maharaja User', email: loginEmail, avatar: '👑' });
    }
  };

  const saveAndComplete = (user: { name: string; email: string; avatar: string; phone?: string }) => {
    soundManager.playWinFanfare();
    try {
      localStorage.setItem('royal_carrom_current_user', JSON.stringify(user));
      // Also update legacy profile
      localStorage.setItem('royal_carrom_profile', JSON.stringify({
        name: user.name,
        avatar: user.avatar,
        score: 0,
        queens: 0,
        gamesPlayed: 0,
        gamesWon: 0,
      }));
    } catch (e) {
      console.error(e);
    }
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080c] px-4 overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#ffdf73]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Premium OTP Notification Toast */}
      <AnimatePresence>
        {otpToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#1b1c24] to-[#2a2212] border-2 border-[#d4af37] shadow-[0_10px_30px_rgba(212,175,55,0.4)]"
          >
            <div className="p-2 rounded-xl bg-[#d4af37]/20 text-[#ffdf73]">
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold">Secure Gateway</div>
              <div className="text-sm font-black text-white">{otpToast}</div>
            </div>
            <button 
              onClick={() => setOtpToast(null)}
              className="ml-4 text-gray-400 hover:text-white text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-[#13151f] via-[#0d0e15] to-[#0a0a0f] border-2 border-[#d4af37]/40 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(212,175,55,0.08)] backdrop-blur-xl"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8022] p-0.5 shadow-[0_0_25px_rgba(212,175,55,0.5)] mb-4 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#0c0d12] flex items-center justify-center">
              <Crown className="w-8 h-8 text-[#ffdf73]" />
            </div>
          </div>
          <h1 className="font-royal text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f3e5ab] via-[#ffdf73] to-[#d4af37] tracking-wider mb-1">
            ROYAL ARCADE
          </h1>
          <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">
            {isSignUp ? 'Create Your Maharaja Account' : 'Welcome Back, Striker'}
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-bold"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* LOGIN FORM */}
        {!isSignUp ? (
          <div className="space-y-6">
            <div className="flex rounded-xl bg-[#1b1c24] p-1 border border-[#d4af37]/20">
              <button
                onClick={() => { setLoginMethod('email'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-300 ${
                  loginMethod === 'email' ? 'bg-[#d4af37] text-[#0a0a0f] shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                EMAIL LOGIN
              </button>
              <button
                onClick={() => { setLoginMethod('phone'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-300 ${
                  loginMethod === 'phone' ? 'bg-[#d4af37] text-[#0a0a0f] shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                PHONE OTP
              </button>
            </div>

            {loginMethod === 'email' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="maharaja@royal.in"
                      className="w-full bg-[#1b1c24] border border-[#d4af37]/30 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1b1c24] border border-[#d4af37]/30 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#0a0a0f] font-black text-sm tracking-wider shadow-[0_10px_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  SIGN IN
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-[#1b1c24] border border-[#d4af37]/30 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSendOtp(loginPhone)}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#0a0a0f] font-black text-sm tracking-wider shadow-[0_10px_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  SEND PREMIUM OTP
                </button>

                {generatedOtp && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#ffdf73] uppercase tracking-wider mb-1.5">Enter 6-Digit OTP (Atomic Auto-filled)</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        className="w-full bg-[#1b1c24] border-2 border-[#d4af37] rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-black text-white focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-sm tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      VERIFY & LOGIN
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => { setIsSignUp(true); setSignupStep('phone'); setErrorMsg(''); }}
                className="text-xs text-gray-400 hover:text-[#ffdf73] transition font-bold"
              >
                Don't have an account? <span className="text-[#d4af37] underline">Sign Up</span>
              </button>
            </div>
          </div>
        ) : (
          /* SIGN UP FLOW */
          <div className="space-y-6">
            {signupStep === 'phone' && (
              <div className="space-y-4">
                <div className="text-xs text-[#ffdf73] font-bold text-center mb-2">Step 1 of 3: Mobile Number Verification</div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-[#1b1c24] border border-[#d4af37]/30 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSendOtp(phone)}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#0a0a0f] font-black text-sm tracking-wider shadow-[0_10px_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  SEND OTP
                </button>
              </div>
            )}

            {signupStep === 'otp' && (
              <div className="space-y-4">
                <div className="text-xs text-[#ffdf73] font-bold text-center mb-2">Step 2 of 3: Verify OTP (Atomic Auto-filled)</div>
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full bg-[#1b1c24] border-2 border-[#d4af37] rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black text-white focus:outline-none shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#0a0a0f] font-black text-sm tracking-wider shadow-[0_10px_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  VERIFY OTP
                </button>
              </div>
            )}

            {signupStep === 'details' && (
              <form onSubmit={handleCompleteSignup} className="space-y-4">
                <div className="text-xs text-[#ffdf73] font-bold text-center mb-2">Step 3 of 3: Complete Profile Details</div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Maharaja Striker"
                      className="w-full bg-[#1b1c24] border border-[#d4af37]/30 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="maharaja@royal.in"
                      className="w-full bg-[#1b1c24] border border-[#d4af37]/30 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1b1c24] border border-[#d4af37]/30 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Choose Avatar</label>
                  <div className="grid grid-cols-4 gap-2">
                    {avatars.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setAvatar(av)}
                        className={`p-2 rounded-xl text-xl border transition flex items-center justify-center ${
                          avatar === av ? 'bg-[#d4af37]/20 border-[#d4af37] scale-105' : 'bg-[#1b1c24] border-gray-800 hover:border-[#d4af37]/50'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#0a0a0f] font-black text-sm tracking-wider shadow-[0_10px_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  COMPLETE SIGN UP
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                className="text-xs text-gray-400 hover:text-[#ffdf73] transition font-bold"
              >
                Already have an account? <span className="text-[#d4af37] underline">Sign In</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
