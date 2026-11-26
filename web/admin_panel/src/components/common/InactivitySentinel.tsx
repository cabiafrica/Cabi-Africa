import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthContext } from '../../AuthContext';
import axios from 'axios';
import {
  ShieldAlert,
  Clock,
  LogOut,
  CheckCircle2,
  Lock,
  KeyRound,
  Fingerprint,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { isPlatformAuthenticatorAvailable, authenticateWithPasskey } from '../../lib/webauthn';

interface InactivitySentinelProps {
  warningThresholdMs?: number;  // Default 8 minutes (480,000 ms)
  lockThresholdMs?: number;     // Default 10 minutes (600,000 ms)
  evictionThresholdMs?: number; // Default 30 minutes (1,800,000 ms)
}

export const InactivitySentinel: React.FC<InactivitySentinelProps> = ({
  warningThresholdMs = 8 * 60 * 1000,
  lockThresholdMs = 10 * 60 * 1000,
  evictionThresholdMs = 30 * 60 * 1000,
}) => {
  const { logout, isAuthenticated, user } = useAuthContext();
  const [state, setState] = useState<'ACTIVE' | 'WARNING' | 'LOCKED'>('ACTIVE');
  const [warningSeconds, setWarningSeconds] = useState(120);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastBroadcastRef = useRef<number>(0);

  // Check biometric hardware support
  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setPasskeyAvailable);
  }, []);

  // Broadcast channel setup for cross-tab synchronization
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('cabi_admin_auth_channel');
        channelRef.current = channel;

        channel.onmessage = (event) => {
          if (event.data?.type === 'ACTIVITY') {
            lastActivityRef.current = Math.max(lastActivityRef.current, event.data.timestamp || Date.now());
            if (state === 'WARNING') setState('ACTIVE');
          } else if (event.data?.type === 'LOCK') {
            setState('LOCKED');
          } else if (event.data?.type === 'UNLOCK') {
            lastActivityRef.current = Date.now();
            setState('ACTIVE');
          } else if (event.data?.type === 'LOGOUT') {
            logout();
          }
        };

        return () => {
          channel.close();
        };
      }
    } catch (e) {
      console.warn('[InactivitySentinel] BroadcastChannel fallback active.');
    }
  }, [logout, state]);

  const broadcastEvent = useCallback((type: string, data: any = {}) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, ...data });
    }
  }, []);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (state === 'WARNING') {
      setState('ACTIVE');
    }
    const now = Date.now();
    if (now - lastBroadcastRef.current > 15000) {
      lastBroadcastRef.current = now;
      broadcastEvent('ACTIVITY', { timestamp: now });
    }
  }, [state, broadcastEvent]);

  const handleHardEviction = useCallback(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem('cabi_admin_logout_reason', 'inactivity');
      broadcastEvent('LOGOUT', { reason: 'inactivity' });
    } catch (e) {
      // Ignore
    }
    logout();
  }, [isAuthenticated, logout, broadcastEvent]);

  // Activity tracking & tick loop
  useEffect(() => {
    if (!isAuthenticated) return;

    let throttleTimeout: any = null;
    const handleUserEvent = () => {
      if (state !== 'LOCKED') {
        if (!throttleTimeout) {
          throttleTimeout = setTimeout(() => {
            resetActivity();
            throttleTimeout = null;
          }, 1000);
        }
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleUserEvent, { passive: true }));

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const idle = Date.now() - lastActivityRef.current;
        if (idle >= evictionThresholdMs) {
          handleHardEviction();
        } else if (idle >= lockThresholdMs) {
          setState('LOCKED');
          broadcastEvent('LOCK');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;

      if (idle >= evictionThresholdMs) {
        handleHardEviction();
      } else if (idle >= lockThresholdMs) {
        if (state !== 'LOCKED') {
          setState('LOCKED');
          broadcastEvent('LOCK');
        }
      } else if (idle >= warningThresholdMs) {
        if (state === 'ACTIVE') {
          setState('WARNING');
        }
        const remaining = Math.max(0, Math.ceil((lockThresholdMs - idle) / 1000));
        setWarningSeconds(remaining);
      } else {
        if (state === 'WARNING') {
          setState('ACTIVE');
        }
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserEvent));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isAuthenticated, state, warningThresholdMs, lockThresholdMs, evictionThresholdMs, resetActivity, handleHardEviction, broadcastEvent]);

  // Quick Unlock with 6-Digit PIN or Password
  const handleQuickUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!unlockPin.trim()) return;

    setIsUnlocking(true);
    setUnlockError(null);

    try {
      const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.cabi.africa/api';
      await axios.post(`${BACKEND_URL}/auth/webauthn/quick-unlock`, {
        userId: user?.id,
        authSecret: unlockPin.trim(),
        authType: unlockPin.length === 6 && /^\d+$/.test(unlockPin) ? 'pin' : 'password',
      });

      lastActivityRef.current = Date.now();
      setState('ACTIVE');
      setUnlockPin('');
      broadcastEvent('UNLOCK');
    } catch (err: any) {
      setUnlockError(err.response?.data?.message || 'Invalid PIN or password. Try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Touch ID / Face ID Biometric Unlock
  const handleBiometricUnlock = async () => {
    setIsUnlocking(true);
    setUnlockError(null);

    try {
      const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.cabi.africa/api';

      const challengeRes = await axios.post(`${BACKEND_URL}/auth/webauthn/challenge`, {
        identifier: user?.email || user?.id,
      });

      const assertion = await authenticateWithPasskey(challengeRes.data.challenge);

      await axios.post(`${BACKEND_URL}/auth/webauthn/quick-unlock`, {
        userId: user?.id,
        authSecret: assertion.id,
        authType: 'passkey',
      });

      lastActivityRef.current = Date.now();
      setState('ACTIVE');
      broadcastEvent('UNLOCK');
    } catch (err: any) {
      console.warn('[Passkey Unlock]', err);
      setUnlockError(err.message || 'Biometric authentication cancelled or declined. Use your PIN below.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!isAuthenticated) return null;

  // 1. WARNING MODAL (8-10 Minutes Idle)
  if (state === 'WARNING') {
    const minutes = Math.floor(warningSeconds / 60);
    const seconds = warningSeconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
        <div className="relative w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-center text-white">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            Administrative Session Warning
          </h2>

          <p className="text-xs text-gray-300 leading-relaxed mb-5">
            Your administrative console will automatically blur and lock in:
          </p>

          <div className="bg-black/70 border border-amber-500/30 rounded-xl py-3 px-6 mb-6 inline-flex items-center space-x-3 shadow-inner">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-3xl font-extrabold tracking-widest text-amber-400">
              {formattedTime}
            </span>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={resetActivity}
              className="w-full py-3 px-4 bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold rounded-xl shadow-lg shadow-brand-yellow/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Stay Signed In</span>
            </button>

            <button
              type="button"
              onClick={handleHardEviction}
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Now</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ZERO-TRUST SCREEN BLUR LOCK (>= 10 Min Idle)
  if (state === 'LOCKED') {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 animate-fade-in">
        <div className="w-full max-w-md bg-zinc-950 border border-brand-yellow/40 rounded-3xl p-8 shadow-2xl text-center text-white relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-yellow/15 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow mb-5 shadow-lg shadow-brand-yellow/20">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            Console Locked
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Protected against shoulder-surfing after 10 minutes of inactivity.
          </p>

          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 mb-6 flex items-center space-x-3 text-left">
            <img
              src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=FFD700&color=000`}
              alt="Admin"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-yellow/30"
            />
            <div className="truncate flex-1">
              <h4 className="text-sm font-bold text-white truncate">{user?.fullName || 'Administrator'}</h4>
              <p className="text-xs text-brand-yellow truncate">{user?.email}</p>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Institutional Admin</span>
            </div>
          </div>

          {unlockError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{unlockError}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleBiometricUnlock}
              disabled={isUnlocking}
              className="w-full py-3.5 px-4 bg-brand-yellow hover:bg-brand-yellowHover text-black font-extrabold rounded-2xl shadow-xl shadow-brand-yellow/25 transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50"
            >
              {isUnlocking ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Fingerprint className="w-6 h-6" />
              )}
              <span className="text-sm">Unlock with Touch ID / Passkey</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-3 text-[11px] text-gray-500 uppercase tracking-widest font-semibold">or use pin</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <form onSubmit={handleQuickUnlock} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={unlockPin}
                  onChange={(e) => setUnlockPin(e.target.value)}
                  placeholder="Enter 6-digit PIN or password"
                  className="w-full text-center tracking-widest font-mono text-base py-3 px-4 bg-black/70 border border-white/15 rounded-2xl focus:border-brand-yellow text-white outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:text-gray-500"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isUnlocking || !unlockPin.trim()}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl border border-white/10 transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer disabled:opacity-40"
              >
                <KeyRound className="w-4 h-4 text-brand-yellow" />
                <span>Unlock with PIN</span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
            <span>Hard eviction at 30 min idle</span>
            <button
              type="button"
              onClick={handleHardEviction}
              className="text-red-400 hover:text-red-300 font-semibold transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InactivitySentinel;
