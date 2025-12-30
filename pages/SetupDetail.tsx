
import React, { useState } from 'react';
import { Setup, Amplifier } from '../types.ts';
import PedalNode from '../components/PedalNode.tsx';
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

  const handleGetCritique = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Critique this guitar rig for the song "${setup.title}". Chain: ${setup.chain.map(p => p.name).join(' -> ')}. Advice in 50 words max.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiCritique(response.text || "Watch those gain stages.");
    } catch (err) {
      setAiCritique("Producers are busy right now.");
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
          <button onClick={onProfileClick} className="text-primary font-bold hover:underline">Created by {setup.creator}</button>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGetCritique} disabled={isAnalyzing} className="bg-purple-600 px-6 py-3 rounded-xl font-bold transition-all shadow-xl active:scale-95">
            {isAnalyzing ? "..." : "AI Critique"}
          </button>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3"><span className="material-symbols-outlined text-primary !text-3xl">cable</span> Signal Chain</h2>
        <div className="relative w-full rounded-3xl bg-[#14181f] border border-border-dark p-8 overflow-x-auto">
          <div className="flex items-center min-w-max relative z-10 gap-0">
            {setup.chain.map((pedal, index) => (
              <React.Fragment key={pedal.id}>
                <PedalNode pedal={pedal} active={true} size="md" />
                <div className="w-10 h-1 bg-border-dark" />
              </React.Fragment>
            ))}
            {setup.amplifier && <AmpNodeDisplay amp={setup.amplifier} />}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SetupDetail;
