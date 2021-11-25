import { nanoid } from "@reduxjs/toolkit";
import { TokenList } from "@uniswap/token-lists";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Web3Provider } from "@ethersproject/providers";
import { AppDispatch } from "../state";
import { fetchTokenList } from "../state/glists/actions";
import getTokenList from "../utils/getTokenList";
import resolveENSContentHash from "../utils/resolveENSContentHash";

export function useFetchListCallback(): (
  library: Web3Provider,
  listUrl: string,
  sendDispatch?: boolean
) => Promise<TokenList> {
  const dispatch = useDispatch<AppDispatch>();

  const ensResolver = useCallback(
    async (library: Web3Provider, ensName: string) => {
      return resolveENSContentHash(ensName, library);
    },
    []
  );

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (library: Web3Provider, listUrl: string, sendDispatch = true) => {
      const requestId = nanoid();
      sendDispatch &&
        dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
      return getTokenList(library, listUrl, ensResolver)
        .then((tokenList) => {
          sendDispatch &&
            dispatch(
              fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId })
            );
          return tokenList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          sendDispatch &&
            dispatch(
              fetchTokenList.rejected({
                url: listUrl,
                requestId,
                errorMessage: error.message,
              })
            );
          throw error;
        });
    },
    [dispatch, ensResolver]
  );
}
