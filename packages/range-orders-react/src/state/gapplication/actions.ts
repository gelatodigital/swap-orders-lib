import { createAction } from "@reduxjs/toolkit";

export const updateBlockNumber = createAction<{
  chainId: number;
  blockNumber: number;
}>("rapplication/updateBlockNumber");

export const updateFrontrunProtected = createAction<boolean>(
  "rapplication/frontrunProtected"
);
