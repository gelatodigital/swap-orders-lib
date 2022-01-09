import { useMemo } from "react";
import { ChainId, GelatoRangeOrder } from "@gelatonetwork/range-orders-lib";
import { useWeb3 } from "../../web3";

export default function useGelatoRangeOrdersLib():
  | GelatoRangeOrder
  | undefined {
  const { chainId, library } = useWeb3();

  return useMemo(() => {
    try {
      return chainId && library
        ? new GelatoRangeOrder(
            chainId as ChainId,
            library?.getSigner(),
          )
        : undefined;
    } catch (error: any) {
      console.error(
        `Could not instantiate GelatoLimitOrders: ${error.message}`
      );
      return undefined;
    }
  }, [chainId, library]);
}
