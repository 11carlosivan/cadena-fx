
import React, { useState, useEffect } from 'react';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTutorialProps {
  steps: TutorialStep[];
  activeStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isOpen: boolean;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ steps, activeStep, onNext, onPrev, onSkip, isOpen }) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const step = steps[activeStep];
    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, activeStep, steps]);

  if (!isOpen) return null;

  const currentStep = steps[activeStep];

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const gap = 20;
    switch (currentStep.position) {
      case 'bottom':
        return { top: `${targetRect.bottom + gap}px`, left: `${targetRect.left + targetRect.width / 2}px`, transform: 'translateX(-50%)' };
      case 'top':
        return { top: `${targetRect.top - gap}px`, left: `${targetRect.left + targetRect.width / 2}px`, transform: 'translate(-50%, -100%)' };
      case 'right':
        return { top: `${targetRect.top + targetRect.height / 2}px`, left: `${targetRect.right + gap}px`, transform: 'translateY(-50%)' };
      case 'left':
        return { top: `${targetRect.top + targetRect.height / 2}px`, left: `${targetRect.left - gap}px`, transform: 'translate(-100%, -50%)' };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none">
      {/* Dimmed Overlay with Spotlight Hole */}
      <div className="absolute inset-0 bg-black/70 transition-all duration-500" style={{
        clipPath: targetRect ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)` : 'none'
      }} />

      {/* Pulse Effect for Target */}
      {targetRect && (
        <div 
          className="absolute border-2 border-primary rounded-xl animate-pulse pointer-events-none transition-all duration-500"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 20px rgba(19, 91, 236, 0.5)'
          }}
        />
      )}

      {/* Tooltip Card */}
      <div 
        className="absolute pointer-events-auto w-80 bg-surface-dark border border-primary/30 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in fade-in zoom-in-95"
        style={getTooltipPosition()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined !text-[24px]">school</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">{currentStep.title}</h4>
            <div className="flex gap-1 mt-1">
               {steps.map((_, i) => (
                 <div key={i} className={`h-1 rounded-full transition-all ${i === activeStep ? 'w-4 bg-primary' : 'w-1 bg-border-dark'}`} />
               ))}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-text-secondary leading-relaxed mb-6 font-medium">
          {currentStep.content}
        </p>

        <div className="flex items-center justify-between">
          <button 
            onClick={onSkip}
            className="text-[10px] font-black uppercase text-text-secondary hover:text-white transition-colors"
          >
            Skip Guide
          </button>
          <div className="flex gap-2">
            {activeStep > 0 && (
              <button 
                onClick={onPrev}
                className="size-10 rounded-xl bg-surface-light border border-border-dark flex items-center justify-center hover:bg-white/5 transition-all"
              >
                <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
              </button>
            )}
            <button 
              onClick={activeStep === steps.length - 1 ? onSkip : onNext}
              className="bg-primary hover:bg-blue-600 px-5 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all active:scale-95"
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next Step'}
              <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
