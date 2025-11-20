import React, { useState, useEffect, useRef } from 'react';
import { EnigmaSettings, Mission } from './types';
import { EnigmaMachine } from './utils/enigmaMachine';
import RotorPanel from './components/RotorPanel';
import Lampboard from './components/Lampboard';
import Keyboard from './components/Keyboard';
import Plugboard from './components/Plugboard';
import MissionControl from './components/MissionControl';
import { Eraser, Paperclip, Copy, Settings } from 'lucide-react';

const DEFAULT_SETTINGS: EnigmaSettings = {
  rotors: ['I', 'II', 'III'],
  positions: ['A', 'A', 'A'],
  ringSettings: [0, 0, 0],
  reflector: 'B',
  plugboard: {}
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<EnigmaSettings>(DEFAULT_SETTINGS);
  const [litKey, setLitKey] = useState<string | null>(null);
  const [inputTape, setInputTape] = useState<string>("");
  const [outputTape, setOutputTape] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  
  const machineRef = useRef<EnigmaMachine>(new EnigmaMachine(settings));

  // Sync machine instance when settings change (except positions updates caused by typing)
  useEffect(() => {
    machineRef.current = new EnigmaMachine(settings);
  }, [settings.rotors, settings.ringSettings, settings.reflector, settings.plugboard]);

  // If positions change via UI manually
  useEffect(() => {
     machineRef.current = new EnigmaMachine(settings);
  }, [settings.positions]);

  const handleKeyPress = (char: string) => {
    const machine = machineRef.current;
    
    // 1. Step Rotors
    machine.step();
    
    // 2. Encrypt
    const encrypted = machine.encryptChar(char);
    
    // 3. Update UI State
    setLitKey(encrypted);
    setInputTape(prev => prev + char);
    setOutputTape(prev => prev + encrypted);
    
    // 4. Update Rotor Positions in React State (for visuals)
    const newSettings = machine.getSettings();
    setSettings(prev => ({ ...prev, positions: newSettings.positions }));
  };

  const handleKeyRelease = () => {
    setLitKey(null);
  };

  // Keyboard listener for physical keyboard
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      if (litKey) return; 
      if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };
    const upHandler = () => {
      handleKeyRelease();
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [litKey, settings]);

  const clearTapes = () => {
    setInputTape("");
    setOutputTape("");
  };

  const handleMissionLoad = (mission: Mission) => {
    setActiveMission(mission);
    clearTapes();
    setSettings(prev => ({...prev, positions: ['A', 'A', 'A']}));
  };

  return (
    <div className="h-screen w-full bg-[#121212] text-white font-sans flex flex-col overflow-hidden">
      
      {/* Header Bar */}
      <header className="h-12 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
            <h1 className="text-lg font-mono font-bold tracking-widest text-[#e0e0e0]">ENIGMA I</h1>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <p className="text-[10px] text-gray-500 font-mono hidden sm:block tracking-widest">WEHRMACHT / HEER & LUFTWAFFE</p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-[10px] font-mono bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-colors text-gray-300 flex items-center gap-2 group"
            >
                <Settings size={12} className="group-hover:rotate-90 transition-transform duration-700" /> 
                <span className="hidden sm:inline">CONFIGURE</span>
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: The Machine Environment */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-2 wood-texture overflow-hidden select-none shadow-inner">
            <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
            
            {/* The Machine Unit - Responsive Scaling */}
            <div className="relative z-10 flex flex-col items-center transform scale-[0.65] sm:scale-[0.75] md:scale-[0.85] lg:scale-[0.9] xl:scale-100 transition-transform duration-300 origin-center">
                
                {/* Rotors sit 'on top' of the box */}
                <div className="mb-3 relative z-20 w-full flex justify-center">
                    <RotorPanel 
                        settings={settings} 
                        onUpdate={setSettings} 
                        onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                </div>

                {/* Main Box */}
                <div className="bg-[#202020] p-6 pt-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-t border-l border-white/10 border-b-8 border-r-4 border-[#111] relative flex flex-col items-center gap-4 w-full max-w-2xl">
                     {/* Metal Plate Effect */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/50 rounded-b-lg shadow-white/5"></div>
                     
                     <div className="absolute top-4 right-6 text-[10px] font-mono text-white/20 tracking-widest">
                        SERIES B / 1942
                     </div>

                     <Lampboard litKey={litKey} />
                     
                     {/* Divider */}
                     <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1"></div>

                     <Keyboard 
                        onKeyPress={handleKeyPress} 
                        onKeyRelease={handleKeyRelease}
                        pressedKey={litKey ? inputTape[inputTape.length - 1] : null}
                    />

                    {/* Logo/Plate */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-white/10 font-sans tracking-[0.3em]">
                        BERLIN
                    </div>
                </div>
            </div>
        </main>

        {/* RIGHT: Operations Sidebar */}
        <aside className="w-80 bg-[#111] border-l border-white/10 flex flex-col shrink-0 z-10 shadow-2xl">
            
            {/* Tapes Section - Fixed at top of sidebar */}
            <div className="p-4 bg-[#161616] border-b border-white/5 shadow-lg relative z-10">
                <div className="flex justify-between items-end mb-2">
                     <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Paperclip size={12} /> Log
                     </h2>
                     <button onClick={clearTapes} className="text-[9px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                        <Eraser size={10} /> CLEAR
                     </button>
                </div>
                
                <div className="space-y-2">
                    <div className="relative group">
                        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-blue-500/50 rounded-l"></div>
                        <div className="bg-[#e0e0e0] text-black font-mono text-xs p-2 pl-3 rounded-r paper-texture min-h-[2rem] shadow-inner break-all leading-tight">
                            {inputTape || <span className="text-gray-400 italic opacity-50">Input...</span>}
                        </div>
                    </div>
                    
                    <div className="relative group">
                         <div className="absolute -left-1 top-0 bottom-0 w-1 bg-red-500/50 rounded-l"></div>
                         <div className="bg-[#e0e0e0] text-red-900 font-bold font-mono text-xs p-2 pl-3 rounded-r paper-texture min-h-[2rem] shadow-inner break-all relative leading-tight">
                            {outputTape || <span className="text-gray-400/50 italic font-normal">Output...</span>}
                            {outputTape && (
                                <button onClick={() => navigator.clipboard.writeText(outputTape)} className="absolute right-1 bottom-1 p-1 text-gray-500 hover:text-black bg-white/50 rounded transition-colors">
                                    <Copy size={10} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                
                {/* Mission Control */}
                <section>
                    <MissionControl onLoadMission={handleMissionLoad} />
                </section>

                {/* Active Mission Dossier */}
                {activeMission && (
                    <section className="animate-slideIn">
                        <div className="bg-[#1a1a1a] border border-yellow-600/30 rounded-lg overflow-hidden relative">
                             <div className="absolute -top-2 right-3 text-gray-500 opacity-50">
                                 <Paperclip size={16} />
                             </div>

                            <div className="bg-yellow-900/20 p-2 border-b border-yellow-600/20 flex justify-between items-center">
                                <h3 className="text-yellow-500 font-mono text-[10px] font-bold uppercase tracking-wider">Mission Orders</h3>
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-white font-bold text-xs mb-1">{activeMission.title}</h4>
                                <p className="text-gray-400 text-[10px] leading-relaxed mb-3 border-l-2 border-white/10 pl-2">
                                    {activeMission.description}
                                </p>
                                
                                <div className="bg-black/40 rounded p-2 border border-white/5 mb-2">
                                    <div className="text-[9px] text-gray-500 uppercase mb-1">Target</div>
                                    <div className="font-mono text-white tracking-widest text-xs break-all">
                                        {activeMission.targetText}
                                    </div>
                                </div>

                                {activeMission.requiredSettings && (
                                     <div className="p-2 bg-blue-900/10 border border-blue-500/20 rounded text-[9px] text-blue-300 font-mono leading-tight">
                                        <strong>CONFIG:</strong> {JSON.stringify(activeMission.requiredSettings).replace(/[{"}]/g, '').replace(/,/g, ', ')}
                                     </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
                
                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="text-[9px] text-gray-600 font-mono leading-relaxed text-center">
                        <p className="mb-1">Type to encrypt.</p>
                        <p>Simulator V2.0</p>
                    </div>
                </div>
            </div>

        </aside>

      </div>

      <Plugboard 
        settings={settings}
        onUpdate={setSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;