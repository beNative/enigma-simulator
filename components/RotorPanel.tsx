
import React, { useRef, useEffect } from 'react';
import { EnigmaSettings } from '../types';
import { ChevronUp, ChevronDown, Settings } from 'lucide-react';

interface Props {
  settings: EnigmaSettings;
  onUpdate: (newSettings: EnigmaSettings) => void;
  onOpenSettings: () => void;
}

const RotorUnit: React.FC<{
  label: string;
  position: string;
  onNext: () => void;
  onPrev: () => void;
  rotorType: string;
  isGreek?: boolean;
}> = ({ label, position, onNext, onPrev, rotorType, isGreek }) => {
  const prevPosRef = useRef(position);
  let animClass = "";

  if (prevPosRef.current !== position) {
    const curr = position.charCodeAt(0);
    const prev = prevPosRef.current.charCodeAt(0);
    let diff = curr - prev;

    if (diff === -25) diff = 1;
    else if (diff === 25) diff = -1;

    if (diff > 0) {
      animClass = "animate-rotor-slide-up";
    } else {
      animClass = "animate-rotor-slide-down";
    }
  }

  useEffect(() => {
    prevPosRef.current = position;
  }, [position]);

  return (
    <div className="flex flex-col items-center mx-1 sm:mx-1.5 bg-enigma-key p-1 sm:p-1.5 pb-2 rounded border border-white/10 shadow-lg relative group/rotor">
      <div className={`text-[8px] sm:text-[9px] mb-0.5 uppercase font-bold tracking-widest opacity-50 group-hover/rotor:opacity-100 transition-opacity ${isGreek ? 'text-blue-300' : 'text-gray-400'}`}>
        {rotorType}
      </div>
      
      <button onClick={onNext} className="p-0.5 hover:bg-white/10 rounded transition-colors mb-0.5 text-gray-500 hover:text-white">
        <ChevronUp size={14} />
      </button>

      <div className={`w-10 sm:w-12 h-12 sm:h-14 text-black font-mono text-xl sm:text-2xl flex items-center justify-center rounded shadow-inner-deep border-2 relative overflow-hidden ${isGreek ? 'bg-[#d0d5dd] border-[#667085]' : 'bg-[#e0e0e0] border-[#888]'}`}>
         {/* Glass sheen */}
         <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-20"></div>
         
         {/* Animated Character */}
         <span key={position} className={`relative z-10 ${animClass}`}>
            {position}
         </span>
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-8 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-10"></div>

      <button onClick={onPrev} className="p-0.5 hover:bg-white/10 rounded transition-colors mt-0.5 text-gray-500 hover:text-white">
        <ChevronDown size={14} />
      </button>
      
      <div className={`mt-0.5 text-[8px] sm:text-[9px] font-mono font-bold ${isGreek ? 'text-blue-400/70' : 'text-gray-600'}`}>{label}</div>
    </div>
  );
};

const RotorPanel: React.FC<Props> = ({ settings, onUpdate, onOpenSettings }) => {
  
  const rotate = (index: number, dir: 1 | -1) => {
    const currentCode = settings.positions[index].charCodeAt(0) - 65;
    const nextCode = (currentCode + dir + 26) % 26;
    const nextChar = String.fromCharCode(nextCode + 65);
    
    const newPos = [...settings.positions];
    newPos[index] = nextChar;
    
    onUpdate({
      ...settings,
      positions: newPos
    });
  };

  // Helper to label rotors based on position
  const getLabel = (index: number, total: number) => {
    if (total === 4) {
        if (index === 0) return "GREEK";
        if (index === 1) return "LEFT";
        if (index === 2) return "MID";
        return "RIGHT";
    }
    // Default 3
    if (index === 0) return "LEFT";
    if (index === 1) return "MID";
    return "RIGHT";
  }

  return (
    <div className="bg-[#1c1c1c] p-2 px-3 sm:px-4 rounded-xl border border-white/5 shadow-2xl flex flex-col items-center relative overflow-hidden transition-all duration-500">
      {/* Metallic Grating Background Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px)'}}></div>

      <div className="flex items-center justify-center z-10 space-x-1">
         {settings.rotors.map((rotor, idx) => (
             <RotorUnit 
                key={idx}
                label={getLabel(idx, settings.rotors.length)}
                position={settings.positions[idx]}
                rotorType={rotor}
                isGreek={settings.rotors.length === 4 && idx === 0}
                onNext={() => rotate(idx, 1)}
                onPrev={() => rotate(idx, -1)}
             />
         ))}
      </div>

      <button 
        onClick={onOpenSettings}
        className="absolute top-1 right-1 p-1 text-gray-600 hover:text-enigma-lit transition-colors hover:bg-white/5 rounded-full"
        title="Configure Rotors"
      >
        <Settings size={14} />
      </button>
    </div>
  );
};

export default RotorPanel;
