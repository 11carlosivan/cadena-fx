
import React, { useState, useMemo } from 'react';
import { Setup } from '../types.ts';

interface HomeProps {
  setups: Setup[];
  onSetupSelect: (setup: Setup) => void;
  onSaveSetup: (setup: Setup) => void;
  onShareRig: () => void;
}

type SortOption = 'trending' | 'newest' | 'top rated';

const Home: React.FC<HomeProps> = ({ setups, onSetupSelect, onSaveSetup, onShareRig }) => {
  const [activeSort, setActiveSort] = useState<SortOption>('trending');
  
  const featured = setups.length > 0 ? setups[0] : null;

  const getDaysAgo = (dateStr: string) => {
    if (!dateStr) return 999;
    if (dateStr.includes('days')) return parseInt(dateStr);
    if (dateStr.includes('week')) return parseInt(dateStr) * 7;
    if (dateStr.includes('month')) return 30;
    if (dateStr.includes('just now')) return 0;
    return 999;
  };

  const sortedSetups = useMemo(() => {
    const list = [...setups];
    switch (activeSort) {
      case 'newest':
        return list.sort((a, b) => getDaysAgo(a.updatedAt) - getDaysAgo(b.updatedAt));
      case 'top rated':
      case 'trending':
      default:
        return list.sort((a, b) => b.likes - a.likes);
    }
  }, [activeSort, setups]);

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {featured && (
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
            </div>
          </div>
        </section>
      )}

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border-dark pb-4 gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">public</span>
            Community Setups
          </h2>
          <div className="flex gap-2">
            {(['trending', 'newest', 'top rated'] as SortOption[]).map((option) => (
              <button 
                key={option} 
                onClick={() => setActiveSort(option)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeSort === option ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedSetups.map((setup) => (
            <div 
              key={setup.id}
              onClick={() => onSetupSelect(setup)}
              className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={setup.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt={setup.title} />
              </div>
              <div className="p-4">
                <h3 className="font-bold truncate">{setup.title}</h3>
                <p className="text-xs text-text-secondary">{setup.artist}</p>
                <div className="mt-4 pt-3 border-t border-border-dark flex items-center justify-between text-text-secondary">
                  <span className="text-[10px]">{setup.creator}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold">
                    <span className="material-symbols-outlined !text-[14px]">favorite</span>
                    {setup.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
