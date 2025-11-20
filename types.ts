export interface RotorDef {
  name: string;
  wiring: string;
  notch: string; // Turnover notch position (letter)
}

export interface ReflectorDef {
  name: string;
  wiring: string;
}

export interface EnigmaSettings {
  rotors: [string, string, string]; // Left, Middle, Right (e.g., 'I', 'II', 'III')
  positions: [string, string, string]; // Current visible letter
  ringSettings: [number, number, number]; // 0-25 (A=0)
  reflector: string; // 'B' or 'C'
  plugboard: Record<string, string>; // Map 'A' -> 'Z'
}

export interface Mission {
  title: string;
  description: string;
  targetText: string; // Plaintext to encrypt
  requiredSettings?: Partial<EnigmaSettings>;
}
