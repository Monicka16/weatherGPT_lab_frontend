import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, Phone, ArrowRight } from "lucide-react";

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formattedPhone = formData.phone.startsWith("+91")
        ? formData.phone
        : `+91${formData.phone.trim()}`;

      if (signUp) {
        await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          phone: formattedPhone,
        });
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#436756] rounded-xl text-white flex items-center justify-center font-bold text-xl mx-auto mb-3">
            W
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Create an Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join WeatherLY to get personalized insights</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#436756]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#436756]"
              />
            </div>
          </div>

          {/* Phone Number with +91 Default Prefix */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 z-10" />
              <div className="absolute left-9 text-sm text-slate-600 font-medium select-none z-10">
                +91
              </div>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setFormData((prev) => ({ ...prev, phone: val.slice(0, 10) }));
                }}
                placeholder="9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-[72px] pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#436756]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#436756]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#436756] hover:bg-[#355345] text-white font-medium rounded-xl py-2.5 text-sm transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#436756] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};