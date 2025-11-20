import React, { useState } from 'react';
import { EnigmaSettings } from '../types';
import { ALPHABET } from '../constants';
import { X } from 'lucide-react';

interface Props {
  settings: EnigmaSettings;
  onUpdate: (s: EnigmaSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Plugboard: React.FC<Props> = ({ settings, onUpdate, isOpen, onClose }) => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlug = (char: string) => {
    // If same char clicked twice, deselect
    if (selectedChar === char) {
      setSelectedChar(null);
      return;
    }

    // If nothing selected, select first
    if (!selectedChar) {
      // Check if already plugged, if so, remove existing connection first
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

    // Second char selected, form pair
    const newBoard = { ...settings.plugboard };
    
    // Remove old connections for both
    const oldTarget = newBoard[selectedChar];
    const oldSource = newBoard[char];
    if (oldTarget) { delete newBoard[selectedChar]; delete newBoard[oldTarget]; }
    if (oldSource) { delete newBoard[char]; delete newBoard[oldSource]; }

    // Create new connection
    newBoard[selectedChar] = char;
    newBoard[char] = selectedChar;

    onUpdate({ ...settings, plugboard: newBoard });
    setSelectedChar(null);
  };

  const isConnected = (char: string) => !!settings.plugboard[char];
  
  // Configuration Logic for Rotors
  const handleRotorChange = (idx: number, val: string) => {
    const newRotors = [...settings.rotors] as [string, string, string];
    newRotors[idx] = val;
    onUpdate({ ...settings, rotors: newRotors });
  };

  const handleRingChange = (idx: number, val: number) => {
    const newRings = [...settings.ringSettings] as [number, number, number];
    newRings[idx] = val;
    onUpdate({ ...settings, ringSettings: newRings });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#252525] w-full max-w-2xl rounded-xl shadow-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto text-gray-200">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 className="text-xl font-mono font-bold text-enigma-lit">MACHINE CONFIGURATION</h2>
          <button onClick={onClose} className="hover:text-white"><X /></button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Rotor Setup */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Rotor Selection</h3>
            <div className="space-y-4">
              {['Left', 'Middle', 'Right'].map((label, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded">
                  <span className="text-xs font-mono text-gray-400">{label}</span>
                  <div className="flex gap-2">
                    <select 
                      value={settings.rotors[i]}
                      onChange={(e) => handleRotorChange(i, e.target.value)}
                      className="bg-[#333] border border-white/10 rounded text-sm px-2 py-1 outline-none focus:border-enigma-lit"
                    >
                      {['I', 'II', 'III', 'IV', 'V'].map(r => <option key={r} value={r}>Rotor {r}</option>)}
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
                <span className="text-xs font-mono text-gray-400">REFLECTOR</span>
                <select 
                  value={settings.reflector}
                  onChange={(e) => onUpdate({...settings, reflector: e.target.value})}
                  className="bg-[#333] border border-white/10 rounded text-sm px-2 py-1 outline-none focus:border-enigma-lit"
                >
                  <option value="B">UKW-B</option>
                  <option value="C">UKW-C</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plugboard */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider flex justify-between">
              <span>Plugboard</span>
              <span className="text-xs normal-case font-normal text-gray-500">Click two letters to connect</span>
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
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-enigma-lit text-black px-6 py-2 rounded font-bold hover:bg-yellow-500 transition-colors font-mono"
          >
            APPLY CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
};

export default Plugboard;
