
export type Instrument = 'Electric Guitar' | 'Bass Guitar' | 'Synth' | 'Acoustic Guitar';

export type PedalType = 'Dynamics' | 'Drive' | 'Modulation' | 'Delay' | 'Reverb' | 'Utility';

export interface User {
  id: string;
  name: string;
  avatar: string;
  banner?: string;
  bio: string;
  location?: string;
  experience?: string;
  genres?: string[];
  website?: string;
  youtube?: string;
  instagram?: string;
  topGear?: string[];
}

export interface Pedal {
  id: string;
  name: string;
  brand: string;
  type: PedalType;
  color: string;
  icon: string;
  settings: Record<string, number>;
  notes?: string;
  isBypassed?: boolean;
}

export interface Amplifier {
  id: string;
  name: string;
  brand: string;
  color: string;
  settings: Record<string, number>;
  notes?: string;
  isBypassed?: boolean;
  channels?: string[];
  activeChannel?: string;
  variants?: string[];
  activeVariant?: string;
}

export interface Setup {
  id: string;
  title: string;
  artist: string;
  creator: string;
  creatorAvatar: string;
  likes: number;
  comments: number;
  instrument: Instrument;
  genre: string;
  tags: string[];
  coverImage: string;
  chain: Pedal[];
  amplifier?: Amplifier;
  updatedAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isAuthor?: boolean;
}
