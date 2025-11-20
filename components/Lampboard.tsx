
import React from 'react';

interface Props {
  litKey: string | null;
}

const KEYS = [
  { row: 0, chars: "QWERTZUIO".split('') },
  { row: 1, chars: "ASDFGHJK".split('') },
  { row: 2, chars: "PYXCVBNML".split('') }
];

const Lampboard: React.FC<Props> = ({ litKey }) => {
  return (
    <div className="flex flex-col items-center gap-4 select-none py-2">
      {KEYS.map((rowConfig, rIdx) => (
        <div 
          key={rIdx} 
          className="flex gap-3 sm:gap-4"
          style={{
            // Match Keyboard Staggering
            paddingLeft: rIdx === 1 ? '3rem' : rIdx === 2 ? '1.5rem' : '0'
          }}
        >
          {rowConfig.chars.map((char) => {
            const isLit = litKey === char;
            return (
              <div
                key={char}
                className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-75
                  border-2
                  ${isLit 
                    ? 'border-yellow-600 bg-yellow-500 text-yellow-900 shadow-[0_0_30px_10px_rgba(255,200,0,0.5)]' 
                    : 'border-white/10 bg-black/60 text-white/20 shadow-inner'
                  }
                `}
              >
                {/* Flat Glass Window Look */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                
                {/* Inner Glow Source */}
                {isLit && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-yellow-400 blur-md opacity-60 animate-pulse"></div>
                        <div className="absolute inset-1 rounded-full bg-yellow-200 blur-[2px] opacity-90"></div>
                    </>
                )}

                <span className={`font-mono font-bold text-lg z-10 ${isLit ? 'scale-110' : ''}`}>
                    {char}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Lampboard;
