import { Contract } from "@ethersproject/contracts";
import { WETH9 } from "@uniswap/sdk-core";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as QuoterABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";

import ARGENT_WALLET_DETECTOR_ABI from "../abis/argent-wallet-detector.json";
import ENS_PUBLIC_RESOLVER_ABI from "../abis/ens-public-resolver.json";
import ENS_ABI from "../abis/ens-registrar.json";
import ERC20_ABI from "../abis/erc20.json";
import ERC20_BYTES32_ABI from "../abis/erc20_bytes32.json";
import MULTICALL_ABI from "../abis/multicall2.json";

import WETH_ABI from "../abis/weth.json";
import EIP_2612 from "../abis/eip_2612.json";

import {
  ARGENT_WALLET_DETECTOR_ADDRESS,
  MULTICALL2_ADDRESSES,
  ENS_REGISTRAR_ADDRESSES,
  QUOTER_ADDRESSES,
} from "../constants/addresses";
import { useMemo } from "react";
import { getContract } from "../utils";
import {
  ArgentWalletDetector,
  EnsPublicResolver,
  EnsRegistrar,
  Erc20,
  Multicall2,
  Weth,
} from "../abis/types";
import { useWeb3 } from "../web3";

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { chainId, library, account } = useWeb3();
  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null;
    let address: string | undefined;
    if (typeof addressOrAddressMap === "string") address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];
    if (!address) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [
    addressOrAddressMap,
    ABI,
    library,
    chainId,
    withSignerIfPossible,
    account,
  ]) as T;
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): Erc20 | null {
  return (useContract(
    tokenAddress,
    ERC20_ABI,
    withSignerIfPossible
  ) as unknown) as Erc20;
}

export function useWETHContract(withSignerIfPossible?: boolean): Weth | null {
  const { chainId } = useWeb3();
  return (useContract(
    chainId ? WETH9[chainId]?.address : undefined,
    WETH_ABI,
    withSignerIfPossible
  ) as unknown) as Weth;
}

export function useArgentWalletDetectorContract(): ArgentWalletDetector | null {
  return (useContract(
    ARGENT_WALLET_DETECTOR_ADDRESS,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  ) as unknown) as ArgentWalletDetector;
}

export function useENSRegistrarContract(
  withSignerIfPossible?: boolean
): EnsRegistrar | null {
  return (useContract(
    ENS_REGISTRAR_ADDRESSES,
    ENS_ABI,
    withSignerIfPossible
  ) as unknown) as EnsRegistrar;
}

export function useENSResolverContract(
  address: string | undefined,
  withSignerIfPossible?: boolean
): EnsPublicResolver | null {
  return (useContract(
    address,
    ENS_PUBLIC_RESOLVER_ABI,
    withSignerIfPossible
  ) as unknown) as EnsPublicResolver;
}

export function useBytes32TokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false);
}

export function useMulticall2Contract(): Multicall2 {
  return (useContract(
    MULTICALL2_ADDRESSES,
    MULTICALL_ABI,
    false
  ) as unknown) as Multicall2;
}

export function usePoolContract(poolAddress?: string): Contract | null {
  return useContract(poolAddress, IUniswapV3PoolABI, true);
}

export function useV3Quoter(): Contract | null {
  return useContract(QUOTER_ADDRESSES, QuoterABI, true);
}
