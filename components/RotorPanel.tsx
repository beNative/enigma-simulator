import React, { useRef, useEffect, useState } from 'react';
import { EnigmaSettings } from '../types';
import { Settings, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  settings: EnigmaSettings;
  onUpdate: (newSettings: EnigmaSettings) => void;
  onOpenSettings: () => void;
  isCoverOpen: boolean;
  variant?: 'military' | 'commercial';
}

const RotorUnitInternal: React.FC<{
  label: string;
  position: string;
  onNext: () => void;
  onPrev: () => void;
  rotorType: string;
  isGreek?: boolean;
}> = ({ label, position, onNext, onPrev, rotorType, isGreek }) => {
  const prevPosRef = useRef(position);
  const [spinAnim, setSpinAnim] = useState("");
  
  // Helper to get chars for the ring visual
  const getCharOffset = (offset: number) => {
    const code = position.charCodeAt(0) - 65;
    const newCode = (code + offset + 26) % 26;
    return String.fromCharCode(newCode + 65);
  }

  useEffect(() => {
    if (prevPosRef.current !== position) {
      const curr = position.charCodeAt(0);
      const prev = prevPosRef.current.charCodeAt(0);
      let diff = curr - prev;
      if (diff === -25) diff = 1;
      else if (diff === 25) diff = -1;

      setSpinAnim(diff > 0 ? "animate-knurl-up" : "animate-knurl-down");
      const t = setTimeout(() => setSpinAnim(""), 200);
      prevPosRef.current = position;
      return () => clearTimeout(t);
    }
  }, [position]);

  return (
    <div className="relative flex flex-col items-center mx-1 sm:mx-2 group/rotor">
      
      {/* Label / Position Marker */}
      <div className="mb-2 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex flex-col items-center">
         <span className="text-[8px] opacity-50">POS</span>
         <span className="text-amber-500">{label}</span>
      </div>

      {/* The Rotor Cylinder Assembly */}
      <div className="relative w-16 sm:w-20 h-48 perspective-1000 z-10">
          
          {/* Background Shaft Segment (passes through) */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-zinc-800 via-zinc-400 to-zinc-800 -z-20 shadow-inner"></div>

          {/* THE ROTOR BODY */}
          <div className="w-full h-full rounded-lg relative flex flex-col shadow-[10px_0_20px_rgba(0,0,0,0.8)] transition-transform hover:scale-105">
               
               {/* Cylinder Shape Mask */}
               <div className="absolute inset-0 overflow-hidden rounded-lg bg-[#1a1a1a] border-x border-black/50">
                    
                    {/* Lighting / Material Shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/90 pointer-events-none z-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-20"></div>

                    {/* --- COMPONENT: Left Contact Plate (Springs) --- */}
                    {/* Represented as top/left edge details visually */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#b8860b] border-r border-black/60 z-10 flex flex-col justify-center gap-3 opacity-80">
                        {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-yellow-200 rounded-full mx-auto shadow-sm"></div>)}
                    </div>

                    {/* --- COMPONENT: Main Body (Bakelite) --- */}
                    <div className="absolute inset-y-0 left-1.5 right-1.5 bg-[#18100c]">
                         {/* Texture */}
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay"></div>

                         {/* ENGRAVING */}
                         <div className="absolute top-4 w-full text-center z-10">
                            <div className="inline-block border border-amber-500/30 rounded px-1 bg-black/40 backdrop-blur-sm">
                                <span className={`text-[10px] font-serif font-bold tracking-widest ${isGreek ? 'text-blue-300' : 'text-amber-500'}`}>
                                    {rotorType}
                                </span>
                            </div>
                         </div>

                         {/* --- COMPONENT: Thumbwheel --- */}
                         <div className="absolute top-14 w-full h-12 bg-zinc-800 shadow-[0_0_10px_black] border-y border-black">
                              {/* Knurling Animation Layer */}
                              <div className={`w-full h-full opacity-70 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)] ${spinAnim}`}></div>
                              {/* Metallic Sheen */}
                              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-80"></div>
                         </div>

                         {/* --- COMPONENT: Alphabet Ring --- */}
                         <div className="absolute bottom-6 w-full h-12 bg-[#e8e8e8] shadow-md flex flex-col items-center justify-center overflow-hidden border-y border-zinc-500">
                              {/* Paper Texture */}
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50"></div>
                              
                              {/* Visible Chars */}
                              <div className={`flex flex-col items-center transition-transform duration-150 ${spinAnim}`}>
                                   <span className="text-[8px] font-mono font-bold text-zinc-400 scale-y-75 blur-[0.5px]">{getCharOffset(-1)}</span>
                                   <span className="text-xl font-mono font-bold text-zinc-900 my-0.5 scale-x-110">{position}</span>
                                   <span className="text-[8px] font-mono font-bold text-zinc-400 scale-y-75 blur-[0.5px]">{getCharOffset(1)}</span>
                              </div>
                         </div>
                    </div>

                    {/* --- COMPONENT: Right Contact Plate (Flat Pads) --- */}
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#8b4513] border-l border-black/60 z-10"></div>
               </div>
          </div>

          {/* Mechanical Catch / Ratchet Lever (Visual) */}
          <div className="absolute -right-1 bottom-10 w-2 h-8 bg-zinc-700 rounded-l-full shadow-lg border border-zinc-600 z-0"></div>
      </div>

      {/* Manual Interaction Buttons */}
      <div className="flex flex-col gap-1 mt-3">
           <button 
              onClick={onPrev}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-t border-x border-t border-white/5 py-1 flex justify-center shadow-lg active:translate-y-0.5 transition-all"
              title="Step Up"
            >
                <ChevronUp size={14} />
            </button>
            <button 
              onClick={onNext}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-b border-x border-b border-white/5 py-1 flex justify-center shadow-lg active:translate-y-0.5 transition-all"
              title="Step Down"
            >
                <ChevronDown size={14} />
            </button>
      </div>

    </div>
  );
}

const RotorUnitExternal: React.FC<{
  position: string;
  onNext: () => void;
  onPrev: () => void;
  model: string;
  variant?: 'military' | 'commercial';
}> = ({ position, onNext, onPrev, model, variant = 'military' }) => {
    const prevPosRef = useRef(position);
    const [spinAnim, setSpinAnim] = useState("");
    let textAnimClass = "";
  
    // Animation logic
    if (prevPosRef.current !== position) {
      const curr = position.charCodeAt(0);
      const prev = prevPosRef.current.charCodeAt(0);
      let diff = curr - prev;
      if (diff === -25) diff = 1;
      else if (diff === 25) diff = -1;
      textAnimClass = diff > 0 ? "animate-rotor-slide-up" : "animate-rotor-slide-down";
    }
  
    useEffect(() => {
      if (prevPosRef.current !== position) {
        const curr = position.charCodeAt(0);
        const prev = prevPosRef.current.charCodeAt(0);
        let diff = curr - prev;
        if (diff === -25) diff = 1;
        else if (diff === 25) diff = -1;
  
        setSpinAnim(diff > 0 ? "animate-knurl-up" : "animate-knurl-down");
        const t = setTimeout(() => setSpinAnim(""), 200);
        
        prevPosRef.current = position;
        return () => clearTimeout(t);
      }
    }, [position]);

    const isM4 = model === 'M4';
    const windowWidth = isM4 ? 'w-9 sm:w-10' : 'w-12 sm:w-14'; 
    const windowBorder = variant === 'commercial' ? 'border-zinc-400/30' : 'border-white/10';
    const windowBg = variant === 'commercial' ? 'bg-black' : 'bg-black';

    return (
        <div className="flex flex-col items-center mx-0.5 sm:mx-1 relative">
            {/* Viewing Window */}
            <div className={`${windowWidth} h-12 sm:h-14 ${windowBg} rounded-sm shadow-[inset_0_2px_5px_rgba(0,0,0,1)] border ${windowBorder} flex items-center justify-center relative overflow-hidden mb-1`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-50 pointer-events-none z-20"></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent z-20 pointer-events-none"></div>
                <span key={position} className={`relative z-10 font-mono text-xl sm:text-2xl text-[#eee] font-medium drop-shadow-[0_0_3px_rgba(255,255,255,0.3)] ${textAnimClass}`}>
                    {position}
                </span>
            </div>

            {/* Thumbwheel */}
            <div className="relative w-16 sm:w-20 h-12 flex flex-col items-center justify-center -mt-4 pt-4 z-0">
                <div className="absolute inset-x-2 top-4 bottom-0 bg-[#050505] rounded shadow-[inset_0_0_5px_black]"></div>
                <div className="relative z-10 w-5 sm:w-6 h-12 bg-gradient-to-r from-[#1a1a1a] via-[#444] to-[#1a1a1a] rounded cursor-grab active:cursor-grabbing flex flex-col items-center border-x border-black shadow-lg group overflow-hidden">
                    <div className={`w-full flex flex-col items-center ${spinAnim}`}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-full h-px bg-black/60 my-[2px] shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                        ))}
                    </div>
                    <button onClick={onPrev} className="absolute top-0 w-full h-1/2 hover:bg-white/5 z-20" title="Step Up"></button>
                    <button onClick={onNext} className="absolute bottom-0 w-full h-1/2 hover:bg-white/5 z-20" title="Step Down"></button>
                </div>
            </div>
        </div>
    );
}

const RotorPanel: React.FC<Props> = ({ settings, onUpdate, onOpenSettings, isCoverOpen, variant }) => {
  
  const rotate = (index: number, dir: 1 | -1) => {
    const currentCode = settings.positions[index].charCodeAt(0) - 65;
    const nextCode = (currentCode + dir + 26) % 26;
    const nextChar = String.fromCharCode(nextCode + 65);
    const newPos = [...settings.positions];
    newPos[index] = nextChar;
    onUpdate({ ...settings, positions: newPos });
  };

  const getLabel = (index: number, total: number) => {
    if (total === 4) {
        if (index === 0) return "GR";
        if (index === 1) return "L";
        if (index === 2) return "M";
        return "R";
    }
    return ["L", "M", "R"][index];
  }

  // External View (Standard)
  if (!isCoverOpen) {
      return (
        <div className="p-1 transition-all duration-500">
          <div className="flex items-end justify-center space-x-1 sm:space-x-3 relative z-10">
             {settings.rotors.map((_, idx) => (
                 <RotorUnitExternal 
                    key={idx}
                    position={settings.positions[idx]}
                    onNext={() => rotate(idx, 1)}
                    onPrev={() => rotate(idx, -1)}
                    model={settings.model}
                    variant={variant}
                 />
             ))}
          </div>
        </div>
      );
  }

  // Internal View (Open Cover)
  return (
    <div className="bg-[#111] p-4 sm:p-6 rounded-lg shadow-[inset_0_0_60px_black] border border-zinc-800 relative overflow-hidden transition-all duration-500 animate-fadeIn">
        
        {/* Mechanical Background Details */}
        <div className="absolute inset-0 bg-[#0f0f0f]">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_#333_1px,_transparent_1px)] bg-[length:10px_10px]"></div>
            {/* Shadows for depth */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent opacity-80"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent opacity-80"></div>
        </div>

        {/* Main Mechanical Assembly */}
        <div className="relative z-10 flex flex-col items-center">
            
            {/* Top Shaft Bar */}
            <div className="w-[95%] h-2 bg-zinc-800 rounded-full mb-4 shadow-[0_2px_5px_black] relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full"></div>
            </div>

            <div className="flex items-start justify-center gap-1 sm:gap-2">
                {/* Reflector Block (Static on left usually) */}
                <div className="w-10 sm:w-12 h-40 bg-zinc-800 rounded-l-lg shadow-2xl border-y border-l border-zinc-700 relative flex flex-col items-center justify-center mr-2">
                     <div className="absolute right-0 top-2 bottom-2 w-1 bg-black/50"></div>
                     <span className="text-[10px] font-mono font-bold text-zinc-500 -rotate-90 whitespace-nowrap">UKW {settings.reflector}</span>
                     {/* Screws */}
                     <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-zinc-900 rounded-full"></div>
                     <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-zinc-900 rounded-full"></div>
                </div>

                {/* The Rotors */}
                {settings.rotors.map((rotor, idx) => (
                    <RotorUnitInternal
                        key={idx}
                        label={getLabel(idx, settings.rotors.length)}
                        position={settings.positions[idx]}
                        rotorType={rotor}
                        isGreek={settings.rotors.length === 4 && idx === 0}
                        onNext={() => rotate(idx, 1)}
                        onPrev={() => rotate(idx, -1)}
                    />
                ))}

                {/* Entry Wheel Block (Right) */}
                 <div className="w-6 sm:w-8 h-40 bg-zinc-800 rounded-r-lg shadow-2xl border-y border-r border-zinc-700 relative flex flex-col items-center justify-center ml-2 opacity-80">
                     <div className="absolute left-0 top-2 bottom-2 w-1 bg-black/50"></div>
                     <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_3px)] opacity-30"></div>
                </div>
            </div>
            
            {/* Configuration Button (Integrated as a mechanical plate) */}
            <div className="mt-8 w-full flex justify-center">
                <button 
                    onClick={onOpenSettings}
                    className="group relative px-8 py-2 bg-zinc-800 border border-zinc-600 rounded shadow-[0_5px_15px_black] active:scale-95 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                    <div className="flex items-center gap-3 text-amber-500 font-mono font-bold text-xs tracking-wider z-10 relative">
                        <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span>CONFIGURE MECHANISM</span>
                    </div>
                    {/* Screw heads on button */}
                    <div className="absolute top-1 left-1 w-1 h-1 bg-zinc-500 rounded-full opacity-50"></div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-zinc-500 rounded-full opacity-50"></div>
                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-zinc-500 rounded-full opacity-50"></div>
                    <div className="absolute bottom-1 right-1 w-1 h-1 bg-zinc-500 rounded-full opacity-50"></div>
                </button>
            </div>

        </div>
    </div>
  );
};

export default RotorPanel;