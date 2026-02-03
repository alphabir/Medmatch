
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Navigation, MapPin, ArrowLeft, Loader2, Hospital, ExternalLink } from 'lucide-react';
import { triageService } from '../services/gemini';
import { GroundingSource } from '../types';

interface Props {
  onReset: () => void;
}

const EmergencyScreen: React.FC<Props> = ({ onReset }) => {
  const [hospitals, setHospitals] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const pos = await new Promise<GeolocationPosition | null>((res) => 
          navigator.geolocation.getCurrentPosition(res, () => res(null), { timeout: 8000 })
        );
        
        const results = await triageService.findEmergencyHospitals(
          pos?.coords.latitude, 
          pos?.coords.longitude
        );
        
        setHospitals(results);
      } catch (err) {
        console.error("Emergency hospital search failed", err);
        setError("Failed to locate hospitals. Please use standard maps or call emergency services.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const navigateToHospital = (uri: string) => {
    window.open(uri, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-red-700 z-[100] flex flex-col items-center p-6 text-white overflow-y-auto"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600 to-red-900 pointer-events-none opacity-50"></div>

      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between mb-12 mt-4">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-black text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Exit Triage
        </button>
        <div className="px-4 py-2 bg-white/10 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest">
          Emergency Mode Active
        </div>
      </header>

      <motion.div 
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative z-10 mb-8 p-6 bg-white text-red-700 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)]"
      >
        <AlertCircle size={48} strokeWidth={3} />
      </motion.div>

      <div className="relative z-10 text-center max-w-2xl mb-12">
        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none">SEEK HELP NOW.</h1>
        <p className="text-lg md:text-xl font-bold text-red-100 opacity-90 leading-tight">
          Your symptoms indicate a serious emergency. We've located the nearest medical facilities for you.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-4xl space-y-4 mb-16">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/10 rounded-[2.5rem] p-16 flex flex-col items-center border border-white/20 backdrop-blur-md"
            >
              <Loader2 className="animate-spin mb-6 text-red-200" size={48} />
              <h2 className="text-2xl font-black mb-2">Locating Nearest Hospital...</h2>
              <p className="text-red-200/60 font-bold text-sm uppercase tracking-widest">Pinpointing your coordinates</p>
            </motion.div>
          ) : hospitals.length > 0 ? (
            <motion.div 
              key="hospitals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6 px-4">
                <Hospital className="text-red-300" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-200">Nearest Emergency Facilities</h3>
              </div>

              {hospitals.map((hospital, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border backdrop-blur-md transition-all ${
                    i === 0 ? 'bg-white text-red-900 border-white shadow-2xl' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${i === 0 ? 'bg-red-100 text-red-600' : 'bg-white/10 text-white'}`}>
                      <MapPin size={32} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black leading-none mb-2">{hospital.title}</h4>
                      <p className={`text-xs font-bold uppercase tracking-widest ${i === 0 ? 'text-red-700/60' : 'text-red-100/60'}`}>
                        {i === 0 ? 'Recommended (Closest)' : 'Emergency Department'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigateToHospital(hospital.uri)}
                    className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      i === 0 
                      ? 'bg-red-600 text-white shadow-xl hover:bg-red-700' 
                      : 'bg-white text-red-900 shadow-xl hover:bg-red-50'
                    }`}
                  >
                    START NAVIGATION <Navigation size={18} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 rounded-[2.5rem] p-12 text-center border border-white/20"
            >
              <AlertCircle className="mx-auto mb-6 text-red-300" size={48} />
              <h2 className="text-2xl font-black mb-4">Location Search Failed</h2>
              <p className="text-red-100 font-bold mb-8">
                We couldn't pinpoint nearby hospitals automatically. Please open your maps app manually and search for "Hospital" or call your local emergency number.
              </p>
              <button 
                onClick={() => window.open('https://www.google.com/maps/search/hospital+near+me', '_blank')}
                className="px-10 py-5 bg-white text-red-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl"
              >
                OPEN GOOGLE MAPS <ExternalLink size={18} className="inline ml-2" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="relative z-10 text-center mt-auto pb-8">
        <p className="text-red-100/40 text-[10px] font-black uppercase tracking-[0.2em] max-w-md mx-auto">
          MedMatch is an informational tool. In a life-threatening emergency, always prioritize the quickest route to clinical care or call emergency services.
        </p>
      </footer>
    </motion.div>
  );
};

export default EmergencyScreen;
