import ETHEREUM_LOGO_URL from '../assets/images/ethereum-logo.png'

export type NetworkInfo = {
  id: SupportedNetwork
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
  blurb?: string
}


export enum SupportedNetwork { ETHEREUM, GOERLI }

export const EthereumNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.ETHEREUM,
  name: 'Ethereum',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
}

export const GoerliNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.GOERLI,
  name: 'Goerli',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
}