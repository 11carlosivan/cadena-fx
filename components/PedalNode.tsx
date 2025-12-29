
import React from 'react';
import { Pedal } from '../types';

interface PedalNodeProps {
  pedal: Pedal;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const PedalNode: React.FC<PedalNodeProps> = ({ pedal, active, onClick, size = 'md' }) => {
  const widthClass = size === 'sm' ? 'w-24' : size === 'md' ? 'w-32' : 'w-40';
  const heightClass = size === 'sm' ? 'h-36' : size === 'md' ? 'h-48' : 'h-60';
  const isBypassed = pedal.isBypassed;

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 ${widthClass} flex flex-col items-center gap-2`}
      onClick={onClick}
    >
      <div 
        className={`w-full ${heightClass} rounded-xl bg-gradient-to-br ${pedal.color} p-4 flex flex-col justify-between shadow-xl border border-white/10 group-hover:-translate-y-2 transition-all duration-300 ${
          active ? 'ring-2 ring-primary ring-offset-4 ring-offset-background-dark' : ''
        } ${isBypassed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
      >
        {/* Pedal LED */}
        <div className="flex justify-center">
          <div className={`size-2.5 rounded-full border border-black/20 transition-all duration-300 ${!isBypassed && active ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-gray-900'}`} />
        </div>

        {/* Brand/Model Text */}
        <div className="text-center">
          <div className="bg-black/20 rounded px-1.5 py-0.5 inline-block border border-white/5 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-white">{pedal.name}</p>
          </div>
          <p className="text-[8px] text-white/60 font-bold uppercase mt-1">{pedal.brand}</p>
        </div>

        {/* Footswitch */}
        <div className="mx-auto size-10 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 border-b-4 border-gray-600 shadow-lg flex items-center justify-center">
          <div className={`size-6 rounded-full border border-gray-400 bg-gradient-to-br transition-colors duration-300 ${isBypassed ? 'from-gray-400 to-gray-600' : 'from-gray-200 to-gray-400'}`} />
        </div>
      </div>
      
      {/* Label under pedal */}
      <div className="text-center">
        <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isBypassed ? 'text-gray-600' : 'text-text-secondary'}`}>
          {isBypassed ? 'Bypassed' : pedal.type}
        </p>
      </div>
    </div>
  );
};

export default PedalNode;
