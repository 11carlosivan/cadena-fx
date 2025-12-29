
import React from 'react';
import { MOCK_SETUPS } from '../constants';
import { Setup } from '../types';

interface HomeProps {
  onSetupSelect: (setup: Setup) => void;
  onSaveSetup: (setup: Setup) => void;
  onShareRig: () => void;
}

const Home: React.FC<HomeProps> = ({ onSetupSelect, onSaveSetup, onShareRig }) => {
  const featured = MOCK_SETUPS[1];

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Hero Banner */}
      <section className="relative h-[500px] rounded-3xl overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105"
          style={{ backgroundImage: `url(${featured.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end gap-6">
          <div className="flex items-center gap-3">
            <span className="bg-primary/20 border border-primary/30 text-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Editor's Choice</span>
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
              <span className="material-symbols-outlined !text-[18px] material-symbols-fill">star</span> 5.0
            </div>
          </div>
          <div className="max-w-2xl space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">{featured.title}</h1>
            <p className="text-xl text-gray-300 font-medium">{featured.artist}</p>
            <p className="text-text-secondary text-lg mt-4 line-clamp-2">
              Discover the legendary chain behind one of the most iconic guitar solos in history.
              Every pedal, setting, and nuance breakdown.
            </p>
          </div>
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => onSetupSelect(featured)}
              className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2 group/btn"
            >
              View Full Setup
              <span className="material-symbols-outlined !text-[20px] transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
            </button>
            <button 
              onClick={() => onSaveSetup(featured)}
              className="bg-surface-light hover:bg-border-dark px-6 py-3 rounded-xl font-bold border border-border-dark transition-colors active:scale-95"
            >
              Save Tone
            </button>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border-dark pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">public</span>
            Community Setups
          </h2>
          <div className="flex gap-2">
            {['Trending', 'Newest', 'Top Rated'].map((filter, i) => (
              <button key={filter} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${i === 0 ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-dark'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_SETUPS.map((setup) => (
            <div 
              key={setup.id}
              onClick={() => onSetupSelect(setup)}
              className="group flex flex-col bg-surface-dark border border-border-dark rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={setup.coverImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={setup.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3">
                   <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded uppercase tracking-tighter">
                     {setup.instrument.split(' ')[0]}
                   </span>
                </div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold">
                  <span className="material-symbols-outlined !text-[12px] text-yellow-400 material-symbols-fill">star</span>
                  4.8
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-bold group-hover:text-primary transition-colors truncate">{setup.title}</h3>
                <p className="text-xs text-text-secondary truncate">{setup.artist}</p>
                <div className="mt-4 pt-3 border-t border-border-dark flex items-center justify-between text-text-secondary">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${setup.creatorAvatar})` }} />
                    <span className="text-[10px] font-medium">{setup.creator}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSaveSetup(setup); }}
                    className="flex items-center gap-1 text-[10px] font-bold hover:text-pink-500 transition-colors"
                  >
                    <span className="material-symbols-outlined !text-[14px]">favorite</span>
                    {setup.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contribution CTA */}
      <section className="bg-gradient-to-br from-primary/20 to-surface-dark border border-border-dark rounded-3xl p-10 relative overflow-hidden group/cta">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[url('https://images.unsplash.com/photo-1525011268546-bf3f9b007f6a?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-10 mix-blend-overlay rotate-3 group-hover/cta:scale-110 transition-transform duration-700" />
        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="bg-primary/20 text-primary border border-primary/30 inline-block px-3 py-1 rounded font-bold text-xs uppercase tracking-widest">Contribute</div>
          <h2 className="text-4xl font-bold tracking-tight">Know a secret setup?</h2>
          <p className="text-lg text-gray-300">
            Help the community decode the sounds of tomorrow. Share your pedalboard diagrams, 
            VST chains, and professional amp settings to earn community badges.
          </p>
          <button 
            onClick={onShareRig}
            className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-black/50 active:scale-95"
          >
            <span className="material-symbols-outlined">upload</span>
            Share Your Rig
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
