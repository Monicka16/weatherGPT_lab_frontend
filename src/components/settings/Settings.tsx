import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  LogOut,
  Check,
  Save,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { useTemperatureUnit } from '../../context/TemperatureUnitContext';
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

  const { temperatureUnit, setTemperatureUnit } = useTemperatureUnit();

  const [enterToSend, setEnterToSend] = useLocalStorage<boolean>(
    'enter_to_send',
    true
  );

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
    <div className="space-y-8 max-w-2xl mx-auto py-4 text-primary transition-colors duration-200">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-accent-base text-xs font-semibold tracking-wider uppercase">
          <SettingsIcon size={16} />
          <span>PREFERENCES & ACCOUNT</span>
        </div>

        <h1 className="text-3xl font-light tracking-tight text-primary">
          Settings
        </h1>
      </div>

      {/* Account Profile Section */}
      {user && (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-base text-white flex items-center justify-center font-bold">
                <User size={20} />
              </div>

              <div>
                <h2 className="text-base font-medium text-primary">
                  Account Profile
                </h2>

                <p className="text-xs text-secondary font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-accent-alert/10 text-accent-alert text-xs font-medium transition-colors border border-border"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-accent-base text-xs flex items-center gap-2">
              <Check size={16} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-xl bg-surface-elevated border border-accent-alert text-accent-alert text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-primary">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-accent-base"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-primary">
                  Age
                </label>

                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-accent-base"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-primary">
                  Occupation
                </label>

                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-accent-base"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-primary">
                  Gender
                </label>

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-accent-base"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-primary">
                  Contact Number
                </label>

                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-accent-base"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-primary">
                Interests
              </label>

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
                          ? 'bg-accent-base text-white border border-accent-base'
                          : 'bg-surface-elevated text-secondary border border-border hover:border-accent-base/30'
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
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-base hover:opacity-90 text-white font-medium text-xs rounded-xl transition-opacity shadow-sm disabled:opacity-50"
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
      <div className="space-y-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-sm font-medium text-primary">
              Temperature Unit
            </h2>

            <p className="text-xs text-secondary">
              Select primary metric display
            </p>
          </div>

          <div className="flex items-center bg-surface-elevated p-1 rounded-xl border border-border">
            <button
              onClick={() => setTemperatureUnit('celsius')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                temperatureUnit === 'celsius'
                  ? 'bg-accent-base text-white font-medium shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              °C
            </button>

            <button
              onClick={() => setTemperatureUnit('fahrenheit')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                temperatureUnit === 'fahrenheit'
                  ? 'bg-accent-base text-white font-medium shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              °F
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-primary">
              Enter Key Behaviour
            </h2>

            <p className="text-xs text-secondary">
              Press Enter to send chat messages
            </p>
          </div>

          <input
            type="checkbox"
            checked={enterToSend}
            onChange={(e) => setEnterToSend(e.target.checked)}
            className="w-4 h-4 accent-accent-base cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};