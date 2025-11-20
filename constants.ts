import { RotorDef, ReflectorDef } from './types';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const ROTORS: Record<string, RotorDef> = {
  I: { name: 'I', wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II: { name: 'II', wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { name: 'III', wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
  IV: { name: 'IV', wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
  V: { name: 'V', wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' },
};

export const REFLECTORS: Record<string, ReflectorDef> = {
  B: { name: 'B', wiring: 'YRUHQSLDPXNGOKMIEBFZCWVJAT' },
  C: { name: 'C', wiring: 'FVPJIAOYEDRZXWGCTKUQSBNMHL' },
};
