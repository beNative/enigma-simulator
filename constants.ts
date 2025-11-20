
import { RotorDef, ReflectorDef } from './types';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const ROTORS: Record<string, RotorDef> = {
  // Standard Wehrmacht/Kriegsmarine
  I: { name: 'I', wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II: { name: 'II', wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { name: 'III', wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
  IV: { name: 'IV', wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
  V: { name: 'V', wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' },
  VI: { name: 'VI', wiring: 'JPGVOUMFYQBENHZRDKASXLICTW', notch: 'ZM' },
  VII: { name: 'VII', wiring: 'NZJHGRCXMYSWBOUFAIVLPEKQDT', notch: 'ZM' },
  VIII: { name: 'VIII', wiring: 'FKQHTLXOCBJSPDZRAMEWNIUYGV', notch: 'ZM' },
  
  // Norway (Norenigma) - Post-war Police
  N_I: { name: 'N-I', wiring: 'WTOKASUYVRBXJHQCPZEFMDINLG', notch: 'Q' },
  N_II: { name: 'N-II', wiring: 'GJLPUBSWEMCTQVHXAFZDRONYKI', notch: 'E' },
  N_III: { name: 'N-III', wiring: 'JWFMCPNOHRYIDXBVGQLTAEZKSU', notch: 'V' },
  N_IV: { name: 'N-IV', wiring: 'FGZJMVXEPBWSHQCTOIARYKNDLU', notch: 'J' },
  N_V: { name: 'N-V', wiring: 'HEJXQOTZBVFDASCILWPGYNMURK', notch: 'Z' },

  // Swiss K (Commercial) - Standard notch positions used for simulation
  K_I: { name: 'K-I', wiring: 'PEZUOHXSCVFMTBGLRINQJWAYDK', notch: 'Q' },
  K_II: { name: 'K-II', wiring: 'ZOUESYDKFWPCIQXHMVBLGNJRAT', notch: 'E' },
  K_III: { name: 'K-III', wiring: 'EHRVXGAOBQUSIMZFLYNWKTPDJC', notch: 'V' },

  // Railway (Sonderenigma)
  R_I: { name: 'R-I', wiring: 'JGDQOXUSCAMIFRVTPNEWKBLZYH', notch: 'Q' },
  R_II: { name: 'R-II', wiring: 'NTZPSFBOKMWRCJDIVLAEYUXHGQ', notch: 'E' },
  R_III: { name: 'R-III', wiring: 'JVIUBHTCDYAKEQZPOSGXNRMWFL', notch: 'V' },
};

export const GREEK_ROTORS: Record<string, RotorDef> = {
  Beta: { name: 'Beta', wiring: 'LEYJVCNIXWPBQMDRTAKZGFUHOS', notch: '' },
  Gamma: { name: 'Gamma', wiring: 'FSOKANUERHMBTIYCWLQPZXVGJD', notch: '' },
};

export const REFLECTORS: Record<string, ReflectorDef> = {
  A: { name: 'A', wiring: 'EJMZALYXVBWFCRQUONTSPIKHGD' }, // Early Enigma I
  B: { name: 'B', wiring: 'YRUHQSLDPXNGOKMIEBFZCWVJAT' }, // Standard
  C: { name: 'C', wiring: 'FVPJIAOYEDRZXWGCTKUQSBNMHL' }, // Standard
  B_Thin: { name: 'B Thin', wiring: 'ENKQAUYWJICOPBLMDXZVFTHRGS' }, // M4
  C_Thin: { name: 'C Thin', wiring: 'RDOBJNTKVEHMLFCWZAXGYIPSUQ' }, // M4
  
  N: { name: 'N (Norway)', wiring: 'MOWJYPUXNDSRAIBFVLKZGQCHET' }, // Norway
  K: { name: 'K (Swiss)', wiring: 'IMETCGFRAYSQBZXWLHKDVUPOJN' }, // Swiss
  R: { name: 'Railway', wiring: 'QYHOGNECVPUZTFDJAXWMKISRBL' }, // Railway
};
