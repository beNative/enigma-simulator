
import { ROTORS, GREEK_ROTORS, REFLECTORS, ALPHABET } from '../constants';
import { EnigmaSettings, RotorDef } from '../types';

// Helper: char to 0-25 index
const toIndex = (char: string): number => char.charCodeAt(0) - 65;
// Helper: 0-25 index to char
const toChar = (index: number): string => String.fromCharCode(((index % 26) + 26) % 26 + 65);

export class EnigmaMachine {
  private settings: EnigmaSettings;

  constructor(settings: EnigmaSettings) {
    this.settings = JSON.parse(JSON.stringify(settings));
  }

  public getSettings(): EnigmaSettings {
    return { ...this.settings };
  }

  private getRotorDef(name: string): RotorDef {
    if (ROTORS[name]) return ROTORS[name];
    if (GREEK_ROTORS[name]) return GREEK_ROTORS[name];
    throw new Error(`Unknown rotor: ${name}`);
  }

  // Step the rotors before encryption happens
  public step(): void {
    const rotorCount = this.settings.rotors.length;
    
    // Identifying indices based on count
    // 3 Rotors: [Left(0), Mid(1), Right(2)]
    // 4 Rotors: [Greek(0), Left(1), Mid(2), Right(3)]
    
    const rightIdx = rotorCount - 1;
    const midIdx = rotorCount - 2;
    const leftIdx = rotorCount - 3;
    
    const rightRotor = this.getRotorDef(this.settings.rotors[rightIdx]);
    const midRotor = this.getRotorDef(this.settings.rotors[midIdx]);

    const rightPos = toIndex(this.settings.positions[rightIdx]);
    const midPos = toIndex(this.settings.positions[midIdx]);
    const leftPos = toIndex(this.settings.positions[leftIdx]);

    // Determine notches (Turnover position)
    // NOTE: Many rotors have single notch, but VI-VIII have two. Logic simplifies to "is at notch" check.
    const isAtNotch = (rotor: RotorDef, pos: number) => {
        const char = toChar(pos);
        return rotor.notch.includes(char);
    }

    let nextRight = (rightPos + 1) % 26;
    let nextMid = midPos;
    let nextLeft = leftPos;
    
    const rightNotch = isAtNotch(rightRotor, rightPos);
    const midNotch = isAtNotch(midRotor, midPos);

    // Double stepping logic
    if (midNotch) {
      nextLeft = (leftPos + 1) % 26;
      nextMid = (midPos + 1) % 26;
    } else if (rightNotch) {
      nextMid = (midPos + 1) % 26;
    }

    const newPositions = [...this.settings.positions];
    newPositions[rightIdx] = toChar(nextRight);
    newPositions[midIdx] = toChar(nextMid);
    newPositions[leftIdx] = toChar(nextLeft);
    
    // Greek rotor (index 0 in 4-rotor setup) never steps automatically
    
    this.settings.positions = newPositions;
  }

  public encryptChar(char: string): string {
    // 1. Plugboard
    let signal = this.passPlugboard(toIndex(char));

    // 2. Rotors (Right -> Left)
    // Traverse from last index down to 0
    for (let i = this.settings.rotors.length - 1; i >= 0; i--) {
        signal = this.passRotorForward(i, signal);
    }

    // 3. Reflector
    signal = this.passReflector(signal);

    // 4. Rotors (Left -> Right)
    // Traverse from 0 up to last index
    for (let i = 0; i < this.settings.rotors.length; i++) {
        signal = this.passRotorReverse(i, signal);
    }

    // 5. Plugboard
    signal = this.passPlugboard(signal);

    return toChar(signal);
  }

  private passPlugboard(index: number): number {
    const char = toChar(index);
    const swap = this.settings.plugboard[char];
    return swap ? toIndex(swap) : index;
  }

  private passRotorForward(rotorIdx: number, signal: number): number {
    const rotorName = this.settings.rotors[rotorIdx];
    const rotor = this.getRotorDef(rotorName);
    const pos = toIndex(this.settings.positions[rotorIdx]);
    const ring = this.settings.ringSettings[rotorIdx];

    // Input enters at 'signal', shifted by offset (pos - ring)
    const offset = pos - ring;
    const entryIndex = (signal + offset + 26) % 26;
    const entryChar = toChar(entryIndex);
    
    // Map through wiring
    const wiringOutChar = rotor.wiring[toIndex(entryChar)];
    const wiringOutIndex = toIndex(wiringOutChar);

    // Output exits, shift back by offset
    const exitIndex = (wiringOutIndex - offset + 26) % 26;
    return exitIndex;
  }

  private passRotorReverse(rotorIdx: number, signal: number): number {
    const rotorName = this.settings.rotors[rotorIdx];
    const rotor = this.getRotorDef(rotorName);
    const pos = toIndex(this.settings.positions[rotorIdx]);
    const ring = this.settings.ringSettings[rotorIdx];

    const offset = pos - ring;
    const entryIndex = (signal + offset + 26) % 26;
    const entryChar = toChar(entryIndex);

    // Reverse mapping
    const wiringIndex = rotor.wiring.indexOf(entryChar);
    
    const exitIndex = (wiringIndex - offset + 26) % 26;
    return exitIndex;
  }

  private passReflector(signal: number): number {
    const reflector = REFLECTORS[this.settings.reflector];
    const char = toChar(signal);
    const mapped = reflector.wiring[toIndex(char)];
    return toIndex(mapped);
  }
}
