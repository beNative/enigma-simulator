import { Mission } from "../types";

const MISSIONS: Mission[] = [
  {
    title: "Operation Neptune",
    description: "Intercepted naval signals indicate a U-boat surfacing near the channel. Decrypt coordinates immediately.",
    targetText: "UBOATXSPOTTEDXSECTORXSEVEN",
    requiredSettings: { rotors: ['I', 'III', 'II'] }
  },
  {
    title: "Desert Fox Supply",
    description: "General Rommel requests immediate fuel status update for the Afrika Korps tanks.",
    targetText: "FUELXRESERVESXCRITICAL",
    requiredSettings: { rotors: ['II', 'IV', 'V'] }
  },
  {
    title: "Weather Station Kurt",
    description: "Automated weather station in the North Atlantic is transmitting. Decode the forecast.",
    targetText: "STORMXFRONTXAPPROACHING",
    requiredSettings: { ringSettings: [5, 10, 15] }
  },
  {
    title: "Diplomatic Cable",
    description: "Urgent message from the embassy in neutral territory. Top secret clearance required.",
    targetText: "NEGOTIATIONSXFAILEDXSTOP",
    requiredSettings: { reflector: 'C' }
  },
  {
    title: "Resistance Network",
    description: "Local resistance has sabotaged the rail lines. Report damage assessment.",
    targetText: "RAILXLINEXBROKENXNORTH",
    requiredSettings: { rotors: ['V', 'I', 'III'] }
  },
  {
    title: "Midnight Watch",
    description: "Standard hourly check-in required. Maintain radio silence otherwise.",
    targetText: "ALLXQUIETXONXWESTERNXFRONT",
  }
];

const FACTS = [
  "The Enigma machine was invented by German engineer Arthur Scherbius at the end of World War I.",
  "Polish mathematicians were the first to break early Enigma codes in the 1930s.",
  "Alan Turing designed the Bombe machine at Bletchley Park to speed up the breaking of Enigma keys.",
  "The Plugboard (Steckerbrett) added billions of possibilities to the encryption, making it much harder to crack.",
  "Enigma machines used by the Navy (Kriegsmarine) had four rotors instead of the standard three.",
  "Operators had to clean the rotor contacts regularly to prevent short circuits and misfires.",
  "The codebooks containing daily settings were printed in water-soluble ink so they could be destroyed instantly."
];

export const generateDailyMission = async (): Promise<Mission> => {
  // Simulate "decoding" delay for effect
  await new Promise(resolve => setTimeout(resolve, 600));
  return MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
};

export const getHistoricalFact = async (query: string): Promise<string> => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return FACTS[Math.floor(Math.random() * FACTS.length)];
}