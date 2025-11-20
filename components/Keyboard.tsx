import React from 'react';

interface Props {
  onKeyPress: (char: string) => void;
  onKeyRelease: () => void;
  pressedKey: string | null;
  rimColor?: string; // Optional gradient class override
}

const KEYS = [
  { row: 0, chars: "QWERTZUIO".split('') }, // 9 keys
  { row: 1, chars: "ASDFGHJK".split('') },  // 8 keys, indented
  { row: 2, chars: "PYXCVBNML".split('') }  // 9 keys, indented slightly differently
];

const Keyboard: React.FC<Props> = ({ onKeyPress, onKeyRelease, pressedKey, rimColor }) => {
  const rimGradient = rimColor ? `bg-gradient-to-br ${rimColor}` : 'bg-gradient-to-br from-zinc-300 via-zinc-100 to-zinc-400';

  return (
    <div className="flex flex-col items-center gap-4 select-none relative py-4">
      
      {/* Decorative Screws for the Keyboard Plate */}
      <div className="absolute top-0 left-4 w-2 h-2 bg-zinc-600 rounded-full shadow-inner flex items-center justify-center opacity-50"><div className="w-full h-px bg-zinc-800 rotate-12"></div></div>
      <div className="absolute top-0 right-4 w-2 h-2 bg-zinc-600 rounded-full shadow-inner flex items-center justify-center opacity-50"><div className="w-full h-px bg-zinc-800 -rotate-45"></div></div>
      <div className="absolute bottom-0 left-10 w-2 h-2 bg-zinc-600 rounded-full shadow-inner flex items-center justify-center opacity-50"><div className="w-full h-px bg-zinc-800 rotate-90"></div></div>
      <div className="absolute bottom-0 right-10 w-2 h-2 bg-zinc-600 rounded-full shadow-inner flex items-center justify-center opacity-50"><div className="w-full h-px bg-zinc-800 rotate-0"></div></div>

      {KEYS.map((rowConfig, rIdx) => (
        <div 
          key={rIdx} 
          className="flex gap-3 sm:gap-4"
          style={{
            // Authentic Staggering:
            // Row 2 is indented by half a key width approx
            // Row 3 is indented but different from Row 2
            paddingLeft: rIdx === 1 ? '3rem' : rIdx === 2 ? '1.5rem' : '0'
          }}
        >
          {rowConfig.chars.map((char) => {
            const isPressed = pressedKey === char;
            return (
              <div key={char} className="relative group">
                  {/* Key Shadow on chassis */}
                  <div className="absolute -bottom-1.5 -right-1.5 w-full h-full rounded-full bg-black/60 blur-sm"></div>
                  
                  <button
                    onMouseDown={() => onKeyPress(char)}
                    onMouseUp={onKeyRelease}
                    onMouseLeave={() => isPressed && onKeyRelease()}
                    onTouchStart={(e) => { e.preventDefault(); onKeyPress(char); }}
                    onTouchEnd={(e) => { e.preventDefault(); onKeyRelease(); }}
                    className={`
                      relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center 
                      transition-transform duration-75 outline-none z-10
                      ${isPressed ? 'translate-y-1 scale-95' : 'hover:-translate-y-px'}
                    `}
                  >
                    {/* Metal Rim (Bezel) - Silver/Nickel look */}
                    <div className={`absolute inset-0 rounded-full ${rimGradient} shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}></div>
                    
                    {/* Inner Rim Shadow */}
                    <div className="absolute inset-[2px] rounded-full bg-black/80"></div>

                    {/* Key Cap - Bakelite (Shiny Black) */}
                    <div className="absolute inset-[3px] rounded-full bg-radial-gradient from-[#444] to-[#050505] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden">
                         
                         {/* Specular Highlights for Bakelite look */}
                         <div className="absolute -top-2 -left-2 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
                         <div className="absolute top-2 right-3 w-2 h-1 bg-white/30 rounded-full rotate-45 blur-[0.5px]"></div>
                         
                         <span className="text-[#eee] font-sans font-bold text-sm sm:text-base z-10 drop-shadow-md">
                           {char}
                         </span>
                    </div>
                  </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;