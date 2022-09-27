import { SupportedChainId } from "./chains";

export function getChainInfo(chainId: any): any {
  if (chainId) {
    return SupportedChainId[chainId] ?? undefined;
  }
  return undefined;
}
