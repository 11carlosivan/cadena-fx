
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import SetupDetail from './pages/SetupDetail';
import CreateSetup from './pages/CreateSetup';
import AuthModal from './components/AuthModal';
import { Setup, User } from './types';
import { MOCK_SETUPS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [selectedSetup, setSelectedSetup] = useState<Setup | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedSetups, setSavedSetups] = useState<Setup[]>([]);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'info' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = (callback: () => void) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    callback();
  };

  const handleTabChange = (tab: string) => {
    if ((tab === 'create' || tab === 'my setups') && !user) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
    setSelectedSetup(null);
  };

  const handleLogin = (userData: User, welcomeMsg: string) => {
    setUser(userData);
    showNotification(welcomeMsg, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('explore');
    showNotification('Logged out successfully');
  };

  const handleSaveSetup = (setup: Setup) => {
    handleAction(() => {
      if (savedSetups.find(s => s.id === setup.id)) {
        showNotification(`"${setup.title}" is already in your library.`);
        return;
      }
      setSavedSetups(prev => [...prev, setup]);
      showNotification(`Tone "${setup.title}" saved!`, 'success');
    });
  };

  const renderSetupGrid = (setups: Setup[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {setups.map((setup) => (
        <div 
          key={setup.id}
          onClick={() => { setSelectedSetup(setup); setActiveTab('detail'); }}
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
          </div>
          <div className="p-4 flex flex-col gap-1">
            <h3 className="font-bold group-hover:text-primary transition-colors truncate">{setup.title}</h3>
            <p className="text-xs text-text-secondary truncate">{setup.artist}</p>
            <div className="mt-4 pt-3 border-t border-border-dark flex items-center justify-between text-text-secondary">
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${setup.creatorAvatar})` }} />
                <span className="text-[10px] font-medium">{setup.creator}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <span className="material-symbols-outlined !text-[14px]">favorite</span>
                {setup.likes}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'detail' && selectedSetup) {
      return (
        <SetupDetail 
          setup={selectedSetup} 
          onBack={() => setActiveTab('explore')}
          onClone={() => handleAction(() => showNotification("Setup cloned to your library!"))}
          onFavorite={() => handleAction(() => showNotification("Added to favorites"))}
          onComment={(text) => handleAction(() => showNotification("Comment posted!"))}
        />
      );
    }

    switch (activeTab) {
      case 'home':
      case 'explore':
        return (
          <Home 
            onSetupSelect={(s) => { setSelectedSetup(s); setActiveTab('detail'); }}
            onSaveSetup={handleSaveSetup}
            onShareRig={() => handleAction(() => showNotification("Rig shared with the community!"))}
          />
        );
      case 'my setups':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black">My Rig Library</h1>
                <p className="text-text-secondary text-sm">Your personal collection of saved and created tones.</p>
              </div>
              <button onClick={() => setActiveTab('create')} className="bg-primary hover:bg-blue-600 px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">add</span> Create New
              </button>
            </div>
            {savedSetups.length > 0 ? renderSetupGrid(savedSetups) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <span className="material-symbols-outlined !text-[64px] text-border-dark">library_music</span>
                <p className="text-text-secondary max-w-xs">You haven't saved any setups yet. Explore the community to find your next sound!</p>
                <button onClick={() => setActiveTab('explore')} className="text-primary font-bold hover:underline">Browse Community</button>
              </div>
            )}
          </div>
        );
      case 'community':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black">Community Trends</h1>
                <p className="text-text-secondary text-sm">What's currently blowing the roof off in the ToneShare world.</p>
              </div>
            </div>
            {renderSetupGrid(MOCK_SETUPS)}
          </div>
        );
      case 'create':
        return <CreateSetup />;
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-500">
            <div className="size-32 rounded-full bg-cover bg-center border-4 border-primary shadow-2xl" style={{ backgroundImage: `url(${user?.avatar})` }} />
            <div>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-text-secondary">{user?.bio}</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-surface-dark border border-border-dark p-6 rounded-2xl w-32">
                <p className="text-2xl font-bold">{savedSetups.length}</p>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">Saved</p>
              </div>
              <div className="bg-surface-dark border border-border-dark p-6 rounded-2xl w-32">
                <p className="text-2xl font-bold text-primary">850</p>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">Likes</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">Edit Settings</button>
              <button onClick={handleLogout} className="px-8 py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all">Logout</button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined !text-[64px] text-border-dark">construction</span>
              <h2 className="text-2xl font-bold text-text-secondary">This section is currently under development.</h2>
              <button onClick={() => setActiveTab('explore')} className="text-primary font-bold hover:underline">Return to Explore</button>
            </div>
          </div>
        );
    }
  };

  const handleSetupSelect = (setup: Setup) => {
    setSelectedSetup(setup);
    setActiveTab('detail');
  };

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={handleTabChange} user={user} onLoginClick={() => setIsAuthModalOpen(true)}>
        {renderContent()}
      </Layout>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />
      
      {/* Sistema de Notificaciones Toast */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
            notification.type === 'success' ? 'bg-primary/20 border-primary text-white' : 'bg-surface-dark/90 border-border-dark text-text-secondary'
          }`}>
            <span className="material-symbols-outlined !text-[20px]">{notification.type === 'success' ? 'check_circle' : 'info'}</span>
            <span className="font-bold text-sm">{notification.msg}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
