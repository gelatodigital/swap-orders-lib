import { Contract } from '@ethersproject/contracts'
import { WETH9 } from '@uniswap/sdk-core'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'

import ARGENT_WALLET_DETECTOR_ABI from '../abis/argent-wallet-detector.json'
import ENS_PUBLIC_RESOLVER_ABI from '../abis/ens-public-resolver.json'
import ENS_ABI from '../abis/ens-registrar.json'
import ERC20_ABI from '../abis/erc20.json'
import ERC20_BYTES32_ABI from '../abis/erc20_bytes32.json'
import MULTICALL_ABI from '../abis/multicall2.json'
import WETH_ABI from '../abis/weth.json'
import EIP_2612 from '../abis/eip_2612.json'
import IGUniPoolABI from '../abis/guni-pool.json'
import IGUniFactoryABI from '../abis/guni-factory.json'
import IUniswapV3PoolABI from '../abis/uniswap-v3-pool.json'
import IGUniResolverABI from '../abis/guni-resolver.json'
import IGUniRouterABI from '../abis/guni-router.json'
import IQuoterV2ABI from '../abis/quoter-v2.json'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import {
  ARGENT_WALLET_DETECTOR_ADDRESS,
  MULTICALL2_ADDRESSES,
  V2_ROUTER_ADDRESS,
  ENS_REGISTRAR_ADDRESSES,
  GUNI_FACTORY_ADDRESSES,
  GUNI_RESOLVER_ADDRESSES,
  GUNI_ROUTER_ADDRESSES,
  V3_QUOTER_ADDRESSES,
} from '../constants/addresses'
import { useMemo } from 'react'
import { getContract } from '../utils'
import {
  ArgentWalletDetector,
  EnsPublicResolver,
  EnsRegistrar,
  Erc20,
  GuniFactory,
  Multicall2,
  Weth,
} from '../abis/types'
import { useActiveWeb3React } from './web3'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const { chainId } = useActiveWeb3React()
  return useContract<Weth>(chainId ? WETH9[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract() {
  return useContract<ArgentWalletDetector>(ARGENT_WALLET_DETECTOR_ADDRESS, ARGENT_WALLET_DETECTOR_ABI, false)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  return useContract<EnsRegistrar>(ENS_REGISTRAR_ADDRESSES, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
  return useContract<EnsPublicResolver>(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useUniswapV3PoolContract(poolAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(poolAddress, IUniswapV3PoolABI, withSignerIfPossible)
}

export function useGUniPoolContract(poolAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(poolAddress, IGUniPoolABI, withSignerIfPossible)
}

export function useV2RouterContract(): Contract | null {
  return useContract(V2_ROUTER_ADDRESS, IUniswapV2Router02ABI, true)
}

export function useGUniFactoryContract() {
  return useContract<GuniFactory>(GUNI_FACTORY_ADDRESSES, IGUniFactoryABI, true)
}

export function useGUniResolverContract(): Contract | null {
  return useContract(GUNI_RESOLVER_ADDRESSES, IGUniResolverABI, true)
}

export function useGUniRouterContract(): Contract | null {
  return useContract(GUNI_ROUTER_ADDRESSES, IGUniRouterABI, true)
}

export function useV3Quoter(): Contract | null {
  return useContract(V3_QUOTER_ADDRESSES, QuoterABI, true)
}

export function useMulticall2Contract() {
  return useContract<Multicall2>(MULTICALL2_ADDRESSES, MULTICALL_ABI, false) as Multicall2
}

export function useUniswapV3Quoter(): Contract | null {
  return useContract(V3_QUOTER_ADDRESSES, IQuoterV2ABI, true)
}
