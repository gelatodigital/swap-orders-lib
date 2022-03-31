import { ETH_ADDRESS } from "../constants";

export const isRangeOrderSupportedChain = (chainId: number): boolean => {
  switch (chainId) {
    case 137:
      return true;
    default:
      return false;
  }
};

export const isPolygonChainId = (chainId: number): boolean => {
  if (chainId === 137) {
    return true;
  }
  return false;
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

export const isNetworkGasToken = (token: string): boolean => {
  if (token.toLowerCase() === ETH_ADDRESS.toLowerCase()) {
    return true;
  } else {
    return false;
  }
};
