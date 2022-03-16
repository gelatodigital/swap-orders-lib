import { Token } from "@uniswap/sdk-core";

export const WBNB_BSC = new Token(
  56,
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  18,
  "WBNB",
  "Wrapped BNB"
);

export const BUSD_BSC = new Token(
  56,
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  18,
  "BUSD",
  "Binance-Peg BUSD"
);

export const USDC_BSC = new Token(
  56,
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  18,
  "USDC",
  "Binance-Peg USD Coin"
);

export const USDT_BSC = new Token(
  56,
  "0x55d398326f99059fF775485246999027B3197955",
  18,
  "USDT",
  "Binance-Peg BSC-USD"
);

export const BSC_BASES = [WBNB_BSC, BUSD_BSC, USDC_BSC, USDT_BSC];
