
import React, { useState } from 'react';
import { Setup, Amplifier } from '../types';
import PedalNode from '../components/PedalNode';

interface SetupDetailProps {
  setup: Setup;
  onBack: () => void;
  onClone: () => void;
  onFavorite: () => void;
  onComment: (text: string) => void;
}

const AmpNodeDisplay: React.FC<{ amp: Amplifier }> = ({ amp }) => (
  <div className="relative w-40 h-28 rounded-xl bg-gradient-to-br from-surface-light to-background-dark p-3 border border-border-dark shadow-xl flex flex-col items-center justify-center text-center gap-1">
    <div className={`absolute inset-0 bg-gradient-to-br ${amp.color} opacity-10 rounded-xl`} />
    <span className="material-symbols-outlined !text-[32px] text-primary/60">speaker</span>
    <div>
      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{amp.brand}</p>
      <p className="text-xs font-bold text-white">{amp.name}</p>
    </div>
  </div>
);

const SetupDetail: React.FC<SetupDetailProps> = ({ setup, onBack, onClone, onFavorite, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    onComment(commentText);
    setCommentText('');
  };

  const handleFavoriteClick = () => {
    setIsLiked(!isLiked);
    onFavorite();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <button onClick={onBack} className="hover:text-white transition-colors">Home</button>
        <span className="material-symbols-outlined !text-[16px]">chevron_right</span>
        <span className="font-medium text-white">{setup.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{setup.title}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Created by</span>
              <button className="text-primary font-bold hover:underline">{setup.creator}</button>
            </div>
            <div className="size-1 rounded-full bg-border-dark" />
            <span className="text-xs text-text-secondary">Updated {setup.updatedAt}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-surface-dark border border-border-dark px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined !text-[16px]">piano</span> {setup.instrument}
            </span>
            {setup.tags.map(tag => (
              <span key={tag} className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClone}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <span className="material-symbols-outlined !text-[20px]">content_copy</span>
            Clone Setup
          </button>
          <button 
            onClick={handleFavoriteClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold border transition-all active:scale-95 ${
              isLiked 
                ? 'bg-pink-500 text-white border-pink-500 shadow-xl shadow-pink-500/20' 
                : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border-pink-500/20'
            }`}
          >
            <span className={`material-symbols-outlined !text-[22px] ${isLiked ? 'material-symbols-fill' : ''}`}>favorite</span>
            {setup.likes + (isLiked ? 1 : 0)}
          </button>
        </div>
      </div>

      {/* Creator's Note */}
      <div className="p-8 rounded-2xl bg-surface-dark/50 border-l-4 border-primary italic">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined !text-[18px]">format_quote</span>
          Creator's Note
        </h3>
        <p className="text-lg text-gray-300 leading-relaxed">
          "This chain is all about capturing the woody, resonant mid-range of the neck pickup. 
          Make sure your volume knob is around 7 to get that glassy saturation without losing definition. 
          The compressor is the secret sauce here—don't overdo the sensitivity."
        </p>
      </div>

      {/* Signal Chain Visualization */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-primary !text-3xl">cable</span>
          Signal Chain
        </h2>
        <div className="relative w-full rounded-3xl bg-[#14181f] border border-border-dark p-8 md:p-16 overflow-x-auto shadow-inner">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="flex items-center min-w-max relative z-10 gap-0">
            {/* Input Node */}
            <div className="flex flex-col items-center gap-3 mr-6">
              <div className="size-16 rounded-full bg-surface-dark border-2 border-border-dark flex items-center justify-center shadow-2xl">
                <span className="material-symbols-outlined text-text-secondary !text-3xl">input</span>
              </div>
              <span className="text-[10px] font-black tracking-widest text-text-secondary uppercase">Input</span>
            </div>

            {setup.chain.map((pedal, index) => (
              <React.Fragment key={pedal.id}>
                {/* Connector Line */}
                <div className="w-12 md:w-20 h-1 bg-gradient-to-r from-border-dark to-primary/50 relative">
                   <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/20 blur-[2px]" />
                </div>
                
                <PedalNode pedal={pedal} active={true} size="md" />
              </React.Fragment>
            ))}

            {/* Amplifier Connector */}
            {setup.amplifier && (
              <>
                <div className="w-12 md:w-20 h-1 bg-gradient-to-r from-primary/50 to-primary/80 relative" />
                <div className="mx-4">
                  <AmpNodeDisplay amp={setup.amplifier} />
                </div>
              </>
            )}

            {/* Output Node */}
            <div className="w-12 md:w-20 h-1 bg-gradient-to-r from-primary/80 to-border-dark" />
            <div className="flex flex-col items-center gap-3 ml-6">
              <div className="size-16 rounded-full bg-surface-dark border-2 border-border-dark flex items-center justify-center shadow-2xl">
                <span className="material-symbols-outlined text-text-secondary !text-3xl">output</span>
              </div>
              <span className="text-[10px] font-black tracking-widest text-text-secondary uppercase">Output</span>
            </div>
          </div>
        </div>
      </section>

      {/* Discussion & Gear */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-text-secondary">forum</span>
            Discussion (24)
          </h3>
          <div className="bg-surface-dark rounded-2xl border border-border-dark p-6 space-y-6">
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-border-dark bg-cover bg-center shrink-0" style={{ backgroundImage: 'url(https://picsum.photos/100/100?random=15)' }} />
              <div className="flex-1 space-y-3">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-background-dark border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary placeholder:text-text-secondary resize-none transition-all" 
                  placeholder="Ask a question or share your thoughts..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handlePostComment}
                    disabled={!commentText.trim()}
                    className="bg-primary hover:bg-blue-600 px-6 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-text-secondary">hardware</span>
            Gear Used
          </h3>
          <div className="bg-surface-dark rounded-2xl border border-border-dark p-6 space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
              <div className="size-12 rounded bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-text-secondary">piano</span>
              </div>
              <div>
                <p className="font-bold text-sm">Fender Stratocaster</p>
                <p className="text-xs text-text-secondary">Neck Pickup, Tone at 8</p>
              </div>
            </div>
            {setup.amplifier && (
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                <div className="size-12 rounded bg-background-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-text-secondary">speaker</span>
                </div>
                <div>
                  <p className="font-bold text-sm">{setup.amplifier.brand} {setup.amplifier.name}</p>
                  <p className="text-xs text-text-secondary">Primary Amplifier</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupDetail;
