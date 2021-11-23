import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import getLibrary from '../utils/getLibrary';
import { NetworkConnector } from './NetworkConnector';

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY
const DEFAULT_NETWORK_ID = Number(process.env.REACT_APP_DEFAULT_NETWORK_ID || 1)

if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

const NETWORK_URLS: {
  [chainId: number]: string
} = {
  [1]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  // [4]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [3]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [5]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  // [42]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
  [56]: 'https://bsc-dataseed.binance.org',
  [137]: 'https://rpc-mainnet.maticvigil.com',
  [43114]: 'https://api.avax.network/ext/bc/C/rpc'
}

const SUPPORTED_CHAIN_IDS = [1, 3, 5, 56, 137, 43114]

export const network = new NetworkConnector({
  urls: NETWORK_URLS,
  defaultChainId: DEFAULT_NETWORK_ID,
  pollingInterval: 5000
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(network.provider))
}

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS
})