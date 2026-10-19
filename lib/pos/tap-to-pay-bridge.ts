export type TapToPayCollectInput = {
  clientSecret: string;
  connectionToken: string;
  locationId: string;
  simulated?: boolean;
};

export type VerveaceTapToPay = {
  available: true;
  collect(input: TapToPayCollectInput): Promise<void>;
  cancel(): Promise<void>;
  warmup?(input: {
    connectionToken: string;
    locationId: string;
    simulated?: boolean;
  }): Promise<void>;
};

declare global {
  interface Window {
    VerveaceTapToPay?: VerveaceTapToPay;
  }
}

export function getTapToPayBridge(): VerveaceTapToPay | null {
  if (typeof window === "undefined") return null;
  return window.VerveaceTapToPay?.available ? window.VerveaceTapToPay : null;
}
