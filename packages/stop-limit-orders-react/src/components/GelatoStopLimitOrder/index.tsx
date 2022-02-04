/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Currency,
  CurrencyAmount,
  Percent,
  TradeType,
} from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";
import { AdvancedSwapDetails } from "../order/AdvancedSwapDetails";
import UnsupportedCurrencyFooter from "../order/UnsupportedCurrencyFooter";
import { MouseoverTooltip, MouseoverTooltipContent } from "../Tooltip";
import React, { useCallback, useState, Fragment, useEffect } from "react";
import {
  ArrowDown,
  Info,
  Divide,
  X,
  CheckCircle,
  HelpCircle,
} from "react-feather";
import { Text } from "rebass";
import styled from "styled-components";
import {
  ButtonConfirmed,
  ButtonError,
  ButtonLight,
  ButtonPrimary,
} from "../Button";
import { GreyCard } from "../Card";
import { AutoColumn } from "../Column";
import CurrencyInputPanel from "../CurrencyInputPanel";
import Row, { AutoRow, RowFixed } from "../Row";
import ConfirmSwapModal from "../order/ConfirmSwapModal";
import {
  ArrowWrapper,
  BottomGrouping,
  Dots,
  SwapCallbackError,
  Wrapper,
} from "../order/styleds";
import { SwapHeader } from "../order/SwapHeader";
import TradePrice from "../order/TradePrice";
import { useGelatoStopLimitOrders } from "../../hooks/gelato";
import { useIsSwapUnsupported } from "../../hooks/useIsSwapUnsupported";
import { useUSDCValue } from "../../hooks/useUSDCPrice";
import { Field } from "../../state/gstoplimit/actions";
import { tryParseAmount } from "../../state/gstoplimit/hooks";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import AppBody from "./AppBody";
import { ExternalLink, TYPE } from "../../theme";
import { useWeb3 } from "../../web3";
import useTheme from "../../hooks/useTheme";
import useGasOverhead from "../../hooks/useGasOverhead";
import PoweredByGelato from "../../assets/svg/poweredbygelato_transparent.svg";
import {
  ApprovalState,
  useApproveCallbackFromInputCurrencyAmount,
} from "../../hooks/useApproveCallback";
import Loader from "../Loader";
import CurrencyLogo from "../CurrencyLogo";
import { NATIVE } from "../../constants/addresses";
import Slippage from "../order/Slippage";

const StyledInfo = styled(Info)`
  opacity: 0.4;
  color: ${({ theme }) => theme.text1};
  height: 16px;
  width: 16px;
  :hover {
    opacity: 0.8;
  }
`;

enum Rate {
  DIV = "DIV",
  MUL = "MUL",
}

const PoweredByWrapper = styled(PoweredByGelato)<{ size: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  height: ${() => "26px"};
  width: ${({ size }) => (size ? size + "px" : "32px")};
  background-color: ${({ theme }) => theme.bg1};
  & > img,
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
  border-radius: 0.5rem;       
  margin-left: 0.25rem;
`;

interface GelatoStopLimitOrderProps {
  showCommonBases?: boolean;
}

export default function GelatoStopLimitOrder({
  showCommonBases = true,
}: GelatoStopLimitOrderProps) {
  const { account, toggleWalletModal } = useWeb3();

  const theme = useTheme();

  const recipient = account ?? null;

  const {
    handlers: {
      handleInput,
      handleCurrencySelection,
      handleSwitchTokens,
      handleStopLimitOrderSubmission,
    },
    derivedOrderInfo: {
      parsedAmounts,
      currencies,
      currencyBalances,
      trade,
      formattedAmounts,
      inputError,
      rawAmounts,
      price,
    },
    orderState: { independentField, rateType },
  } = useGelatoStopLimitOrders();

  const fiatValueInput = useUSDCValue(parsedAmounts.input);

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

  const isValid = !inputError;

  const handleTypeInput = useCallback(
    (value: string) => {
      handleInput(Field.INPUT, value);
    },
    [handleInput]
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      handleInput(Field.OUTPUT, value);
    },
    [handleInput]
  );
  const handleTypeDesiredRate = useCallback(
    (value: string) => {
      handleInput(Field.PRICE, value);
    },
    [handleInput]
  );

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

  const [
    approvalState,
    approveCallback,
  ] = useApproveCallbackFromInputCurrencyAmount(parsedAmounts.input);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approvalState, approvalSubmitted]);

  const allowedSlippage = new Percent(500, 10_000);
  const userHasSpecifiedInputOutput = Boolean(
    (independentField === Field.INPUT || independentField === Field.OUTPUT) &&
      currencies.input &&
      currencies.output
  );
  const routeNotFound = !trade?.route;
  const isLoadingRoute =
    parsedAmounts.input &&
    !parsedAmounts.output &&
    currencies.input &&
    currencies.output;

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(
    currencyBalances.input
  );
  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) &&
      !parsedAmounts.input?.equalTo(maxInputAmount)
  );

  const handleSwap = useCallback(() => {
    if (!handleStopLimitOrderSubmission) {
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

      if (!account) {
        throw new Error("No account");
      }

      handleStopLimitOrderSubmission({
        inputToken: currencies.input?.isNative
          ? NATIVE
          : currencies.input?.wrapped.address,
        outputToken: currencies.output?.isNative
          ? NATIVE
          : currencies.output?.wrapped.address,
        inputAmount: rawAmounts.input,
        outputAmount: rawAmounts.output,
        owner: account,
      })
        .then(({ hash }) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: hash,
          });
        })
        .catch((error) => {
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
    handleStopLimitOrderSubmission,
    tradeToConfirm,
    showConfirm,
    currencies.input?.wrapped.address,
    currencies.input?.isNative,
    currencies.output?.wrapped.address,
    currencies.output?.isNative,
    rawAmounts.input,
    rawAmounts.output,
    account,
  ]);

  const [showInverted, setShowInverted] = useState<boolean>(false);

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

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade as any,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      //  setApprovalSubmitted(false); // reset 2 step UI for approvals
      handleCurrencySelection(Field.INPUT, inputCurrency);
    },
    [handleCurrencySelection]
  );

  const handleMaxInput = useCallback(() => {
    maxInputAmount && handleInput(Field.INPUT, maxInputAmount.toExact());
  }, [maxInputAmount, handleInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency) => handleCurrencySelection(Field.OUTPUT, outputCurrency),
    [handleCurrencySelection]
  );

  const swapIsUnsupported = useIsSwapUnsupported(
    currencies?.input,
    currencies?.output
  );

  const {
    gasPrice,
    realExecutionPrice,
    realExecutionPriceAsString,
  } = useGasOverhead(parsedAmounts.input, parsedAmounts.output, rateType);

  const showApproveFlow =
    !inputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED));

  const handleApprove = useCallback(async () => {
    await approveCallback();
  }, [approveCallback]);

  return (
    <Fragment>
      <AppBody>
        <SwapHeader />
        <Wrapper id="limit-order-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
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
              <CurrencyInputPanel
                value={formattedAmounts.price}
                showMaxButton={showMaxButton}
                currency={currencies.input}
                onUserInput={handleTypeDesiredRate}
                fiatValue={fiatValueDesiredRate ?? undefined}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies.output}
                showCommonBases={showCommonBases}
                id="limit-order-currency-rate"
                showCurrencySelector={false}
                hideBalance={true}
                showRate={true}
                isInvertedRate={rateType === Rate.MUL ? false : true}
                gasPrice={gasPrice}
                realExecutionPrice={realExecutionPrice ?? undefined}
                realExecutionPriceAsString={realExecutionPriceAsString}
              />
              <ArrowWrapper clickable>
                <ArrowDown
                  size="16"
                  onClick={() => {
                    //   setApprovalSubmitted(false); // reset 2 step UI for approvals
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
              <Row>
                <Slippage />
              </Row>
            </div>

            <Row
              style={{ justifyContent: !trade ? "center" : "space-between" }}
            >
              <RowFixed>
                <ExternalLink href={"https://www.gelato.network"}>
                  <PoweredByWrapper size={126} />
                </ExternalLink>
              </RowFixed>
              {trade ? (
                <RowFixed>
                  {/* Current market rate */}
                  <TradePrice
                    price={trade.executionPrice}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                  />
                  <MouseoverTooltipContent content={<AdvancedSwapDetails />}>
                    <StyledInfo />
                  </MouseoverTooltipContent>
                </RowFixed>
              ) : null}
            </Row>

            <BottomGrouping>
              {swapIsUnsupported ? (
                <ButtonPrimary disabled={true}>
                  <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
                </ButtonPrimary>
              ) : !account ? (
                <ButtonLight onClick={toggleWalletModal}>
                  Connect Wallet
                </ButtonLight>
              ) : routeNotFound &&
                userHasSpecifiedInputOutput &&
                parsedAmounts.input ? (
                <GreyCard style={{ textAlign: "center" }}>
                  <TYPE.main mb="4px">
                    {isLoadingRoute ? (
                      <Dots>Loading</Dots>
                    ) : (
                      `Insufficient liquidity for this trade.`
                    )}
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
                            : `Allow the Gelato Stop Limit Orders to use your 
                              ${currencies.input?.symbol}`}
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
                            text={`You must give the Gelato Stop Limit Orders smart contracts
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
                      id="limit-order-button"
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
                  id="stop-limit-order-button"
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

      {!swapIsUnsupported ? null : (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies.input, currencies.output]}
        />
      )}
    </Fragment>
  );
}
