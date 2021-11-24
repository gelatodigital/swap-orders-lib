import { useMemo } from "react";
import { Contract } from "@ethersproject/contracts";
import { NEVER_RELOAD, useSingleCallResult } from "../state/gmulticall/hooks";
import { useWeb3 } from "../web3";
import { useArgentWalletDetectorContract } from "./useContract";

export default function useIsArgentWallet(): boolean {
  const { account } = useWeb3();
  const argentWalletDetector = useArgentWalletDetectorContract();
  const inputs = useMemo(() => [account ?? undefined], [account]);
  const call = useSingleCallResult(
    (argentWalletDetector as unknown) as Contract,
    "isArgentWallet",
    inputs,
    NEVER_RELOAD
  );
  return call?.result?.[0] ?? false;
}
