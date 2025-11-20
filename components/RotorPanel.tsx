
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

// Visual component to simulate the internal cross-wiring of a rotor
const WiringVisual: React.FC<{ rotorType: string }> = ({ rotorType }) => {
  // Create a stable visual based on the rotor name
  const seed = rotorType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const wires = [];
  const numWires = 26; // Full alphabet density
  
  for (let i = 0; i < numWires; i++) {
    const y1 = 4 + (i / numWires) * 92;
    
    // Deterministic random based on seed + i
    const rand = (Math.sin(seed * (i + 1) * 13.37) + 1) / 2; // 0..1
    const y2 = 4 + (rand * 92); 
    
    // Colors: Copper, Oxide Copper, Bright Brass
    const colors = ['#b45309', '#d97706', '#f59e0b', '#fbbf24']; 
    const colorIndex = Math.floor((Math.sin(seed + i) + 1) * 2.5) % colors.length;
    const color = colors[colorIndex];
    
    // Control points for Bezier curves to make them look like tangible wires
    const dist = Math.abs(y2 - y1);
    const arch = 10 + dist * 0.4;
    const cp1y = y1 + (y2 > y1 ? arch : -arch);
    const cp2y = y2 - (y2 > y1 ? arch : -arch);

    wires.push(
        <g key={i}>
            {/* Wire Shadow/Base */}
            <path 
                d={`M 0 ${y1} C 30 ${cp1y}, 70 ${cp2y}, 100 ${y2}`}
                stroke={color}
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
                className="opacity-90"
            />
            {/* Wire Highlight (Specular) */}
            <path 
                d={`M 0 ${y1} C 30 ${cp1y}, 70 ${cp2y}, 100 ${y2}`}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={0.5}
                fill="none"
                strokeLinecap="round"
                className="opacity-60"
            />
            {/* Solder Points / Terminals */}
            <circle cx="1.5" cy={y1} r="1.8" fill="#d97706" stroke="#78350f" strokeWidth="0.5" />
            <circle cx="98.5" cy={y2} r="1.8" fill="#d97706" stroke="#78350f" strokeWidth="0.5" />
        </g>
    );
  }

  return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-b-lg">
          {/* Dark inner housing background */}
          <div className="absolute inset-0 bg-[#1a120b] shadow-[inset_0_0_10px_rgba(0,0,0,1)]"></div>
          
          {/* Cross-hatch texture for insulation board */}
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_3px)]"></div>

          <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
              {wires}
          </svg>
          
          {/* Glassy reflection/shadow on the wiring housing */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-20 pointer-events-none"></div>
      </div>
  )
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
      <div className="relative w-20 sm:w-24 h-52 perspective-1000 z-10">
          
          {/* Background Shaft Segment (passes through) */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-zinc-800 via-zinc-400 to-zinc-800 -z-20 shadow-inner rounded-sm"></div>

          {/* THE ROTOR BODY */}
          <div className="w-full h-full relative flex items-center justify-center transition-transform hover:scale-105 duration-300 origin-center">
               
               {/* LEFT: Spring Contacts Plate (Spring-loaded pins) */}
               <div className="absolute -left-1.5 top-8 bottom-8 w-3 z-20 flex flex-col justify-between py-1">
                   {/* Dense array of pins to simulate 26 contacts */}
                   {[...Array(18)].map((_, i) => (
                       <div key={i} className="relative w-full h-[2px] flex items-center">
                           <div className="absolute right-0 w-3 h-1 bg-gradient-to-l from-yellow-500 to-yellow-700 rounded-l-full shadow-[0_1px_1px_rgba(0,0,0,0.5)]"></div> 
                           <div className="absolute right-0.5 w-px h-px bg-white/50"></div>
                       </div>
                   ))}
               </div>

               {/* CENTER: Main Drum */}
               <div className="relative w-full h-44 bg-[#18100c] rounded-lg overflow-hidden shadow-[5px_0_25px_rgba(0,0,0,0.9)] border-y border-black/80 flex flex-col">
                    
                    {/* Bakelite Texture Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay pointer-events-none z-30"></div>

                    {/* Lighting/Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-white/5 to-black/80 pointer-events-none z-40"></div>
                    <div className="absolute left-1/4 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none z-40 blur-sm"></div>

                    {/* TOP: Thumbwheel (Knurled) */}
                    <div className="h-[32%] bg-zinc-800 relative border-b border-black shadow-lg z-10">
                         {/* Knurling texture */}
                         <div className={`absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)] opacity-50 mix-blend-multiply ${spinAnim}`}></div>
                         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                         {/* Edge Highlight */}
                         <div className="absolute top-0 inset-x-0 h-[1px] bg-white/20"></div>
                    </div>

                    {/* MIDDLE: Alphabet Ring (The Ringstellung) */}
                    <div className="h-[28%] bg-[#e6e6d8] relative flex items-center justify-center border-y border-zinc-600 z-20 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] overflow-hidden">
                        {/* Material texture (Ivory/Paper) */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-80"></div>
                        
                        {/* Notch Visual (Contextual to ring) */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-2 bg-zinc-400/50 rounded-l-sm blur-[1px]"></div>

                        {/* Characters */}
                        <div className={`flex flex-col items-center transition-transform duration-150 ${spinAnim} relative z-10`}>
                             <span className="text-[8px] font-mono font-bold text-zinc-500/70 scale-y-75 blur-[0.5px]">{getCharOffset(-1)}</span>
                             <span className="text-2xl font-mono font-bold text-[#222] my-0.5 scale-x-110 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">{position}</span>
                             <span className="text-[8px] font-mono font-bold text-zinc-500/70 scale-y-75 blur-[0.5px]">{getCharOffset(1)}</span>
                        </div>
                    </div>

                    {/* BOTTOM: Core Wiring Housing */}
                    <div className="h-[40%] bg-[#2a1d15] relative border-t border-black shadow-inner z-10 flex flex-col items-center justify-end pb-2 overflow-hidden">
                         
                         {/* WIRING VISUALIZATION */}
                         <WiringVisual rotorType={rotorType} />

                         {/* Rotor Type Label Plate (Brass) */}
                         <div className="z-30 px-2 py-0.5 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded border border-yellow-900/50 shadow-lg mb-1.5">
                            <span className={`text-[9px] font-serif font-bold tracking-widest drop-shadow-sm ${isGreek ? 'text-blue-100' : 'text-yellow-100'}`}>
                                {rotorType}
                            </span>
                         </div>
                    </div>
               </div>

               {/* RIGHT: Flat Contact Plate */}
               <div className="absolute right-0 top-8 bottom-8 w-1.5 z-20 flex flex-col justify-between py-1 pl-0.5">
                    {/* Flat brass pads */}
                    {[...Array(18)].map((_, i) => (
                        <div key={i} className="w-1 h-[2px] bg-yellow-700/80 rounded-full shadow-sm"></div>
                    ))}
               </div>

          </div>

          {/* Mechanical Ratchet / Pawl visual (Bottom Right) */}
          <div className="absolute -right-2 bottom-6 w-3 h-8 bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-l border border-zinc-700 z-0 shadow-xl transform -skew-y-12 origin-bottom-right">
             <div className="absolute top-1 right-1 w-1 h-1 bg-black/30 rounded-full"></div>
          </div>
      </div>

      {/* Manual Interaction Buttons */}
      <div className="flex flex-col gap-1 mt-3 w-full max-w-[4rem]">
           <button 
              onClick={onPrev}
              className="w-full bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-400 hover:text-white rounded-t border border-white/10 py-1 flex justify-center shadow-lg active:translate-y-0.5 transition-all"
              title="Step Up"
            >
                <ChevronUp size={12} />
            </button>
            <button 
              onClick={onNext}
              className="w-full bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-zinc-400 hover:text-white rounded-b border-x border-b border-white/10 py-1 flex justify-center shadow-lg active:translate-y-0.5 transition-all"
              title="Step Down"
            >
                <ChevronDown size={12} />
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
            <div className="w-[95%] h-3 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-full mb-4 shadow-[0_2px_5px_black] relative border border-zinc-800">
                 <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full"></div>
            </div>

            <div className="flex items-start justify-center gap-1 sm:gap-2">
                {/* Reflector Block (Static on left) */}
                <div className="w-10 sm:w-12 h-44 bg-zinc-800 rounded-l-lg shadow-2xl border-y border-l border-zinc-700 relative flex flex-col items-center justify-center mr-2 mt-2 overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                     <div className="absolute right-0 top-2 bottom-2 w-1 bg-black/50"></div>
                     <span className="text-[10px] font-mono font-bold text-zinc-500 -rotate-90 whitespace-nowrap z-10">UKW {settings.reflector}</span>
                     {/* Screws */}
                     <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-zinc-900 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                     <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-zinc-900 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
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
                 <div className="w-6 sm:w-8 h-44 bg-zinc-800 rounded-r-lg shadow-2xl border-y border-r border-zinc-700 relative flex flex-col items-center justify-center ml-2 opacity-80 mt-2 overflow-hidden">
                     <div className="absolute left-0 top-2 bottom-2 w-1 bg-black/50"></div>
                     <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_3px)] opacity-30"></div>
                     {/* Axle End */}
                     <div className="w-4 h-4 bg-zinc-600 rounded-full shadow-inner border border-black/50 relative">
                         <div className="absolute inset-1 bg-black/50 rounded-full"></div>
                     </div>
                </div>
            </div>
            
            {/* Configuration Button (Integrated as a mechanical plate) */}
            <div className="mt-8 w-full flex justify-center">
                <button 
                    onClick={onOpenSettings}
                    className="group relative px-8 py-2 bg-[#1a1a1a] border border-zinc-700 rounded shadow-[0_5px_15px_black] active:scale-95 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="flex items-center gap-3 text-amber-600 font-mono font-bold text-xs tracking-wider z-10 relative group-hover:text-amber-500 transition-colors">
                        <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span>CONFIGURE MECHANISM</span>
                    </div>
                    {/* Screw heads on button */}
                    <div className="absolute top-1 left-1 w-1 h-1 bg-zinc-500 rounded-full opacity-50 shadow-sm"></div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-zinc-500 rounded-full opacity-50 shadow-sm"></div>
                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-zinc-500 rounded-full opacity-50 shadow-sm"></div>
                    <div className="absolute bottom-1 right-1 w-1 h-1 bg-zinc-500 rounded-full opacity-50 shadow-sm"></div>
                </button>
            </div>

        </div>
    </div>
  );
};

export default RotorPanel;
