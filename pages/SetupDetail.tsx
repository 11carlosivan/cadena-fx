
import React, { useState } from 'react';
import { Setup, Amplifier } from '../types';
import PedalNode from '../components/PedalNode';
import { GoogleGenAI } from "@google/genai";

interface SetupDetailProps {
  setup: Setup;
  onBack: () => void;
  onClone: () => void;
  onFavorite: () => void;
  onComment: (text: string) => void;
  onProfileClick?: () => void;
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

const SetupDetail: React.FC<SetupDetailProps> = ({ setup, onBack, onClone, onFavorite, onComment, onProfileClick }) => {
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [aiCritique, setAiCritique] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    onComment(commentText);
    setCommentText('');
  };

  const handleFavoriteClick = () => {
    setIsLiked(!isLiked);
    onFavorite();
  };

  const handleGetCritique = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a legendary music producer (Butch Vig style). Technically critique this guitar rig for the song "${setup.title}" by "${setup.artist}". 
      Chain: ${setup.chain.map(p => `${p.name} (${p.type})`).join(' -> ')}. 
      Amp: ${setup.amplifier?.brand} ${setup.amplifier?.name}. 
      Give a professional, technical advice in 50 words max. Be honest and a bit edgy.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAiCritique(response.text || "It's a start, but watch those gain stages.");
    } catch (err) {
      setAiCritique("Producers are busy right now. Try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <button onClick={onBack} className="hover:text-white transition-colors">Home</button>
        <span className="material-symbols-outlined !text-[16px]">chevron_right</span>
        <span className="font-medium text-white">{setup.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{setup.title}</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={onProfileClick}
              className="flex items-center gap-3 group/creator"
            >
              <div className="size-8 rounded-full bg-cover bg-center ring-2 ring-border-dark group-hover/creator:ring-primary transition-all" style={{ backgroundImage: `url(${setup.creatorAvatar})` }} />
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">Created by</span>
                <span className="text-primary font-bold hover:underline">{setup.creator}</span>
              </div>
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGetCritique}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20 active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined !text-[20px]">psychology</span>}
            Producer Critique
          </button>
          <button 
            onClick={onClone}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <span className="material-symbols-outlined !text-[20px]">content_copy</span>
            Clone Rig
          </button>
        </div>
      </div>

      {aiCritique && (
        <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 animate-in zoom-in-95 flex flex-col md:flex-row gap-6 items-center">
           <div className="size-20 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30">
             <span className="material-symbols-outlined !text-[40px]">settings_input_component</span>
           </div>
           <div>
             <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">The Producer's Technical Verdict</h3>
             <p className="text-lg font-medium text-gray-200 leading-relaxed italic">"{aiCritique}"</p>
           </div>
           <button onClick={() => setAiCritique(null)} className="ml-auto text-text-secondary hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>
      )}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-primary !text-3xl">cable</span>
          Signal Chain
        </h2>
        <div className="relative w-full rounded-3xl bg-[#14181f] border border-border-dark p-8 md:p-16 overflow-x-auto shadow-inner">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="flex items-center min-w-max relative z-10 gap-0">
            <div className="flex flex-col items-center gap-3 mr-6">
              <div className="size-16 rounded-full bg-surface-dark border-2 border-border-dark flex items-center justify-center shadow-2xl">
                <span className="material-symbols-outlined text-text-secondary !text-3xl">input</span>
              </div>
              <span className="text-[10px] font-black tracking-widest text-text-secondary uppercase">Input</span>
            </div>
            {setup.chain.map((pedal, index) => (
              <React.Fragment key={pedal.id}>
                <div className="w-12 md:w-20 h-1 bg-gradient-to-r from-border-dark to-primary/50 relative">
                   <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/20 blur-[2px]" />
                </div>
                <PedalNode pedal={pedal} active={true} size="md" />
              </React.Fragment>
            ))}
            {setup.amplifier && (
              <>
                <div className="w-12 md:w-20 h-1 bg-gradient-to-r from-primary/50 to-primary/80 relative" />
                <div className="mx-4">
                  <AmpNodeDisplay amp={setup.amplifier} />
                </div>
              </>
            )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-text-secondary">forum</span>
            Discussion
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
      </div>
    </div>
  );
};

export default SetupDetail;
