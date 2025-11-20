
import React, { useState } from 'react';
import { EnigmaSettings, EnigmaModel } from '../types';
import { ALPHABET, ROTORS, REFLECTORS, GREEK_ROTORS } from '../constants';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  settings: EnigmaSettings;
  onUpdate: (s: EnigmaSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MODEL_CONFIGS: Record<EnigmaModel, {
  label: string;
  rotors: string[];
  reflectors: string[];
  hasPlugboard: boolean;
  description: string;
}> = {
  'I': {
    label: "Wehrmacht Enigma I",
    rotors: ['I', 'II', 'III', 'IV', 'V'],
    reflectors: ['A', 'B', 'C'],
    hasPlugboard: true,
    description: "Standard German Army/Air Force machine."
  },
  'M3': {
    label: "Kriegsmarine M3",
    rotors: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
    reflectors: ['B', 'C'],
    hasPlugboard: true,
    description: "Early war Navy machine, 3 rotors selected from 8."
  },
  'M4': {
    label: "Kriegsmarine M4",
    rotors: ['Beta', 'Gamma', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
    reflectors: ['B_Thin', 'C_Thin'],
    hasPlugboard: true,
    description: "U-Boat 4-rotor machine. First rotor must be Beta/Gamma."
  },
  'Norway': {
    label: "Norenigma (Police)",
    rotors: ['N_I', 'N_II', 'N_III', 'N_IV', 'N_V'],
    reflectors: ['N'],
    hasPlugboard: true,
    description: "Post-war modified Enigma used by Norwegian Police."
  },
  'SwissK': {
    label: "Swiss K (Commercial)",
    rotors: ['K_I', 'K_II', 'K_III'],
    reflectors: ['K'],
    hasPlugboard: false,
    description: "Commercial variant used by Swiss Army. No plugboard."
  },
  'Railway': {
    label: "Reichsbahn (Rocket)",
    rotors: ['R_I', 'R_II', 'R_III'],
    reflectors: ['R'],
    hasPlugboard: false,
    description: "Railway Security. Rewired rotors, no plugboard."
  }
};

const Plugboard: React.FC<Props> = ({ settings, onUpdate, isOpen, onClose }) => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  if (!isOpen) return null;

  const config = MODEL_CONFIGS[settings.model];

  const handlePlug = (char: string) => {
    if (!config.hasPlugboard) return;

    if (selectedChar === char) {
      setSelectedChar(null);
      return;
    }
    if (!selectedChar) {
      const existing = settings.plugboard[char];
      if (existing) {
        const newBoard = { ...settings.plugboard };
        delete newBoard[char];
        delete newBoard[existing];
        onUpdate({ ...settings, plugboard: newBoard });
      }
      setSelectedChar(char);
      return;
    }

    const newBoard = { ...settings.plugboard };
    const oldTarget = newBoard[selectedChar];
    const oldSource = newBoard[char];
    if (oldTarget) { delete newBoard[selectedChar]; delete newBoard[oldTarget]; }
    if (oldSource) { delete newBoard[char]; delete newBoard[oldSource]; }

    newBoard[selectedChar] = char;
    newBoard[char] = selectedChar;

    onUpdate({ ...settings, plugboard: newBoard });
    setSelectedChar(null);
  };

  const isConnected = (char: string) => settings.plugboard?.[char];
  
  const handleRotorChange = (idx: number, val: string) => {
    const newRotors = [...settings.rotors];
    newRotors[idx] = val;
    onUpdate({ ...settings, rotors: newRotors });
  };

  const handleRingChange = (idx: number, val: number) => {
    const newRings = [...settings.ringSettings];
    newRings[idx] = val;
    onUpdate({ ...settings, ringSettings: newRings });
  };

  const getRotorLabel = (index: number) => {
      const total = settings.rotors.length;
      if (total === 4) {
          if (index === 0) return "GREEK";
          if (index === 1) return "LEFT";
          if (index === 2) return "MIDDLE";
          return "RIGHT";
      }
      return ["LEFT", "MIDDLE", "RIGHT"][index];
  }

  const getAvailableRotors = (index: number) => {
      const total = settings.rotors.length;
      // M4 Special Rule: Index 0 must be Greek
      if (settings.model === 'M4' && index === 0) {
          return ['Beta', 'Gamma'];
      }
      // M4 Special Rule: Standard slots cannot take Greek
      if (settings.model === 'M4' && index !== 0) {
          return config.rotors.filter(r => !['Beta', 'Gamma'].includes(r));
      }
      return config.rotors;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#252525] w-full max-w-4xl rounded-xl shadow-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto text-gray-200">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-mono font-bold text-enigma-lit">MACHINE CONFIGURATION</h2>
            <span className="text-xs text-gray-500 font-mono mt-1">{config.label}</span>
            <span className="text-[10px] text-gray-600 italic">{config.description}</span>
          </div>
          <button onClick={onClose} className="hover:text-white"><X /></button>
        </div>

        <div className={`grid ${config.hasPlugboard ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
          {/* Rotor Setup */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Rotor Stack</h3>
            <div className="space-y-3">
              {settings.rotors.map((val, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded">
                  <span className={`text-xs font-mono ${settings.model === 'M4' && i === 0 ? 'text-blue-400' : 'text-gray-400'}`}>{getRotorLabel(i)}</span>
                  <div className="flex gap-2">
                    <select 
                      value={val}
                      onChange={(e) => handleRotorChange(i, e.target.value)}
                      className="bg-[#333] border border-white/10 rounded text-sm px-2 py-1 outline-none focus:border-enigma-lit w-24"
                    >
                      {getAvailableRotors(i).map(r => <option key={r} value={r}>{ROTORS[r]?.name || GREEK_ROTORS[r]?.name || r}</option>)}
                    </select>
                    <select 
                       value={settings.ringSettings[i]}
                       onChange={(e) => handleRingChange(i, parseInt(e.target.value))}
                       className="bg-[#333] border border-white/10 rounded text-sm px-2 py-1 outline-none focus:border-enigma-lit w-16"
                    >
                      {ALPHABET.split('').map((l, idx) => <option key={l} value={idx}>{l}-{idx+1}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between bg-black/20 p-3 rounded mt-4">
                <span className="text-xs font-mono text-gray-400">REFLECTOR (UKW)</span>
                <select 
                  value={settings.reflector}
                  onChange={(e) => onUpdate({...settings, reflector: e.target.value})}
                  className="bg-[#333] border border-white/10 rounded text-sm px-2 py-1 outline-none focus:border-enigma-lit w-32"
                >
                   {config.reflectors.map(r => (
                       <option key={r} value={r}>{REFLECTORS[r]?.name || r}</option>
                   ))}
                </select>
              </div>
            </div>
          </div>

          {/* Plugboard - Only if supported */}
          {config.hasPlugboard ? (
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider flex justify-between">
                <span>Steckerbrett</span>
                <span className="text-xs normal-case font-normal text-gray-500">Connect pairs</span>
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {ALPHABET.split('').map(char => {
                  const connected = isConnected(char);
                  const target = settings.plugboard[char];
                  const isSelected = selectedChar === char;
                  
                  let borderColor = 'border-white/10';
                  let bgColor = 'bg-[#1a1a1a]';
                  let textColor = 'text-gray-400';

                  if (isSelected) {
                     borderColor = 'border-enigma-lit';
                     bgColor = 'bg-enigma-lit/20';
                     textColor = 'text-enigma-lit';
                  } else if (connected) {
                     borderColor = 'border-green-500/50';
                     bgColor = 'bg-green-900/20';
                     textColor = 'text-green-400';
                  }

                  return (
                    <button
                      key={char}
                      onClick={() => handlePlug(char)}
                      className={`
                        h-10 rounded flex flex-col items-center justify-center text-xs font-bold border transition-all
                        ${borderColor} ${bgColor} ${textColor}
                      `}
                    >
                      <span>{char}</span>
                      {connected && <span className="text-[9px] opacity-60">{target}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-white/10 rounded-xl bg-white/5 opacity-60">
                <AlertTriangle size={48} className="mb-4 text-yellow-500/50" />
                <h3 className="text-gray-300 font-mono font-bold mb-2">PLUGBOARD UNAVAILABLE</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                    The selected model ({config.label}) historically did not feature a plugboard mechanism. Connections are direct 1-to-1.
                </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end border-t border-white/5 pt-4">
          <button 
            onClick={onClose}
            className="bg-enigma-lit text-black px-8 py-2 rounded font-bold hover:bg-yellow-500 transition-colors font-mono"
          >
            CLOSE CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
};

export default Plugboard;
