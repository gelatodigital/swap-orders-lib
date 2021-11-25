import React from "react";
import { Handler } from "@gelatonetwork/limit-orders-lib";
export * from "@gelatonetwork/limit-orders-lib";

import { gelatoReducers, GELATO_PERSISTED_KEYS } from "./state";
import ApplicationUpdater from "./state/gapplication/updater";
import ListsUpdater from "./state/glists/updater";
import MulticallUpdater from "./state/gmulticall/updater";
import TransactionUpdater from "./state/gtransactions/updater";
import { clearAllTransactions } from "./state/gtransactions/actions";
import { tryParseAmount } from "./state/gstoplimit/hooks";
import {
  useGelatoStopLimitOrders,
  useGelatoStopLimitOrdersHandlers,
} from "./hooks/gelato";
import useGelatoStopLimitOrdersHistory from "./hooks/gelato/useGelatoStopLimitOrdersHistory";
import useGelatoStopLimitOrdersLib from "./hooks/gelato/useGelatoStopLimitOrdersLib";
import GelatoStopLimitOrderPanel from "./components/GelatoStopLimitOrder";
import GelatoStopLimitOrdersHistoryPanel from "./components/StopLimitOrdersHistory";
import { Web3Provider } from "./web3";
import useGasPrice from "./hooks/useGasPrice";
import { useUSDCValue } from "./hooks/useUSDCPrice";
import { useCurrency } from "./hooks/Tokens";
import { useCurrencyBalances } from "./hooks/Balances";
import { useTradeExactOut, useTradeExactIn } from "./hooks/useTrade";
import ThemeProvider, { ThemedGlobalStyle } from "./theme";
import {
  ApprovalState,
  useApproveCallbackFromInputCurrencyAmount,
} from "./hooks/useApproveCallback";
import { useTransactionAdder } from "./state/gtransactions/hooks";
import { clearOrdersLocalStorage } from "./utils/localStorageOrders";

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
        <ListsUpdater />
        <ApplicationUpdater />
        <MulticallUpdater />
        <TransactionUpdater />
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
      <ListsUpdater />
      <ApplicationUpdater />
      <MulticallUpdater />
      <TransactionUpdater />
      {children}
    </Web3Provider>
  );
}

export {
  useGelatoStopLimitOrders,
  useGelatoStopLimitOrdersHandlers,
  useGelatoStopLimitOrdersHistory,
  useGelatoStopLimitOrdersLib,
  GelatoStopLimitOrderPanel,
  GelatoStopLimitOrdersHistoryPanel,
  useGasPrice,
  gelatoReducers,
  GELATO_PERSISTED_KEYS,
  clearAllTransactions,
  useUSDCValue,
  useCurrency,
  useCurrencyBalances,
  useTradeExactOut,
  useTradeExactIn,
  tryParseAmount,
  ApprovalState,
  useApproveCallbackFromInputCurrencyAmount,
  useTransactionAdder,
  clearOrdersLocalStorage,
};
