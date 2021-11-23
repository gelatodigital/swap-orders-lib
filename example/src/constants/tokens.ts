import { Token } from '@uniswap/sdk-core'
import { UNI_ADDRESS } from './addresses'

export const AMPL = new Token(1, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const DAI = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const WBTC = new Token(1, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')
export const FEI = new Token(1, '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 18, 'FEI', 'Fei USD')
export const TRIBE = new Token(1, '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B', 18, 'TRIBE', 'Tribe')
export const FRAX = new Token(1, '0x853d955aCEf822Db058eb8505911ED77F175b99e', 18, 'FRAX', 'Frax')
export const FXS = new Token(1, '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 18, 'FXS', 'Frax Share')
export const renBTC = new Token(1, '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', 8, 'renBTC', 'renBTC')
export const UMA = new Token(1, '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828', 18, 'UMA', 'UMA Voting Token v1')
// Mirror Protocol compat.
export const UST = new Token(1, '0xa47c8bf37f92abed4a126bda807a7b7498661acd', 18, 'UST', 'Wrapped UST')
export const MIR = new Token(1, '0x09a3ecafa817268f77be1283176b946c4ff2e608', 18, 'MIR', 'Wrapped MIR')
export const UNI: { [chainId: number]: Token } = {
  [1]: new Token(1, UNI_ADDRESS[1], 18, 'UNI', 'Uniswap'),
  [4]: new Token(4, UNI_ADDRESS[4], 18, 'UNI', 'Uniswap'),
  [3]: new Token(3, UNI_ADDRESS[3], 18, 'UNI', 'Uniswap'),
  [5]: new Token(5, UNI_ADDRESS[5], 18, 'UNI', 'Uniswap'),
  [42]: new Token(42, UNI_ADDRESS[42], 18, 'UNI', 'Uniswap'),
}

export const USDC_GOERLI = new Token(5, '0x6fb5ef893d44f4f88026430d82d4ef269543cb23', 6, 'USDC', 'USD//C')

export const USDC_MATIC = new Token(137, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6, 'USDC', 'USD//C')
export const DAI_MATIC = new Token(137, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'Dai Stablecoin')
export const USDT_MATIC = new Token(137, '0x3813e82e6f7098b9583FC0F33a962D02018B6803', 6, 'USDT', 'Tether USD')
export const WETH_MATIC = new Token(137, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 'WETH', 'Wrapped ETH')
export const QUICK_MATIC = new Token(137, '0x831753dd7087cac61ab5644b308642cc1c33dc13', 18, 'QUICK', 'Quickswap')
export const WBTC_MATIC = new Token(137, '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', 8, 'WBTC', 'Wrapped BTC')
export const WMATIC_MATIC = new Token(137, '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 18, 'WMATIC', 'Wrapped MATIC')
export const MATIC_BASES = [USDC_MATIC, DAI_MATIC, USDT_MATIC, WETH_MATIC, QUICK_MATIC, WBTC_MATIC, WMATIC_MATIC]

export const WBNB_BSC = new Token(56, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'Wrapped BNB')
export const BUSD_BSC = new Token(56, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'Binance-Peg BUSD')
export const USDC_BSC = new Token(56, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'USDC', 'Binance-Peg USD Coin')
export const USDT_BSC = new Token(56, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Binance-Peg BSC-USD')
export const BSC_BASES = [WBNB_BSC, BUSD_BSC, USDC_BSC, USDT_BSC]

export const WAVAX_AVAX = new Token(43114, "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", 18, "WAVAX", "Wrapped AVAX");
export const USDC_AVAX = new Token(43114, "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", 6, "USDC.e", "USD Coin");
export const USDT_AVAX = new Token(43114, "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", 6, "USDT.e", "Tether USD");
export const AVAX_BASES = [WAVAX_AVAX, USDC_AVAX, USDT_AVAX]

export const getBaseTokenLogoURLByTokenSymbol = (symbol: string | undefined): string | undefined => {
  switch (symbol) {
    case 'USDC':
    case "USDC.e":
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    case 'DAI':
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png'
    case 'USDT':
    case "USDT.e":
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
    case 'ETH':
    case 'WETH':
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    case 'QUICK':
      return 'https://raw.githubusercontent.com/sameepsi/quickswap-interface/master/public/favicon.jpeg'
    case 'WBTC':
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png'
    case 'WMATIC':
    case 'MATIC':
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png'
    case 'WBNB':
    case 'BNB':
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB8c77482e45F1F44dE1745F52C74426C631bDD52/logo.png'
    case 'BUSD':
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4Fabb145d64652a948d72533023f6E7A623C7C53/logo.png'
    case "WAVAX":
    case "AVAX":
      return "https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo.png";
    default:
      return undefined
  }
}
