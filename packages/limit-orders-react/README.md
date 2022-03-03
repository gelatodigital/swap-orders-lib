[![npm version](https://badge.fury.io/js/%40gelatonetwork%2Flimit-orders-lib.svg)](https://badge.fury.io/js/%40gelatonetwork%2Flimit-orders-lib)

# Gelato Limit Order React SDK

Use Gelato's react component or hooks to place limit buy and sell orders on Ethereum, Polygon and Fantom using Gelato Network.

- To hook it up in simple and direct way, using our default style, just use our react component (uniswap trade style widget). It's as is as a couple of lines of code.
- If your want to build your custom UI you can use our react hooks and plug them in into your components. Check the steps below.

> :warning: :warning: :warning: **Warning** :warning: :warning: :warning: :
> Version 1.0.0 introduced new features and our system changed to an approval/transferFrom flow. You should use the latest version available (>= 1.0.0). If you are using an old version you should update to the latest version immediately. Versions below 1.0.0 are being deprecated.

## [Demo](https://www.sorbet.finance)

<a href="https://www.sorbet.finance" target="_blank">
     <img src="https://i.imgur.com/xE5RKRH.png"
          alt="Gelato Limit orders"
          style="width: 440px;"
     />
</a>

## Installation

`yarn add -D @gelatonetwork/limit-orders-react`

or

`npm install --save-dev @gelatonetwork/limit-orders-react`

## Getting started

Wrap your app with the GelatoProvider and pass the gelato reducers into your redux store.

In your store pass the gelato reducers:

```tsx
import { configureStore } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";
import {
  gelatoReducers,
  GELATO_PERSISTED_KEYS,
} from "@gelatonetwork/limit-orders-react";

// OPTIONAL: set the gelato persisted keys
// If don't use `redux-localstorage-simple` you can skip this step and only set the reducers
// You can also skip you don't use the GelatoLimitOrderPanel component
const PERSISTED_KEYS: string[] = ["your_keys", ...GELATO_PERSISTED_KEYS];

const store = configureStore({
  reducer: {
    ...your_reducers,
    // Pass the gelato reducers
    ...gelatoReducers,
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
import { GelatoProvider } from "@gelatonetwork/limit-orders-react";
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
      // as long as it conforms with our theme definitions (you can check our `ThemeProvider` [here](https://github.com/gelatodigital/limit-orders-lib/tree/master/packages/limit-orders-react/theme/index.tsx))
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

## Use the Gelato react component

Using the Gelato react component is the easiest option to get limit orders into your app.

```tsx
import React from "react";
import {
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from "@gelatonetwork/limit-orders-react";

export default function LimitOrder() {
  return (
    <>
      {/*To hide common bases in search modal you can pass into the component `showCommonBases={false}` */}
      <GelatoLimitOrderPanel />
      <GelatoLimitOrdersHistoryPanel />
    </>
  );
}
```

## Use the Gelato react hooks

Using the gelato hooks all logic and state updates are encapsulated and all your have to do is plug them into your application.

Hooks available:

- `useGelatoLimitOrders()`
- `useGelatoLimitOrdersHandlers()`
- `useGelatoLimitOrdersHistory()`
- `useGelatoLimitOrdersLib()`
- `useGasOverhead()`

```tsx
import React from "react";
import {
  useGelatoLimitOrders,
  GelatoLimitOrdersHistoryPanel,
} from "@gelatonetwork/limit-orders-react";


export default function LimitOrder() {
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
  } = useGelatoLimitOrders();

  const { open, cancelled, executed, expired } = useGelatoLimitOrdersHistory();

  ...
}
```

## Use the Gelato react hook `useGasOverhead()` to calculate real execution price

For networks using the "gas-model" to pay for execution. The Execution price will be slightly higher then the entered Price. Orders will execute when `minReturn` + `transactionFee` === "current price"

Hook to calculate actual execution price:

```tsx
import React, { useMemo } from "react";
import {
  useGasOverhead,
  CurrencyAmount,
  useCurrency,
  TradePrice
} from "@gelatonetwork/limit-orders-react";

export default function LimitOrderCard() {
 ...
  const inputToken = useCurrency(order.inputToken);
  const outputToken = useCurrency(order.outputToken);

  const inputAmount = useMemo(
    () =>
      inputToken && order.inputAmount
        ? CurrencyAmount.fromRawAmount(inputToken, order.inputAmount)
        : undefined,
    [inputToken, order.inputAmount]
  );

  const isEthereum = isEthereumChain(chainId ?? 1);

  const outputAmount = useMemo(
    () =>
      outputToken && rawMinReturn
        ? CurrencyAmount.fromRawAmount(outputToken, order.minReturn)
        : undefined,
    [outputToken, rawMinReturn]
  );

  const {
    gasPrice,
    projectedExecutionPrice, // returns @uniswap/sdk-core Price object
    projectedExecutionPriceAsString,
  } = useGasOverhead(inputAmount, outputAmount);

  const [ inverted, setInverted, ] = useState<boolean>(true);

  ...

  return (
    <>
    {projectedExecutionPrice ? (
      <TradePrice
        price={ethereumExecutionPrice}
        showInverted={inverted}
        setShowInverted={setInverted}
        fontWeight={500}
        fontSize={12}
      />
    ): ... }
    </>
  )
}
```

## Expiration

> :warning: :warning: :warning: **Warning** :warning: :warning: :warning: :
> Important: Open orders will expire three months `7889238 seconds` after creation. Expired orders will be filtered out of `open` and pushed into the `expired` in `useGelatoLimitOrdersHistory()`.

See complete integration example [here](https://github.com/gelatodigital/limit-orders-lib/tree/master/packages/limit-orders-react/src/components/GelatoLimitOrder/index.tsx#L81).

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
useGelatoLimitOrders(): {
  handlers: GelatoLimitOrdersHandlers;
  derivedOrderInfo: DerivedOrderInfo;
  orderState: OrderState;
}

useGelatoLimitOrdersHandlers(): {
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
useGelatoLimitOrdersHistory(includeOrdersWithNullHandler?: boolean): {
  open: { pending: Order[]; confirmed: Order[] };
  cancelled: { pending: Order[]; confirmed: Order[] };
  executed: Order[];
  expired: Order[];
  clearLocalStorageAndRefetchDataFromSubgraph: () => void
}

useGelatoLimitOrdersLib(): GelatoLimitOrders | undefined
```

### Need help? Want to add a new handler?

Reach out to us on [Telegram](https://t.me/therealgelatonetwork), [Discord](https://discord.gg/ApbA39BKyJ) or [Twitter](https://twitter.com/gelatonetwork)
