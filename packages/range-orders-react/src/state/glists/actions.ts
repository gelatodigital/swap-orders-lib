import { ActionCreatorWithPayload, createAction } from "@reduxjs/toolkit";
import { TokenList, Version } from "@uniswap/token-lists";

export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{
    url: string;
    tokenList: TokenList;
    requestId: string;
  }>;
  rejected: ActionCreatorWithPayload<{
    url: string;
    errorMessage: string;
    requestId: string;
  }>;
}> = {
  pending: createAction("rlists/fetchTokenList/pending"),
  fulfilled: createAction("rlists/fetchTokenList/fulfilled"),
  rejected: createAction("rlists/fetchTokenList/rejected"),
};
// add and remove from list options
export const addList = createAction<string>("rlists/addList");
export const removeList = createAction<string>("rlists/removeList");

// select which lists to search across from loaded lists
export const enableList = createAction<string>("rlists/enableList");
export const disableList = createAction<string>("rlists/disableList");

// versioning
export const acceptListUpdate = createAction<string>("rlists/acceptListUpdate");
export const rejectVersionUpdate = createAction<Version>(
  "rlists/rejectVersionUpdate"
);
