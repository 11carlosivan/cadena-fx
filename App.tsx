
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import SetupDetail from './pages/SetupDetail';
import CreateSetup from './pages/CreateSetup';
import ProfilePage from './pages/ProfilePage';
import AuthModal from './components/AuthModal';
import OnboardingTutorial, { TutorialStep } from './components/OnboardingTutorial';
import { Setup, User } from './types';
import { MOCK_SETUPS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [selectedSetup, setSelectedSetup] = useState<Setup | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [communitySetups, setCommunitySetups] = useState<Setup[]>([]);
  const [savedSetups, setSavedSetups] = useState<Setup[]>([]);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [needsInstallation, setNeedsInstallation] = useState(false);

  // Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    { targetId: 'explore-nav', title: 'Legendary Library', content: 'Explore thousands of tones created by artists and enthusiasts.', position: 'bottom' },
    { targetId: 'new-setup-btn', title: 'Craft Your Chain', content: 'Ready to build? Start a new setup from scratch.', position: 'bottom' },
    { targetId: 'profile-nav', title: 'Musician Identity', content: 'Manage your rig collection and professional profile.', position: 'left' }
  ];

  // Fetch setups from API
  const fetchSetups = async () => {
    try {
      const res = await fetch('/api/setups');
      if (res.ok) {
        const data = await res.json();
        setCommunitySetups(data);
        setNeedsInstallation(false);
      } else {
        // Si la API falla, podría ser que la base de datos no esté instalada
        setNeedsInstallation(true);
      }
    } catch (err) {
      setNeedsInstallation(true);
    }
  };

  useEffect(() => {
    fetchSetups();
  }, []);

  const handleRunInstallation = async () => {
    setIsInstalling(true);
    try {
      const res = await fetch('/api/install', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification("Database installed successfully! Reloading...", "success");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showNotification("Installation failed: " + data.error, "info");
      }
    } catch (err) {
      showNotification("Network error during installation", "info");
    } finally {
      setIsInstalling(false);
    }
  };

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
    if ((tab === 'create' || tab === 'my setups' || tab === 'profile') && !user) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
    setSelectedSetup(null);
  };

  const handlePublishSetup = async (newSetup: Setup) => {
    try {
      const res = await fetch('/api/setups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSetup, creator_id: user?.id })
      });
      if (res.ok) {
        fetchSetups();
        setActiveTab('explore');
        showNotification("Rig published to global database!", "success");
      }
    } catch (err) {
      showNotification("Error connecting to server", "info");
    }
  };

  if (needsInstallation) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-dark border border-border-dark rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl animate-in zoom-in-95">
          <div className="size-20 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined !text-[48px]">database_upload</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">System Setup</h1>
            <p className="text-text-secondary text-sm">ToneShare is ready to be hosted. We need to initialize the MySQL database schema to begin.</p>
          </div>
          <div className="p-4 bg-background-dark/50 rounded-2xl border border-white/5 text-left">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Requirements</p>
            <ul className="text-xs space-y-1 text-text-secondary">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined !text-[14px] text-green-500">check_circle</span> Node.js App created in cPanel</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined !text-[14px] text-green-500">check_circle</span> MySQL Database & User created</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined !text-[14px] text-green-500">check_circle</span> .env file configured</li>
            </ul>
          </div>
          <button 
            onClick={handleRunInstallation}
            disabled={isInstalling}
            className="w-full bg-primary hover:bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isInstalling ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Run SQL Install Script"}
          </button>
          <p className="text-[10px] text-text-secondary">This will execute setup_db.sql on your host.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={handleTabChange} user={user} onLoginClick={() => setIsAuthModalOpen(true)}>
        {activeTab === 'explore' && <Home setups={communitySetups} onSetupSelect={setSelectedSetup} onSaveSetup={(s) => showNotification("Saved!")} onShareRig={() => handleTabChange('create')} />}
        {activeTab === 'create' && <CreateSetup onPublish={handlePublishSetup} user={user!} />}
        {/* ... Otros componentes renderizados condicionalmente */}
      </Layout>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={(u, m) => { setUser(u); showNotification(m, "success"); }} />
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5">
          <div className="px-6 py-3 rounded-2xl bg-surface-dark border border-primary shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">{notification.type === 'success' ? 'check_circle' : 'info'}</span>
            <span className="font-bold text-sm">{notification.msg}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
