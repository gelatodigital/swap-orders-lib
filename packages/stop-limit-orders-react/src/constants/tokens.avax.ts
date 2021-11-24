import { Token } from "@uniswap/sdk-core";

export const WAVAX_AVAX = new Token(
  43114,
  "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  18,
  "WAVAX",
  "Wrapped AVAX"
);

export const USDC_AVAX = new Token(
  43114,
  "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
  6,
  "USDC.e",
  "USD Coin"
);

export const USDT_AVAX = new Token(
  43114,
  "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
  6,
  "USDT.e",
  "Tether USD"
);

export const AVAX_BASES = [WAVAX_AVAX, USDC_AVAX, USDT_AVAX];
