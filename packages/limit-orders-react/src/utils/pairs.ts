import { Token } from "@uniswap/sdk-core";
import { getCreate2Address } from "@ethersproject/address";
import { keccak256, pack } from "@ethersproject/solidity";

const getPairAddress = (
  tokenA: Token,
  tokenB: Token,
  factory: string,
  initCodeHash: string
): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    factory,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    initCodeHash
  );
};

export const calculatePairAddressByHandler = (
  tokenA: Token,
  tokenB: Token,
  factory: string,
  initCodeHash: string
): string | undefined => {
  return getPairAddress(tokenA, tokenB, factory, initCodeHash);
};
