import React from "react";
export * from "@gelatonetwork/limit-orders-lib";
import { CurrencyAmount } from "@uniswap/sdk-core";

import { gelatoReducers, GELATO_PERSISTED_KEYS } from "./state";
import ApplicationUpdater from "./state/gapplication/updater";
import ListsUpdater from "./state/glists/updater";
import MulticallUpdater from "./state/gmulticall/updater";
import TransactionUpdater from "./state/gtransactions/updater";
import { clearAllTransactions } from "./state/gtransactions/actions";
import { tryParseAmount } from "./state/gorder/hooks";
import { 
  useGelatoLimitOrders,
  useGelatoLimitOrdersHandlers } from "./hooks/gelato";
import useGelatoLimitOrdersHistory from "./hooks/gelato/useGelatoLimitOrdersHistory";
import useGelatoLimitOrdersLib from "./hooks/gelato/useGelatoLimitOrdersLib";
import GelatoLimitOrderPanel from "./components/GelatoLimitOrder";
import GelatoLimitOrdersHistoryPanel from "./components/LimitOrdersHistory";
import { Web3Provider } from "./web3";
import useGasPrice from "./hooks/useGasPrice";
import useGasOverhead from "./hooks/useGasOverhead";
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
import TradePrice from "./components/order/TradePrice";
import { buildBasesToCheckTradesAgainst } from "./utils";

export function GelatoProvider({
  chainId,
  library,
  children,
  account,
  router,
  factory,
  bases,
  initCodeHash,
  toggleWalletModal,
  useDefaultTheme = true,
  useDarkMode = true,
  tokenListURLs = [],
}: {
  chainId: number | undefined;
  library: any | undefined;
  account: string | undefined;
  router: string;
  bases?: {
    chainId: number;
    address: string;
    decimals: number;
    name: string;
    symbol: string;
  }[];
  factory: string;
  initCodeHash: string;
  toggleWalletModal?: () => void;
  useDefaultTheme?: boolean;
  useDarkMode?: boolean;
  children?: React.ReactNode;
  tokenListURLs?: string[];
}) {
  const basesToCheckTradesAgainst = bases && bases.length > 0
  ? buildBasesToCheckTradesAgainst(bases)
  : undefined;

if (basesToCheckTradesAgainst) {
  for (const base of basesToCheckTradesAgainst) {
    if (base.chainId !== chainId) {
      throw new Error(
        `Invalid base chainId for token ${base.name}/${base.symbol}: ${base.address}. Required chainId: ${chainId}`
      );
    }
  }
}
  return useDefaultTheme ? (
    <ThemeProvider useDarkMode={useDarkMode}>
      <Web3Provider
        chainId={chainId}
        library={library}
        account={account}
        router={router}
        bases={basesToCheckTradesAgainst}
        factory={factory}
        initCodeHash={initCodeHash}
        toggleWalletModal={toggleWalletModal}
      >
        <ThemedGlobalStyle />
        <ListsUpdater includeTokenLists={tokenListURLs} />
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
      bases={basesToCheckTradesAgainst}
      account={account}
      router={router}
      factory={factory}
      initCodeHash={initCodeHash}
      toggleWalletModal={toggleWalletModal}
    >
      <ListsUpdater includeTokenLists={tokenListURLs} />
      <ApplicationUpdater />
      <MulticallUpdater />
      <TransactionUpdater />
      {children}
    </Web3Provider>
  );
}

export {
  useGelatoLimitOrders,
  useGelatoLimitOrdersHandlers,
  useGelatoLimitOrdersHistory,
  useGelatoLimitOrdersLib,
  useGasPrice,
  useGasOverhead,
  CurrencyAmount,
  TradePrice,
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
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
