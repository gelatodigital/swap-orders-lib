import { useMemo } from "react";
import { ChainId, GelatoLimitOrders } from "@gelatonetwork/limit-orders-lib";
import { useWeb3 } from "../../web3";
import { useFrontrunProtected } from "../../state/gapplication/hooks";

export default function useGelatoLimitOrdersLib():
  | GelatoLimitOrders
  | undefined {
  const { chainId, library, router, factory, initCodeHash } = useWeb3();
  const frontrunProtected = useFrontrunProtected();

  return useMemo(() => {
    try {
      return chainId && library && router && factory && initCodeHash
        ? new GelatoLimitOrders(
            chainId as ChainId,
            library.getSigner(),
            router, factory, initCodeHash,
            frontrunProtected
          )
        : undefined;
    } catch (error: any) {
      console.error(
        `Could not instantiate GelatoLimitOrders: ${error.message}`
      );
      return undefined;
    }
  }, [chainId, library, router, factory, initCodeHash, frontrunProtected]);
}
