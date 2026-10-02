import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, LogOut, Check, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const ALL_INTERESTS = [
  'Weather',
  'Technology',
  'Sports',
  'Travel',
  'Agriculture',
  'Environment',
  'Fitness',
  'Research',
];

export const Settings: React.FC = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [unit, setUnit] = useLocalStorage<'celsius' | 'fahrenheit'>('weather_unit', 'celsius');
  const [enterToSend, setEnterToSend] = useLocalStorage<boolean>('enter_to_send', true);

  // Editable Profile States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('Male');
  const [interests, setInterests] = useState<string[]>([]);
  const [contactNumber, setContactNumber] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAge(profile.age ? String(profile.age) : '');
      setOccupation(profile.occupation || '');
      setGender(profile.gender || 'Male');
      setInterests(profile.interests || []);
      setContactNumber(profile.contact_number || '');
    }
  }, [profile]);

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== item));
      }
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: name.trim(),
        age: parseInt(age, 10) || 18,
        occupation: occupation.trim(),
        gender: gender,
        interests: interests,
        email: user.email || profile?.email || '',
        contact_number: contactNumber.trim(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-4 text-[#263532] dark:text-[#E8EFEC] transition-colors duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[#536B67] dark:text-[#A9C0B5] text-xs font-semibold tracking-wider uppercase">
          <SettingsIcon size={16} />
          <span>PREFERENCES & ACCOUNT</span>
        </div>
        <h1 className="text-3xl font-bold text-[#263532] dark:text-[#E8EFEC]">Settings</h1>
      </div>

      {/* Account Profile Section */}
      {user && (
        <div className="bg-[#FFFFFF] dark:bg-[#1C2925] p-6 rounded-2xl border border-[#536B67]/15 dark:border-[#A9C0B5]/10 shadow-sm dark:shadow-black/20 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#536B67]/10 dark:border-[#A9C0B5]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#536B67] dark:bg-[#536B67] text-white flex items-center justify-center font-bold">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#263532] dark:text-[#E8EFEC]">Account Profile</h2>
                <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A] font-mono">{user.email}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-[#A9C0B5]/30 dark:bg-[#A9C0B5]/15 border border-[#536B67]/20 dark:border-[#A9C0B5]/15 text-[#536B67] dark:text-[#A9C0B5] text-xs flex items-center gap-2">
              <Check size={16} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 rounded-xl px-3.5 py-2 text-sm text-[#263532] dark:text-[#E8EFEC] focus:outline-none focus:border-[#536B67] dark:focus:border-[#A9C0B5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 rounded-xl px-3.5 py-2 text-sm text-[#263532] dark:text-[#E8EFEC] focus:outline-none focus:border-[#536B67] dark:focus:border-[#A9C0B5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 rounded-xl px-3.5 py-2 text-sm text-[#263532] dark:text-[#E8EFEC] focus:outline-none focus:border-[#536B67] dark:focus:border-[#A9C0B5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 rounded-xl px-3.5 py-2 text-sm text-[#263532] dark:text-[#E8EFEC] focus:outline-none focus:border-[#536B67] dark:focus:border-[#A9C0B5]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">Contact Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 rounded-xl px-3.5 py-2 text-sm text-[#263532] dark:text-[#E8EFEC] focus:outline-none focus:border-[#536B67] dark:focus:border-[#A9C0B5]"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">Interests</label>
              <div className="flex flex-wrap gap-2">
                {ALL_INTERESTS.map((item) => {
                  const selected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selected
                          ? 'bg-[#536B67] text-white border border-[#536B67]'
                          : 'bg-[#E4ECE7] dark:bg-[#24332E] text-[#5F6F6B] dark:text-[#8FA19A] border border-[#536B67]/15 dark:border-[#A9C0B5]/10'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#536B67] hover:bg-[#435754] text-white font-medium text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* App Preferences */}
      <div className="space-y-6 bg-[#FFFFFF] dark:bg-[#1C2925] p-6 rounded-2xl border border-[#536B67]/15 dark:border-[#A9C0B5]/10 shadow-sm dark:shadow-black/20">
        <div className="flex items-center justify-between pb-4 border-b border-[#536B67]/10 dark:border-[#A9C0B5]/10">
          <div>
            <h2 className="text-sm font-semibold text-[#263532] dark:text-[#E8EFEC]">Temperature Unit</h2>
            <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A]">Select primary metric display</p>
          </div>
          <div className="flex items-center bg-[#E4ECE7] dark:bg-[#24332E] p-1 rounded-xl border border-[#536B67]/15 dark:border-[#A9C0B5]/10">
            <button
              onClick={() => setUnit('celsius')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                unit === 'celsius' ? 'bg-[#536B67] text-white font-medium' : 'text-[#5F6F6B] dark:text-[#8FA19A]'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('fahrenheit')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                unit === 'fahrenheit' ? 'bg-[#536B67] text-white font-medium' : 'text-[#5F6F6B] dark:text-[#8FA19A]'
              }`}
            >
              °F
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#263532] dark:text-[#E8EFEC]">Enter Key Behaviour</h2>
            <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A]">Press Enter to send chat messages</p>
          </div>
          <input
            type="checkbox"
            checked={enterToSend}
            onChange={(e) => setEnterToSend(e.target.checked)}
            className="w-4 h-4 accent-[#536B67] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};