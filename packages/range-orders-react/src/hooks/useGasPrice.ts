import { useCallback, useState } from "react";
import { useWeb3 } from "../web3";
import useInterval from "./useInterval";
import { isEthereumChain } from "@gelatonetwork/limit-orders-lib/dist/utils";
import { isPolygonChainId } from "@gelatonetwork/range-orders-lib/dist/utils";

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  BSC = 56,
  MATIC = 137,
  FANTOM = 250,
  AVAX = 43114,
}

export default function useGasPrice(): number | undefined {
  const { chainId, library } = useWeb3();
  const [gasPrice, setGasPrice] = useState<number>();

  const gasPriceCallback = useCallback(() => {
    if (isPolygonChainId(chainId)) {
      setGasPrice(1);
      return;
    }
    library
      ?.getGasPrice()
      .then((gasPrice) => {
        // add 20%
        setGasPrice(gasPrice.mul(120).div(100).toNumber());
      })
      .catch((error) =>
        console.error(`Failed to get gas price for chainId: ${chainId}`, error)
      );
  }, [chainId, library]);

  useInterval(
    gasPriceCallback,
    chainId && isEthereumChain(chainId) ? 15000 : 60000
  );

  return gasPrice;
}
