import {
  EjectLP,
  EjectLP__factory,
  ERC20,
  ERC20__factory,
  RangeOrder,
  RangeOrder__factory,
} from "./types";
import {
  GELATO_EJECT_LP_ADDRESS,
  GELATO_RANGE_ORDERS_ADDRESS,
} from "../constants";
import { abi as IUniswapPoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
import { ChainId } from "../types";

export const getEjectLP = (
  chainId: number,
  signerOrProvider: Signer | Provider
): EjectLP => {
  return EjectLP__factory.connect(
    GELATO_EJECT_LP_ADDRESS[chainId],
    signerOrProvider
  );
};

export const getRangeOrder = (
  chainId: ChainId,
  signerOrProvider: Signer | Provider | undefined
): RangeOrder => {
  return signerOrProvider
    ? RangeOrder__factory.connect(
        GELATO_RANGE_ORDERS_ADDRESS[chainId],
        signerOrProvider
      )
    : (new Contract(
        GELATO_RANGE_ORDERS_ADDRESS[chainId],
        RangeOrder__factory.createInterface()
      ) as RangeOrder);
};

export const getUniswapV3Pool = (
  pool: string,
  signerOrProvider: Signer | Provider | undefined
): Contract => {
  return new Contract(pool, IUniswapPoolABI, signerOrProvider);
};

export const getECR20 = (
  erc20: string,
  signerOrProvider: Signer | Provider | undefined
): ERC20 => {
  return signerOrProvider
    ? ERC20__factory.connect(erc20, signerOrProvider)
    : (new Contract(erc20, ERC20__factory.createInterface()) as ERC20);
};
