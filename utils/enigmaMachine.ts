import { ROTORS, REFLECTORS, ALPHABET } from '../constants';
import { EnigmaSettings } from '../types';

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

  // Step the rotors before encryption happens
  public step(): void {
    const [lName, mName, rName] = this.settings.rotors;
    const leftRotor = ROTORS[lName];
    const midRotor = ROTORS[mName];
    const rightRotor = ROTORS[rName];

    const leftPos = toIndex(this.settings.positions[0]);
    const midPos = toIndex(this.settings.positions[1]);
    const rightPos = toIndex(this.settings.positions[2]);

    // Determine notches (Turnover position)
    // If rotor is at notch, it steps the NEXT rotor on the NEXT keypress
    const rightNotch = toIndex(rightRotor.notch);
    const midNotch = toIndex(midRotor.notch);

    let nextLeft = leftPos;
    let nextMid = midPos;
    let nextRight = (rightPos + 1) % 26;

    // Double stepping mechanism:
    // 1. If the middle rotor is at its notch, it will step the left rotor AND itself (again).
    // 2. If the right rotor is at its notch, it will step the middle rotor.
    
    const rightAtNotch = rightPos === rightNotch;
    const midAtNotch = midPos === midNotch;

    if (midAtNotch) {
      nextLeft = (leftPos + 1) % 26;
      nextMid = (midPos + 1) % 26;
    } else if (rightAtNotch) {
      nextMid = (midPos + 1) % 26;
    }

    this.settings.positions = [toChar(nextLeft), toChar(nextMid), toChar(nextRight)];
  }

  public encryptChar(char: string): string {
    // 1. Plugboard
    let signal = this.passPlugboard(toIndex(char));

    // 2. Rotors (Right -> Left)
    signal = this.passRotorForward(2, signal);
    signal = this.passRotorForward(1, signal);
    signal = this.passRotorForward(0, signal);

    // 3. Reflector
    signal = this.passReflector(signal);

    // 4. Rotors (Left -> Right)
    signal = this.passRotorReverse(0, signal);
    signal = this.passRotorReverse(1, signal);
    signal = this.passRotorReverse(2, signal);

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
    const rotor = ROTORS[rotorName];
    const pos = toIndex(this.settings.positions[rotorIdx]);
    const ring = this.settings.ringSettings[rotorIdx];

    // Input enters at 'signal', shifted by offset (pos - ring)
    const offset = pos - ring;
    const entryIndex = (signal + offset + 26) % 26;
    const entryChar = toChar(entryIndex);
    
    // Map through wiring
    // Wiring is input 'A' -> wiring[0]
    const wiringOutChar = rotor.wiring[toIndex(entryChar)];
    const wiringOutIndex = toIndex(wiringOutChar);

    // Output exits, shift back by offset
    const exitIndex = (wiringOutIndex - offset + 26) % 26;
    return exitIndex;
  }

  private passRotorReverse(rotorIdx: number, signal: number): number {
    const rotorName = this.settings.rotors[rotorIdx];
    const rotor = ROTORS[rotorName];
    const pos = toIndex(this.settings.positions[rotorIdx]);
    const ring = this.settings.ringSettings[rotorIdx];

    const offset = pos - ring;
    const entryIndex = (signal + offset + 26) % 26;
    const entryChar = toChar(entryIndex);

    // Reverse mapping: Find which input connects to this output in wiring
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
