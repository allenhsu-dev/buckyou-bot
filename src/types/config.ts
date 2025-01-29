export interface WinnerStrategy {
  whitelist: string[];
  threshold: number;
}

export interface Strategy {
  preferredToken: "SUI" | "BUCK";
  countdownThreshold: number;
  winnerStrategy: WinnerStrategy;
  testMode?: boolean;
}

export interface Config {
  suiPrivKey: string;
  rpcUrl: string;
  strategy: Strategy;
  referrer: string;
}
