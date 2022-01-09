import { createAction } from "@reduxjs/toolkit";

export const updateBlockNumber = createAction<{
  chainId: number;
  blockNumber: number;
}>("gapplication/updateBlockNumber");

export const updateFrontrunProtected = createAction<boolean>(
  "gapplication/frontrunProtected"
);
