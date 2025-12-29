
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User | null;
  onLoginClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLoginClick }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-white font-sans overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-background-dark/95 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onTabChange('home')}
            >
              <div className="size-8 flex items-center justify-center rounded bg-gradient-to-br from-primary to-blue-400 text-white shadow-[0_0_15px_rgba(19,91,236,0.5)]">
                <span className="material-symbols-outlined !text-[20px] material-symbols-fill">graphic_eq</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">ToneShare</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              {['Explore', 'My Setups', 'Community'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab.toLowerCase())}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    activeTab === tab.toLowerCase() ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <div className="relative hidden sm:block w-full max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary !text-[20px]">search</span>
              <input 
                className="w-full bg-surface-dark border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary placeholder:text-text-secondary"
                placeholder="Search setups, pedals..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onTabChange('create')}
                className="hidden sm:flex items-center gap-2 bg-primary hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(19,91,236,0.3)]"
              >
                <span className="material-symbols-outlined !text-[18px]">add_circle</span>
                New Setup
              </button>
              
              {user ? (
                <button 
                  onClick={() => onTabChange('profile')}
                  className={`size-9 rounded-full bg-cover bg-center ring-2 transition-all ${activeTab === 'profile' ? 'ring-primary shadow-[0_0_10px_rgba(19,91,236,0.5)]' : 'ring-border-dark'}`}
                  style={{ backgroundImage: `url(${user.avatar})` }}
                />
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="px-4 py-2 bg-surface-light border border-border-dark rounded-lg text-xs font-bold hover:bg-border-dark transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="border-t border-border-dark bg-[#0b0d11] p-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">graphic_eq</span>
            <span className="font-bold text-lg">ToneShare</span>
          </div>
          <p className="text-text-secondary text-sm">© 2024 ToneShare. Built for musicians, by musicians.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Support'].map(link => (
              <a key={link} href="#" className="text-text-secondary hover:text-white text-xs transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
