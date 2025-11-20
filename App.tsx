import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EnigmaSettings, Mission, EnigmaModel } from './types';
import { EnigmaMachine } from './utils/enigmaMachine';
import RotorPanel from './components/RotorPanel';
import Lampboard from './components/Lampboard';
import Keyboard from './components/Keyboard';
import Plugboard from './components/Plugboard';
import MissionControl from './components/MissionControl';
import { Eraser, Paperclip, Copy, ChevronDown, Info, Lock, Unlock, X } from 'lucide-react';

const DEFAULT_STATES: Record<EnigmaModel, EnigmaSettings> = {
  'I': { model: 'I', rotors: ['I', 'II', 'III'], positions: ['A', 'A', 'A'], ringSettings: [0, 0, 0], reflector: 'B', plugboard: {} },
  'M3': { model: 'M3', rotors: ['I', 'II', 'III'], positions: ['A', 'A', 'A'], ringSettings: [0, 0, 0], reflector: 'B', plugboard: {} },
  'M4': { model: 'M4', rotors: ['Beta', 'I', 'II', 'III'], positions: ['A', 'A', 'A', 'A'], ringSettings: [0, 0, 0, 0], reflector: 'B_Thin', plugboard: {} },
  'Norway': { model: 'Norway', rotors: ['N_I', 'N_II', 'N_III'], positions: ['A', 'A', 'A'], ringSettings: [0, 0, 0], reflector: 'N', plugboard: {} },
  'SwissK': { model: 'SwissK', rotors: ['K_I', 'K_II', 'K_III'], positions: ['A', 'A', 'A'], ringSettings: [0, 0, 0], reflector: 'K', plugboard: {} },
  'Railway': { model: 'Railway', rotors: ['R_I', 'R_II', 'R_III'], positions: ['A', 'A', 'A'], ringSettings: [0, 0, 0], reflector: 'R', plugboard: {} }
};

const MODELS: { id: EnigmaModel; name: string; short: string; description: string }[] = [
    { id: 'I', name: 'Enigma I (Wehrmacht)', short: 'ENIGMA I', description: "Standard German Army/Air Force machine. Black crackle finish metal plate in oak wood case." },
    { id: 'M3', name: 'Enigma M3 (Navy)', short: 'ENIGMA M3', description: "Kriegsmarine standard. 3-rotor slot chosen from 8 available rotors." },
    { id: 'M4', name: 'Enigma M4 (U-Boat)', short: 'ENIGMA M4', description: "Advanced U-Boat model with 4 rotors for high security." },
    { id: 'Norway', name: 'Norenigma', short: 'NORWAY', description: "Post-war Norwegian Police Service model in hammer-tone finish." },
    { id: 'SwissK', name: 'Enigma K (Swiss)', short: 'SWISS K', description: "Commercial variant for Swiss Army. No plugboard. Smooth finish." },
    { id: 'Railway', name: 'Enigma R (Railway)', short: 'RAILWAY', description: "Reichsbahn model. Rewired, no plugboard. Industrial look." },
];

interface ThemeConfig {
    plateClass: string; // CSS class for the metal texture
    caseClass: string; // CSS class for the outer box
    innerCaseColor: string;
    hasPlugboard: boolean;
    keyRimColor?: string;
    windowStyle: 'military' | 'commercial';
}

const THEME_CONFIGS: Record<EnigmaModel, ThemeConfig> = {
    'I': { plateClass: 'crackle-texture', caseClass: 'wood-texture', innerCaseColor: 'bg-[#15100b]', hasPlugboard: true, windowStyle: 'military' },
    'M3': { plateClass: 'crackle-texture', caseClass: 'wood-texture', innerCaseColor: 'bg-[#15100b]', hasPlugboard: true, windowStyle: 'military' },
    'M4': { plateClass: 'crackle-texture', caseClass: 'wood-texture', innerCaseColor: 'bg-[#15100b]', hasPlugboard: true, windowStyle: 'military' },
    'Norway': { plateClass: 'hammertone-texture', caseClass: 'painted-texture', innerCaseColor: 'bg-[#1a221a]', hasPlugboard: true, windowStyle: 'military' },
    'SwissK': { plateClass: 'smooth-texture', caseClass: 'mahogany-texture', innerCaseColor: 'bg-[#0f0a05]', hasPlugboard: false, keyRimColor: 'from-zinc-200 to-zinc-400', windowStyle: 'commercial' },
    'Railway': { plateClass: 'smooth-texture', caseClass: 'mahogany-texture', innerCaseColor: 'bg-[#1a1a1a]', hasPlugboard: false, keyRimColor: 'from-slate-300 to-slate-500', windowStyle: 'commercial' },
};

// Visual Component for the Plugboard Sockets (Front Panel)
const PlugboardPanel: React.FC<{ model: EnigmaModel, plugboard: Record<string, string>, onClick: () => void }> = ({ model, plugboard, onClick }) => {
    const ALPHABET = "QWERTZUIOASDFGHJKPYXCVBNML";
    
    return (
        <div className="w-full px-12 pt-2 pb-6 relative z-10" onClick={onClick}>
            <div className="border-t-2 border-white/10 pt-4">
                 <h4 className="text-center text-[9px] text-white/30 font-mono mb-2 uppercase tracking-widest cursor-pointer hover:text-amber-500 transition-colors">Steckerbrett (Click to Config)</h4>
                 <div className="flex flex-col items-center gap-3 opacity-80">
                     {[
                         ALPHABET.slice(0, 9),
                         ALPHABET.slice(9, 17),
                         ALPHABET.slice(17)
                     ].map((row, rIdx) => (
                         <div key={rIdx} className="flex gap-[1.35rem]" style={{ paddingLeft: rIdx === 1 ? '2.5rem' : rIdx === 2 ? '1.25rem' : '0' }}>
                             {row.split('').map(char => {
                                 const isPlugged = !!plugboard[char];
                                 return (
                                     <div key={char} className="flex flex-col items-center gap-1 group cursor-pointer">
                                         <div className="w-2 h-2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] border border-white/20 relative">
                                             {isPlugged && <div className="absolute inset-0.5 rounded-full bg-red-900"></div>}
                                         </div>
                                         <div className="w-2 h-2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] border border-white/20 mt-0.5 relative">
                                              {isPlugged && <div className="absolute inset-0.5 rounded-full bg-red-900"></div>}
                                         </div>
                                         <span className="text-[8px] font-mono text-white/30 mt-0.5 group-hover:text-white">{char}</span>
                                     </div>
                                 )
                             })}
                         </div>
                     ))}
                 </div>
            </div>
            
            {/* Cables Visual (Abstract) */}
            {Object.keys(plugboard).length > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                    {/* This would ideally be SVG lines connecting sockets, keeping it simple for now */}
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
            )}
        </div>
    );
}

// Component for the Logo/Badge
const MachineBadge: React.FC<{ model: EnigmaModel }> = ({ model }) => {
    if (model === 'SwissK') {
        return (
            <div className="mt-8 mb-4 relative z-10 flex flex-col items-center opacity-80">
                 <div className="w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center bg-gradient-to-br from-[#222] to-black shadow-lg mb-1">
                     <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center">
                        <span className="font-serif text-2xl font-bold text-zinc-400">K</span>
                     </div>
                 </div>
                 <div className="text-[10px] tracking-widest text-zinc-500 font-sans uppercase font-bold">Chiffriermaschine</div>
                 <div className="text-[8px] text-zinc-600 mt-1">Swiss Army • Mod. 1939</div>
            </div>
        );
    }

    if (model === 'Railway') {
        return (
             <div className="mt-8 mb-4 relative z-10 flex flex-col items-center opacity-70">
                 <div className="w-20 h-10 border-2 border-white/10 rounded flex items-center justify-center bg-black shadow-lg mb-1">
                     <span className="font-mono text-xs font-bold text-zinc-300 tracking-widest">REICHSBAHN</span>
                 </div>
                 <div className="text-[8px] text-zinc-600 mt-1 uppercase">Sonderausführung</div>
            </div>
        );
    }

    if (model === 'Norway') {
         return (
             <div className="mt-8 mb-4 relative z-10 flex flex-col items-center opacity-80">
                 <div className="w-16 h-10 border border-white/10 rounded bg-[#333] flex items-center justify-center shadow-lg mb-1">
                     <span className="font-sans text-[10px] font-bold text-zinc-300">NORENIGMA</span>
                 </div>
                 <div className="text-[8px] text-zinc-500 mt-1">Kjeller • 1945</div>
            </div>
        );
    }

    // Standard "J" Logo for I, M3, M4
    return (
        <div className="mt-8 mb-4 relative z-10 flex flex-col items-center opacity-90">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/40 shadow-inner mb-1 relative group">
                <div className="absolute inset-0 rounded-full border border-white/5 scale-90"></div>
                <span className="font-serif text-xl font-bold text-white/40 group-hover:text-amber-500/50 transition-colors">J</span>
            </div>
            <div className="text-[9px] tracking-[0.4em] text-white/20 font-sans uppercase font-bold">Chiffriermaschinen</div>
            <div className="text-[8px] text-white/10 mt-1">HEIMSOETH & RINKE</div>
        </div>
    );
}

const App: React.FC = () => {
  const [activeModel, setActiveModel] = useState<EnigmaModel>('I');
  const [machineStates, setMachineStates] = useState<Record<EnigmaModel, EnigmaSettings>>(DEFAULT_STATES);
  const [litKey, setLitKey] = useState<string | null>(null);
  const [inputTape, setInputTape] = useState<string>("");
  const [outputTape, setOutputTape] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  
  const settings = machineStates[activeModel];
  const machineRef = useRef<EnigmaMachine>(new EnigmaMachine(settings));
  const themeConfig = THEME_CONFIGS[activeModel];

  useEffect(() => {
    machineRef.current = new EnigmaMachine(settings);
  }, [settings]);

  const handleUpdateSettings = (newSettings: EnigmaSettings) => {
    setMachineStates(prev => ({ ...prev, [activeModel]: newSettings }));
  };

  const handleKeyPress = useCallback((char: string) => {
    if (isCoverOpen) return; // Safety mechanism
    const machine = machineRef.current;
    machine.step();
    const encrypted = machine.encryptChar(char);
    setLitKey(encrypted);
    setInputTape(prev => prev + char);
    setOutputTape(prev => prev + encrypted);
    setMachineStates(prev => ({
        ...prev,
        [activeModel]: { ...prev[activeModel], positions: machine.getSettings().positions }
    }));
  }, [activeModel, isCoverOpen]);

  const handleKeyRelease = useCallback(() => {
    setLitKey(null);
  }, []);

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.repeat || litKey) return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleKeyPress(key);
    };
    const upHandler = () => handleKeyRelease();
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [litKey, handleKeyPress, handleKeyRelease]);

  const handleMissionLoad = (mission: Mission) => {
    if (activeModel !== 'I') setActiveModel('I');
    setActiveMission(mission);
    setInputTape(""); setOutputTape("");
    setMachineStates(prev => ({
        ...prev, 'I': { ...prev['I'], positions: ['A', 'A', 'A'], ...mission.requiredSettings }
    }));
  };

  const activeModelInfo = MODELS.find(m => m.id === activeModel) || MODELS[0];

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="h-12 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-50 shadow-xl">
        <div className="flex items-center gap-4">
            <h1 className="hidden md:block text-sm font-mono font-bold tracking-[0.2em] text-gray-400">ENIGMA SIMULATOR</h1>
            
            <div className="relative">
                <button 
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors text-xs font-mono font-bold text-amber-500 border border-amber-500/20"
                >
                    <span>{activeModelInfo.name}</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isModelMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsModelMenuOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-1 w-64 bg-[#111] border border-white/10 rounded shadow-2xl overflow-hidden z-50">
                            {MODELS.map(m => (
                                <button 
                                    key={m.id} 
                                    onClick={() => { setActiveModel(m.id); setIsCoverOpen(false); setIsModelMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 text-xs font-mono hover:bg-white/5 border-b border-white/5 ${activeModel === m.id ? 'text-amber-500 bg-white/5' : 'text-gray-400'}`}
                                >
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* MAIN SIMULATION AREA */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-4 bg-[#080808] overflow-hidden select-none">
            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
            
            {/* Container for Scaling */}
            <div className="relative z-10 transform scale-[0.6] sm:scale-[0.7] md:scale-[0.85] lg:scale-95 transition-transform duration-500 ease-out">
                
                {/* THE MACHINE BOX */}
                <div className={`${themeConfig.caseClass} p-5 rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-2 border-black/40 relative`}>
                    
                    {/* Metal Hardware Latch (Visual) */}
                    <div className="absolute left-1/2 -bottom-2 w-16 h-4 bg-[#222] rounded-b border-x border-b border-white/10 shadow-lg"></div>

                    {/* Inner Chassis Rim */}
                    <div className={`${themeConfig.innerCaseColor} p-2 rounded shadow-[inset_0_2px_10px_black]`}>
                        
                        {/* METAL FACEPLATE (The main interface) */}
                        <div className={`${themeConfig.plateClass} w-[620px] relative rounded-sm shadow-[inset_0_0_40px_black] border-t border-white/10 flex flex-col items-center overflow-hidden`}>
                             
                             {/* Badge */}
                             <MachineBadge model={activeModel} />

                             {/* ROTORS */}
                             <div className="w-full px-10 relative z-20 mb-2">
                                {/* Cover Latch */}
                                <button 
                                    onClick={() => setIsCoverOpen(!isCoverOpen)}
                                    className="absolute right-4 top-8 z-30 w-8 h-12 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-sm border border-zinc-700 shadow-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all group"
                                    title={isCoverOpen ? "Close Rotor Cover" : "Open Rotor Cover"}
                                >
                                    <div className="w-1 h-6 bg-black/20 rounded-full"></div>
                                    {isCoverOpen ? 
                                        <Lock size={10} className="absolute -bottom-4 text-zinc-500" /> : 
                                        <Unlock size={10} className="absolute -bottom-4 text-zinc-500" />
                                    }
                                </button>

                                <RotorPanel 
                                    settings={settings} 
                                    onUpdate={handleUpdateSettings} 
                                    onOpenSettings={() => setIsSettingsOpen(true)}
                                    isCoverOpen={isCoverOpen}
                                    variant={themeConfig.windowStyle}
                                />
                             </div>

                             {/* LAMPBOARD */}
                             <div className="w-full px-8 relative z-10 mb-4 flex justify-center">
                                <Lampboard litKey={litKey} />
                             </div>

                             {/* KEYBOARD */}
                             <div className="w-full relative z-10 pb-4">
                                 <div className="mx-4 border-t border-white/5 pt-4">
                                    <Keyboard 
                                        onKeyPress={handleKeyPress} 
                                        onKeyRelease={handleKeyRelease}
                                        pressedKey={litKey ? inputTape[inputTape.length - 1] : null}
                                        rimColor={themeConfig.keyRimColor}
                                    />
                                 </div>
                             </div>
                             
                             {/* PLUGBOARD PANEL (Visual only, triggers modal) */}
                             {themeConfig.hasPlugboard ? (
                                 <PlugboardPanel model={activeModel} plugboard={settings.plugboard} onClick={() => setIsSettingsOpen(true)} />
                             ) : (
                                 <div className="w-full pb-8 pt-2 flex justify-center opacity-30 border-t border-white/5">
                                     <span className="text-[9px] font-mono tracking-widest text-white/50">NO PLUGBOARD CONNECTIONS</span>
                                 </div>
                             )}

                             {/* Screws */}
                             <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-zinc-700 shadow-inner flex items-center justify-center opacity-60"><div className="w-full h-px bg-black rotate-45"></div></div>
                             <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zinc-700 shadow-inner flex items-center justify-center opacity-60"><div className="w-full h-px bg-black rotate-12"></div></div>
                             <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-zinc-700 shadow-inner flex items-center justify-center opacity-60"><div className="w-full h-px bg-black rotate-90"></div></div>
                             <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-zinc-700 shadow-inner flex items-center justify-center opacity-60"><div className="w-full h-px bg-black -rotate-45"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-80 bg-[#0c0c0c] border-l border-white/5 flex flex-col shrink-0 shadow-2xl relative z-20">
            {/* Tapes */}
            <div className="p-5 bg-[#111] border-b border-white/5 shadow-lg">
                <div className="flex justify-between items-end mb-3">
                     <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Paperclip size={12} /> Transcripts
                     </h2>
                     <button onClick={() => { setInputTape(""); setOutputTape(""); }} className="text-[9px] text-red-900/60 hover:text-red-500 flex items-center gap-1 transition-colors">
                        <Eraser size={10} /> CLEAR ALL
                     </button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-[9px] text-zinc-600 block mb-1 ml-1">INPUT</label>
                        <div className="bg-[#e5e5e5] text-zinc-800 font-mono text-sm p-2 rounded-sm min-h-[2.5rem] shadow-inner break-all leading-tight font-medium tracking-wide">
                            {inputTape || <span className="opacity-30 italic">...</span>}
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] text-zinc-600 block mb-1 ml-1">OUTPUT (CIPHER)</label>
                        <div className="bg-[#e5e5e5] text-red-900 font-mono text-sm p-2 rounded-sm min-h-[2.5rem] shadow-inner break-all leading-tight font-bold tracking-wide relative group">
                            {outputTape || <span className="opacity-30 italic font-normal">...</span>}
                            {outputTape && (
                                <button onClick={() => navigator.clipboard.writeText(outputTape)} className="absolute right-1 bottom-1 p-1 text-zinc-400 hover:text-black bg-white/80 rounded shadow-sm transition-colors">
                                    <Copy size={10} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
                <MissionControl onLoadMission={handleMissionLoad} />
                
                <div className="bg-white/5 p-4 rounded border border-white/5">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-wider flex items-center gap-2">
                        <Info size={12} /> Machine Specs
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                        {activeModelInfo.description}
                    </p>
                </div>

                {activeMission && activeModel === 'I' && (
                     <div className="bg-amber-900/10 border border-amber-500/20 rounded p-4 animate-slideIn">
                         <h4 className="text-amber-500 text-xs font-bold mb-1 uppercase tracking-wider">Active Mission</h4>
                         <p className="text-zinc-400 text-xs leading-relaxed mb-2">{activeMission.title}</p>
                         <div className="text-[10px] font-mono bg-black/40 p-2 rounded text-amber-200/80 break-all">
                             TARGET: {activeMission.targetText}
                         </div>
                     </div>
                )}
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