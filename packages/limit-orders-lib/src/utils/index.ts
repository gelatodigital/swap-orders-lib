import { ETH_ADDRESS } from "../constants";

export * as queries from "./queries/constants";

export const isNetworkGasToken = (token: string): boolean => {
  if (token.toLowerCase() === ETH_ADDRESS.toLowerCase()) {
    return true;
  } else {
    return false;
  }
};

export const isTransactionCostDependentChain = (chainId: number): boolean => {
  switch (chainId) {
    case 1:
      return true;
    case 3:
      return true;
    case 5:
      return true;
    case 56:
      return true;
    case 250:
      return true;
    case 43114:
      return true;
    default:
      return false;
  }
};

export const isEthereumChain = (chainId: number): boolean => {
  switch (chainId) {
    case 1:
      return true;
    case 3:
      return true;
    case 5:
      return true;
    default:
      return false;
  }
};
