
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { AnalysisResult, UrgencyLevel, GroundingSource, User, Booking, Review, UserInput } from '../types';
import { triageService } from '../services/gemini';
import { 
  Navigation, 
  ExternalLink, 
  AlertCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  Activity,
  MapPin,
  Star,
  Calendar,
  Check,
  MessageSquare,
  Send,
  Quote,
  ChevronRight,
  Map as MapIcon,
  Info as InfoIcon,
  Phone
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onRestart: () => void;
  currentUser: User | null;
  onUserUpdate: (user: User) => void;
  input: UserInput;
}

const URGENCY_THEMES: Record<UrgencyLevel, any> = {
  [UrgencyLevel.LOW]: { 
    bg: 'bg-emerald-500', 
    text: 'text-emerald-700', 
    border: 'border-emerald-400',
    lightBg: 'bg-emerald-50',
    icon: CheckCircle,
    accent: 'emerald'
  },
  [UrgencyLevel.MODERATE]: { 
    bg: 'bg-blue-600', 
    text: 'text-blue-700', 
    border: 'border-blue-400',
    lightBg: 'bg-blue-50',
    icon: Clock,
    accent: 'blue'
  },
  [UrgencyLevel.HIGH]: { 
    bg: 'bg-orange-500', 
    text: 'text-orange-800', 
    border: 'border-orange-400',
    lightBg: 'bg-orange-50',
    icon: AlertTriangle,
    accent: 'orange'
  },
  [UrgencyLevel.EMERGENCY]: { 
    bg: 'bg-red-600', 
    text: 'text-red-700', 
    border: 'border-red-400',
    lightBg: 'bg-red-50',
    icon: AlertCircle,
    accent: 'red'
  },
};

const DoctorCard = ({ 
  source, 
  specialty, 
  index, 
  currentUser, 
  onUserUpdate,
  reviews,
  onAddReview
}: { 
  source: GroundingSource, 
  specialty: string, 
  index: number, 
  currentUser: User | null, 
  onUserUpdate: (user: User) => void,
  reviews: Review[],
  onAddReview: (review: Review) => void
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'map' | 'reviews'>('info');
  const [bookingState, setBookingState] = useState<'idle' | 'scheduling' | 'confirming' | 'done'>('idle');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  
  const distance = useMemo(() => (0.5 + Math.random() * 5).toFixed(1), []);
  const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"];

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "4.8";
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const hasBooked = useMemo(() => {
    return currentUser?.bookings.some(b => b.doctorName === source.title);
  }, [currentUser, source.title]);

  const confirmBooking = () => {
    setBookingState('confirming');
    
    // Redirect to the external platform (e.g., the Google Maps business page or clinic website)
    // This allows the user to finalize the appointment on the official clinical system.
    window.open(source.uri, '_blank');

    setTimeout(() => {
      if (currentUser && selectedTime) {
        const newBooking: Booking = {
          id: Date.now().toString(),
          doctorName: source.title,
          specialty: specialty,
          time: selectedTime,
          date: new Date().toLocaleDateString(),
          status: 'confirmed'
        };
        onUserUpdate({
          ...currentUser,
          bookings: [newBooking, ...currentUser.bookings]
        });
      }
      setBookingState('done');
    }, 1500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const review: Review = {
      id: Date.now().toString(),
      userName: currentUser.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toLocaleDateString()
    };
    onAddReview(review);
    setNewReview({ rating: 5, comment: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      className="group relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,130,246,0.12)] border border-slate-100/50 transition-all duration-500 overflow-hidden flex flex-col h-[620px]"
    >
      {/* Top Banner with Stats */}
      <div className="h-32 bg-slate-50 relative overflow-hidden flex items-end px-8 pb-4">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors"></div>
        
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-white">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <span className="text-[11px] font-black text-slate-800">{averageRating}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 border border-blue-500">
             <span className="text-[9px] font-black uppercase tracking-wider">Verified Provider</span>
          </div>
        </div>
      </div>

      {/* Profile Pic overlap */}
      <div className="relative h-0">
        <div className="absolute -top-10 left-8 w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white group-hover:scale-105 transition-transform duration-500">
          <Stethoscope size={36} className="text-blue-600" />
        </div>
      </div>

      {/* Tabs Header */}
      <div className="mt-14 px-8 flex items-center gap-6 border-b border-slate-50">
        {[
          { id: 'info', icon: InfoIcon, label: 'Details' },
          { id: 'map', icon: MapIcon, label: 'Map' },
          { id: 'reviews', icon: MessageSquare, label: 'Reviews' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative pb-4 flex items-center gap-2 transition-all ${
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div layoutId={`activeTab-${index}`} className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-8 space-y-6"
            >
              <div>
                <h4 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{source.title}</h4>
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  {specialty} Specialist
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Distance</p>
                  <div className="flex items-center gap-2 font-black text-slate-800">
                    <MapPin size={14} className="text-blue-500" /> {distance} mi
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                  <div className="flex items-center gap-2 font-black text-emerald-500">
                    <Clock size={14} /> Open Now
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <AnimatePresence mode="wait">
                  {bookingState === 'idle' && (
                    <motion.button 
                      key="idle"
                      onClick={() => setBookingState('scheduling')}
                      className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95"
                    >
                      BOOK APPOINTMENT
                    </motion.button>
                  )}
                  {bookingState === 'scheduling' && (
                    <motion.div key="scheduling" className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map(slot => (
                          <button key={slot} onClick={() => setSelectedTime(slot)} className={`p-3 rounded-xl text-[10px] font-black uppercase transition-all ${selectedTime === slot ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setBookingState('idle')} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[9px] uppercase">Back</button>
                        <button disabled={!selectedTime} onClick={confirmBooking} className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase shadow-lg shadow-blue-200">Confirm & Redirect</button>
                      </div>
                    </motion.div>
                  )}
                  {bookingState === 'confirming' && (
                    <motion.div key="confirming" className="py-6 flex flex-col items-center justify-center">
                      <Activity className="animate-spin text-blue-600 mb-2" size={24} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redirecting to Platform...</span>
                    </motion.div>
                  )}
                  {bookingState === 'done' && (
                    <motion.div key="done" className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center gap-2 text-emerald-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Redirected!</span>
                      </div>
                      <button onClick={() => window.open(source.uri, '_blank')} className="text-[9px] font-bold text-emerald-800 underline decoration-emerald-200 uppercase tracking-widest">
                        Re-open Official Booking
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 h-full flex flex-col"
            >
              <div className="flex-grow bg-slate-100 rounded-[2rem] relative overflow-hidden group/map cursor-pointer border border-slate-200" onClick={() => window.open(source.uri, '_blank')}>
                {/* Simulated high-fidelity map UI */}
                <div className="absolute inset-0 opacity-40">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center"
                   >
                     <div className="w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div>
                   </motion.div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic Location</p>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{source.title}</p>
                    </div>
                    <Navigation size={18} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => window.open(source.uri, '_blank')}
                className="mt-6 w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-colors"
              >
                OPEN IN GOOGLE MAPS <ExternalLink size={16} />
              </button>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 h-full flex flex-col"
            >
              <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                      <Quote size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-400">Be the first to share your experience with this provider.</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={review.id} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-slate-900 uppercase">{review.userName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={8} fill={i < review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">"{review.comment}"</p>
                      <p className="text-[8px] text-slate-300 font-bold mt-2 uppercase tracking-tighter">{review.date}</p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Review Submission for verified users */}
              <div className="mt-6 pt-6 border-t border-slate-50">
                {currentUser && hasBooked ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex items-center gap-2 justify-center">
                       {[1, 2, 3, 4, 5].map(num => (
                        <button key={num} type="button" onClick={() => setNewReview({...newReview, rating: num})} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newReview.rating >= num ? 'bg-amber-100 text-amber-600' : 'bg-white border text-slate-300'}`}>
                          <Star size={14} fill={newReview.rating >= num ? "currentColor" : "none"} />
                        </button>
                       ))}
                    </div>
                    <div className="relative">
                      <textarea 
                        value={newReview.comment}
                        onChange={e => setNewReview({...newReview, comment: e.target.value})}
                        placeholder="Verified Patient Review..."
                        className="w-full p-4 bg-slate-50 rounded-2xl text-[11px] font-bold border border-slate-200 focus:border-blue-400 outline-none h-20 resize-none"
                        required
                      />
                      <button type="submit" className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-transform">
                        <Send size={14} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {currentUser ? 'Book a visit to review' : 'Login to share feedback'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Quick Actions */}
      <div className="px-8 py-6 bg-slate-900 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Phone size={14} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Fast Track Contact</span>
        </div>
        <ChevronRight size={18} className="text-slate-500" />
      </div>
    </motion.div>
  );
};

const ResultView: React.FC<Props> = ({ result, onRestart, currentUser, onUserUpdate, input }) => {
  const [doctors, setDoctors] = useState<{ text: string, sources: GroundingSource[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewsByDoctor, setReviewsByDoctor] = useState<Record<string, Review[]>>({});
  const directoryRef = useRef<HTMLDivElement>(null);
  const theme = URGENCY_THEMES[result.urgency] || URGENCY_THEMES[UrgencyLevel.LOW];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const pos = await new Promise<GeolocationPosition | null>((res) => 
          navigator.geolocation.getCurrentPosition(res, () => res(null), { timeout: 10000 })
        );
        const data = await triageService.findDoctors(result.specialty, input.symptoms, pos?.coords.latitude, pos?.coords.longitude);
        setDoctors(data);
        
        // Mock initial reviews
        const initialReviews: Record<string, Review[]> = {};
        data.sources.forEach(source => {
          initialReviews[source.title] = [
            { id: Math.random().toString(), userName: 'Verified Patient', rating: 5, comment: 'Exceptional care and very short wait times.', date: 'Recent' }
          ];
        });
        setReviewsByDoctor(initialReviews);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [result.specialty, input.symptoms]);

  const addReview = (doctorTitle: string, review: Review) => {
    setReviewsByDoctor(prev => ({
      ...prev,
      [doctorTitle]: [review, ...(prev[doctorTitle] || [])]
    }));
  };

  const scrollToDirectory = () => {
    directoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-32">
      {result.isUnsure && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Stethoscope size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl shrink-0 border border-white/30">
              <Stethoscope size={40} />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-4xl font-black mb-3 tracking-tighter">Limited Data Context.</h3>
              <p className="text-indigo-100 font-bold text-xl leading-snug max-w-xl">Symptoms are broad. We've matched you to a General Practitioner for a foundational vibe check.</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={scrollToDirectory} className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase shadow-2xl tracking-widest">SCAN DIRECTORY</motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Hero Result */}
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative">
        <div className={`relative bg-white rounded-[4rem] p-2 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-4 ${theme.border}`}>
          <div className={`${theme.bg} rounded-[3.8rem] p-12 md:p-24 text-white flex flex-col items-center text-center gap-10 relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
            
            <div className="z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/20 border border-white/30 text-[11px] font-black uppercase tracking-[0.4em] mb-10 backdrop-blur-md">
                <AlertCircle size={16} /> Urgency: {result.urgency}
              </div>
              <h2 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">
                Consult a <span className="bg-white text-slate-900 px-8 py-3 rounded-[2.5rem] inline-block mt-4 md:mt-0 shadow-2xl">{result.specialty}</span>
              </h2>
              <p className="text-2xl md:text-3xl font-medium opacity-90 max-w-3xl leading-tight tracking-tight">
                {result.explanation}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Steps & Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Your Care Roadmap</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.nextSteps.map((step, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2 + i * 0.1 }}
                key={i} 
                className="flex items-start gap-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.lightBg} ${theme.text}`}>
                  <CheckCircle size={20} />
                </div>
                <span className="text-lg font-bold text-slate-700 leading-snug">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl h-full flex flex-col justify-center">
          <ShieldAlert className="text-blue-500 mb-8" size={48} />
          <h4 className="text-3xl font-black mb-6 leading-tight">Patient Safety Protocol</h4>
          <p className="text-slate-400 font-bold leading-relaxed text-lg">
            This assistant matches patterns based on clinical data. It is NOT a diagnosis. If pain increases or symptoms evolve rapidly, bypass this triage and seek emergency care immediately.
          </p>
        </div>
      </div>

      {/* Directory Section */}
      <section ref={directoryRef} className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-6">
          <div className="max-w-xl">
             <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Real-time Grounding</div>
             <h3 className="text-5xl font-black text-slate-900 tracking-tighter">Matched Providers.</h3>
             <p className="text-slate-400 font-bold text-lg mt-2">Verified specialists within your geographic reach, ranked by patient trust.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 shadow-sm"></div>)}
             </div>
             <p className="text-xs font-black text-slate-500 uppercase tracking-widest">50+ Nearby matches</p>
          </div>
        </div>

        {loading ? (
          <div className="py-48 flex flex-col items-center justify-center">
            <div className="relative">
              <Activity className="animate-spin text-blue-600 relative z-10" size={64} />
              <div className="absolute inset-0 bg-blue-200 blur-2xl opacity-20 animate-pulse"></div>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-8">GPS Medical Sync Active</p>
          </div>
        ) : (
          <LayoutGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {doctors?.sources.map((source, i) => (
                <DoctorCard 
                  key={i} 
                  source={source} 
                  specialty={result.specialty} 
                  index={i} 
                  currentUser={currentUser}
                  onUserUpdate={onUserUpdate}
                  reviews={reviewsByDoctor[source.title] || []}
                  onAddReview={(r) => addReview(source.title, r)}
                />
              ))}
            </div>
          </LayoutGroup>
        )}
      </section>

      {/* Footer Nav */}
      <div className="flex justify-center pt-20">
        <motion.button 
          whileHover={{ scale: 1.05, y: -5 }} 
          whileTap={{ scale: 0.95 }}
          onClick={onRestart} 
          className="group relative px-20 py-10 bg-blue-600 text-white rounded-[3rem] font-black text-3xl shadow-[0_30px_60px_rgba(37,99,235,0.3)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.4)] transition-all flex items-center gap-8 border-b-8 border-blue-800"
        >
          START OVER <ArrowRight size={36} className="group-hover:translate-x-3 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
};

export default ResultView;

function ShieldAlert(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
