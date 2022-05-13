import React, { createContext, useContext, useEffect, useState } from "react";
import type { FC, ReactNode } from "react";
import { Web3Provider as Web3ProviderEthers } from "@ethersproject/providers";

interface Web3State {
  library: Web3ProviderEthers | undefined;
  account: string | undefined | null;
  chainId: number | undefined;
  router: string | undefined,
  factory: string | undefined,
  initCodeHash: string | undefined,
  toggleWalletModal?: () => void;
}

interface Web3ProviderProps {
  children: ReactNode;
  library: Web3ProviderEthers | undefined;
  account: string | undefined | null;
  chainId: number | undefined;
  router: string | undefined,
  factory: string | undefined,
  initCodeHash: string | undefined,
  toggleWalletModal?: () => void;
}

const initialWeb3State: Web3State = {
  library: undefined,
  chainId: undefined,
  account: undefined,
  router: undefined,
  factory: undefined,
  initCodeHash: undefined,
  toggleWalletModal: undefined,
};

const Web3Context = createContext<Web3State>({} as Web3State);

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: FC<Web3ProviderProps> = ({
  children,
  library,
  chainId,
  account,
  router,
  factory,
  initCodeHash,
  toggleWalletModal,
}: Web3ProviderProps) => {
  const [state, setState] = useState<Web3State>(initialWeb3State);

  useEffect(() => {
    setState({
      library,
      chainId,
      account,
      router,
      factory,
      initCodeHash,
      toggleWalletModal,
    });
  }, [library, chainId, account,   router,
    factory,
    initCodeHash, toggleWalletModal]);

  return (
    <Web3Context.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
