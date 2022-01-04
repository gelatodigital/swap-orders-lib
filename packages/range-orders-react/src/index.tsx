import React from "react";
import { Handler } from "@gelatonetwork/limit-orders-lib";
import { gelatoRangeOrderReducers, GELATO_RANGE_PERSISTED_KEYS } from "./state";
import GelatoRangeOrderPanel from "./components/GelatoRangeOrder";
import GelatoRangeOrderHistoryPanel from "./components/RangeOrdersHistory";
import ThemeProvider, { ThemedGlobalStyle } from "./theme";
import { Web3Provider } from "./web3";

export function GelatoProvider({
  chainId,
  library,
  children,
  account,
  handler,
  toggleWalletModal,
  useDefaultTheme = true,
  useDarkMode = true,
}: {
  chainId: number | undefined;
  library: any | undefined;
  account: string | undefined;
  handler?: Handler;
  toggleWalletModal?: () => void;
  useDefaultTheme?: boolean;
  useDarkMode?: boolean;
  children?: React.ReactNode;
}) {
  return useDefaultTheme ? (
    <ThemeProvider useDarkMode={useDarkMode}>
      <Web3Provider
        chainId={chainId}
        library={library}
        account={account}
        handler={handler}
        toggleWalletModal={toggleWalletModal}
      >
        <ThemedGlobalStyle />
        {children}
      </Web3Provider>
    </ThemeProvider>
  ) : (
    <Web3Provider
      chainId={chainId}
      library={library}
      account={account}
      handler={handler}
      toggleWalletModal={toggleWalletModal}
    >
      {children}
    </Web3Provider>
  );
}

export {
  GelatoRangeOrderPanel,
  GelatoRangeOrderHistoryPanel,
  GELATO_RANGE_PERSISTED_KEYS,
  gelatoRangeOrderReducers,
};
