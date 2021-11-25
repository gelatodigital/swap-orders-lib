import { useMemo } from "react";
import {
  GelatoStopLimitOrders,
  ChainId,
  Handler,
} from "@gelatonetwork/limit-orders-lib";
import { useWeb3 } from "../../web3";

export default function useGelatoStopLimitOrdersLib():
  | GelatoStopLimitOrders
  | undefined {
  const { chainId, library } = useWeb3();
  return useMemo(() => {
    try {
      return chainId && library
        ? new GelatoStopLimitOrders(
            chainId as ChainId,
            library?.getSigner(),
            "quickswap_stoploss" as Handler
          )
        : undefined;
    } catch (error) {
      console.error(
        `Could not instantiate GelatoStopLimitOrders: ${
          (error as Error).message
        }`
      );
      return undefined;
    }
  }, [chainId, library]);
}
