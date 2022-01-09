import React, { Fragment, useState, useCallback } from "react";
import {
  Currency,
  CurrencyAmount,
  Percent,
  TradeType,
} from "@uniswap/sdk-core";
import AppBody from "./AppBody";
import SwapHeader from "../order/SwapHeader";
import { ArrowWrapper, Wrapper } from "../order/styleds";
import { AutoColumn } from "../Column";
import CurrencyInputPanel from "../CurrencyInputPanel";
import FeeInputPanel from "../FeeInputPanel";
import { useGelatoRangeOrders } from "../../hooks/gelato";
import { Field } from "../../state/gorder/actions";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { useUSDCValue } from "../../hooks/useUSDCPrice";
import { Divide, X, Minus, ArrowDown } from "react-feather";
import useTheme from "../../hooks/useTheme";
import { tryParseAmount } from "../../state/gorder/hooks";
import useGasOverhead from "../../hooks/useGasOverhead";

interface GelatoRangeOrderProps {
  showCommonBases?: boolean;
}

enum Rate {
  DIV = "DIV",
  MUL = "MUL",
}

export default function GelatoRangeOrder({
  showCommonBases = true,
}: GelatoRangeOrderProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<"sell" | "buy">("sell");
  const {
    handlers: {
      handleInput,
      handleRateType,
      handleCurrencySelection,
      handleSwitchTokens,
    },
    derivedOrderInfo: {
      parsedAmounts,
      currencies,
      formattedAmounts,
      currencyBalances,
      price,
      trade,
    },
    orderState: { independentField, rateType },
  } = useGelatoRangeOrders();

  const fiatValueInput = useUSDCValue(parsedAmounts.input);
  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(
    currencyBalances.input
  );
  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) &&
      !parsedAmounts.input?.equalTo(maxInputAmount)
  );
  const desiredRateInCurrencyAmount = tryParseAmount(
    trade?.outputAmount.toSignificant(6),
    currencies.output
  );

  const fiatValueDesiredRate = useUSDCValue(desiredRateInCurrencyAmount);
  const currentMarketRate = trade?.executionPrice ?? undefined;
  const pct =
    currentMarketRate && price
      ? price.subtract(currentMarketRate).divide(currentMarketRate)
      : undefined;
  const percentageRateDifference = pct
    ? new Percent(pct.numerator, pct.denominator)
    : undefined;

  const handleActiveTab = (tab: "sell" | "buy") => {
    if (activeTab === tab) return;
    handleRateType(rateType, price);
    setActiveTab(tab);
  };
  const handleTypeInput = useCallback(
    (value: string) => {
      handleInput(Field.INPUT, value);
    },
    [handleInput]
  );
  const handleMaxInput = useCallback(() => {
    maxInputAmount && handleInput(Field.INPUT, maxInputAmount.toExact());
  }, [maxInputAmount, handleInput]);
  const handleInputSelect = useCallback(
    (inputCurrency) => {
      handleCurrencySelection(Field.INPUT, inputCurrency);
    },
    [handleCurrencySelection]
  );
  const handleTypeDesiredRate = useCallback(
    (value: string) => {
      handleInput(Field.PRICE, value);
    },
    [handleInput]
  );
  const handleFeeInput = useCallback((value: string) => {
    console.log(value);
  }, []);
  const handleTypeOutput = useCallback(
    (value: string) => {
      handleInput(Field.OUTPUT, value);
    },
    [handleInput]
  );
  const handleOutputSelect = useCallback(
    (outputCurrency) => handleCurrencySelection(Field.OUTPUT, outputCurrency),
    [handleCurrencySelection]
  );

  const {
    gasPrice,
    realExecutionPrice,
    realExecutionPriceAsString,
  } = useGasOverhead(parsedAmounts.input, parsedAmounts.output, rateType);

  return (
    <Fragment>
      <AppBody>
        <SwapHeader handleActiveTab={handleActiveTab} activeTab={activeTab} />
        <Wrapper>
          {/* TODO: ConfirmSwapModal */}
          <AutoColumn gap={"md"}>
            <div style={{ display: "relative" }}>
              <CurrencyInputPanel
                label={
                  independentField === Field.OUTPUT ? "From (at most)" : "From"
                }
                value={formattedAmounts.input}
                showMaxButton={showMaxButton}
                currency={currencies.input}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies.output}
                showCommonBases={showCommonBases}
                id="limit-order-currency-input"
              />
              <ArrowWrapper clickable={false}>
                {rateType === Rate.MUL ? (
                  <X
                    size="16"
                    color={
                      currencies.input && currencies.output
                        ? theme.text1
                        : theme.text3
                    }
                  />
                ) : (
                  <Divide
                    size="16"
                    color={
                      currencies.input && currencies.output
                        ? theme.text1
                        : theme.text3
                    }
                  />
                )}
              </ArrowWrapper>
              {/* Range price selector */}
              <CurrencyInputPanel
                value={formattedAmounts.price}
                showMaxButton={false}
                currency={currencies.input}
                onUserInput={handleTypeDesiredRate}
                fiatValue={fiatValueDesiredRate ?? undefined}
                otherCurrency={currencies.output}
                id="range-order-currency-rate"
                showCurrencySelector={false}
                hideBalance={true}
                showRange={true}
                rangePriceLower={formattedAmounts.rangePriceLower}
                rangePriceUpper={formattedAmounts.rangePriceUpper}
                isInvertedRate={rateType === Rate.MUL ? false : true}
                gasPrice={gasPrice}
                realExecutionPrice={realExecutionPrice ?? undefined}
                realExecutionPriceAsString={realExecutionPriceAsString}
              />
              <ArrowWrapper clickable={false}>
                <Minus
                  size="16"
                  color={
                    currencies.input && currencies.output
                      ? theme.text1
                      : theme.text3
                  }
                />
              </ArrowWrapper>
              <FeeInputPanel
                id="range-order-fee"
                onUserInput={handleFeeInput}
                value=""
              />
              <ArrowWrapper clickable={false}>
                <ArrowDown
                  size="16"
                  onClick={() => {
                    handleSwitchTokens();
                  }}
                  color={
                    currencies.input && currencies.output
                      ? theme.text1
                      : theme.text3
                  }
                />
              </ArrowWrapper>
              <CurrencyInputPanel
                value={formattedAmounts.output}
                onUserInput={handleTypeOutput}
                label={
                  independentField === Field.INPUT ? "To (at least)" : "To"
                }
                showMaxButton={false}
                hideBalance={false}
                priceImpact={percentageRateDifference}
                currency={currencies.output}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies.input}
                showCommonBases={showCommonBases}
                rateType={rateType}
                id="limit-order-currency-output"
              />
            </div>
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </Fragment>
  );
}
