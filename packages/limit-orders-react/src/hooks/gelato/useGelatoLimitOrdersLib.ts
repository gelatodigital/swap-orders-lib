import { useMemo } from "react";
import { ChainId, GelatoLimitOrders } from "@gelatonetwork/limit-orders-lib";
import { useWeb3 } from "../../web3";
import { useFrontrunProtected } from "../../state/gapplication/hooks";

export default function useGelatoLimitOrdersLib():
  | GelatoLimitOrders
  | undefined {
  const { chainId, library, handler, subgraphUrl } = useWeb3();
  const frontrunProtected = useFrontrunProtected();

  return useMemo(() => {
    try {
      return chainId && library
        ? new GelatoLimitOrders(
            chainId as ChainId,
            library?.getSigner(),
            frontrunProtected ? undefined : handler,
            frontrunProtected,
            subgraphUrl
          )
        : undefined;
    } catch (error: any) {
      console.error(
        `Could not instantiate GelatoLimitOrders: ${error.message}`
      );
      return undefined;
    }
  }, [chainId, library, handler, frontrunProtected, subgraphUrl]);
}
