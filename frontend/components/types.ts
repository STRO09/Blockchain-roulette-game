// types/types.ts
export interface Player {
    number: number | null;
    bet: number;
    isActive: boolean;
    hasQuit: boolean;
    id: number;
    name: string;
    money: number;
  }