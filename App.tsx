
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInput, AnalysisResult, UrgencyLevel, User, TriageHistoryItem } from './types';
import { triageService } from './services/gemini';
import { QUICK_SYMPTOMS, AGE_GROUPS } from './constants';
import EmergencyScreen from './components/EmergencyScreen';
import ResultView from './components/ResultView';
import ProfileView from './components/ProfileView';
import { 
  Stethoscope, 
  ArrowRight, 
  ShieldAlert, 
  Heart,
  Activity,
  Zap,
  Info,
  Sparkles,
  User as UserIcon,
  LogOut,
  Clock,
  Thermometer,
  ShieldCheck,
  CalendarDays,
  Shield,
  Search,
  CheckCircle,
  Plus,
  Cross
} from 'lucide-react';

const FloatingIcon = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 5, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
    className={`absolute pointer-events-none opacity-10 blur-[1px] ${className}`}
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  const [step, setStep] = useState<'consent' | 'input' | 'analyzing' | 'result' | 'emergency' | 'profile'>('consent');
  const [input, setInput] = useState<UserInput>({ 
    symptoms: '', 
    ageGroup: '', 
    onset: '', 
    severity: 5,
    duration: '',
    existingConditions: ''
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('medmatch_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('medmatch_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const handleStart = () => setStep('input');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.symptoms.trim()) return;

    setStep('analyzing');

    try {
      const res = await triageService.analyzeSymptoms(input);
      setResult(res);

      if (currentUser) {
        const historyItem: TriageHistoryItem = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          symptoms: input.symptoms,
          result: res
        };
        setCurrentUser({
          ...currentUser,
          history: [historyItem, ...currentUser.history]
        });
      }

      if (res.isEmergency || res.urgency === UrgencyLevel.EMERGENCY) {
        setStep('emergency');
      } else {
        setStep('result');
      }
    } catch (err: any) {
      console.error(err);
      setStep('input');
    }
  };

  const handleReset = () => {
    setStep('consent');
    setInput({ 
      symptoms: '', 
      ageGroup: '', 
      onset: '', 
      severity: 5, 
      duration: '', 
      existingConditions: '' 
    });
    setResult(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('medmatch_user');
    setCurrentUser(null);
    setStep('consent');
  };

  const addQuickSymptom = (sym: string) => {
    setInput(prev => ({
      ...prev,
      symptoms: prev.symptoms ? `${prev.symptoms}, ${sym}` : sym
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fdfdfd] selection:bg-blue-100 selection:text-blue-900">
      {/* Immersive Background Blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-[70%] h-[70%] bg-blue-100/40 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-emerald-100/40 rounded-full blur-[160px] pointer-events-none -z-10"></div>
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-100/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <header className="w-full max-w-6xl px-6 py-8 flex items-center justify-between z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 cursor-pointer group"
          onClick={handleReset}
        >
          <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl group-hover:scale-110 group-active:scale-95 transition-all">
            <Stethoscope className="w-7 h-7" />
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tighter">MedMatch<span className="text-blue-600">.</span></span>
        </motion.div>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => setStep('profile')}
                className={`flex items-center gap-3 px-6 py-3.5 ${step === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-slate-900'} rounded-2xl text-[10px] font-black tracking-widest shadow-xl border border-slate-100 uppercase transition-all`}
              >
                <UserIcon className="w-4 h-4" /> {currentUser.name.split(' ')[0]}
              </motion.button>
              <button 
                onClick={handleLogout}
                className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep('profile')}
              className="flex items-center gap-3 px-6 py-3.5 bg-white text-slate-900 rounded-2xl text-[10px] font-black tracking-widest shadow-xl border border-slate-100 uppercase"
            >
              <UserIcon className="w-4 h-4" /> LOGIN
            </motion.button>
          )}

          {step !== 'consent' && step !== 'emergency' && step !== 'profile' && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep('emergency')}
              className="hidden md:flex items-center gap-3 px-6 py-3.5 bg-red-600 text-white rounded-2xl text-[10px] font-black tracking-widest shadow-2xl shadow-red-200 uppercase"
            >
              <ShieldAlert className="w-4 h-4" /> SOS
            </motion.button>
          )}
        </div>
      </header>

      <main className="w-full max-w-6xl px-4 pb-20 z-10 flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 'consent' && (
            <motion.div 
              key="consent" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full py-10 md:py-20"
            >
              {/* Background Decorative Icons */}
              <FloatingIcon delay={0} className="top-0 left-10">
                <Heart size={80} />
              </FloatingIcon>
              <FloatingIcon delay={1} className="top-40 right-20">
                <Activity size={100} />
              </FloatingIcon>
              <FloatingIcon delay={2} className="bottom-0 left-40">
                <Thermometer size={70} />
              </FloatingIcon>
              <FloatingIcon delay={1.5} className="bottom-20 right-40">
                <Shield size={60} />
              </FloatingIcon>

              <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10"
                >
                  <Sparkles size={14} /> AI-Powered Clinical Triage
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-7xl md:text-[10rem] font-black text-slate-900 tracking-tighter leading-[0.85] mb-8"
                >
                  Precision <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Matching.</span>
                </h1 >

                <motion.p 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="text-xl md:text-2xl text-slate-500 font-bold max-w-2xl mx-auto mb-16 leading-tight"
                >
                  Describe your symptoms and get matched with the right specialist in seconds. Private, safe, and instant.
                </motion.p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="relative group px-12 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] overflow-hidden flex items-center gap-6"
                  >
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <span className="relative z-10">START CONSULTATION</span>
                    <ArrowRight size={28} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                  {[
                    { icon: ShieldCheck, label: "Privacy First" },
                    { icon: Zap, label: "Instant Triage" },
                    { icon: Search, label: "Maps Grounded" },
                    { icon: CheckCircle, label: "100% Verified" }
                  ].map((feature, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-lg border border-slate-50">
                        <feature.icon size={20} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{feature.label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-5xl mx-auto w-full">
              <div className="bg-white rounded-[3.5rem] p-8 md:p-14 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-50">
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Primary Symptoms Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <Thermometer size={22} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">What are your symptoms?</h3>
                    </div>
                    
                    <div className="relative group">
                       <textarea 
                        value={input.symptoms}
                        onChange={e => setInput({...input, symptoms: e.target.value})}
                        placeholder="Describe what you're feeling in your own words..."
                        className="w-full h-40 p-8 bg-slate-50 border-2 border-transparent rounded-[2.5rem] focus:border-blue-400 focus:bg-white outline-none transition-all text-xl font-bold shadow-inner"
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        {QUICK_SYMPTOMS.map(s => (
                          <button 
                            key={s} 
                            type="button" 
                            onClick={() => addQuickSymptom(s)} 
                            className="px-4 py-2 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black text-slate-400 border border-slate-100 transition-all uppercase tracking-widest"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Grid for Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Severity & Age */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                          <Activity size={18} />
                        </div>
                        <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Pain / Severity</label>
                      </div>
                      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-3xl font-black text-slate-900">{input.severity}</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={input.severity} 
                          onChange={e => setInput({...input, severity: parseInt(e.target.value)})} 
                          className="flex-grow accent-blue-600" 
                        />
                      </div>
                      
                      <select 
                        value={input.ageGroup}
                        onChange={e => setInput({...input, ageGroup: e.target.value})}
                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-800 focus:border-blue-400 outline-none transition-all cursor-pointer"
                      >
                        <option value="">Select Age Group</option>
                        {AGE_GROUPS.map(age => <option key={age} value={age}>{age}</option>)}
                      </select>
                    </div>

                    {/* Timeline & Onset */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Clock size={18} />
                        </div>
                        <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Timeline</label>
                      </div>
                      <input 
                        type="text"
                        placeholder="How long? (e.g. 3 hours, 2 days)"
                        value={input.duration}
                        onChange={e => setInput({...input, duration: e.target.value})}
                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-800 focus:border-blue-400 outline-none transition-all"
                      />
                      <div className="flex gap-2 p-1 bg-slate-50 rounded-3xl border border-slate-100">
                        <button 
                          type="button"
                          onClick={() => setInput({...input, onset: 'Sudden'})}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${input.onset === 'Sudden' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
                        >
                          Sudden Onset
                        </button>
                        <button 
                          type="button"
                          onClick={() => setInput({...input, onset: 'Gradual'})}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${input.onset === 'Gradual' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
                        >
                          Gradual Onset
                        </button>
                      </div>
                    </div>

                    {/* Health Background */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                          <ShieldCheck size={18} />
                        </div>
                        <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Health Context</label>
                      </div>
                      <textarea 
                        value={input.existingConditions}
                        onChange={e => setInput({...input, existingConditions: e.target.value})}
                        placeholder="Existing conditions or allergies? (Optional)"
                        className="w-full h-32 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-400 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <motion.button 
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 group"
                    >
                      MATCH SPECIALIST <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                    <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mt-6">
                      MedMatch uses AI to suggest specialties. Not a medical diagnosis.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-[40px] opacity-20 animate-pulse"></div>
                <Activity className="w-20 h-20 text-blue-600 animate-bounce relative z-10" />
              </div>
              <h2 className="text-4xl font-black mt-12 tracking-tighter">Analyzing Clinical Data...</h2>
              <p className="text-slate-400 font-bold mt-4 uppercase tracking-[0.3em] text-xs">Mapping symptoms to specialists</p>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <ResultView 
                result={result} 
                onRestart={handleReset} 
                currentUser={currentUser} 
                onUserUpdate={setCurrentUser} 
                input={input}
              />
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <ProfileView user={currentUser} onLogin={setCurrentUser} onBack={() => setStep('consent')} />
            </motion.div>
          )}

          {step === 'emergency' && <EmergencyScreen onReset={handleReset} />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
