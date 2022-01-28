import React, { Fragment, useState, useCallback, useEffect } from "react";
import {
  Currency,
  CurrencyAmount,
  Percent,
  TradeType,
} from "@uniswap/sdk-core";
import AppBody from "./AppBody";
import SwapHeader from "../order/SwapHeader";
import { BottomGrouping } from "../order/styleds";
import {
  ArrowWrapper,
  Wrapper,
  Dots,
  SwapCallbackError,
} from "../order/styleds";
import { AutoColumn } from "../Column";
import CurrencyInputPanel from "../CurrencyInputPanel";
import FeeInputPanel from "../FeeInputPanel";
import { useGelatoRangeOrders } from "../../hooks/gelato";
import { Field } from "../../state/gorder/actions";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { useUSDCValue } from "../../hooks/useUSDCPrice";
import {
  Divide,
  X,
  Minus,
  ArrowDown,
  CheckCircle,
  HelpCircle,
} from "react-feather";
import { Text } from "rebass";
import useTheme from "../../hooks/useTheme";
import { tryParseAmount } from "../../utils/tryParseAmount";
import useGasOverhead from "../../hooks/useGasOverhead";
import { useIsSwapUnsupported } from "../../hooks/useIsSwapUnsupported";
import {
  ButtonConfirmed,
  ButtonError,
  ButtonLight,
  ButtonPrimary,
} from "../Button";
import { TYPE } from "../../theme";
import { useWeb3 } from "../../web3";
import { GreyCard } from "../Card";
import {
  ApprovalState,
  useApproveCallbackFromInputCurrencyAmount,
} from "../../hooks/useApproveCallback";
import { AutoRow } from "../Row";
import CurrencyLogo from "../CurrencyLogo";
import Loader from "../Loader";
import { MouseoverTooltip } from "../Tooltip";
import { Trade } from "@uniswap/v2-sdk";
import { BigNumber } from "ethers";
import ConfirmSwapModal from "../order/ConfirmSwapModal";

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
  const { account, toggleWalletModal } = useWeb3();
  const [activeTab, setActiveTab] = useState<"sell" | "buy">("sell");
  const recipient = account ?? null;
  const {
    handlers: {
      handleInput,
      updateRange,
      handleRateType,
      handleCurrencySelection,
      handleSwitchTokens,
      handleRangeOrderSubmission,
      handleRangeSelection,
    },
    derivedOrderInfo: {
      parsedAmounts,
      currencies,
      formattedAmounts,
      currencyBalances,
      price,
      trade,
      rawAmounts,
      maxFeeAmount,
    },
    orderState: {
      independentField,
      rateType,
      rangeLowerEnabled,
      rangeUpperEnabled,
    },
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

  const swapIsUnsupported = useIsSwapUnsupported(
    currencies?.input,
    currencies?.output
  );
  const userHasSpecifiedInputOutput = Boolean(
    currencies.input && currencies.output
  );
  const routeNotFound = !trade?.route;
  const isLoadingRoute =
    userHasSpecifiedInputOutput &&
    ((parsedAmounts.input && !parsedAmounts.output) ||
      (!parsedAmounts.input && parsedAmounts.output));

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
      // if (price)
      //   updateRange(Field.PRICE, price);
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
  const handleRangeSelect = useCallback(
    (rangePrice) => handleRangeSelection(rangePrice),
    [handleRangeSelection]
  );

  const {
    gasPrice,
    realExecutionPrice,
    realExecutionPriceAsString,
  } = useGasOverhead(parsedAmounts.input, parsedAmounts.output, rateType);

  // modal and loading
  const [
    { showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash },
    setSwapState,
  ] = useState<{
    showConfirm: boolean;
    tradeToConfirm: Trade<Currency, Currency, TradeType> | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade as any,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const [
    approvalState,
    approveCallback,
  ] = useApproveCallbackFromInputCurrencyAmount(parsedAmounts.input);

  const inputError = false;
  const isValid = !inputError;

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approvalState, approvalSubmitted]);

  useEffect(() => {
    if (price) updateRange(Field.PRICE, price);
  }, [price, updateRange]);

  // set order error text based on order state
  const [rangeError0, setRangeError0] = useState<boolean>(false);
  const [rangeError1, setRangeError1] = useState<boolean>(false);
  useEffect(() => {
    if (price && currentMarketRate) {
      if (
        price?.greaterThan(currentMarketRate) &&
        !rangeUpperEnabled &&
        !rangeLowerEnabled
      ) {
        setRangeError0(true);
      } else {
        setRangeError0(false);
      }
      if (
        currentMarketRate?.greaterThan(price) &&
        !rangeUpperEnabled &&
        !rangeLowerEnabled
      ) {
        setRangeError1(true);
      } else {
        setRangeError1(false);
      }
    }
  }, [currentMarketRate, price, rangeLowerEnabled, rangeUpperEnabled]);

  const showApproveFlow =
    !inputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED));
  const handleApprove = useCallback(async () => {
    await approveCallback();
  }, [approveCallback]);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      handleInput(Field.INPUT, "");
    }
  }, [attemptingTxn, handleInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleSwap = useCallback(() => {
    if (!handleRangeOrderSubmission) {
      return;
    }

    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    });

    try {
      if (!currencies.input?.wrapped.address) {
        throw new Error("Invalid input currency");
      }

      if (!currencies.output?.wrapped.address) {
        throw new Error("Invalid output currency");
      }

      if (!rawAmounts.input) {
        throw new Error("Invalid input amount");
      }

      if (!rawAmounts.output) {
        throw new Error("Invalid output amount");
      }

      handleRangeOrderSubmission({
        inputAmount: BigNumber.from(rawAmounts.input),
      })
        .then(({ hash }: any) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: hash,
          });
        })
        .catch((error: any) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: error.message,
            txHash: undefined,
          });
        });
    } catch (error: any) {
      setSwapState({
        attemptingTxn: false,
        tradeToConfirm,
        showConfirm,
        swapErrorMessage: error.message,
        txHash: undefined,
      });
    }
  }, [
    handleRangeOrderSubmission,
    tradeToConfirm,
    showConfirm,
    currencies.input?.wrapped.address,
    currencies.output?.wrapped.address,
    rawAmounts.input,
    rawAmounts.output,
  ]);

  return (
    <Fragment>
      <AppBody>
        <SwapHeader handleActiveTab={handleActiveTab} activeTab={activeTab} />
        <Wrapper>
          {/* TODO: ConfirmSwapModal */}
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            inputAmount={parsedAmounts.input}
            outputAmount={parsedAmounts.output}
          />
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
                id="range-order-currency-input"
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
                rangeLowerEnabled={rangeLowerEnabled}
                lowerTick={formattedAmounts.lowerTick}
                rangePriceUpper={formattedAmounts.rangePriceUpper}
                rangeUpperEnabled={rangeUpperEnabled}
                upperTick={formattedAmounts.upperTick}
                rangeError0={rangeError0}
                rangeError1={rangeError1}
                isInvertedRate={rateType === Rate.MUL ? false : true}
                gasPrice={gasPrice}
                realExecutionPrice={realExecutionPrice ?? undefined}
                realExecutionPriceAsString={realExecutionPriceAsString}
                onPriceSelect={handleRangeSelect}
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
              {maxFeeAmount && (
                <FeeInputPanel
                  id="range-order-fee"
                  onUserInput={handleFeeInput}
                  value={maxFeeAmount}
                />
              )}
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
                id="range-order-currency-output"
              />
            </div>
            <BottomGrouping>
              {swapIsUnsupported ? (
                <ButtonPrimary disabled={true}>
                  <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
                </ButtonPrimary>
              ) : !account ? (
                <ButtonLight onClick={toggleWalletModal}>
                  Connect Wallet
                </ButtonLight>
              ) : routeNotFound && isLoadingRoute ? (
                <GreyCard style={{ textAlign: "center" }}>
                  <TYPE.main mb="4px">
                    <Dots>Loading</Dots>
                  </TYPE.main>
                </GreyCard>
              ) : showApproveFlow ? (
                <AutoRow style={{ flexWrap: "nowrap", width: "100%" }}>
                  <AutoColumn style={{ width: "100%" }} gap="12px">
                    <ButtonConfirmed
                      onClick={handleApprove}
                      disabled={
                        approvalState !== ApprovalState.NOT_APPROVED ||
                        approvalSubmitted
                      }
                      width="100%"
                      altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                      confirmed={approvalState === ApprovalState.APPROVED}
                    >
                      <AutoRow
                        justify="space-between"
                        style={{ flexWrap: "nowrap" }}
                      >
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <CurrencyLogo
                            currency={currencies.input}
                            size={"20px"}
                            style={{ marginRight: "8px", flexShrink: 0 }}
                          />
                          {/* we need to shorten this string on mobile */}
                          {approvalState === ApprovalState.APPROVED
                            ? `You can now use your ${currencies.input?.symbol} to place orders.`
                            : `Allow the Gelato Range Orders to use your 
                              ${currencies.input?.symbol}.`}
                        </span>
                        {approvalState === ApprovalState.PENDING ||
                        (approvalSubmitted &&
                          approvalState === ApprovalState.NOT_APPROVED) ? (
                          <Loader stroke="white" />
                        ) : approvalSubmitted &&
                          approvalState === ApprovalState.APPROVED ? (
                          <CheckCircle size="20" color={theme.green1} />
                        ) : (
                          <MouseoverTooltip
                            text={`You must give the Gelato Range Orders smart contracts
                                permission to use your 
                                ${currencies.input?.symbol}. You only have to do
                                this once per token.`}
                          >
                            <HelpCircle
                              size="20"
                              color={"white"}
                              style={{ marginLeft: "8px" }}
                            />
                          </MouseoverTooltip>
                        )}
                      </AutoRow>
                    </ButtonConfirmed>
                    <ButtonError
                      onClick={() => {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        });
                      }}
                      id="range-order-button"
                      disabled={
                        !isValid || approvalState !== ApprovalState.APPROVED
                      }
                      error={false}
                    >
                      <Text fontSize={20} fontWeight={500}>
                        {inputError ? inputError : `Place order`}
                      </Text>
                    </ButtonError>
                  </AutoColumn>
                </AutoRow>
              ) : (
                <ButtonError
                  onClick={() => {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    });
                  }}
                  id="range-order-button"
                  disabled={!isValid}
                  error={false}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {inputError ? inputError : `Place order`}
                  </Text>
                </ButtonError>
              )}
              {swapErrorMessage && isValid ? (
                <SwapCallbackError error={swapErrorMessage} />
              ) : null}
            </BottomGrouping>
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </Fragment>
  );
}
