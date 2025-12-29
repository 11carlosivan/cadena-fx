
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MOCK_PEDALS, MOCK_AMPLIFIERS } from '../constants';
import { Pedal, PedalType, Instrument, Amplifier, User, Setup } from '../types';
import PedalNode from '../components/PedalNode';
import { GoogleGenAI, Type } from "@google/genai";

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

const EQ_PRESETS: Record<string, Record<string, number>> = {
  'Neutral': { 'Bass': 50, 'Mid': 50, 'Middle': 50, 'Treble': 50, 'Presence': 50, 'Cut': 50 },
  'Warm': { 'Bass': 75, 'Mid': 60, 'Middle': 60, 'Treble': 35, 'Presence': 25, 'Cut': 60 },
  'Bright': { 'Bass': 30, 'Mid': 45, 'Middle': 45, 'Treble': 85, 'Presence': 80, 'Cut': 15 },
  'Scooped': { 'Bass': 80, 'Mid': 15, 'Middle': 15, 'Treble': 80, 'Presence': 60, 'Cut': 40 },
  'Vintage': { 'Bass': 65, 'Mid': 70, 'Middle': 70, 'Treble': 40, 'Presence': 30, 'Cut': 55 }
};

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
      <div className="relative size-16 cursor-ns-resize" onMouseDown={handleMouseDown}>
        <svg className="absolute inset-0 size-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border-dark" />
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

const Fader: React.FC<KnobProps> = ({ label, value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const updateValue = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const height = rect.height;
    const top = rect.top;
    const relativeY = clientY - top;
    const newValue = Math.min(100, Math.max(0, 100 - (relativeY / height) * 100));
    onChange(Math.round(newValue));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e.clientY);
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updateValue(e.clientY);
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
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center gap-4 h-56 select-none group">
      <div 
        ref={trackRef}
        className="relative w-8 flex-1 bg-black/40 rounded-full border border-white/5 cursor-ns-resize overflow-hidden shadow-inner"
        onMouseDown={handleMouseDown}
      >
        <div 
            className="absolute bottom-0 left-0 right-0 bg-primary/10 transition-all duration-300"
            style={{ height: `${value}%` }}
        />
        <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 flex flex-col justify-between pointer-events-none opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-0.5 bg-white rounded-full" />
          ))}
        </div>
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-6 h-10 bg-gradient-to-b from-surface-light to-background-dark border border-white/10 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-75 z-10"
          style={{ bottom: `calc(${value}% - 20px)` }}
        >
          <div className="w-4 h-1 bg-primary shadow-[0_0_8px_rgba(19,91,236,0.8)] rounded-full" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary group-hover:text-white transition-colors">{label}</p>
        <p className="text-[10px] font-mono text-primary font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const PatchCable: React.FC<{ active?: boolean; bypassed?: boolean }> = ({ active, bypassed }) => (
  <div className="relative w-16 h-1.5 flex items-center justify-center group/cable">
    <div className={`relative h-2 w-full bg-[#111] shadow-2xl rounded-full overflow-hidden transition-all duration-300 ${active ? 'ring-1 ring-primary/40' : ''}`}>
       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-white/5 pointer-events-none" />
       <div className={`absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-opacity duration-300 ${active && !bypassed ? 'animate-[signalFlow_2s_linear_infinite] opacity-100' : 'opacity-0'}`} />
    </div>
    <style>{`
      @keyframes signalFlow {
        from { left: -50%; }
        to { left: 150%; }
      }
    `}</style>
  </div>
);

const AmpNode: React.FC<{ amp: Amplifier; active?: boolean; onClick?: () => void }> = ({ amp, active, onClick }) => {
  const isBypassed = amp.isBypassed;
  return (
    <div 
      onClick={onClick}
      className={`relative w-52 h-36 rounded-2xl bg-gradient-to-br ${amp.color} p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer transition-all hover:-translate-y-1 ${
        active ? 'ring-2 ring-primary ring-offset-8 ring-offset-background-dark' : ''
      } ${isBypassed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
    >
      <div className="absolute top-4 left-4 flex gap-1.5">
        {[1,2,3].map(i => <div key={i} className={`size-1 rounded-full ${isBypassed ? 'bg-white/10' : 'bg-white/30 animate-pulse'}`} />)}
      </div>
      <div className="h-full flex flex-col items-center justify-center text-center space-y-1">
        <span className={`material-symbols-outlined !text-[56px] transition-colors ${isBypassed ? 'text-white/10' : 'text-white/20'}`}>speaker</span>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/50">{amp.brand}</p>
          <p className="text-sm font-bold text-white tracking-tight">{amp.name}</p>
          {amp.activeChannel && (
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <div className={`size-1 rounded-full ${isBypassed ? 'bg-gray-500' : 'bg-primary shadow-[0_0_5px_#135bec]'}`} />
              <p className={`text-[8px] font-black uppercase tracking-widest ${isBypassed ? 'text-white/30' : 'text-white/90'}`}>{amp.activeChannel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CreateSetupProps {
  onPublish: (setup: Setup) => void;
  user: User;
  onProfileClick?: () => void;
}

interface SongSearchResult {
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  primaryGenreName: string;
}

const CreateSetup: React.FC<CreateSetupProps> = ({ onPublish, user, onProfileClick }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [activeChain, setActiveChain] = useState<Pedal[]>([]);
  const [selectedAmp, setSelectedAmp] = useState<Amplifier>(MOCK_AMPLIFIERS[0]);
  const [history, setHistory] = useState<HistoryState[]>([{ chain: [], amplifier: { ...MOCK_AMPLIFIERS[0] } }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPedalIndex, setSelectedPedalIndex] = useState<number | null>(null);
  const [isAmpSelected, setIsAmpSelected] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'pedals' | 'amps'>('pedals');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [ampBrandFilter, setAmpBrandFilter] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('Electric Guitar');
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isInstrumentMenuOpen, setIsInstrumentMenuOpen] = useState(false);

  // Song Search States
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [songSearchResults, setSongSearchResults] = useState<SongSearchResult[]>([]);
  const [isSearchingSongs, setIsSearchingSongs] = useState(false);
  const [aiToneInsight, setAiToneInsight] = useState<string | null>(null);
  const [suggestedBlueprint, setSuggestedBlueprint] = useState<any | null>(null);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Dynamics': true, 'Drive': true, 'Modulation': true, 'Delay': false, 'Reverb': false
  });

  const pedalDescriptions: Record<string, string> = {
    'Dynamics': 'Adjusts volume and touch response. Includes compressors and limiters.',
    'Drive': 'Adds saturation, sustain, and harmonics. From light overdrive to massive fuzz.',
    'Modulation': 'Creates movement and textures. Chorus, flangers, phasers, and tremolos.',
    'Delay': 'Repeats your signal to create rhythmic echoes or ambient soundscapes.',
    'Reverb': 'Simulates acoustic spaces, from small rooms to infinite cathedrals.'
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

  const autoArrangeChain = () => {
    const order: PedalType[] = ['Dynamics', 'Drive', 'Modulation', 'Delay', 'Reverb', 'Utility'];
    const sorted = [...activeChain].sort((a, b) => {
      return order.indexOf(a.type) - order.indexOf(b.type);
    });
    commitChange(sorted, selectedAmp);
    setSelectedPedalIndex(null);
  };

  const clearChain = () => {
    if (confirm("Are you sure you want to clear your entire signal chain?")) {
        commitChange([], selectedAmp);
        setSelectedPedalIndex(null);
        setIsAmpSelected(false);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = history[prevIndex];
      setHistoryIndex(prevIndex);
      setActiveChain(state.chain);
      setSelectedAmp(state.amplifier);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      setHistoryIndex(nextIndex);
      setActiveChain(state.chain);
      setSelectedAmp(state.amplifier);
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

  const movePedal = (index: number, direction: 'left' | 'right') => {
    const next = [...activeChain];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    
    const [movedPedal] = next.splice(index, 1);
    next.splice(targetIndex, 0, movedPedal);
    
    commitChange(next, selectedAmp);
    setSelectedPedalIndex(targetIndex);
  };

  const togglePedalBypass = (index: number) => {
    const next = [...activeChain];
    next[index] = { ...next[index], isBypassed: !next[index].isBypassed };
    commitChange(next, selectedAmp);
  };

  const toggleAmpBypass = () => {
    commitChange(activeChain, { ...selectedAmp, isBypassed: !selectedAmp.isBypassed });
  };

  const updatePedalSetting = (index: number, key: string, newValue: number) => {
    const next = [...activeChain];
    next[index] = { ...next[index], settings: { ...next[index].settings, [key]: newValue } };
    setActiveChain(next);
  };

  const finalizeKnobChange = () => commitChange(activeChain, selectedAmp);

  const updateAmpChannel = (channel: string) => {
    commitChange(activeChain, { ...selectedAmp, activeChannel: channel });
  };

  const updateAmpVariant = (variant: string) => {
    commitChange(activeChain, { ...selectedAmp, activeVariant: variant });
  };

  const updateAmpSetting = (key: string, newValue: number) => {
    setSelectedAmp(prev => ({ ...prev, settings: { ...prev.settings, [key]: newValue } }));
  };

  const applyEqPreset = (presetName: string) => {
    const preset = EQ_PRESETS[presetName];
    if (!preset) return;
    
    const newSettings = { ...selectedAmp.settings };
    Object.keys(newSettings).forEach(key => {
      const presetValue = preset[key] || preset[key.toLowerCase()] || preset[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()];
      if (presetValue !== undefined) {
        newSettings[key] = presetValue;
      }
    });
    
    commitChange(activeChain, { ...selectedAmp, settings: newSettings });
  };

  const handleAiToneMatch = async () => {
    setAiAnalyzing(true);
    setAiSuggestion('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Signal chain: ${activeChain.map(p => p.name).join(' -> ')} into ${selectedAmp.brand} ${selectedAmp.name}. Recommend one pedal for a ${selectedInstrument} player seeking a modern tone.`
      });
      setAiSuggestion(response.text || "Try a shimmer reverb at the end.");
    } catch (err) {
      setAiSuggestion("Connection error. Try again.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleApplyBlueprint = () => {
    if (!suggestedBlueprint) return;
    
    // Convert suggested pedal types to real mock pedals
    const newChain: Pedal[] = suggestedBlueprint.pedals.map((pType: string, i: number) => {
      const match = MOCK_PEDALS.find(p => p.type === pType) || MOCK_PEDALS[0];
      return { ...match, id: `ai-${pType}-${i}-${Date.now()}`, isBypassed: false };
    });

    const newAmp = MOCK_AMPLIFIERS.find(a => a.brand.toLowerCase().includes(suggestedBlueprint.ampBrand.toLowerCase())) || MOCK_AMPLIFIERS[0];

    commitChange(newChain, newAmp);
    setCurrentStep(2);
    setAiSuggestion(`Applied ${suggestedBlueprint.style} blueprint!`);
  };

  const handlePublish = () => {
    setIsPublishing(true);
    const newSetup: Setup = {
      id: `setup-${Date.now()}`,
      title: songTitle || "Untitled Tone",
      artist: artistName || "Various Artists",
      creator: user.name,
      creatorAvatar: user.avatar,
      likes: 0,
      comments: 0,
      instrument: selectedInstrument,
      genre: "Modern",
      tags: [selectedInstrument.split(' ')[0], "New"],
      coverImage: coverImage || `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}`,
      chain: activeChain,
      amplifier: selectedAmp,
      updatedAt: "just now"
    };
    
    setTimeout(() => {
      onPublish(newSetup);
      setIsPublishing(false);
    }, 1200);
  };

  const handleSongSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingSongs(true);
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
      const data = await response.json();
      setSongSearchResults(data.results || []);
    } catch (error) {
      console.error('Song search failed', error);
    } finally {
      setIsSearchingSongs(false);
    }
  };

  const selectSong = async (song: SongSearchResult) => {
    setSongTitle(song.trackName);
    setArtistName(song.artistName);
    setCoverImage(song.artworkUrl100.replace('100x100bb', '1200x630bb'));
    setSongSearchResults([]);
    setSongSearchQuery('');
    
    setAiToneInsight("Synthesizing audio blueprint...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the track "${song.trackName}" by "${song.artistName}". 
        Return a JSON object with: 
        "insight": A short description of the tone, 
        "style": a one word descriptor (e.g. 'Psychedelic'), 
        "pedals": an array of 3 pedal types from ['Dynamics', 'Drive', 'Modulation', 'Delay', 'Reverb'], 
        "ampBrand": one of ['Marshall', 'Fender', 'Vox', 'Orange', 'Mesa Boogie'].`,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text);
      setAiToneInsight(data.insight);
      setSuggestedBlueprint(data);
    } catch (err) {
      setAiToneInsight("Error generating blueprint.");
    }
  };

  const filteredPedals = useMemo(() => 
    MOCK_PEDALS.filter(p => (p.name + p.brand).toLowerCase().includes(searchQuery.toLowerCase()) && (!brandFilter || p.brand === brandFilter) && (!colorFilter || p.color === colorFilter)),
  [searchQuery, brandFilter, colorFilter]);

  const filteredAmps = useMemo(() => 
    MOCK_AMPLIFIERS.filter(a => (a.name + a.brand).toLowerCase().includes(searchQuery.toLowerCase()) && (!ampBrandFilter || a.brand === ampBrandFilter)),
  [searchQuery, ampBrandFilter]);

  const selectedPedal = selectedPedalIndex !== null ? activeChain[selectedPedalIndex] : null;

  const { eqSettings, mainSettings } = useMemo(() => {
    const eq: Record<string, number> = {};
    const main: Record<string, number> = {};
    const eqKeys = ['bass', 'mid', 'middle', 'treble', 'presence', 'cut'];
    
    Object.entries(selectedAmp.settings).forEach(([k, v]) => {
      if (eqKeys.includes(k.toLowerCase())) {
        eq[k] = v as number;
      } else {
        main[k] = v as number;
      }
    });
    return { eqSettings: eq, mainSettings: main };
  }, [selectedAmp]);

  const instruments: { name: Instrument; icon: string }[] = [
    { name: 'Electric Guitar', icon: 'electric_guitar' },
    { name: 'Bass Guitar', icon: 'piano' },
    { name: 'Synth', icon: 'keyboard' },
    { name: 'Acoustic Guitar', icon: 'music_note' },
  ];

  if (currentStep === 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95">
        <div className="max-w-4xl w-full bg-surface-dark border border-border-dark rounded-[3.5rem] p-12 shadow-2xl space-y-12 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          
          <div className="text-center space-y-4">
            <div className="bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined !text-[16px]">music_note</span> Setup Step 1
            </div>
            <h2 className="text-5xl font-black tracking-tighter">Your Tone Story</h2>
            <p className="text-text-secondary text-lg">Define the track that inspired this signal chain.</p>
          </div>

          <div className="space-y-10">
            <div className="space-y-4 relative">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-2">Quick Search & Auto-Fill</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary !text-[24px]">search</span>
                <input 
                  value={songSearchQuery} 
                  onChange={e => {
                    setSongSearchQuery(e.target.value);
                    if (e.target.value.length > 2) handleSongSearch(e.target.value);
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleSongSearch(songSearchQuery)}
                  placeholder="Search for a song or artist..." 
                  className="w-full bg-background-dark/50 border-border-dark rounded-[2rem] py-6 pl-16 pr-6 text-xl font-bold focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text-secondary/40 shadow-inner"
                />
                {isSearchingSongs && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {songSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-light border border-border-dark rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-4">
                  {songSearchResults.map((song, i) => (
                    <button 
                      key={i} 
                      onClick={() => selectSong(song)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-primary/10 transition-colors border-b border-border-dark last:border-none text-left"
                    >
                      <img src={song.artworkUrl100} className="size-12 rounded-xl object-cover shadow-lg" alt="" />
                      <div>
                        <p className="font-black text-sm text-white">{song.trackName}</p>
                        <p className="text-xs text-text-secondary">{song.artistName} • {song.primaryGenreName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-2">Song Title</label>
                <input value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="e.g. Starla" className="w-full bg-background-dark border-border-dark rounded-2xl p-4 text-lg font-bold focus:border-primary transition-all" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-2">Artist</label>
                <input value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="The Smashing Pumpkins" className="w-full bg-background-dark border-border-dark rounded-2xl p-4 text-lg font-bold focus:border-primary transition-all" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-2">Instrument</label>
                <div className="flex flex-wrap gap-2">
                  {instruments.map(inst => (
                    <button
                      key={inst.name}
                      onClick={() => setSelectedInstrument(inst.name)}
                      className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-bold text-sm ${
                        selectedInstrument === inst.name 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-background-dark border-border-dark text-text-secondary hover:bg-surface-light hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined !text-[20px]">{inst.icon}</span>
                      {inst.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {aiToneInsight && (
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex gap-4">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                    <span className="material-symbols-outlined !text-[28px] relative z-10">smart_toy</span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">AI Tone Blueprint Insight</h4>
                    <p className="text-sm text-text-secondary leading-relaxed font-medium italic">"{aiToneInsight}"</p>
                  </div>
                </div>
                {suggestedBlueprint && (
                  <button 
                    onClick={handleApplyBlueprint}
                    className="shrink-0 bg-white text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined !text-[18px]">magic_button</span>
                    Apply Rig Blueprint
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-border-dark/50">
            <button 
              onClick={onProfileClick}
              className="flex items-center gap-3 group/user"
            >
              <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-border-dark group-hover/user:ring-primary transition-all shadow-xl" style={{ backgroundImage: `url(${user.avatar})` }} />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Creating as</p>
                <p className="text-sm font-bold group-hover/user:text-primary transition-colors">{user.name}</p>
              </div>
            </button>
            <button disabled={!songTitle || !artistName} onClick={() => setCurrentStep(2)} className="bg-primary hover:bg-blue-600 disabled:opacity-20 px-12 py-5 rounded-3xl font-black text-xl flex items-center gap-3 transition-all hover:scale-105 shadow-xl shadow-primary/30 active:scale-95">
              Enter Pedalboard <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in slide-in-from-right duration-500">
      <div className="bg-surface-dark/40 backdrop-blur-xl border border-border-dark rounded-2xl p-4 flex items-center justify-between px-8 shadow-xl">
        <div className="flex items-center gap-6">
          <button onClick={() => setCurrentStep(1)} className="size-12 rounded-2xl bg-background-dark border border-border-dark flex items-center justify-center text-text-secondary hover:text-white transition-all shadow-lg active:scale-95"><span className="material-symbols-outlined">edit_note</span></button>
          <div className="flex items-center gap-4">
            {coverImage && <img src={coverImage} className="size-10 rounded-lg object-cover shadow-lg border border-white/5" alt="" />}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-black text-2xl tracking-tight">{songTitle}</h2>
                <span className="text-text-secondary/50 font-black">/</span>
                <p className="text-text-secondary font-bold text-lg">{artistName}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button onClick={undo} disabled={historyIndex <= 0} className="size-11 rounded-xl bg-background-dark/50 border border-border-dark flex items-center justify-center disabled:opacity-20 hover:text-primary transition-colors shadow-lg"><span className="material-symbols-outlined">undo</span></button>
           <button onClick={redo} disabled={historyIndex >= history.length - 1} className="size-11 rounded-xl bg-background-dark/50 border border-border-dark flex items-center justify-center disabled:opacity-20 hover:text-primary transition-colors shadow-lg"><span className="material-symbols-outlined">redo</span></button>
           <button onClick={clearChain} className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500/20 transition-all shadow-lg active:scale-95">
             <span className="material-symbols-outlined !text-[18px]">delete_sweep</span> Clear
           </button>
           <button onClick={autoArrangeChain} className="bg-primary/10 border border-primary/20 text-primary px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-all shadow-lg active:scale-95">
             <span className="material-symbols-outlined !text-[18px]">magic_button</span> Auto-Order
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <aside className="w-72 bg-surface-dark border border-border-dark rounded-3xl flex flex-col shrink-0 overflow-hidden shadow-2xl">
          <div className="flex bg-background-dark/30">
            <button onClick={() => setLibraryTab('pedals')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${libraryTab === 'pedals' ? 'text-primary bg-primary/5' : 'text-text-secondary'}`}>Pedals</button>
            <button onClick={() => setLibraryTab('amps')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${libraryTab === 'amps' ? 'text-primary bg-primary/5' : 'text-text-secondary'}`}>Amps</button>
          </div>
          <div className="p-4 border-b border-border-dark bg-background-dark/10">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary !text-[18px]">search</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={`Find ${libraryTab}...`} className="w-full bg-background-dark border-border-dark rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-primary/40 focus:border-primary transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {libraryTab === 'pedals' ? (
              Object.entries(pedalDescriptions).map(([type, desc]) => {
                const categoryPedals = filteredPedals.filter(p => p.type === type);
                if (categoryPedals.length === 0) return null;
                const isExp = expandedSections[type];
                return (
                  <div key={type} className="space-y-3">
                    <button onClick={() => setExpandedSections(p => ({...p, [type]: !isExp}))} className="w-full flex items-center justify-between group">
                      <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors ${isExp ? 'text-primary' : 'text-text-secondary'}`}>{type}</h3>
                      <span className={`material-symbols-outlined !text-[18px] text-text-secondary transition-transform ${isExp ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                    {isExp && (
                      <div className="space-y-2 animate-in slide-in-from-top-2">
                        {categoryPedals.map(p => (
                          <button key={p.id} onClick={() => addPedal(p)} className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-surface-light/5 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all group shadow-sm">
                            <div className={`size-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}><span className="material-symbols-outlined text-white !text-[20px]">{p.icon}</span></div>
                            <div className="text-left"><p className="text-[11px] font-bold">{p.name}</p><p className="text-[8px] text-text-secondary uppercase">{p.brand}</p></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              filteredAmps.map(amp => (
                <button key={amp.id} onClick={() => commitChange(activeChain, amp)} className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all shadow-sm ${selectedAmp.id === amp.id ? 'bg-primary/10 border-primary/50' : 'bg-surface-light/10 border-transparent hover:bg-white/5'}`}>
                  <div className={`size-14 rounded-2xl bg-gradient-to-br ${amp.color} flex items-center justify-center shadow-xl`}><span className="material-symbols-outlined text-white !text-[28px]">speaker</span></div>
                  <div className="text-left"><p className="text-xs font-black tracking-tight">{amp.name}</p><p className="text-[9px] text-text-secondary uppercase">{amp.brand}</p></div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex-1 bg-[#0a0c10] border border-border-dark rounded-[3rem] relative flex flex-col shadow-[inset_0_10px_100px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10 flex-1 flex items-center justify-center px-16 overflow-x-auto pb-8 pt-4">
            <div className="flex items-center gap-0">
              <div className="flex flex-col items-center gap-4 group">
                <div className="size-14 rounded-full bg-surface-dark border-2 border-border-dark flex items-center justify-center text-text-secondary group-hover:text-primary transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"><span className="material-symbols-outlined !text-[32px]">input</span></div>
                <span className="text-[10px] font-black tracking-widest text-text-secondary uppercase">Input</span>
              </div>

              {activeChain.map((p, i) => (
                <React.Fragment key={p.id}>
                  <PatchCable active={true} bypassed={p.isBypassed} />
                  <div className="relative">
                    <PedalNode pedal={p} active={selectedPedalIndex === i} onClick={() => { setSelectedPedalIndex(i); setIsAmpSelected(false); }} size="md" />
                  </div>
                </React.Fragment>
              ))}

              <PatchCable active={true} bypassed={selectedAmp.isBypassed} />
              <div className="flex flex-col items-center gap-4">
                <AmpNode amp={selectedAmp} active={isAmpSelected} onClick={() => { setIsAmpSelected(true); setSelectedPedalIndex(null); }} />
                <span className="text-[10px] font-black tracking-widest text-text-secondary uppercase">Amplifier</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 inset-x-8 bg-surface-dark/90 backdrop-blur-2xl border border-primary/20 p-5 rounded-[2rem] flex items-center justify-between z-30 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-5">
               <div className={`size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden`}>
                 {aiAnalyzing && <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-2xl animate-spin" />}
                 <span className="material-symbols-outlined !text-[32px]">smart_toy</span>
               </div>
               <div className="max-w-md">
                 <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-1">Tone Assistant Expert</p>
                 <p className="text-[13px] text-text-secondary leading-snug font-medium italic">
                   {aiAnalyzing ? "Optimizing signal-to-noise ratio..." : aiSuggestion || "Your rig is looking professional. Need an adjustment?"}
                 </p>
               </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAiToneMatch} disabled={aiAnalyzing} className="bg-primary hover:bg-blue-600 disabled:opacity-50 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
                {aiAnalyzing ? "Processing..." : "Analyze Setup"}
              </button>
            </div>
          </div>
        </div>

        <aside className="w-80 bg-surface-dark border border-border-dark rounded-3xl flex flex-col shrink-0 overflow-hidden shadow-2xl">
          {(selectedPedal || isAmpSelected) ? (
            <>
              <div className="p-6 border-b border-border-dark bg-surface-light/20 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-xl bg-gradient-to-br ${isAmpSelected ? selectedAmp.color : selectedPedal!.color} flex items-center justify-center shadow-lg`}><span className="material-symbols-outlined text-white !text-[24px]">{isAmpSelected ? 'speaker' : selectedPedal!.icon}</span></div>
                    <div>
                      <h2 className="text-base font-black truncate max-w-[120px] tracking-tight">{isAmpSelected ? selectedAmp.name : selectedPedal!.name}</h2>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">{isAmpSelected ? 'Amplifier' : selectedPedal!.type}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-background-dark/30 rounded-2xl border border-white/5">
                    <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Component Power</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${ (isAmpSelected ? selectedAmp.isBypassed : selectedPedal!.isBypassed) ? 'text-text-secondary/50' : 'text-primary'}`}>
                        {(isAmpSelected ? selectedAmp.isBypassed : selectedPedal!.isBypassed) ? 'BYPASSED' : 'ACTIVE'}
                    </span>
                    </div>
                    <button 
                    onClick={() => isAmpSelected ? toggleAmpBypass() : togglePedalBypass(selectedPedalIndex!)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner overflow-hidden ${ (isAmpSelected ? selectedAmp.isBypassed : selectedPedal!.isBypassed) ? 'bg-background-dark' : 'bg-primary/20 border-primary/40'}`}
                    >
                        <div className={`absolute top-1 size-5 rounded-full transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.5)] flex items-center justify-center ${ (isAmpSelected ? selectedAmp.isBypassed : selectedPedal!.isBypassed) ? 'left-1 bg-surface-light' : 'left-8 bg-primary shadow-[0_0_10px_#135bec]'}`}>
                        <div className={`size-1.5 rounded-full ${ (isAmpSelected ? selectedAmp.isBypassed : selectedPedal!.isBypassed) ? 'bg-gray-600' : 'bg-white shadow-[0_0_5px_white]'}`} />
                        </div>
                    </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-10" onMouseUp={finalizeKnobChange}>
                {isAmpSelected ? (
                  <div className={`space-y-10 transition-opacity duration-300 ${selectedAmp.isBypassed ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Main Gain & Volume</h3>
                       <div className="grid grid-cols-2 gap-y-12 gap-x-6">
                        {Object.entries(mainSettings).map(([label, value]) => (
                          <Knob key={label} label={label} value={value} onChange={v => updateAmpSetting(label, v)} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Graphic Equalizer</h3>
                       <div className="bg-background-dark/50 border border-white/5 rounded-3xl p-6 flex justify-around items-end gap-2 shadow-inner min-h-[280px]">
                        {Object.entries(eqSettings).map(([label, value]) => (
                          <Fader key={label} label={label} value={value} onChange={v => updateAmpSetting(label, v)} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`grid grid-cols-2 gap-y-12 gap-x-6 transition-opacity duration-300 ${selectedPedal!.isBypassed ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
                    {Object.entries(selectedPedal!.settings).map(([label, value]) => (
                      <Knob key={label} label={label} value={value} onChange={v => updatePedalSetting(selectedPedalIndex!, label, v)} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 animate-in fade-in">
              <div className="size-24 rounded-[2rem] bg-gradient-to-br from-surface-light to-background-dark flex items-center justify-center border border-border-dark shadow-2xl"><span className="material-symbols-outlined !text-[48px] text-primary/30">tune</span></div>
              <div className="space-y-3">
                <p className="text-xl font-black tracking-tight text-white/90">Rig Inspector</p>
                <p className="text-sm text-text-secondary leading-relaxed">Select any component in your signal chain to fine-tune its parameters and tone.</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <footer className="bg-surface-dark/80 backdrop-blur-xl border border-border-dark p-4 rounded-[2.5rem] flex items-center justify-end px-10 shadow-2xl gap-5 relative">
        <div className="mr-auto">
          <button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-text-secondary hover:text-white transition-all uppercase tracking-widest active:scale-95">
            <span className="material-symbols-outlined !text-[18px]">arrow_back</span> Info
          </button>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsInstrumentMenuOpen(!isInstrumentMenuOpen)}
            className="bg-surface-light hover:bg-border-dark px-6 py-3 rounded-2xl text-sm font-bold border border-border-dark transition-all flex items-center gap-3 min-w-[200px] shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined !text-[18px] text-primary">
              {instruments.find(i => i.name === selectedInstrument)?.icon || 'music_note'}
            </span>
            <span className="truncate uppercase tracking-widest text-[10px] font-black">{selectedInstrument}</span>
            <span className={`material-symbols-outlined transition-transform duration-300 ${isInstrumentMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {isInstrumentMenuOpen && (
            <div className="absolute bottom-full mb-3 left-0 right-0 bg-surface-dark border border-border-dark rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100]">
              <div className="p-2 space-y-1">
                {instruments.map(inst => (
                  <button
                    key={inst.name}
                    onClick={() => {
                      setSelectedInstrument(inst.name);
                      setIsInstrumentMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedInstrument === inst.name 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-text-secondary hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">{inst.icon}</span>
                    {inst.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-primary hover:bg-blue-600 px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          {isPublishing ? (
            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined !text-[20px]">publish</span>
          )}
          {isPublishing ? "Saving Rig..." : "Publish Rig"}
        </button>
      </footer>
    </div>
  );
};

export default CreateSetup;
