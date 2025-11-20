import React from 'react';

interface Props {
  onKeyPress: (char: string) => void;
  onKeyRelease: () => void;
  pressedKey: string | null;
}

const ROWS = [
  "QWERTZUIO",
  "ASDFGHJK",
  "PYXCVBNML"
];

const Keyboard: React.FC<Props> = ({ onKeyPress, onKeyRelease, pressedKey }) => {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-2">
          {row.split('').map((char) => {
            const isPressed = pressedKey === char;
            return (
              <button
                key={char}
                onMouseDown={() => onKeyPress(char)}
                onMouseUp={onKeyRelease}
                onMouseLeave={() => isPressed && onKeyRelease()}
                onTouchStart={(e) => { e.preventDefault(); onKeyPress(char); }}
                onTouchEnd={(e) => { e.preventDefault(); onKeyRelease(); }}
                className={`
                  w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  border-4 outline-none
                  ${isPressed
                    ? 'bg-[#444] border-[#111] translate-y-1 text-gray-300'
                    : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:bg-[#252525] shadow-[0_4px_0_rgb(20,20,20)]'
                  }
                `}
              >
                {char}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;