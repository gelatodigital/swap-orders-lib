import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { Contract } from "@ethersproject/contracts";
import { useMemo } from "react";
import { useSingleCallResult } from "../state/gmulticall/hooks";
import { useTokenContract } from "./useContract";
import { useWeb3 } from "../web3";
import { isEthereumChain } from "@gelatonetwork/limit-orders-lib/dist/utils";

export function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string
): CurrencyAmount<Token> | undefined {
  const { chainId } = useWeb3();
  const contract = useTokenContract(token?.address, false);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);
  const allowance = useSingleCallResult(
    (contract as unknown) as Contract,
    "allowance",
    inputs,
    {
      blocksPerFetch: isEthereumChain(chainId ?? 1) ? 1 : 5,
    }
  ).result;

  return useMemo(
    () =>
      token && allowance
        ? CurrencyAmount.fromRawAmount(token, allowance.toString())
        : undefined,
    [token, allowance]
  );
}
