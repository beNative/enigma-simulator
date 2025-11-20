import React from 'react';

interface Props {
  litKey: string | null;
}

const ROWS = [
  "QWERTZUIO",
  "ASDFGHJK",
  "PYXCVBNML"
];

const Lampboard: React.FC<Props> = ({ litKey }) => {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-2">
          {row.split('').map((char) => {
            const isLit = litKey === char;
            return (
              <div
                key={char}
                className={`
                  w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-75
                  border-2 
                  ${isLit 
                    ? 'bg-yellow-400 text-black border-yellow-200 shadow-glow scale-105 z-10' 
                    : 'bg-[#222] text-white/20 border-white/10 shadow-inner'
                  }
                `}
              >
                {char}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Lampboard;