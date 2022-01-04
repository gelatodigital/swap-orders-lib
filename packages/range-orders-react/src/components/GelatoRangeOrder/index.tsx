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
import { useGelatoRangeOrders } from "../../hooks/gelato";
import { Field } from "../../state/gorder/actions";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { useUSDCValue } from "../../hooks/useUSDCPrice";
import {
  Divide,
  X,
} from "react-feather";
import useTheme from "../../hooks/useTheme";

interface GelatoRangeOrderProps {
  showCommonBases?: boolean;
}

enum Rate {
  DIV = "DIV",
  MUL = "MUL",
}

export default function GelatoRangeOrder({ showCommonBases = true }: GelatoRangeOrderProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<"sell" | "buy">("sell");
  const {
    handlers: {
      handleInput,
      handleRateType,
      handleCurrencySelection,
      handleSwitchTokens,
      handleLimitOrderSubmission,
    },
    derivedOrderInfo: {
      parsedAmounts,
      currencies,
      formattedAmounts,
      currencyBalances,
      price,
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
      //  setApprovalSubmitted(false); // reset 2 step UI for approvals
      handleCurrencySelection(Field.INPUT, inputCurrency);
    },
    [handleCurrencySelection]
  );

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
            </div>
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </Fragment>
  );
}
