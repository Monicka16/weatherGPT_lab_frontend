import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const PREDEFINED_INTERESTS = [
  'Weather',
  'Technology',
  'Sports',
  'Travel',
  'Agriculture',
  'Environment',
  'Fitness',
  'Research',
];

export const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('Male');
  const [interests, setInterests] = useState<string[]>(['Weather']);
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== item));
      }
    } else {
      setInterests([...interests, item]);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your valid full name.');
      return false;
    }
    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 5 || parsedAge > 120) {
      setError('Please enter a valid age (5 to 120).');
      return false;
    }
    if (!occupation.trim()) {
      setError('Please enter your occupation.');
      return false;
    }
    if (!gender) {
      setError('Please select your gender.');
      return false;
    }
    if (interests.length === 0) {
      setError('Please select at least one interest.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
    if (!contactNumber.trim() || !phoneRegex.test(contactNumber.trim()) || contactNumber.trim().length < 7) {
      setError('Please enter a valid contact phone number.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Sign up credential with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            age: parseInt(age, 10),
            occupation: occupation.trim(),
            gender: gender,
            interests: interests,
            contact_number: contactNumber.trim(),
          },
        },
      });

      if (authError) throw authError;

      const user = authData.user;

      if (user) {
        // 2. Persist profile info to public.profiles table
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          name: name.trim(),
          age: parseInt(age, 10),
          occupation: occupation.trim(),
          gender: gender,
          interests: interests,
          email: email.trim(),
          contact_number: contactNumber.trim(),
        });

        if (profileError) {
          console.warn('Profile database insert error:', profileError.message);
        }
      }

      if (authData.session) {
        navigate('/', { replace: true });
      } else {
        setSuccessMessage(
          'Account created successfully! Please check your email to confirm your account before signing in.'
        );
      }
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F2] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#536B67]/15 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#536B67] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
            W
          </div>
          <h1 className="text-2xl font-bold text-[#263532]">Create your WeatherGPT account</h1>
          <p className="text-xs text-[#5F6F6B]">
            Provide your profile information to initialize your personalized account.
          </p>
        </div>

        {/* Message Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-[#A9C0B5]/30 border border-[#536B67]/20 text-[#263532] text-xs space-y-3">
            <div className="flex items-center gap-2 text-[#536B67] font-semibold">
              <CheckCircle2 size={18} />
              <span>Account Created</span>
            </div>
            <p>{successMessage}</p>
            <button
              onClick={() => navigate('/signin')}
              className="px-4 py-2 bg-[#536B67] text-white text-xs font-medium rounded-xl hover:bg-[#435754]"
            >
              Go to Sign In
            </button>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532]">Full Name</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-[#7B8985]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#263532] placeholder-[#7B8985] focus:outline-none focus:border-[#536B67]"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532]">Age</label>
                <div className="relative flex items-center">
                  <Calendar size={16} className="absolute left-3.5 text-[#7B8985]" />
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    min="5"
                    max="120"
                    className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#263532] placeholder-[#7B8985] focus:outline-none focus:border-[#536B67]"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532]">Occupation</label>
                <div className="relative flex items-center">
                  <Briefcase size={16} className="absolute left-3.5 text-[#7B8985]" />
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Software Engineer / Student"
                    className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#263532] placeholder-[#7B8985] focus:outline-none focus:border-[#536B67]"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532]">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl px-4 py-2.5 text-sm text-[#263532] focus:outline-none focus:border-[#536B67]"
                  disabled={loading}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532]">Email Address</label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-[#7B8985]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#263532] placeholder-[#7B8985] focus:outline-none focus:border-[#536B67]"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532]">Contact Number</label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-3.5 text-[#7B8985]" />
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#263532] placeholder-[#7B8985] focus:outline-none focus:border-[#536B67]"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Interests Chips */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-[#263532]">
                Interests (Select multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_INTERESTS.map((item) => {
                  const selected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selected
                          ? 'bg-[#536B67] text-white border border-[#536B67]'
                          : 'bg-[#E4ECE7] text-[#5F6F6B] border border-[#536B67]/15 hover:border-[#536B67]/30'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532]">Password</label>
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

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532]">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-[#7B8985]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#E4ECE7] border border-[#536B67]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#263532] placeholder-[#7B8985] focus:outline-none focus:border-[#536B67]"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[#7B8985] hover:text-[#263532] p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#536B67] hover:bg-[#435754] text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Redirect */}
        <div className="pt-4 border-t border-[#536B67]/10 text-center text-xs text-[#5F6F6B]">
          <span>Already have an account? </span>
          <Link to="/signin" className="text-[#536B67] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};