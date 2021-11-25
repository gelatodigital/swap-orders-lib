import { createAction } from "@reduxjs/toolkit";

export interface SerializedToken {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface SerializedPair {
  token0: SerializedToken;
  token1: SerializedToken;
}

export const addSerializedToken = createAction<{
  serializedToken: SerializedToken;
}>("guser/addSerializedToken");
export const removeSerializedToken = createAction<{
  chainId: number;
  address: string;
}>("guser/removeSerializedToken");
export const addSerializedPair = createAction<{
  serializedPair: SerializedPair;
}>("guser/addSerializedPair");
export const removeSerializedPair = createAction<{
  chainId: number;
  tokenAAddress: string;
  tokenBAddress: string;
}>("guser/removeSerializedPair");
