
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MOCK_PEDALS, MOCK_AMPLIFIERS } from '../constants';
import { Pedal, PedalType, Instrument, Amplifier } from '../types';
import PedalNode from '../components/PedalNode';
import { GoogleGenAI } from "@google/genai";

interface HistoryState {
  chain: Pedal[];
  amplifier: Amplifier;
}

interface KnobProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  color?: string;
}

const Knob: React.FC<KnobProps> = ({ label, value, onChange, color = 'primary' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = startY.current - e.clientY;
      const newValue = Math.min(100, Math.max(0, startValue.current + delta * 0.5));
      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onChange]);

  const rotation = (value / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center gap-3 group select-none">
      <div 
        className="relative size-16 cursor-ns-resize"
        onMouseDown={handleMouseDown}
      >
        <svg className="absolute inset-0 size-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border-dark"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="282.7"
            strokeDashoffset={282.7 - (282.7 * value) / 100}
            strokeLinecap="round"
            className="text-primary transition-all duration-100"
          />
        </svg>

        <div 
          className="absolute inset-2 rounded-full bg-gradient-to-b from-surface-light to-background-dark shadow-xl flex items-center justify-center border border-white/5"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute top-1.5 size-1.5 rounded-full bg-white shadow-[0_0_5px_white]" />
          <div className="size-6 rounded-full bg-black/40 border border-white/10" />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-white transition-colors">{label}</p>
        <p className="text-[10px] font-mono text-primary font-bold mt-0.5">{value}%</p>
      </div>
    </div>
  );
};

const EqualizerSlider: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2 group select-none">
    <div className="flex justify-between items-center px-1">
      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-text-secondary group-hover:text-white transition-colors">{label}</label>
      <span className="text-[9px] font-mono text-primary/70 font-bold">{value}%</span>
    </div>
    <div className="relative flex items-center h-6">
      <div className="absolute inset-x-0 h-1 bg-background-dark rounded-full border border-white/5" />
      <div 
        className="absolute h-1 bg-primary rounded-full transition-all duration-75" 
        style={{ width: `${value}%` }}
      />
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute w-full appearance-none bg-transparent cursor-pointer z-10 
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                   [&::-webkit-slider-thumb]:shadow-[0_0_8px_white] [&::-webkit-slider-thumb]:border 
                   [&::-webkit-slider-thumb]:border-primary/20
                   [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full 
                   [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none"
      />
    </div>
  </div>
);

const BypassToggle: React.FC<{ isBypassed: boolean; onToggle: () => void }> = ({ isBypassed, onToggle }) => (
  <div className="flex items-center gap-3 select-none">
    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!isBypassed ? 'text-primary' : 'text-text-secondary'}`}>
      {isBypassed ? 'Bypassed' : 'Engaged'}
    </span>
    <button 
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 border-2 ${
        !isBypassed ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(19,91,236,0.3)]' : 'bg-surface-light border-border-dark'
      }`}
    >
      <div 
        className={`absolute top-0.5 left-0.5 size-4 rounded-full transition-all duration-300 transform shadow-sm ${
          !isBypassed ? 'translate-x-5 bg-white shadow-[0_0_5px_white]' : 'translate-x-0 bg-text-secondary'
        }`}
      />
    </button>
  </div>
);

const PatchCable: React.FC<{ active?: boolean }> = ({ active }) => (
  <div className="relative w-16 h-1 flex items-center justify-center">
    <div className={`relative h-1.5 w-full bg-[#1a1a1a] shadow-lg rounded-full overflow-hidden transition-all duration-300 ${active ? 'ring-1 ring-primary/30' : ''}`}>
       <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
       {active && <div className="absolute inset-0 bg-primary/20 animate-pulse" />}
    </div>
    <svg className="absolute -top-4 w-full h-8 pointer-events-none overflow-visible" preserveAspectRatio="none">
       <path d="M 0 16 Q 32 24 64 16" stroke="#0a0a0a" strokeWidth="4" fill="none" strokeLinecap="round" className="drop-shadow-lg opacity-40" />
    </svg>
  </div>
);

const AmpNode: React.FC<{ amp: Amplifier; active?: boolean; onClick?: () => void }> = ({ amp, active, onClick }) => {
  const isBypassed = amp.isBypassed;
  return (
    <div 
      onClick={onClick}
      className={`relative w-48 h-36 rounded-xl bg-gradient-to-br ${amp.color} p-4 border border-white/10 shadow-2xl cursor-pointer transition-all hover:-translate-y-1 ${
        active ? 'ring-2 ring-primary ring-offset-4 ring-offset-background-dark' : ''
      } ${isBypassed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
    >
      <div className="absolute top-3 left-3 flex gap-1">
        {[1,2,3,4].map(i => <div key={i} className={`size-1 rounded-full ${isBypassed ? 'bg-white/10' : 'bg-white/20'}`} />)}
      </div>
      <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
        <span className={`material-symbols-outlined !text-[48px] transition-colors ${isBypassed ? 'text-white/10' : 'text-white/40'}`}>speaker</span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{amp.brand}</p>
          <p className="text-sm font-bold text-white tracking-tight">{amp.name}</p>
        </div>
      </div>
      <div className="absolute bottom-2 inset-x-4 flex justify-between opacity-40">
        <div className="size-1.5 rounded-full bg-white" />
        <div className="size-1.5 rounded-full bg-white" />
      </div>
    </div>
  );
};

const CreateSetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [activeChain, setActiveChain] = useState<Pedal[]>([MOCK_PEDALS[0]]);
  const [selectedAmp, setSelectedAmp] = useState<Amplifier>(MOCK_AMPLIFIERS[0]);
  const [history, setHistory] = useState<HistoryState[]>([{ chain: [...activeChain], amplifier: { ...selectedAmp } }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPedalIndex, setSelectedPedalIndex] = useState<number | null>(0);
  const [isAmpSelected, setIsAmpSelected] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'pedals' | 'amps'>('pedals');
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [ampBrandFilter, setAmpBrandFilter] = useState<string | null>(null);

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('Electric Guitar');
  
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [bpm, setBpm] = useState('');
  const [releaseYear, setReleaseYear] = useState('');

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Dynamics': true, 'Drive': true, 'Modulation': true, 'Delay': false, 'Reverb': false
  });

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const commitChange = useCallback((newChain: Pedal[], newAmp: Amplifier) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ chain: [...newChain], amplifier: { ...newAmp } });
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setActiveChain(newChain);
    setSelectedAmp(newAmp);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = history[prevIndex];
      setHistoryIndex(prevIndex);
      setActiveChain(state.chain);
      setSelectedAmp(state.amplifier);
      setSelectedPedalIndex(null);
      setIsAmpSelected(false);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      setHistoryIndex(nextIndex);
      setActiveChain(state.chain);
      setSelectedAmp(state.amplifier);
      setSelectedPedalIndex(null);
      setIsAmpSelected(false);
    }
  };

  const addPedal = (pedal: Pedal) => {
    const newChain = [...activeChain, { ...pedal, id: `${pedal.id}-${Date.now()}`, isBypassed: false }];
    commitChange(newChain, selectedAmp);
    setSelectedPedalIndex(newChain.length - 1);
    setIsAmpSelected(false);
  };

  const removePedal = (index: number) => {
    const newChain = [...activeChain];
    newChain.splice(index, 1);
    commitChange(newChain, selectedAmp);
    setSelectedPedalIndex(null);
  };

  const updatePedalSetting = (index: number, key: string, newValue: number) => {
    const next = [...activeChain];
    const targetPedal = { ...next[index] };
    targetPedal.settings = { ...targetPedal.settings, [key]: newValue };
    next[index] = targetPedal;
    setActiveChain(next);
    // Don't commit history for every single knob drag to avoid filling buffer
  };

  const finalizeKnobChange = () => {
     commitChange(activeChain, selectedAmp);
  };

  const togglePedalBypass = (index: number) => {
    const next = [...activeChain];
    next[index] = { ...next[index], isBypassed: !next[index].isBypassed };
    commitChange(next, selectedAmp);
  };

  const updatePedalNotes = (index: number, newNotes: string) => {
    const next = [...activeChain];
    next[index] = { ...next[index], notes: newNotes };
    setActiveChain(next);
  };

  const updateAmpSetting = (key: string, newValue: number) => {
    setSelectedAmp(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: newValue }
    }));
  };

  const toggleAmpBypass = () => {
    const nextAmp = { ...selectedAmp, isBypassed: !selectedAmp.isBypassed };
    commitChange(activeChain, nextAmp);
  };

  const updateAmpNotes = (newNotes: string) => {
    setSelectedAmp(prev => ({ ...prev, notes: newNotes }));
  };

  // Drag Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newChain = [...activeChain];
    const [movedPedal] = newChain.splice(draggedIndex, 1);
    newChain.splice(index, 0, movedPedal);
    
    commitChange(newChain, selectedAmp);
    setSelectedPedalIndex(index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAiToneMatch = async () => {
    setAiAnalyzing(true);
    setAiSuggestion('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Signal chain: ${activeChain.map(p => p.name).join(' -> ')} into ${selectedAmp.brand} ${selectedAmp.name}. 
        Recommend one pedal to add to this chain for a professional Shoegaze wall-of-sound. Brief suggestion.`
      });
      setAiSuggestion(response.text || "Try adding a heavy modulated delay.");
    } catch (err) {
      console.error(err);
      setAiSuggestion("Failed to get AI recommendation.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSave = () => {
    console.log("Saving Setup:", {
      song: songTitle, artist: artistName, bpm, year: releaseYear, instrument: selectedInstrument, amplifier: selectedAmp, chain: activeChain
    });
    alert(`Setup for "${songTitle}" saved!`);
  };

  const selectedPedal = selectedPedalIndex !== null ? activeChain[selectedPedalIndex] : null;
  const pedalTypes: PedalType[] = ['Dynamics', 'Drive', 'Modulation', 'Delay', 'Reverb'];

  // Derived filter data
  const brands = useMemo(() => Array.from(new Set(MOCK_PEDALS.map(p => p.brand))).sort(), []);
  const colors = useMemo(() => Array.from(new Set(MOCK_PEDALS.map(p => p.color))), []);
  const ampBrands = useMemo(() => Array.from(new Set(MOCK_AMPLIFIERS.map(a => a.brand))).sort(), []);

  const filteredPedals = useMemo(() => {
    return MOCK_PEDALS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = brandFilter ? p.brand === brandFilter : true;
      const matchesColor = colorFilter ? p.color === colorFilter : true;
      return matchesSearch && matchesBrand && matchesColor;
    });
  }, [searchQuery, brandFilter, colorFilter]);

  const filteredAmps = useMemo(() => {
    return MOCK_AMPLIFIERS.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = ampBrandFilter ? a.brand === ampBrandFilter : true;
      return matchesSearch && matchesBrand;
    });
  }, [searchQuery, ampBrandFilter]);

  // EQ Settings Logic for Amplifiers
  const eqSettingNames = ['Bass', 'Mid', 'Middle', 'Treble', 'Presence', 'Cut'];
  
  const ampSettings = useMemo(() => {
    if (!selectedAmp) return { main: [], eq: [] };
    const all = Object.entries(selectedAmp.settings);
    return {
      main: all.filter(([label]) => !eqSettingNames.includes(label)),
      eq: all.filter(([label]) => eqSettingNames.includes(label))
    };
  }, [selectedAmp]);

  if (currentStep === 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="max-w-3xl w-full bg-surface-dark border border-border-dark rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <div className="p-12 space-y-10">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <span className="material-symbols-outlined !text-[14px]">music_note</span>
                Step 1: Song Information
              </div>
              <h2 className="text-4xl font-black tracking-tight">Capture the Essence</h2>
              <p className="text-text-secondary text-sm">Tell us about the track you're building this tone for.</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex justify-between">Song Title <span className="text-primary font-black">Required</span></label>
                <input type="text" autoFocus value={songTitle} onChange={(e) => setSongTitle(e.target.value)} placeholder="e.g. Only Shallow" className="w-full bg-background-dark border-border-dark focus:border-primary rounded-2xl p-4 text-xl font-bold transition-all placeholder:opacity-20" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex justify-between">Artist / Band <span className="text-primary font-black">Required</span></label>
                <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="My Bloody Valentine" className="w-full bg-background-dark border-border-dark focus:border-primary rounded-2xl p-4 text-lg font-bold transition-all placeholder:opacity-20" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Instrument</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">piano</span>
                  <select value={selectedInstrument} onChange={(e) => setSelectedInstrument(e.target.value as Instrument)} className="w-full bg-background-dark border-border-dark focus:border-primary rounded-2xl p-4 pl-12 text-lg font-bold appearance-none cursor-pointer">
                    <option value="Electric Guitar">Electric Guitar</option>
                    <option value="Bass Guitar">Bass Guitar</option>
                    <option value="Synth">Synth</option>
                    <option value="Acoustic Guitar">Acoustic Guitar</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Tempo (BPM)</label>
                <input type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} placeholder="120" className="w-full bg-background-dark border-border-dark focus:border-primary rounded-2xl p-4 font-mono text-lg transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Release Year</label>
                <input type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} placeholder="1991" className="w-full bg-background-dark border-border-dark focus:border-primary rounded-2xl p-4 font-mono text-lg transition-all" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button disabled={!songTitle || !artistName} onClick={() => setCurrentStep(2)} className="group flex items-center gap-3 bg-primary hover:bg-blue-600 disabled:opacity-30 px-10 py-5 rounded-[1.5rem] font-black text-lg transition-all transform hover:scale-105 shadow-xl shadow-primary/20">Go to Pedalboard <span className="material-symbols-outlined group-hover:translate-x-1">arrow_forward</span></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in slide-in-from-right duration-500">
      <div className="bg-surface-dark/60 backdrop-blur border border-border-dark rounded-2xl p-4 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <button onClick={() => setCurrentStep(1)} className="size-10 rounded-xl bg-background-dark border border-border-dark flex items-center justify-center text-text-secondary hover:text-white transition-colors"><span className="material-symbols-outlined !text-[20px]">arrow_back</span></button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-black text-xl">{songTitle || 'Untitled Setup'}</h2>
              <div className="size-1 rounded-full bg-border-dark" />
              <p className="text-text-secondary font-bold text-sm">{artistName || 'Unknown Artist'}</p>
            </div>
            <div className="flex gap-4 mt-0.5">
               <span className="text-[10px] text-primary font-black uppercase tracking-widest">{selectedInstrument}</span>
               {bpm && <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{bpm} BPM</span>}
               {releaseYear && <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Released {releaseYear}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Selected Amp</p>
            <p className="text-xs font-bold text-white">{selectedAmp.brand} {selectedAmp.name}</p>
          </div>
          <div className="size-10 rounded-full bg-surface-light border border-border-dark flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">speaker</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <aside className="w-72 bg-surface-dark border border-border-dark rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-xl">
          <div className="flex border-b border-border-dark">
            <button 
              onClick={() => setLibraryTab('pedals')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${libraryTab === 'pedals' ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-white'}`}
            >Pedals</button>
            <button 
              onClick={() => setLibraryTab('amps')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${libraryTab === 'amps' ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-white'}`}
            >Amplifiers</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {libraryTab === 'pedals' ? (
              <>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 !text-[18px] text-text-secondary">search</span>
                    <input 
                      className="w-full bg-background-dark border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary placeholder:text-text-secondary/50"
                      placeholder="Search pedals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      type="text"
                    />
                  </div>

                  {/* Brand Filters */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">Brand</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => setBrandFilter(null)}
                        className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${brandFilter === null ? 'bg-primary border-primary text-white' : 'bg-surface-light/20 border-border-dark text-text-secondary hover:text-white'}`}
                      >All</button>
                      {brands.map(brand => (
                        <button 
                          key={brand}
                          onClick={() => setBrandFilter(brandFilter === brand ? null : brand)}
                          className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${brandFilter === brand ? 'bg-primary border-primary text-white' : 'bg-surface-light/20 border-border-dark text-text-secondary hover:text-white'}`}
                        >{brand}</button>
                      ))}
                    </div>
                  </div>

                  {/* Color Filters */}
                  <div className="space-y-2 pb-2 border-b border-border-dark">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">Theme</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                         onClick={() => setColorFilter(null)}
                         className={`size-5 rounded-full border flex items-center justify-center ${colorFilter === null ? 'border-primary ring-1 ring-primary' : 'border-border-dark'}`}
                      >
                        <div className="size-3 rounded-full bg-white/20" />
                      </button>
                      {colors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setColorFilter(colorFilter === color ? null : color)}
                          className={`size-5 rounded-full border transition-all bg-gradient-to-br ${color} ${colorFilter === color ? 'ring-2 ring-primary border-white scale-110' : 'border-black/40 hover:scale-105'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  {pedalTypes.map(type => {
                    const isExpanded = expandedSections[type];
                    const categoryPedals = filteredPedals.filter(p => p.type === type);
                    
                    if (categoryPedals.length === 0) return null;

                    return (
                      <div key={type} className="flex flex-col">
                        <button onClick={() => toggleSection(type)} className={`flex items-center justify-between p-3 rounded-xl transition-all ${isExpanded ? 'bg-surface-light/30' : 'hover:bg-surface-light/20'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined !text-[18px] ${isExpanded ? 'text-primary' : 'text-text-secondary'}`}>{type === 'Dynamics' ? 'compress' : type === 'Drive' ? 'bolt' : type === 'Modulation' ? 'waves' : type === 'Delay' ? 'timer' : 'cloud'}</span>
                            <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-widest">{type}</h3>
                          </div>
                          <span className={`material-symbols-outlined !text-[18px] text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        {isExpanded && (
                          <div className="mt-2 mb-4 px-1 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                            {categoryPedals.map(pedal => (
                              <button key={pedal.id} onClick={() => addPedal(pedal)} className="w-full flex items-center gap-3 p-2 rounded-xl bg-surface-light/10 hover:bg-primary/10 border border-transparent hover:border-primary/30 group">
                                <div className={`size-10 rounded bg-gradient-to-br ${pedal.color} flex items-center justify-center shadow-lg`}><span className="material-symbols-outlined text-white !text-[20px]">{pedal.icon}</span></div>
                                <div className="text-left min-w-0">
                                  <p className="text-xs font-bold truncate">{pedal.name}</p>
                                  <p className="text-[9px] text-text-secondary uppercase">{pedal.brand}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4 px-1">
                  {/* Search Amps */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 !text-[18px] text-text-secondary">search</span>
                    <input 
                      className="w-full bg-background-dark border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary placeholder:text-text-secondary/50"
                      placeholder="Search amps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      type="text"
                    />
                  </div>

                  {/* Amp Brand Filters */}
                  <div className="space-y-2 pb-2 border-b border-border-dark">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">Manufacturer</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => setAmpBrandFilter(null)}
                        className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${ampBrandFilter === null ? 'bg-primary border-primary text-white' : 'bg-surface-light/20 border-border-dark text-text-secondary hover:text-white'}`}
                      >All</button>
                      {ampBrands.map(brand => (
                        <button 
                          key={brand}
                          onClick={() => { setAmpBrandFilter(ampBrandFilter === brand ? null : brand); }}
                          className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${ampBrandFilter === brand ? 'bg-primary border-primary text-white' : 'bg-surface-light/20 border-border-dark text-text-secondary hover:text-white'}`}
                        >{brand}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-1 space-y-2">
                  {filteredAmps.map(amp => (
                    <button 
                      key={amp.id} 
                      onClick={() => { commitChange(activeChain, amp); setIsAmpSelected(true); setSelectedPedalIndex(null); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedAmp.id === amp.id ? 'bg-primary/10 border-primary/40' : 'bg-surface-light/10 border-transparent hover:bg-surface-light/20'}`}
                    >
                      <div className={`size-12 rounded bg-gradient-to-br ${amp.color} flex items-center justify-center`}><span className="material-symbols-outlined text-white">speaker</span></div>
                      <div className="text-left">
                        <p className="text-xs font-bold">{amp.name}</p>
                        <p className="text-[9px] text-text-secondary uppercase">{amp.brand}</p>
                      </div>
                    </button>
                  ))}
                  {filteredAmps.length === 0 && (
                    <div className="py-8 text-center text-text-secondary text-xs italic">No amplifiers found matching filters.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 bg-background-dark border border-border-dark rounded-3xl p-0 relative flex flex-col shadow-inner overflow-hidden">
          <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-6 right-6 flex gap-2 z-20">
            <button onClick={undo} disabled={historyIndex <= 0} className="size-10 rounded-xl bg-surface-dark/80 backdrop-blur border border-border-dark flex items-center justify-center hover:text-primary disabled:opacity-30"><span className="material-symbols-outlined !text-[20px]">undo</span></button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="size-10 rounded-xl bg-surface-dark/80 backdrop-blur border border-border-dark flex items-center justify-center hover:text-primary disabled:opacity-30"><span className="material-symbols-outlined !text-[20px]">redo</span></button>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center px-12 overflow-x-auto pb-12 pt-8">
            <div className="flex items-center gap-0">
              <div className="flex flex-col items-center gap-3">
                <div className="size-12 rounded-full bg-surface-dark border-2 border-border-dark flex items-center justify-center text-text-secondary"><span className="material-symbols-outlined !text-[24px]">input</span></div>
                <span className="text-[9px] font-black tracking-widest text-text-secondary uppercase">Input</span>
              </div>

              {activeChain.map((pedal, idx) => (
                <React.Fragment key={pedal.id}>
                  <PatchCable active={selectedPedalIndex === idx} />
                  <div 
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    className={`transition-all duration-300 ${draggedIndex === idx ? 'opacity-30 scale-90 grayscale' : ''} ${dragOverIndex === idx && draggedIndex !== idx ? 'translate-x-4 ring-2 ring-primary/20 rounded-2xl' : ''}`}
                  >
                    <PedalNode 
                      pedal={pedal} 
                      active={selectedPedalIndex === idx} 
                      onClick={() => { setSelectedPedalIndex(idx); setIsAmpSelected(false); }} 
                      size="md" 
                    />
                  </div>
                </React.Fragment>
              ))}

              <PatchCable active={isAmpSelected} />
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => draggedIndex !== null && handleDrop(activeChain.length - 1)}
                className="flex flex-col items-center gap-3"
              >
                <AmpNode amp={selectedAmp} active={isAmpSelected} onClick={() => { setIsAmpSelected(true); setSelectedPedalIndex(null); }} />
                <span className="text-[9px] font-black tracking-widest text-text-secondary uppercase">Amplifier</span>
              </div>

              <div className="w-12 h-1 bg-border-dark" />
              <div className="flex flex-col items-center gap-3">
                <div className="size-12 rounded-full bg-surface-dark border-2 border-border-dark flex items-center justify-center text-text-secondary"><span className="material-symbols-outlined !text-[24px]">output</span></div>
                <span className="text-[9px] font-black tracking-widest text-text-secondary uppercase">Output</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 bg-surface-dark/80 backdrop-blur border border-border-dark p-4 rounded-2xl flex items-center justify-between z-30">
            <div className="flex items-center gap-4">
               <div className={`size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary ${aiAnalyzing ? 'animate-spin' : ''}`}><span className="material-symbols-outlined">smart_toy</span></div>
               <div className="max-w-md"><p className="text-xs font-bold text-white mb-0.5">AI Tone Assistant</p><p className="text-[10px] text-text-secondary italic">{aiSuggestion || "I'll suggest how to polish your tone based on your chain."}</p></div>
            </div>
            <button onClick={handleAiToneMatch} disabled={aiAnalyzing} className="bg-primary hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-primary/20">Get Suggestion</button>
          </div>
        </div>

        <aside className="w-80 bg-surface-dark border border-border-dark rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-xl">
          {(selectedPedal || isAmpSelected) ? (
            <>
              <div className="p-5 border-b border-border-dark flex justify-between items-center bg-surface-light/30">
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`size-8 rounded bg-gradient-to-br ${isAmpSelected ? selectedAmp.color : selectedPedal!.color} flex items-center justify-center shadow`}><span className="material-symbols-outlined text-white !text-[18px]">{isAmpSelected ? 'speaker' : selectedPedal!.icon}</span></div>
                  <div>
                    <h2 className="text-sm font-bold truncate max-w-[100px]">{isAmpSelected ? selectedAmp.name : selectedPedal!.name}</h2>
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest">{isAmpSelected ? 'Amplifier' : selectedPedal!.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <BypassToggle 
                    isBypassed={isAmpSelected ? !!selectedAmp.isBypassed : !!selectedPedal?.isBypassed} 
                    onToggle={() => isAmpSelected ? toggleAmpBypass() : togglePedalBypass(selectedPedalIndex!)} 
                  />
                  {!isAmpSelected && (
                    <button onClick={() => removePedal(selectedPedalIndex!)} className="size-8 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-500 flex items-center justify-center"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                {isAmpSelected ? (
                  <div className="space-y-10">
                    {/* Amplifier Main Controls (Knobs) */}
                    <div className="grid grid-cols-2 gap-y-10 gap-x-4">
                      {ampSettings.main.map(([label, value]) => (
                        <Knob 
                          key={label} 
                          label={label} 
                          value={value as number} 
                          onChange={(newVal) => updateAmpSetting(label, newVal)} 
                        />
                      ))}
                    </div>

                    {/* Amplifier Visual EQ (Sliders) */}
                    {ampSettings.eq.length > 0 && (
                      <div className="pt-8 border-t border-border-dark/50 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined !text-[16px] text-primary">equalizer</span>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Visual Equalizer</h3>
                        </div>
                        <div className="space-y-5 bg-background-dark/30 p-4 rounded-2xl border border-white/5" onMouseUp={finalizeKnobChange}>
                          {ampSettings.eq.map(([label, value]) => (
                            <EqualizerSlider 
                              key={label} 
                              label={label} 
                              value={value as number} 
                              onChange={(newVal) => updateAmpSetting(label, newVal)} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Pedal Controls */
                  <div className="grid grid-cols-2 gap-y-10 gap-x-4" onMouseUp={finalizeKnobChange}>
                    {Object.entries(selectedPedal!.settings).map(([label, value]) => (
                      <Knob 
                        key={label} 
                        label={label} 
                        value={value} 
                        onChange={(newVal) => updatePedalSetting(selectedPedalIndex!, label, newVal)} 
                      />
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-border-dark space-y-3">
                  <div className="flex items-center gap-2 text-text-secondary"><span className="material-symbols-outlined !text-[16px]">notes</span><label className="text-[10px] font-black uppercase tracking-widest">{isAmpSelected ? 'Amp' : 'Pedal'} Notes</label></div>
                  <textarea className="w-full bg-background-dark border-none rounded-xl p-4 text-xs focus:ring-1 focus:ring-primary placeholder:text-gray-600 h-28 resize-none leading-relaxed" placeholder="Add performance notes..." value={(isAmpSelected ? selectedAmp.notes : selectedPedal!.notes) || ''} onChange={(e) => isAmpSelected ? updateAmpNotes(e.target.value) : updatePedalNotes(selectedPedalIndex!, e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
              <div className="size-20 rounded-full bg-surface-light flex items-center justify-center border border-border-dark"><span className="material-symbols-outlined !text-[40px] text-border-dark">tune</span></div>
              <div><p className="text-white font-bold">Signal Inspector</p><p className="text-text-secondary text-xs mt-2 max-w-[200px] mx-auto leading-relaxed">Select a pedal or the amplifier in the chain to adjust parameters.</p></div>
            </div>
          )}
        </aside>
      </div>

      <footer className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex items-center justify-end px-8 shadow-2xl gap-4">
        <button onClick={() => setCurrentStep(1)} className="px-6 py-2 rounded-xl text-sm font-bold text-text-secondary hover:text-white transition-colors">Edit Info</button>
        <button className="bg-surface-light hover:bg-border-dark px-6 py-2 rounded-xl text-sm font-bold border border-border-dark transition-all">Preview All</button>
        <button onClick={handleSave} className="bg-primary hover:bg-blue-600 px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transform hover:scale-105 active:scale-95 flex items-center gap-2"><span className="material-symbols-outlined !text-[18px]">save</span>Save Setup</button>
      </footer>
    </div>
  );
};

export default CreateSetup;
