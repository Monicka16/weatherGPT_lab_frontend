import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const isPhone = (val: string) => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(val.trim()) && val.trim().length >= 7 && !val.includes('@');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);

    if (!identifier.trim()) {
      setError('Please enter your email or contact number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const input = identifier.trim();
      let authError = null;

      if (isPhone(input)) {
        const { error } = await supabase.auth.signInWithPassword({
          phone: input,
          password: password,
        });
        authError = error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: input,
          password: password,
        });
        authError = error;
      }

      if (authError) {
        throw authError;
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Sign In Error:', err);
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);

    if (!identifier.trim() || isPhone(identifier.trim())) {
      setError('Please enter your registered email address in the input field above to reset your password.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(identifier.trim(), {
        redirectTo: `${window.location.origin}/signin`,
      });

      if (error) throw error;

      setResetMessage('Password reset link sent! Please check your email inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#536B67]/15 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#536B67] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
            W
          </div>
          <h1 className="text-2xl font-bold text-[#263532]">Welcome back</h1>
          <p className="text-xs text-[#5F6F6B]">
            Sign in to access your WeatherGPT intelligence platform.
          </p>
        </div>

        {/* Error / Info messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetMessage && (
          <div className="p-3.5 rounded-xl bg-[#A9C0B5]/30 border border-[#536B67]/20 text-[#536B67] text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#263532]">
              Email or Contact Number
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-[#7B8985]" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or +919876543210"
                className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#263532] placeholder-[#7B8985] focus:outline-none focus:border-[#536B67]"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#263532]">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-[#536B67] hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-[#7B8985]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#263532] placeholder-[#7B8985] focus:outline-none focus:border-[#536B67]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#7B8985] hover:text-[#263532] p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#536B67] hover:bg-[#435754] text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect */}
        <div className="pt-4 border-t border-[#536B67]/10 text-center text-xs text-[#5F6F6B]">
          <span>Don't have an account? </span>
          <Link to="/signup" className="text-[#536B67] font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};