
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any, welcomeMsg: string, isRegistration: boolean) => void;
}

type AuthMode = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [inspirations, setInspirations] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = "";
      
      if (mode === 'login') {
        prompt = "Genera una frase corta y épica de bienvenida para un guitarrista que acaba de entrar a una comunidad de ToneShare. Usa máximo 10 palabras.";
      } else {
        prompt = `Genera un saludo de bienvenida personalizado para un nuevo miembro llamado ${firstName} que se acaba de unir a ToneShare. Menciona que su pasión por ${inspirations || 'la música'} enriquecerá la comunidad. Máximo 15 palabras.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const welcomeMsg = response.text || (mode === 'login' ? "¡Bienvenido de nuevo!" : "¡Bienvenido a ToneShare!");
      
      onLogin({
        id: 'user-1',
        name: mode === 'login' ? (email.split('@')[0] || 'Musician') : `${firstName} ${lastName}`,
        avatar: `https://picsum.photos/100/100?random=${mode === 'login' ? 50 : 51}`,
        banner: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?q=80&w=2000&auto=format&fit=crop',
        bio: mode === 'login' ? 'Gear head and tone chaser.' : `Inspired by ${inspirations || 'great music'}.`,
        topGear: mode === 'register' ? ['', '', ''] : ['Stratocaster', 'JCM800', 'Tube Screamer'],
        genres: mode === 'register' ? [] : ['Rock', 'Blues'],
        experience: 'Intermediate (2-5 years)',
        location: 'Earth'
      }, welcomeMsg, mode === 'register');
      
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Error al ${mode === 'login' ? 'iniciar sesión' : 'registrarse'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-dark border border-border-dark rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="size-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined !text-[28px] material-symbols-fill">
                {mode === 'login' ? 'graphic_eq' : 'person_add'}
              </span>
            </div>
            <h2 className="text-2xl font-black">{mode === 'login' ? 'Find Your Sound' : 'Join the Community'}</h2>
            <p className="text-text-secondary text-sm">
              {mode === 'login' 
                ? 'Sign in to sync your rigs and join the community.' 
                : 'Create your musical profile and start sharing your tones.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John" 
                    className="w-full bg-background-dark border-border-dark rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all placeholder:opacity-20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Last Name</label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mayer" 
                    className="w-full bg-background-dark border-border-dark rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all placeholder:opacity-20"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                className="w-full bg-background-dark border-border-dark rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all placeholder:opacity-20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-background-dark border-border-dark rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all placeholder:opacity-20"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Musical Inspirations</label>
                <textarea 
                  value={inspirations}
                  onChange={(e) => setInspirations(e.target.value)}
                  placeholder="Who are your favorite musicians?" 
                  rows={2}
                  className="w-full bg-background-dark border-border-dark rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all placeholder:opacity-20 resize-none"
                />
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 py-3.5 rounded-xl font-bold text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest pt-6 border-t border-border-dark">
            <button type="button" className="hover:text-white transition-colors">
              {mode === 'login' ? 'Forgot Password?' : 'Need Help?'}
            </button>
            <button 
              onClick={toggleMode}
              type="button" 
              className="text-primary hover:text-blue-400 transition-colors"
            >
              {mode === 'login' ? 'Create Account' : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
