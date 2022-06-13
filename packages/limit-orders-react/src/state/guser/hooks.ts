import { Token } from "@uniswap/sdk-core";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pair } from "../../entities/pair";
import { useWeb3 } from "../../web3";
import { AppDispatch, AppState } from "../index";
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
} from "./actions";

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  );
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }));
    },
    [dispatch]
  );
}

export function useRemoveUserAddedToken(): (
  chainId: number,
  address: string
) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }));
    },
    [dispatch]
  );
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useWeb3();
  const serializedTokensMap = useSelector<
    AppState,
    AppState["guser"]["tokens"]
  >(({ guser: { tokens } }) => tokens);

  return useMemo(() => {
    if (!chainId) return [];
    return Object.values(serializedTokensMap?.[chainId] ?? {}).map(
      deserializeToken as any
    );
  }, [serializedTokensMap, chainId]);
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  };
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }));
    },
    [dispatch]
  );
}

export function useURLWarningVisible(): boolean {
  return useSelector((state: AppState) => state.guser.URLWarningVisible);
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken(
  [tokenA, tokenB]: [Token, Token],
  factory: string,
  initCodeHash: string
): Token {
  return new Token(
    tokenA.chainId,
    Pair.getAddress(tokenA, tokenB, factory, initCodeHash),
    18,
    "UNI-V2",
    "Uniswap V2"
  );
}
