
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EnigmaSettings, Mission, EnigmaModel } from './types';
import { EnigmaMachine } from './utils/enigmaMachine';
import RotorPanel from './components/RotorPanel';
import Lampboard from './components/Lampboard';
import Keyboard from './components/Keyboard';
import Plugboard from './components/Plugboard';
import MissionControl from './components/MissionControl';
import { Eraser, Paperclip, Copy, Settings, ChevronDown, Info } from 'lucide-react';

const DEFAULT_STATES: Record<EnigmaModel, EnigmaSettings> = {
  'I': {
    model: 'I',
    rotors: ['I', 'II', 'III'],
    positions: ['A', 'A', 'A'],
    ringSettings: [0, 0, 0],
    reflector: 'B',
    plugboard: {}
  },
  'M3': {
    model: 'M3',
    rotors: ['I', 'II', 'III'],
    positions: ['A', 'A', 'A'],
    ringSettings: [0, 0, 0],
    reflector: 'B',
    plugboard: {}
  },
  'M4': {
    model: 'M4',
    rotors: ['Beta', 'I', 'II', 'III'],
    positions: ['A', 'A', 'A', 'A'],
    ringSettings: [0, 0, 0, 0],
    reflector: 'B_Thin',
    plugboard: {}
  },
  'Norway': {
    model: 'Norway',
    rotors: ['N_I', 'N_II', 'N_III'],
    positions: ['A', 'A', 'A'],
    ringSettings: [0, 0, 0],
    reflector: 'N',
    plugboard: {}
  },
  'SwissK': {
    model: 'SwissK',
    rotors: ['K_I', 'K_II', 'K_III'],
    positions: ['A', 'A', 'A'],
    ringSettings: [0, 0, 0],
    reflector: 'K',
    plugboard: {}
  },
  'Railway': {
    model: 'Railway',
    rotors: ['R_I', 'R_II', 'R_III'],
    positions: ['A', 'A', 'A'],
    ringSettings: [0, 0, 0],
    reflector: 'R',
    plugboard: {}
  }
};

const MODELS: { id: EnigmaModel; name: string; short: string; description: string }[] = [
    { 
      id: 'I', 
      name: 'Enigma I (Heer/Luftwaffe)', 
      short: 'ENIGMA I',
      description: "The standard Wehrmacht machine used by the German Army and Air Force. It features a 3-rotor mechanism (chosen from rotors I-V) and a plugboard, providing 158 quintillion settings."
    },
    { 
      id: 'M3', 
      name: 'Enigma M3 (Kriegsmarine)', 
      short: 'ENIGMA M3',
      description: "The standard German Navy machine. Similar to the Enigma I but with 3 rotors chosen from a larger pool of 8 (I-VIII), increasing security for naval operations."
    },
    { 
      id: 'M4', 
      name: 'Enigma M4 (U-Boat)', 
      short: 'ENIGMA M4',
      description: "The complex 4-rotor variant used exclusively by U-Boats. It introduced a 'Greek' fourth rotor (Beta/Gamma) and thin reflectors to combat Allied code-breaking successes."
    },
    { 
      id: 'Norway', 
      name: 'Norenigma (Police)', 
      short: 'NORWAY',
      description: "A post-war adaptation used by the Norwegian Police Security Service. It utilized surplus German hardware with unique wiring configurations."
    },
    { 
      id: 'SwissK', 
      name: 'Enigma K (Swiss)', 
      short: 'SWISS K',
      description: "A commercial variant (Model K) adopted by the Swiss Army. Unlike military versions, it lacks a plugboard, making it significantly more vulnerable to cryptanalysis."
    },
    { 
      id: 'Railway', 
      name: 'Enigma R (Railway)', 
      short: 'RAILWAY',
      description: "A rare version used by the German Railway (Reichsbahn). It features a rewired reflector and rotors but lacks a plugboard, balancing security with ease of use."
    },
];

const App: React.FC = () => {
  const [activeModel, setActiveModel] = useState<EnigmaModel>('I');
  
  // Store persistence for all machines
  const [machineStates, setMachineStates] = useState<Record<EnigmaModel, EnigmaSettings>>(DEFAULT_STATES);
  
  const settings = machineStates[activeModel];
  const machineRef = useRef<EnigmaMachine>(new EnigmaMachine(settings));

  const handleUpdateSettings = (newSettings: EnigmaSettings) => {
    setMachineStates(prev => ({
        ...prev,
        [activeModel]: newSettings
    }));
  };

  const [litKey, setLitKey] = useState<string | null>(null);
  const [inputTape, setInputTape] = useState<string>("");
  const [outputTape, setOutputTape] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  
  // Sync machine instance
  useEffect(() => {
    machineRef.current = new EnigmaMachine(settings);
  }, [settings]);

  const handleKeyPress = useCallback((char: string) => {
    const machine = machineRef.current;
    
    machine.step();
    const encrypted = machine.encryptChar(char);
    
    setLitKey(encrypted);
    setInputTape(prev => prev + char);
    setOutputTape(prev => prev + encrypted);
    
    // Sync the stepped positions back to React state
    const newPos = machine.getSettings().positions;
    
    setMachineStates(prev => ({
        ...prev,
        [activeModel]: {
            ...prev[activeModel],
            positions: newPos
        }
    }));

  }, [activeModel]);

  const handleKeyRelease = useCallback(() => {
    setLitKey(null);
  }, []);

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
  }, [litKey, handleKeyPress, handleKeyRelease]);

  const clearTapes = () => {
    setInputTape("");
    setOutputTape("");
  };

  const handleMissionLoad = (mission: Mission) => {
    if (activeModel !== 'I') {
        setActiveModel('I');
    }
    setActiveMission(mission);
    clearTapes();
    
    // Update Enigma I state
    setMachineStates(prev => ({
        ...prev,
        'I': {
            ...prev['I'],
            positions: ['A', 'A', 'A'],
            ...mission.requiredSettings
        }
    }));
  };

  const activeModelInfo = MODELS.find(m => m.id === activeModel) || MODELS[0];

  return (
    <div className="h-screen w-full bg-[#121212] text-white font-sans flex flex-col overflow-hidden">
      
      {/* Header Bar */}
      <header className="h-12 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-20 shadow-md relative">
        <div className="flex items-center gap-6 h-full">
            <h1 className="hidden sm:block text-lg font-mono font-bold tracking-widest text-[#e0e0e0]">ENIGMA SIMULATOR</h1>
            <h1 className="sm:hidden text-lg font-mono font-bold tracking-widest text-[#e0e0e0]">ENIGMA</h1>
            
            {/* Model Selector */}
            <div className="relative group ml-2 sm:ml-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors text-xs sm:text-sm font-mono font-bold text-enigma-lit">
                    <span>{activeModelInfo.name}</span>
                    <ChevronDown size={14} />
                </div>
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-white/10 rounded shadow-xl overflow-hidden hidden group-hover:block z-50">
                    {MODELS.map(m => (
                        <button 
                            key={m.id}
                            onClick={() => setActiveModel(m.id)}
                            className={`w-full text-left px-4 py-3 text-xs font-mono hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${activeModel === m.id ? 'text-enigma-lit bg-white/5' : 'text-gray-400'}`}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>
            </div>
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
                
                <div className="mb-3 relative z-20 w-full flex justify-center">
                    <RotorPanel 
                        settings={settings} 
                        onUpdate={handleUpdateSettings} 
                        onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                </div>

                {/* Main Box */}
                <div className={`bg-[#202020] p-6 pt-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-t border-l border-white/10 border-b-8 border-r-4 relative flex flex-col items-center gap-4 w-full max-w-2xl border-[#111]`}>
                     {/* Metal Plate Effect */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/50 rounded-b-lg shadow-white/5"></div>
                     
                     <div className="absolute top-4 right-6 text-[10px] font-mono text-white/20 tracking-widest uppercase">
                        {activeModelInfo.short} / SER-{Math.floor(Math.random() * 10000)}
                     </div>

                     <Lampboard litKey={litKey} />
                     
                     {/* Divider */}
                     <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1"></div>

                     <Keyboard 
                        onKeyPress={handleKeyPress} 
                        onKeyRelease={handleKeyRelease}
                        pressedKey={litKey ? inputTape[inputTape.length - 1] : null}
                    />

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-white/10 font-sans tracking-[0.3em] uppercase">
                        {activeModel === 'M4' ? 'KIEL' : activeModel === 'SwissK' ? 'BERN' : activeModel === 'Norway' ? 'OSLO' : 'BERLIN'}
                    </div>
                </div>
            </div>
        </main>

        {/* RIGHT: Operations Sidebar */}
        <aside className="w-80 bg-[#111] border-l border-white/10 flex flex-col shrink-0 z-10 shadow-2xl">
            
            {/* Tapes Section */}
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                
                {/* Mission Control */}
                <section>
                    <MissionControl onLoadMission={handleMissionLoad} />
                    {activeModel !== 'I' && (
                        <p className="text-[9px] text-gray-600 mt-2 text-center italic">
                            Note: Loading a mission will switch the machine to standard Enigma I.
                        </p>
                    )}
                </section>

                {/* Model Description Box */}
                <section>
                    <div className="bg-[#1a1a1a] p-3 rounded border border-white/5 shadow-inner">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-wider flex items-center gap-2">
                            <Info size={12} /> Technical Specs
                        </h3>
                        <div className="text-xs text-gray-300 leading-relaxed font-mono opacity-90">
                            {activeModelInfo.description}
                        </div>
                    </div>
                </section>

                {activeMission && activeModel === 'I' && (
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
                            </div>
                        </div>
                    </section>
                )}
                
                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="text-[9px] text-gray-600 font-mono leading-relaxed text-center">
                        <p className="mb-1">Type to encrypt.</p>
                        <p>Simulator V2.3</p>
                    </div>
                </div>
            </div>

        </aside>

      </div>

      <Plugboard 
        settings={settings}
        onUpdate={handleUpdateSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;
