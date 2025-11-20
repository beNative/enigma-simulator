
export interface RotorDef {
  name: string;
  wiring: string;
  notch: string; // Turnover notch position (letter), empty if none
}

export interface ReflectorDef {
  name: string;
  wiring: string;
}

export type EnigmaModel = 'I' | 'M3' | 'M4' | 'Norway' | 'SwissK' | 'Railway';

export interface EnigmaSettings {
  model: EnigmaModel;
  rotors: string[]; // Dynamic length
  positions: string[]; // Current visible letter
  ringSettings: number[]; // 0-25 (A=0)
  reflector: string; 
  plugboard: Record<string, string>; // Map 'A' -> 'Z'
}

export interface Mission {
  title: string;
  description: string;
  targetText: string; // Plaintext to encrypt
  requiredSettings?: Partial<EnigmaSettings>;
}
