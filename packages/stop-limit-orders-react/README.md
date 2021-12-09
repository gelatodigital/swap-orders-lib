[![npm version](https://badge.fury.io/js/%40gelatonetwork%2Flimit-orders-lib.svg)](https://badge.fury.io/js/%40gelatonetwork%2Flimit-orders-lib)

# Gelato Stop Limit Order React SDK

Use Gelato's react component or hooks to place stop limit orders on Ethereum, Polygon and Fantom using Gelato Network.

- To hook it up in simple and direct way, using our default style, just use our react component (uniswap trade style widget). It's as is as a couple of lines of code.
- If your want to build your custom UI you can use our react hooks and plug them in into your components. Check the steps below.

## [Demo](https://www.sorbet.finance/#/stoplimit-order)

<a href="https://www.sorbet.finance/#/stoplimit-order" target="_blank">
     <img src="https://imgur.com/a/JTwNHkB"
          alt="Gelato Stop Limit orders"
          style="width: 440px;"
     />
</a>

## Installation

`yarn add -D @gelatonetwork/stop-limit-orders-react`

or

`npm install --save-dev @gelatonetwork/stop-limit-orders-react`

## Getting started

Wrap your app with the GelatoProvider and pass the gelato reducers into your redux store.

In your store pass the gelato reducers:

```tsx
import { configureStore } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";
import {
  gelatoStopLimitReducers,
  GELATO_STOPLIMIT_PERSISTED_KEYS,
} from "@gelatonetwork/stop-limit-orders-react";

// OPTIONAL: set the gelato persisted keys
// If don't use `redux-localstorage-simple` you can skip this step and only set the reducers
// You can also skip you don't use the GelatoLimitOrderPanel component
const PERSISTED_KEYS: string[] = [
  "your_keys",
  ...GELATO_STOPLIMIT_PERSISTED_KEYS,
];

const store = configureStore({
  reducer: {
    ...your_reducers,
    // Pass the gelato reducers
    ...gelatoStopLimitReducers,
  },
  middleware: [save({ states: PERSISTED_KEYS, debounce: 1000 })],
  preloadedState: load({ states: PERSISTED_KEYS }),
});

export default store;
```

In your main file wrap your app with `GelatoProvider`:

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { GelatoProvider } from "@gelatonetwork/stop-limit-orders-react";
import { useActiveWeb3React } from "hooks/web3";

function Gelato({ children }: { children?: React.ReactNode }) {
  const { library, chainId, account } = useActiveWeb3React();
  return (
    <GelatoProvider
      library={library}
      chainId={chainId}
      account={account ?? undefined}

      // Optionally your can set a specific handler to block trades on a specific handler
      // Currently we offer support out of the box for "uniswap", "quickswap", "spookyswap" and "spiritswap"
      // Please reach out to us if you want to register a custom handler
      // Make sure chainId and handler are valid
      // handler={'uniswap'}

      // [ONLY IF USING COMPONENT] Optionally pass a toggle modal to be able to connect
      // to a wallet via the component button
      // toggleWalletModal={toggleWalletModal}

      // By default `useDefaultTheme`and `useDarkMode` are set to true
      // Optionally, if you can try to use and pass your own theme by setting `useDefaultTheme`={false}
      // as long as it conforms with our theme definitions (you can check our `ThemeProvider` [here](https://github.com/gelatodigital/swap-orders-lib/blob/master/packages/stop-limit-orders-react/theme/index.tsx))
      // Optionally, if your main theme does not comply with our definitions, you can also wrap `GelatoProvider`
      // with a custom `ThemeProvider` with your own custom definitions. (check our `ThemeProvider` as an example)
      // useDefaultTheme={false}
      // useDarkMode={false}
    >
      {children}
    </GelatoProvider>
  );
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <ThemeProvider>
            <ThemedGlobalStyle />
            <HashRouter>
              <Gelato>
                <App />
              </Gelato>
            </HashRouter>
          </ThemeProvider>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>,
  document.getElementById("root")
);
```
!Important, if you already use `GelatoProvider` with "@gelatonetwork/limit-orders-react", simply import `GelatoProvider`  as `StopLimitProvider` and nest it under `GelatoProvider`


```tsx
import React from "react";
import ReactDOM from "react-dom";
import { GelatoProvider } from "@gelatonetwork/limit-orders-react";
import { GelatoProvider as StopLimitProvider } from "@gelatonetwork/stop-limit-orders-react";

import { useActiveWeb3React } from "hooks/web3";

function Gelato({ children }: { children?: React.ReactNode }) {
  const { library, chainId, account } = useActiveWeb3React();
  return (
    <GelatoProvider
      library={library}
      chainId={chainId}
      account={account ?? undefined}
    >
      <StopLimitProvider
         library={library}
        chainId={chainId}
        account={account ?? undefined}
        >
        {children}
      </StopLimitProvider>
    </GelatoProvider>
  );
}
.....
```
## Use the Gelato react component

Using the Gelato react component is the easiest option to get limit orders into your app.

```tsx
import React from "react";
import {
  GelatoStopLimitOrderPanel,
  GelatoStopLimitOrdersHistoryPanel,
} from "@gelatonetwork/stop-limit-orders-react";

export default function LimitOrder() {
  return (
    <>
      {/*To hide common bases in search modal you can pass into the component `showCommonBases={false}` */}
      <GelatoStopLimitOrderPanel />
      <GelatoStopLimitOrdersHistoryPanel />
    </>
  );
}
```

## Use the Gelato react hooks

Using the gelato hooks all logic and state updates are encapsulated and all your have to do is plug them into your application.

Hooks available:

- `useGelatoStopLimitOrders()`
- `useGelatoStopLimitOrdersHandlers()`
- `useGelatoStopLimitOrdersHistory()`
- `useGelatoStopLimitOrdersLib()`

```tsx
import React from "react";
import {
  useGelatoStopLimitOrders,
  GelatoStopLimitOrdersHistoryPanel,
} from "@gelatonetwork/stop-limit-orders-react";


export default function StopLimitOrder() {
  const {
    handlers: {
      handleInput,
      handleRateType,
      handleCurrencySelection,
      handleSwitchTokens,
      handleLimitOrderSubmission,
      handleLimitOrderCancellation
    },
    derivedOrderInfo: {
      parsedAmounts,
      currencies,
      currencyBalances,
      trade,
      formattedAmounts,
      inputError,
    },
    orderState: { independentField, rateType, typedValue },
  } = useGelatoStopLimitOrders();

  const { open, cancelled, executed } = useGelatoStopLimitOrdersHistory();

  ...
}
```

See complete integration example [here](https://github.com/gelatodigital/swap-orders-lib/blob/master/packages/stop-limit-orders-react/src/components/GelatoStopLimitOrder/index.tsx).

Note: You can also import the following hooks and functions from the library:

- `useCurrency` (to get the currency entity to be traded by address)
- `useUSDCValue` (to get fiat value given a CurrencyAmount)
- `useCurrencyBalances` (to get account balances for given Currencies)
- `useTradeExactIn` (to get a trade using an input amount)
- `useTradeExactOut` (to get a trade using an output amount)
- `tryParseAmount` (to try to parse a user entered amount for a given token)
- `ApprovalState` and `useApproveCallbackFromInputCurrencyAmount` (to max approve and verify allowance)
- `useTransactionAdder` (to add published transaction)

### Types

```typescript
useGelatoStopLimitOrders(): {
  handlers: GelatoLimitOrdersHandlers;
  derivedOrderInfo: DerivedOrderInfo;
  orderState: OrderState;
}

useGelatoStopLimitOrdersHandlers(): {
  handleLimitOrderSubmission: (
    orderToSubmit: {
      inputToken: string;
      outputToken: string;
      inputAmount: string;
      outputAmount: string;
      owner: string;
    },
    overrides?: Overrides
  ) => Promise<TransactionResponse>;

  handleLimitOrderCancellation: (
    order: Order,
    orderDetails?: {
      inputTokenSymbol: string;
      outputTokenSymbol: string;
      inputAmount: string;
      outputAmount: string;
    },
    overrides?: Overrides
  ) => Promise<TransactionResponse>;

  handleInput: (field: Field, value: string) => void;

  handleCurrencySelection: (
    field: Field.INPUT | Field.OUTPUT,
    currency: Currency
  ) => void;

  handleSwitchTokens: () => void;

  handleRateType: (rateType: Rate, price?: Price<Currency, Currency>) => void;
}

// includeOrdersWithNullHandler defaults to false
useGelatoStopLimitOrdersHistory(includeOrdersWithNullHandler?: boolean): {
  open: { pending: Order[]; confirmed: Order[] };
  cancelled: { pending: Order[]; confirmed: Order[] };
  executed: Order[];
}

useGelatoStopLimitOrdersLib(): GelatoStopLimitOrders | undefined
```

### Need help? Want to add a new handler?

Reach out to us on [Telegram](https://t.me/therealgelatonetwork), [Discord](https://discord.gg/ApbA39BKyJ) or [Twitter](https://twitter.com/gelatonetwork)
