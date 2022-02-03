import { StopLimitOrder } from "@gelatonetwork/limit-orders-lib";
import { createAction } from "@reduxjs/toolkit";

export interface SerializableTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: number;
}

export type TransactionType = "submission" | "cancellation" | "approval";

export const addStopLimitTransaction = createAction<{
  chainId: number;
  hash: string;
  from: string;
  type: TransactionType;
  order?: StopLimitOrder;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
}>("gstoplimittransactions/addStopLimitTransaction");
export const clearAllTransactions = createAction<{ chainId: number }>(
  "gstoplimittransactions/clearAllTransactions"
);
export const finalizeTransaction = createAction<{
  chainId: number;
  hash: string;
  receipt: SerializableTransactionReceipt;
}>("gstoplimittransactions/finalizeTransaction");
export const checkedTransaction = createAction<{
  chainId: number;
  hash: string;
  blockNumber: number;
}>("gstoplimittransactions/checkedTransaction");
