declare module "*.png" {
  const value: any;
  export = value;
}

declare module "*.svg" {
  const value: any;
  export = value;
}

declare module "fortmatic";

interface Window {
  ethereum?: {
    isMetaMask?: true;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    autoRefreshOnNetworkChange?: boolean;
  };
  web3?: Record<string, unknown>;
}

declare module "content-hash" {
  declare function decode(x: string): string;
  declare function getCodec(x: string): string;
}

declare module "multihashes" {
  declare function decode(
    buff: Uint8Array
  ): { code: number; name: string; length: number; digest: Uint8Array };
  declare function toB58String(hash: Uint8Array): string;
}
