
import React, { useState } from 'react';
import { User, Setup } from '../types';

interface ProfilePageProps {
  user: User;
  savedSetups: Setup[];
  onUpdateUser: (updatedUser: User) => void;
  initialEditMode?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, savedSetups, onUpdateUser, initialEditMode = false }) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [formData, setFormData] = useState<User>(user);

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const genresOptions = ['Rock', 'Metal', 'Blues', 'Jazz', 'Pop', 'Ambient', 'Shoegaze', 'Funk', 'Indie'];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      {/* Header / Banner */}
      <div className="relative h-64 rounded-[2.5rem] overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${formData.banner || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?q=80&w=2000&auto=format&fit=crop'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />
        
        {isEditing && (
          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white p-3 rounded-2xl flex items-center gap-2 text-xs font-bold border border-white/10 transition-all">
            <span className="material-symbols-outlined !text-[18px]">add_a_photo</span> Change Banner
          </button>
        )}
      </div>

      {/* Profile Info Overlay */}
      <div className="px-8 -mt-20 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          <div className="relative group">
            <div 
              className="size-40 rounded-[2.5rem] bg-cover bg-center border-8 border-background-dark shadow-2xl relative"
              style={{ backgroundImage: `url(${formData.avatar})` }}
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined !text-[32px]">photo_camera</span>
              </div>
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              {formData.name}
              <span className="material-symbols-outlined text-primary !text-[24px] material-symbols-fill">verified</span>
            </h1>
            <p className="text-text-secondary font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
              <span className="material-symbols-outlined !text-[16px]">location_on</span> {formData.location || 'Musician World'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="bg-primary hover:bg-blue-600 px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all transform hover:scale-105"
            >
              Save Profile
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-surface-light border border-border-dark px-8 py-3 rounded-2xl font-black text-sm hover:bg-border-dark transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        {/* Left Side: Stats & About */}
        <div className="space-y-6">
          <div className="bg-surface-dark border border-border-dark rounded-3xl p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-dark p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-primary">{savedSetups.length}</p>
                <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Rigs</p>
              </div>
              <div className="bg-background-dark p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-green-500">12</p>
                <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Badges</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em]">Bio</h3>
              {isEditing ? (
                <textarea 
                  className="w-full bg-background-dark border-border-dark rounded-xl p-3 text-sm focus:ring-primary h-24 resize-none leading-relaxed"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              ) : (
                <p className="text-sm text-gray-300 leading-relaxed">{formData.bio}</p>
              )}
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border-dark/50">
              <h3 className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em]">Social Connect</h3>
              <div className="space-y-3">
                {[
                  { icon: 'language', key: 'website', placeholder: 'your-website.com' },
                  { icon: 'play_circle', key: 'youtube', placeholder: 'youtube.com/@user' },
                  { icon: 'alternate_email', key: 'instagram', placeholder: '@instagram' }
                ].map(social => (
                  <div key={social.key} className="flex items-center gap-3 group">
                    <span className="material-symbols-outlined !text-[18px] text-text-secondary group-hover:text-primary">
                      {social.icon}
                    </span>
                    {isEditing ? (
                      <input 
                        className="bg-transparent border-b border-border-dark focus:border-primary text-sm w-full py-1 outline-none"
                        value={(formData as any)[social.key] || ''}
                        placeholder={social.placeholder}
                        onChange={e => setFormData({...formData, [social.key]: e.target.value})}
                      />
                    ) : (
                      <span className="text-sm text-text-secondary hover:text-white cursor-pointer transition-colors truncate">
                        {(formData as any)[social.key] || social.placeholder}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Pro Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-dark border border-border-dark rounded-3xl p-8 space-y-8">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Musical DNA
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Experience</label>
                {isEditing ? (
                  <select 
                    className="w-full bg-background-dark border-border-dark rounded-xl p-3 text-sm"
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                  >
                    <option>Beginner (0-2 years)</option>
                    <option>Intermediate (2-5 years)</option>
                    <option>Advanced (5-10 years)</option>
                    <option>Professional (10+ years)</option>
                  </select>
                ) : (
                  <p className="font-bold">{formData.experience || 'Not Specified'}</p>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Location</label>
                {isEditing ? (
                  <input 
                    className="w-full bg-background-dark border-border-dark rounded-xl p-3 text-sm"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Nashville, TN"
                  />
                ) : (
                  <p className="font-bold">{formData.location || 'Unknown'}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Primary Genres</label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {genresOptions.map(g => (
                    <button
                      key={g}
                      onClick={() => {
                        const current = formData.genres || [];
                        const next = current.includes(g) ? current.filter(item => item !== g) : [...current, g];
                        setFormData({...formData, genres: next});
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        (formData.genres || []).includes(g) 
                          ? 'bg-primary border-primary text-white' 
                          : 'bg-background-dark border-border-dark text-text-secondary hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(formData.genres || []).map(g => (
                    <span key={g} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-black">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Favorite Gear Setup</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="bg-background-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-text-secondary !text-[24px]">hardware</span>
                    {isEditing ? (
                      <input 
                        className="bg-transparent border-b border-border-dark focus:border-primary text-[10px] font-bold text-center w-full outline-none"
                        placeholder="Gear Name"
                        value={(formData.topGear || [])[i] || ''}
                        onChange={e => {
                          const nextGear = [...(formData.topGear || ['', '', ''])];
                          nextGear[i] = e.target.value;
                          setFormData({...formData, topGear: nextGear});
                        }}
                      />
                    ) : (
                      <p className="text-[10px] font-black uppercase tracking-tight text-center">
                        {(formData.topGear || [])[i] || '---'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
