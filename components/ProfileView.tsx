
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Booking, TriageHistoryItem } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Calendar, 
  Clock, 
  History, 
  Activity, 
  ChevronRight, 
  LogOut, 
  ArrowLeft,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Stethoscope
} from 'lucide-react';

interface Props {
  user: User | null;
  onLogin: (user: User) => void;
  onBack: () => void;
}

const ProfileView: React.FC<Props> = ({ user, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name || 'Alex Jones',
      email: formData.email,
      bookings: [],
      history: []
    };
    onLogin(newUser);
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-50">
          <div className="text-center mb-10">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{isLogin ? 'Welcome Back.' : 'Join the Squad.'}</h2>
            <p className="text-slate-400 font-bold">Manage your health profile with ease.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" placeholder="Your Name" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl font-bold focus:bg-white border-2 border-transparent focus:border-blue-400 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="email" placeholder="name@domain.com" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl font-bold focus:bg-white border-2 border-transparent focus:border-blue-400 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="password" placeholder="••••••••" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl font-bold focus:bg-white border-2 border-transparent focus:border-blue-400 outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>
            </div>
            <button className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-blue-600 transition-all mt-6">
              {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Triage
          </button>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Your Dashboard.</h2>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-black text-slate-900">{user.name}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user.email}</p>
          </div>
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-black">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Profile Info */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity size={100} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-8">Activity Pulse</h3>
            <div className="space-y-8">
              <div>
                <p className="text-5xl font-black mb-1">{user.history.length}</p>
                <p className="text-xs font-bold text-slate-400 uppercase">Triage Checks Run</p>
              </div>
              <div>
                <p className="text-5xl font-black mb-1">{user.bookings.length}</p>
                <p className="text-xs font-bold text-slate-400 uppercase">Confirmed Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Quick Profile</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-lg font-bold text-slate-900">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Age Group</p>
                  <p className="text-lg font-bold text-slate-900">Gen Z / Millennial</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Bookings & History */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Active Bookings</h3>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{user.bookings.length} Found</span>
            </div>

            {user.bookings.length === 0 ? (
              <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold mb-4">No appointments booked yet.</p>
                <button onClick={onBack} className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 mx-auto">
                  Find a Doctor <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {user.bookings.map(booking => (
                  <motion.div key={booking.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="group p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-blue-400 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {/* Fix: Added missing Stethoscope icon */}
                        <Stethoscope size={28} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900">{booking.doctorName}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{booking.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 md:text-right">
                      <div>
                        <p className="text-sm font-black text-slate-900">{booking.date}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{booking.time}</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <CheckCircle2 size={12} /> {booking.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <History size={24} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Recent Triage</h3>
            </div>

            {user.history.length === 0 ? (
              <p className="text-slate-400 font-bold text-center py-10">Your triage history will appear here.</p>
            ) : (
              <div className="space-y-4">
                {user.history.map(item => (
                  <div key={item.id} className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between group cursor-default">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.date}</p>
                      <p className="text-lg font-bold text-slate-700 line-clamp-1 italic">"{item.symptoms}"</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900 uppercase">Match</p>
                        <p className="text-sm font-bold text-blue-600">{item.result.specialty}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-400 transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
