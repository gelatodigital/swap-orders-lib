import { Token } from "@uniswap/sdk-core";

export const WCRO_CRONOS = new Token(
  25,
  "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
  18,
  "WCRO",
  "Wrapped CRO"
);

export const USDC_CRONOS = new Token(
  25,
  "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
  6,
  "USDC",
  "USD Coin"
);

export const WETH_CRONOS = new Token(
  25,
  "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
  18,
  "WETH",
  "Wrapped Ether"
);

export const VVS_CRONOS = new Token(
  25,
  "0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03",
  18,
  "VVS",
  "VVSToken"
);

export const USDT_CRONOS = new Token(
  25,
  "0x66e428c3f67a68878562e79a0234c1f83c208770",
  6,
  "USDT",
  "Tether USD"
);


export const CRONOS_BASES = [WCRO_CRONOS,
  USDC_CRONOS,
  WETH_CRONOS,
  VVS_CRONOS,
  USDT_CRONOS ];
