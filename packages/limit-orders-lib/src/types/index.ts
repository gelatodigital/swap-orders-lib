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
  | "pangolin_stoplimit";

export interface TransactionData {
  to: string;
  data: BytesLike;
  value: BigNumberish;
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

export interface StopLimitOrder extends Order {
  maxReturn: string;
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
