
import React, { useState } from 'react';
import { generateDailyMission, getHistoricalFact } from '../services/aiService';
import { Mission } from '../types';
import { Radio, RefreshCw, BookOpen } from 'lucide-react';

interface Props {
  onLoadMission: (m: Mission) => void;
}

const MissionControl: React.FC<Props> = ({ onLoadMission }) => {
  const [loading, setLoading] = useState(false);
  const [fact, setFact] = useState<string | null>(null);
  const [factLoading, setFactLoading] = useState(false);

  const handleNewMission = async () => {
    setLoading(true);
    try {
      const mission = await generateDailyMission();
      onLoadMission(mission);
      setFact(null); 
    } finally {
      setLoading(false);
    }
  };

  const handleGetFact = async () => {
    setFactLoading(true);
    try {
      const newFact = await getHistoricalFact("Enigma code breaking Bletchley Park");
      setFact(newFact);
    } finally {
      setFactLoading(false);
    }
  }

  return (
    <div className="bg-[#1e1e1e] rounded-lg p-4 border-l-4 border-enigma-lit shadow-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-enigma-lit">
          <Radio size={18} className={loading ? "animate-pulse" : ""} />
          <h3 className="font-mono font-bold text-sm">INTELLIGENCE HQ</h3>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={handleGetFact}
                disabled={factLoading}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 transition-colors"
                title="Archive Fact"
            >
                <BookOpen size={14} />
            </button>
        </div>
      </div>
      
      <div className="mb-4">
        <button 
            onClick={handleNewMission}
            disabled={loading}
            className="w-full py-2 px-3 text-xs font-bold bg-enigma-lit/10 hover:bg-enigma-lit/20 text-enigma-lit border border-enigma-lit/30 rounded transition-colors flex items-center justify-center gap-2"
        >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "DECODING..." : "REQUEST NEW MISSION"}
        </button>
      </div>
      
      <div className="text-xs text-gray-400 font-mono bg-black/30 p-3 rounded border border-white/5 min-h-[60px] flex flex-col justify-center">
        {fact ? (
            <div className="animate-fadeIn">
                <p className="text-green-400 mb-1 font-bold">ARCHIVE RECORD:</p>
                <p className="leading-relaxed">{fact}</p>
            </div>
        ) : (
            <p className="opacity-60 italic">
                "Awaiting orders. Stand by."
            </p>
        )}
      </div>
    </div>
  );
};

export default MissionControl;
