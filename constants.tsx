
import { Setup, Pedal, Amplifier } from './types';

export const MOCK_PEDALS: Pedal[] = [
  { id: '1', name: 'Dyna Comp', brand: 'MXR', type: 'Dynamics', color: 'from-orange-500 to-orange-700', icon: 'compress', settings: { Sensitivity: 60, Output: 40 } },
  { id: '2', name: 'Tube Screamer', brand: 'Ibanez', type: 'Drive', color: 'from-green-600 to-green-800', icon: 'bolt', settings: { Overdrive: 75, Tone: 50, Level: 80 } },
  { id: '3', name: 'Big Muff Pi', brand: 'EHX', type: 'Drive', color: 'from-red-600 to-red-800', icon: 'blur_on', settings: { Sustain: 70, Tone: 40, Volume: 60 } },
  { id: '4', name: 'Neo Chorus', brand: 'Boss', type: 'Modulation', color: 'from-blue-400 to-blue-600', icon: 'waves', settings: { Rate: 30, Depth: 70 } },
  { id: '5', name: 'Carbon Copy', brand: 'MXR', type: 'Delay', color: 'from-emerald-700 to-emerald-900', icon: 'timer', settings: { Delay: 40, Regen: 30, Mix: 50 } },
  { id: '6', name: 'BigSky', brand: 'Strymon', type: 'Reverb', color: 'from-cyan-500 to-cyan-700', icon: 'cloud', settings: { Decay: 65, Mix: 45, Tone: 50 } },
];

export const MOCK_AMPLIFIERS: Amplifier[] = [
  { 
    id: 'amp-1', 
    name: 'JCM800', 
    brand: 'Marshall', 
    color: 'from-yellow-700 to-amber-900', 
    settings: { Preamp: 70, Master: 40, Bass: 50, Middle: 60, Treble: 70, Presence: 40 } 
  },
  { 
    id: 'amp-2', 
    name: 'Twin Reverb', 
    brand: 'Fender', 
    color: 'from-gray-300 to-gray-500', 
    settings: { Volume: 40, Treble: 60, Middle: 50, Bass: 40, Reverb: 30, Speed: 20 } 
  },
  { 
    id: 'amp-3', 
    name: 'AC30 Top Boost', 
    brand: 'Vox', 
    color: 'from-red-800 to-stone-900', 
    settings: { Volume: 50, Treble: 75, Bass: 45, Cut: 30, Gain: 60 } 
  },
  { 
    id: 'amp-4', 
    name: 'Dual Rectifier', 
    brand: 'Mesa Boogie', 
    color: 'from-zinc-700 to-zinc-900', 
    settings: { Gain: 85, Treble: 60, Mid: 40, Bass: 70, Presence: 50, Master: 30 } 
  },
  { 
    id: 'amp-5', 
    name: 'Rockerverb', 
    brand: 'Orange', 
    color: 'from-orange-500 to-orange-700', 
    settings: { Gain: 65, Bass: 55, Mid: 50, Treble: 60, Reverb: 40 } 
  },
];

export const MOCK_SETUPS: Setup[] = [
  {
    id: 'setup-1',
    title: "John's Clean Tone",
    artist: "John Mayer",
    creator: "@GuitarHero99",
    creatorAvatar: "https://picsum.photos/100/100?random=1",
    likes: 1542,
    comments: 24,
    instrument: 'Electric Guitar',
    genre: 'Neo-Soul',
    tags: ['Intermediate', 'Glassy'],
    coverImage: "https://picsum.photos/800/600?random=10",
    updatedAt: "2 days ago",
    chain: [MOCK_PEDALS[0], MOCK_PEDALS[1], MOCK_PEDALS[5]],
    amplifier: MOCK_AMPLIFIERS[1]
  },
  {
    id: 'setup-2',
    title: "Comfortably Numb Lead",
    artist: "Pink Floyd",
    creator: "@GilmourFan",
    creatorAvatar: "https://picsum.photos/100/100?random=2",
    likes: 3120,
    comments: 42,
    instrument: 'Electric Guitar',
    genre: 'Classic Rock',
    tags: ['Pro', 'Epic'],
    coverImage: "https://picsum.photos/800/600?random=11",
    updatedAt: "1 week ago",
    chain: [MOCK_PEDALS[2], MOCK_PEDALS[3], MOCK_PEDALS[4], MOCK_PEDALS[5]],
    amplifier: MOCK_AMPLIFIERS[0]
  },
  {
    id: 'setup-3',
    title: "Hysteria Bass Fuzz",
    artist: "Muse",
    creator: "@BassGod88",
    creatorAvatar: "https://picsum.photos/100/100?random=3",
    likes: 850,
    comments: 15,
    instrument: 'Bass Guitar',
    genre: 'Alternative Rock',
    tags: ['Fuzz', 'Heavy'],
    coverImage: "https://picsum.photos/800/600?random=12",
    updatedAt: "3 days ago",
    chain: [MOCK_PEDALS[2], MOCK_PEDALS[0]],
    amplifier: MOCK_AMPLIFIERS[3]
  }
];
