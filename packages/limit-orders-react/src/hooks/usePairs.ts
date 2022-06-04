import { useMemo } from "react";
import { abi as IUniswapV2PairABI } from "../abis/IUniswapV2Pair.json";
import { Interface } from "@ethersproject/abi";
import { useMultipleContractSingleData } from "../state/gmulticall/hooks";
import { Currency, CurrencyAmount } from "@uniswap/sdk-core";
import { Pair } from "../entities/pair";
import { useWeb3 } from "../web3";
import { isEthereumChain } from "@gelatonetwork/limit-orders-lib/dist/utils";

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI);

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs(
  currencies: [Currency | undefined, Currency | undefined][]
): [PairState | undefined, Pair | null][] {
  const { chainId, factory, initCodeHash } = useWeb3();
  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        currencyA?.wrapped,
        currencyB?.wrapped,
      ]),
    [currencies]
  );

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB)
          ? Pair.getAddress(tokenA, tokenB, factory ?? "", initCodeHash ?? "")
          : undefined;
      }),
    [tokens, factory, initCodeHash]
  );

  const results = useMultipleContractSingleData(
    pairAddresses,
    PAIR_INTERFACE,
    "getReserves",
    undefined,
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      blocksPerFetch: isEthereumChain(chainId!) ? 5 : 60,
    }
  );

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result;
      const tokenA = tokens[i][0];
      const tokenB = tokens[i][1];

      if (loading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB))
        return [PairState.INVALID, null];
      if (!reserves) return [PairState.NOT_EXISTS, null];
      const { reserve0, reserve1 } = reserves;
      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA];
      return [
        PairState.EXISTS,
        new Pair(
          CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
          CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
          factory ?? "",
          initCodeHash ?? ""
        ),
      ];
    });
  }, [results, tokens, factory, initCodeHash]);
}

export function usePair(
  tokenA?: Currency,
  tokenB?: Currency
): [PairState | undefined, Pair | null] {
  const inputs: [[Currency | undefined, Currency | undefined]] = useMemo(
    () => [[tokenA, tokenB]],
    [tokenA, tokenB]
  );
  return usePairs(inputs)[0];
}
