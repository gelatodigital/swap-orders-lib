import { Token } from "@uniswap/sdk-core";

export const USDC_MATIC = new Token(
  137,
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  6,
  "USDC",
  "USD//C"
);
export const DAI_MATIC = new Token(
  137,
  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  18,
  "DAI",
  "Dai Stablecoin"
);
export const USDT_MATIC = new Token(
  137,
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  6,
  "USDT",
  "Tether USD"
);
export const WETH_MATIC = new Token(
  137,
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  18,
  "WETH",
  "Wrapped ETH"
);
export const QUICK_MATIC = new Token(
  137,
  "0x831753dd7087cac61ab5644b308642cc1c33dc13",
  18,
  "QUICK",
  "Quickswap"
);
export const WBTC_MATIC = new Token(
  137,
  "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  8,
  "WBTC",
  "Wrapped BTC"
);
export const WMATIC_MATIC = new Token(
  137,
  "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  18,
  "WMATIC",
  "Wrapped MATIC"
);
export const MATIC_BASES = [
  USDC_MATIC,
  DAI_MATIC,
  USDT_MATIC,
  WETH_MATIC,
  QUICK_MATIC,
  WBTC_MATIC,
  WMATIC_MATIC,
];
