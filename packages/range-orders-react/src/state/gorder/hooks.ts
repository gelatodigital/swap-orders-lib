import JSBI from "jsbi";
import {
  Currency,
  CurrencyAmount,
  NativeCurrency,
  Price,
  Token,
  TradeType,
} from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";
import { useCallback, useMemo } from "react";
import { useCurrency } from "../../hooks/Tokens";
import { useTradeExactIn, useTradeExactOut } from "../../hooks/useTrade";
import { useCurrencyBalances } from "../../hooks/Balances";
import {
  Field,
  Rate,
  selectCurrency,
  setRateType,
  setRecipient,
  switchCurrencies,
  typeInput,
  setRange,
  setZeroForOne,
} from "./actions";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "..";
import { useWeb3 } from "../../web3";
import { BigNumber, utils } from "ethers";
import { tryParseAmount } from "../../utils/tryParseAmount";
import { MAX_FEE_AMOUNTS } from "../../constants/misc";

export function applyExchangeRateTo(
  inputValue: string,
  exchangeRate: string,
  inputCurrency: Currency,
  outputCurrency: Currency,
  isInverted: boolean
): CurrencyAmount<NativeCurrency | Token> | undefined {
  const parsedInputAmount = tryParseAmount(
    inputValue,
    isInverted ? outputCurrency : inputCurrency
  );
  const parsedExchangeRate = tryParseAmount(
    exchangeRate,
    isInverted ? inputCurrency : outputCurrency
  );

  if (isInverted) {
    return parsedExchangeRate && parsedInputAmount
      ? parsedInputAmount
          ?.multiply(
            JSBI.exponentiate(
              JSBI.BigInt(10),
              JSBI.BigInt(inputCurrency.decimals)
            )
          )
          ?.divide(parsedExchangeRate.asFraction)
      : undefined;
  } else {
    return parsedExchangeRate && parsedInputAmount
      ? parsedInputAmount
          ?.multiply(parsedExchangeRate.asFraction)
          .divide(
            JSBI.exponentiate(
              JSBI.BigInt(10),
              JSBI.BigInt(outputCurrency.decimals)
            )
          )
      : undefined;
  }
}

export function useOrderState(): AppState["granger"] {
  return useSelector<AppState, AppState["granger"]>((state) => state.granger);
}

export function useOrderActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
  onChangeRateType: (rateType: Rate) => void;
  onRangeChange: (
    upper: number,
    upperPrice: BigNumber,
    lower: number,
    lowerPrice: BigNumber
  ) => void;
} {
  const dispatch = useDispatch();
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isToken
            ? currency.address
            : currency.isNative
            ? "ETH"
            : "",
        })
      );
    },
    [dispatch]
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }));
    },
    [dispatch]
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }));
    },
    [dispatch]
  );

  const onChangeRateType = useCallback(
    (rateType: Rate) => {
      dispatch(setRateType({ rateType }));
    },
    [dispatch]
  );

  const onRangeChange = useCallback(
    (
      upper: number,
      upperPrice: BigNumber,
      lower: number,
      lowerPrice: BigNumber
    ) => {
      dispatch(
        setRange({
          upper,
          upperPrice,
          lower,
          lowerPrice,
        })
      );
    },
    [dispatch]
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onChangeRateType,
    onRangeChange,
  };
}

export interface DerivedOrderInfo {
  currencies: { input: Currency | undefined; output: Currency | undefined };
  currencyBalances: {
    input: CurrencyAmount<Currency> | undefined;
    output: CurrencyAmount<Currency> | undefined;
  };
  inputError?: string;
  trade: Trade<Currency, Currency, TradeType> | undefined;
  parsedAmounts: {
    input: CurrencyAmount<Currency> | undefined;
    output: CurrencyAmount<Currency> | undefined;
  };
  formattedAmounts: {
    input: string;
    output: string;
    price: string;
    rangePriceLower: string;
    lowerTick: number;
    rangePriceUpper: string;
    upperTick: number;
  };
  rawAmounts: {
    input: string | undefined;
    output: string | undefined;
  };
  price: Price<Currency, Currency> | undefined;
  maxFeeAmount: CurrencyAmount<Currency> | undefined;
  zeroForOne: boolean;
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedOrderInfo(): DerivedOrderInfo {
  const { account, handler, chainId } = useWeb3();
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    rateType,
    inputValue,
    range,
    zeroForOne,
  } = useOrderState();
  const nativeCurrency = useCurrency("NATIVE");
  const maxFeeAmount: CurrencyAmount<Currency> | undefined =
    nativeCurrency && chainId
      ? CurrencyAmount.fromRawAmount(nativeCurrency, MAX_FEE_AMOUNTS[chainId])
      : undefined;

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const upperRange = utils.formatUnits(
    range.upperPrice,
    inputCurrency?.decimals ?? undefined
  );
  const lowerRange = utils.formatUnits(
    range.lowerPrice,
    inputCurrency?.decimals ?? undefined
  );

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ]);

  const isExactIn: boolean = independentField === Field.INPUT;
  const isDesiredRateUpdate = independentField === Field.PRICE;
  const desiredRateAppliedAsCurrencyAmount =
    isDesiredRateUpdate && inputValue && inputCurrency && outputCurrency
      ? applyExchangeRateTo(
          inputValue,
          typedValue,
          inputCurrency,
          outputCurrency,
          rateType === Rate.MUL ? false : true
        )
      : undefined;

  const desiredRateApplied =
    isDesiredRateUpdate &&
    inputValue &&
    inputCurrency &&
    outputCurrency &&
    desiredRateAppliedAsCurrencyAmount
      ? desiredRateAppliedAsCurrencyAmount?.toSignificant(6)
      : typedValue;

  const parsedAmount = tryParseAmount(
    typedValue,
    (isExactIn ? inputCurrency : outputCurrency) ?? undefined
  );

  const parsedAmountToUse = isDesiredRateUpdate
    ? tryParseAmount(
        desiredRateApplied,
        (isExactIn ? inputCurrency : outputCurrency) ?? undefined
      )
    : tryParseAmount(
        typedValue,
        (isExactIn ? inputCurrency : outputCurrency) ?? undefined
      );

  const bestTradeExactIn = useTradeExactIn(
    isExactIn ? parsedAmountToUse : undefined,
    outputCurrency ?? undefined,
    handler
  );
  const bestTradeExactOut = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmountToUse : undefined,
    handler
  );

  const trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

  const inputAmount = useMemo(() => {
    return tryParseAmount(inputValue, inputCurrency ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, inputCurrencyId]);

  const dispatch = useDispatch();

  useMemo(() => {
    if (inputCurrency?.wrapped.address && outputCurrency?.wrapped.address) {
      if (
        parseInt(inputCurrency?.wrapped.address, 16) <
        parseInt(outputCurrency?.wrapped.address, 16)
      ) {
        dispatch(setZeroForOne(true));
      } else {
        dispatch(setZeroForOne(false));
      }
    }
  }, [
    dispatch,
    inputCurrency?.wrapped.address,
    outputCurrency?.wrapped.address,
  ]);

  const currencyBalances = {
    input: relevantTokenBalances[0],
    output: relevantTokenBalances[1],
  };

  const currencies = useMemo(
    () => ({
      input: inputCurrency ?? undefined,
      output: outputCurrency ?? undefined,
    }),
    [inputCurrency, outputCurrency]
  );

  let inputError: string | undefined;
  if (!account) {
    inputError = "Connect Wallet";
  }

  if (
    currencies.input?.wrapped.address.toLowerCase() ===
    currencies.output?.wrapped.address.toLowerCase()
  ) {
    inputError = inputError ?? "Order not allowed";
  }

  const parsedAmounts = useMemo(
    () => ({
      input:
        independentField === Field.INPUT
          ? parsedAmount
          : inputAmount ?? trade?.inputAmount,
      output:
        independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
    }),
    [independentField, parsedAmount, inputAmount, trade]
  );

  if (!parsedAmounts.output && desiredRateAppliedAsCurrencyAmount) {
    parsedAmounts.output = desiredRateAppliedAsCurrencyAmount;
  }

  if (!currencies.input || !currencies.output) {
    inputError = inputError ?? "Select a token";
  }

  if (
    (parsedAmounts.input || parsedAmounts.output) &&
    currencies.input &&
    currencies.output &&
    !trade
  ) {
    const extraMessage =
      chainId === 1 ? ". Only Uniswap V2 pools supported" : "";
    inputError =
      inputError ?? "Insufficient liquidity for this trade" + extraMessage;
  }

  if (!parsedAmounts.input || !parsedAmounts.output) {
    inputError = inputError ?? "Enter an amount";
  }

  const price = useMemo(() => {
    if (!parsedAmounts.input || !parsedAmounts.output) return undefined;

    return new Price({
      baseAmount: parsedAmounts.input,
      quoteAmount: parsedAmounts.output,
    });
  }, [parsedAmounts.input, parsedAmounts.output]);

  // compare input to balance
  const [balanceIn, amountIn] = [currencyBalances.input, parsedAmounts.input];

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError =
      inputError ?? "Insufficient " + amountIn.currency.symbol + " balance";
  }

  if (price && trade) {
    if (
      rateType === Rate.MUL &&
      (price.lessThan(trade.executionPrice.asFraction) ||
        price.equalTo(trade.executionPrice.asFraction))
    )
      inputError =
        inputError ?? "Only possible to place sell orders above market rate";

    if (
      rateType === Rate.DIV &&
      (price.invert().greaterThan(trade.executionPrice.invert().asFraction) ||
        price.invert().equalTo(trade.executionPrice.invert().asFraction))
    )
      inputError =
        inputError ?? "Only possible to place buy orders below market rate";
  }
  // Get Range Order Upper and Lower prices

  const formattedAmounts = {
    input:
      inputValue && inputValue !== ""
        ? inputValue
        : parsedAmounts.input?.toSignificant(6) ?? "",
    output:
      independentField === Field.OUTPUT
        ? typedValue
        : parsedAmounts.output?.toSignificant(6) ?? "",
    price:
      independentField === Field.PRICE
        ? typedValue
        : rateType === Rate.MUL
        ? price?.toSignificant(6) ?? ""
        : price?.invert().toSignificant(6) ?? "",
    rangePriceLower: Number(lowerRange).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    lowerTick: range.lower,
    rangePriceUpper: Number(upperRange).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    upperTick: range.upper,
  };

  const rawAmounts = useMemo(
    () => ({
      input: inputCurrency
        ? parsedAmounts.input
            ?.multiply(
              JSBI.exponentiate(
                JSBI.BigInt(10),
                JSBI.BigInt(inputCurrency.decimals)
              )
            )
            .toFixed(0)
        : undefined,

      output: outputCurrency
        ? parsedAmounts.output
            ?.multiply(
              JSBI.exponentiate(
                JSBI.BigInt(10),
                JSBI.BigInt(outputCurrency.decimals)
              )
            )
            .toFixed(0)
        : undefined,
    }),
    [inputCurrency, outputCurrency, parsedAmounts]
  );

  return {
    currencies,
    currencyBalances,
    inputError,
    formattedAmounts,
    trade: trade ?? undefined,
    parsedAmounts,
    price,
    rawAmounts,
    maxFeeAmount,
    zeroForOne,
  };
}
