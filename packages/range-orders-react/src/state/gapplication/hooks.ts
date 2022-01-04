import { useSelector } from "react-redux";
import { AppState } from "../index";

export function useBlockNumber(chainId?: number): number | undefined {
  return useSelector(
    (state: AppState) => state.rapplication.blockNumber[chainId ?? -1]
  );
}

export function useFrontrunProtected(): boolean {
  return useSelector((state: AppState) => state.rapplication.frontrunProtected);
}
