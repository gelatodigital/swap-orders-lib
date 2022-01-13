export const isRangeOrderSupportedChain = (chainId: number): boolean => {
  switch (chainId) {
    case 137:
      return true;
    default:
      return false;
  }
};
