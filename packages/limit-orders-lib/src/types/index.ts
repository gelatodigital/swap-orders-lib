import { BytesLike } from "@ethersproject/bytes";
import { BigNumberish } from "@ethersproject/bignumber";

// mainnet | ropsten | goerli | bsc | matic | fantom | avalanche
export type ChainId = 1 | 3 | 5 | 56 | 137 | 250 | 43114;

export type Handler =
  | "spookyswap"
  | "spookyswap_stoplimit"
  | "uniswap"
  | "uniswap_stoplimit"
  | "quickswap"
  | "quickswap_stoplimit"
  | "spiritswap"
  | "spiritswap_stoplimit"
  | "bombswap"
  | "polydex"
  | "cafeswap"
  | "pancakeswap"
  | "pancakeswap_stoplimit"
  | "traderjoe"
  | "traderjoe_stoplimit"
  | "defyswap"
  | "pangolin"
  | "pangolin_stoplimit"
  | "tombswap";

export interface TransactionData {
  to: string;
  data: BytesLike;
  value: BigNumberish;
}

export interface TransactionDataWithSalt {
  payload: TransactionData;
  order: PartialOrderV2;
}

export interface TransactionDataWithSecret {
  payload: TransactionData;
  secret: string;
  witness: string;
  order: PartialOrder | PartialStopLimitOrder;
}

export interface WitnessAndSecret {
  witness: string;
  secret: string;
}

export interface Order {
  id: string;
  owner: string;
  inputToken: string;
  outputToken: string;
  minReturn: string;
  maxReturn?: string;
  adjustedMinReturn: string;
  module: string;
  witness: string;
  secret: string;
  inputAmount: string;
  vault: string;
  bought: string | null;
  auxData: string | null;
  status: string;
  createdTxHash: string;
  executedTxHash: string | null;
  cancelledTxHash: string | null;
  blockNumber: string;
  createdAt: string;
  updatedAt: string;
  updatedAtBlock: string;
  updatedAtBlockHash: string;
  data: string;
  inputData: string;
  handler: string | null;
  isExpired: boolean;
}

export interface OrderV2 {
  id: string;
  owner: string;
  inputToken: string;
  outputToken: string;
  minReturn: string;
  factory: string;
  router: string;
  salt: string;
  initCodeHash: string;
  maxReturn?: string;
  adjustedMinReturn: string;
  inputAmount: string;
  bought: string | null;
  auxData: string | null;
  status: string;
  createdTxHash: string;
  executedTxHash: string | null;
  cancelledTxHash: string | null;
  blockNumber: string;
  createdAt: string;
  updatedAt: string;
  updatedAtBlock: string;
  updatedAtBlockHash: string;
  inputData: string;
  isExpired: boolean;
}

export interface StopLimitOrder extends Order {
  maxReturn: string;
}

export interface PartialOrderV2 {
  id: string;
  owner: string;
  inputToken: string;
  outputToken: string;
  minReturn: string;
  adjustedMinReturn: string;
  inputAmount: string;
  inputData: string;
  factory: string;
  router: string;
  salt: string;
  initCodeHash: string;
}

export interface PartialOrder {
  id: string;
  owner: string;
  inputToken: string;
  outputToken: string;
  minReturn: string;
  adjustedMinReturn: string;
  module: string;
  witness: string;
  secret: string;
  inputAmount: string;
  data: string;
  inputData: string;
  handler: string | null;
}

export interface PartialStopLimitOrder extends PartialOrder {
  maxReturn: string;
}
