
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
  // Create a stable visual based on the rotor name so it doesn't jitter on re-render
  // but looks different for different rotors
  const seed = rotorType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const wires = [];
  const numWires = 26; // Full alphabet density for realism
  
  for (let i = 0; i < numWires; i++) {
    // Distribute start points evenly
    const y1 = 5 + (i / numWires) * 90;
    
    // Pseudo-random end points based on seed to simulate permutation
    // Deterministic random based on seed + i
    const rand = (Math.sin(seed * (i + 1) * 13.37) + 1) / 2; // 0..1
    const y2 = 5 + (rand * 90); 
    
    // Colors: Copper, Oxide Copper, Bright Brass, Bronze
    const colors = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#fdba74']; 
    // Pick color based on randomness
    const colorIndex = Math.floor((Math.sin(seed + i) + 1) * 2.5) % colors.length;
    const color = colors[colorIndex];
    
    // Control points for Bezier curves to make them look like tangible wires crossing over
    // We vary the Y control points to create 'arching' effects for wires travelling far distances
    const dist = Math.abs(y2 - y1);
    const arch = dist * 0.6;
    const cp1y = y1 + (y2 > y1 ? arch : -arch);
    const cp2y = y2 - (y2 > y1 ? arch : -arch);

    wires.push(
        <g key={i}>
            <path 
                d={`M 0 ${y1} C 35 ${cp1y}, 65 ${cp2y}, 100 ${y2}`}
                stroke={color}
                strokeWidth={0.8}
                fill="none"
                opacity={0.9}
                className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
            />
            {/* Solder Points / Terminals */}
            <circle cx="1" cy={y1} r="1.2" fill="#fbbf24" opacity="0.9" />
            <circle cx="99" cy={y2} r="1.2" fill="#fbbf24" opacity="0.9" />
        </g>
    );
  }

  return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Dark inner housing background */}
          <div className="absolute inset-0 bg-[#18120e]"></div>
          
          <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
              {wires}
          </svg>
          
          {/* Shine overlay / Glassy reflection/shadow on the wiring housing */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-20"></div>
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
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-gradient-to-r from-zinc-800 via-zinc-400 to-zinc-800 -z-20 shadow-inner rounded-full"></div>

          {/* THE ROTOR BODY */}
          <div className="w-full h-full relative flex items-center justify-center transition-transform hover:scale-105 duration-300">
               
               {/* LEFT: Spring Contacts Plate */}
               <div className="absolute left-1 top-6 bottom-6 w-2 z-20 flex flex-col justify-center gap-2">
                   {/* Pins - Representative visual of the 26 pins */}
                   {[...Array(8)].map((_, i) => (
                       <div key={i} className="relative h-1 w-3 -ml-1">
                           <div className="absolute right-0 w-2 h-1 bg-yellow-500 rounded-l-full shadow-sm"></div>
                           <div className="absolute right-2 w-2 h-[1px] bg-yellow-600 top-1/2 -translate-y-1/2 opacity-80"></div> {/* Spring wire */}
                       </div>
                   ))}
               </div>

               {/* CENTER: Main Drum */}
               <div className="relative w-full h-44 bg-[#18100c] rounded-lg overflow-hidden shadow-[5px_0_20px_rgba(0,0,0,0.8)] border-y border-black/80 flex flex-col">
                    
                    {/* Global lighting sheen */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none z-30"></div>
                    <div className="absolute left-1/3 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none z-30"></div>

                    {/* TOP: Thumbwheel (Knurled) */}
                    <div className="h-[35%] bg-zinc-800 relative border-b border-black shadow-lg z-10">
                         {/* Knurling texture */}
                         <div className={`absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)] opacity-50 mix-blend-multiply ${spinAnim}`}></div>
                         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                    </div>

                    {/* MIDDLE: Alphabet Ring (The Ringstellung) */}
                    <div className="h-[30%] bg-[#e6e6d8] relative flex items-center justify-center border-y border-zinc-600 z-20 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                        {/* Material texture */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-60"></div>
                        {/* Characters */}
                        <div className={`flex flex-col items-center transition-transform duration-150 ${spinAnim}`}>
                             <span className="text-[9px] font-mono font-bold text-zinc-400/80 scale-y-75 blur-[0.5px]">{getCharOffset(-1)}</span>
                             <span className="text-2xl font-mono font-bold text-zinc-900 my-0.5 scale-x-110 drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">{position}</span>
                             <span className="text-[9px] font-mono font-bold text-zinc-400/80 scale-y-75 blur-[0.5px]">{getCharOffset(1)}</span>
                        </div>
                    </div>

                    {/* BOTTOM: Core Wiring Housing */}
                    <div className="h-[35%] bg-[#2a1d15] relative border-t border-black shadow-inner z-10 flex flex-col items-center justify-end pb-2 overflow-hidden">
                         
                         {/* WIRING VISUALIZATION */}
                         <WiringVisual rotorType={rotorType} />

                         {/* Rotor Type Label Plate */}
                         <div className="z-20 px-2 py-0.5 bg-black/80 rounded border border-amber-500/30 backdrop-blur-[1px] mb-2 shadow-lg">
                            <span className={`text-[10px] font-serif font-bold tracking-widest ${isGreek ? 'text-blue-400' : 'text-amber-500'}`}>
                                {rotorType}
                            </span>
                         </div>
                    </div>
               </div>

               {/* RIGHT: Flat Contact Plate */}
               <div className="absolute right-1 top-6 bottom-6 w-1.5 bg-[#5c3a21] border-l border-black/50 z-20 flex flex-col justify-center gap-2">
                    {/* Flat pads visual */}
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-yellow-700/50 mx-auto rounded-full"></div>
                    ))}
               </div>

          </div>

          {/* Mechanical Ratchet / Pawl visual */}
          <div className="absolute -right-1 bottom-8 w-2 h-6 bg-gradient-to-b from-zinc-500 to-zinc-700 rounded-l border border-zinc-600 z-0 shadow-lg"></div>
      </div>

      {/* Manual Interaction Buttons */}
      <div className="flex flex-col gap-1 mt-2 w-full max-w-[4rem]">
           <button 
              onClick={onPrev}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-t border border-white/5 py-1 flex justify-center shadow-lg active:translate-y-0.5 transition-all"
              title="Step Up"
            >
                <ChevronUp size={12} />
            </button>
            <button 
              onClick={onNext}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-b border-x border-b border-white/5 py-1 flex justify-center shadow-lg active:translate-y-0.5 transition-all"
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
            <div className="w-[95%] h-2 bg-zinc-800 rounded-full mb-4 shadow-[0_2px_5px_black] relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full"></div>
            </div>

            <div className="flex items-start justify-center gap-1 sm:gap-2">
                {/* Reflector Block (Static on left usually) */}
                <div className="w-10 sm:w-12 h-40 bg-zinc-800 rounded-l-lg shadow-2xl border-y border-l border-zinc-700 relative flex flex-col items-center justify-center mr-2 mt-6">
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
                        position={settings.positions