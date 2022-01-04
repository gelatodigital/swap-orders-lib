import { createReducer } from "@reduxjs/toolkit";
import { updateBlockNumber, updateFrontrunProtected } from "./actions";

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number };
  readonly frontrunProtected: boolean;
}

const initialState: ApplicationState = {
  blockNumber: {},
  frontrunProtected: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload;
      if (typeof state.blockNumber[chainId] !== "number") {
        state.blockNumber[chainId] = blockNumber;
      } else {
        state.blockNumber[chainId] = Math.max(
          blockNumber,
          state.blockNumber[chainId]
        );
      }
    })
    .addCase(updateFrontrunProtected, (state, action) => {
      const frontrunProtected = action.payload;
      state.frontrunProtected = frontrunProtected;
    })
);
