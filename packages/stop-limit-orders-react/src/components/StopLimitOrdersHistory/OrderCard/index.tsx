import React, { useCallback, useMemo, useState } from "react";
import styled, { DefaultTheme } from "styled-components/macro";
import { darken } from "polished";
import { ArrowRight } from "react-feather";
import { Text } from "rebass";
import { RowBetween } from "../../Row";
import { StopLimitOrder, constants } from "@gelatonetwork/limit-orders-lib";
import useTheme from "../../../hooks/useTheme";
import { useCurrency } from "../../../hooks/Tokens";
import CurrencyLogo from "../../CurrencyLogo";
import { useGelatoStopLimitOrdersHandlers } from "../../../hooks/gelato";
import { CurrencyAmount, Price, Percent } from "@uniswap/sdk-core";
import ConfirmCancellationModal from "../ConfirmCancellationModal";
import { useTradeExactIn } from "../../../hooks/useTrade";
import { Dots } from "../../order/styleds";
import { Rate } from "../../../state/gstoplimit/actions";
import { isEthereumChain } from "@gelatonetwork/limit-orders-lib/dist/utils";
import { useWeb3 } from "../../../web3";
import { ButtonGray } from "../../Button";
import { useIsTransactionPending } from "../../../state/gstoplimittransactions/hooks";
import {
  ExplorerDataType,
  getExplorerLink,
} from "../../../utils/getExplorerLink";
import TradePrice from "../../order/TradePrice";
import useGelatoStopLimitOrdersLib from "../../../hooks/gelato/useGelatoStopLimitOrdersLib";
import useGasOverhead from "../../../hooks/useGasOverhead";
import { MouseoverTooltip } from "../../Tooltip";
import { TYPE } from "../../../theme";
import HoverInlineText from "../../HoverInlineText";
import { formatUnits } from "@ethersproject/units";

const handleColorType = (status: string, theme: DefaultTheme) => {
  switch (status) {
    case "open":
      return theme.blue1;
    case "executed":
      return theme.green1;
    case "cancelled":
      return theme.red1;

    case "pending":
      return theme.yellow1;

    default:
      return theme.text3;
  }
};

const OrderPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: "16px";
  background-color: ${() => "transparent"};
  z-index: 1;
  width: "100%";
`;

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? "16px" : "20px")};
  border: 1px solid ${" transparent"};
  background-color: ${({ theme }) => theme.bg1};
  width: ${({ hideInput }) => (hideInput ? "100%" : "initial")};
  :focus,
  :hover {
    border: 1px solid
      ${({ theme, hideInput }) => (hideInput ? " transparent" : theme.bg3)};
  }
`;

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`;

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) =>
    active
      ? "  margin: 0 0.25rem 0 0.25rem;"
      : "  margin: 0 0.25rem 0 0.25rem;"}
  font-size:  ${({ active }) => (active ? "14px" : "14px")};
`;

const OrderRow = styled(LabelRow)`
  justify-content: flex-end;
  margin-top: -8px;
`;

const OrderStatus = styled.span<{ status: string; clickable: boolean }>`
  font-size: 0.825rem;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  color: ${({ status, theme }) => handleColorType(status, theme)};
  border: 1px solid ${({ status, theme }) => handleColorType(status, theme)};
  width: fit-content;
  justify-self: flex-end;
  text-transform: uppercase;
  :hover {
    content: "Reply!";
    border: 1px solid
      ${({ status, theme, clickable }) =>
        clickable
          ? handleColorType("cancelled", theme)
          : handleColorType(status, theme)};

    color: ${({ status, theme, clickable }) =>
      clickable
        ? handleColorType("cancelled", theme)
        : handleColorType(status, theme)};
  }
`;

export const ArrowWrapper = styled.div`
  padding: 4px;
  border-radius: 12px;
  height: 32px;
  width: 32px;
  margin-right: 2px;
  margin-left: -10px;
  background-color: ${({ theme }) => theme.bg1};
  border: 4px solid ${({ theme }) => theme.bg1};
`;

const CurrencySelect = styled(ButtonGray)<{
  selected: boolean;
  hideInput?: boolean;
}>`
  align-items: center;
  font-size: 24px;
  font-weight: 500;
  background-color: ${({ selected, theme }) =>
    selected ? theme.bg0 : theme.primary1};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 16px;
  box-shadow: ${({ selected }) =>
    selected ? "none" : "0px 6px 10px rgba(0, 0, 0, 0.075)"};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  outline: none;
  cursor: default;
  user-select: none;
  border: none;
  height: ${({ hideInput }) => (hideInput ? "2.8rem" : "2.4rem")};
  width: ${({ hideInput }) => (hideInput ? "100%" : "initial")};
  padding: 0 8px;
  justify-content: space-between;
  margin-right: ${({ hideInput }) => (hideInput ? "0" : "12px")};
  &:focus {
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
    background-color: ${({ selected, theme }) =>
      selected ? theme.bg0 : theme.primary1};
  }
  :hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.bg0 : theme.primary1};
  }
`;

const Spacer = styled.div`
  flex: 1 1 auto;
`;

const ExpiredText = styled.span`
  color: ${({ theme }) => theme.text4};
  margin-right: 5px;
`;

export default function OrderCard({ order }: { order: StopLimitOrder }) {
  const theme = useTheme();

  const { chainId, handler } = useWeb3();

  const [
    showExecutionPriceInverted,
    setShowExecutionPriceInverted,
  ] = useState<boolean>(false);
  const [
    showEthereumExecutionPriceInverted,
    setShowEthereumExecutionPriceInverted,
  ] = useState<boolean>(true);
  const [
    showCurrentPriceInverted,
    setShowCurrentPriceInverted,
  ] = useState<boolean>(true);

  const {
    handleStopLimitOrderCancellation,
  } = useGelatoStopLimitOrdersHandlers();

  const gelatoLibrary = useGelatoStopLimitOrdersLib();

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

  const rawMinReturn = useMemo(() => order.minReturn, [order.minReturn]);

  const rawMaxReturn = useMemo(() => order.maxReturn, [order.maxReturn]);

  const maxOutputAmount = useMemo(
    () =>
      outputToken && rawMaxReturn
        ? CurrencyAmount.fromRawAmount(outputToken, rawMaxReturn)
        : undefined,
    [outputToken, rawMaxReturn]
  );

  const outputAmount = useMemo(
    () =>
      outputToken && rawMinReturn
        ? CurrencyAmount.fromRawAmount(outputToken, rawMinReturn)
        : undefined,
    [outputToken, rawMinReturn]
  );

  const {
    gasPrice,
    realExecutionPrice: ethereumExecutionPrice,
  } = useGasOverhead(inputAmount, outputAmount, Rate.MUL);

  const executionPrice = useMemo(
    () =>
      outputAmount && outputAmount.greaterThan(0) && inputAmount
        ? new Price({
            baseAmount: outputAmount,
            quoteAmount: inputAmount,
          })
        : undefined,
    [inputAmount, outputAmount]
  );

  const maxPrice = useMemo(
    () =>
      maxOutputAmount && maxOutputAmount.greaterThan(0) && inputAmount
        ? new Price({
            baseAmount: maxOutputAmount,
            quoteAmount: inputAmount,
          })
        : undefined,
    [inputAmount, maxOutputAmount]
  );

  const trade = useTradeExactIn(inputAmount, outputToken ?? undefined, handler);

  const currentMarketRate = trade?.executionPrice ?? undefined;

  const pct =
    currentMarketRate && maxPrice
      ? maxPrice.subtract(currentMarketRate).divide(currentMarketRate)
      : undefined;

  // const percentageRateDifference = pct
  //   ? new Percent(pct.numerator, pct.denominator)
  //   : undefined;

  const isSubmissionPending = useIsTransactionPending(order.createdTxHash);
  const isCancellationPending = useIsTransactionPending(
    order.cancelledTxHash ?? undefined
  );

  // modal and loading
  const [
    { showConfirm, cancellationErrorMessage, attemptingTxn, txHash },
    setCancellationState,
  ] = useState<{
    showConfirm: boolean;
    attemptingTxn: boolean;
    cancellationErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    attemptingTxn: false,
    cancellationErrorMessage: undefined,
    txHash: undefined,
  });

  const handleConfirmDismiss = useCallback(() => {
    setCancellationState({
      showConfirm: false,
      attemptingTxn,
      cancellationErrorMessage,
      txHash,
    });
  }, [attemptingTxn, cancellationErrorMessage, txHash]);

  const handleCancellation = useCallback(() => {
    if (!handleStopLimitOrderCancellation) {
      return;
    }

    setCancellationState({
      attemptingTxn: true,
      showConfirm,
      cancellationErrorMessage: undefined,
      txHash: undefined,
    });

    const orderDetails =
      inputToken?.symbol && outputToken?.symbol && inputAmount && outputAmount
        ? {
            inputTokenSymbol: inputToken.symbol,
            outputTokenSymbol: outputToken.symbol,
            inputAmount: inputAmount.toSignificant(4),
            outputAmount: outputAmount.toSignificant(4),
            maxOutputAmount: maxOutputAmount?.toSignificant(4),
          }
        : undefined;

    handleStopLimitOrderCancellation(order, orderDetails)
      .then(({ hash }) => {
        setCancellationState({
          attemptingTxn: false,
          showConfirm,
          cancellationErrorMessage: undefined,
          txHash: hash,
        });
      })
      .catch((error) => {
        setCancellationState({
          attemptingTxn: false,
          showConfirm,
          cancellationErrorMessage: error.message,
          txHash: undefined,
        });
      });
  }, [
    handleStopLimitOrderCancellation,
    showConfirm,
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    order,
  ]);

  const expireDate = order.createdAt ? (
    new Date(
      (parseInt(order.createdAt) + constants.MAX_LIFETIME_IN_SECONDS) * 1000
    ).toLocaleString()
  ) : (
    <Dots />
  );

  const OrderCard = ({
    showStatusButton = true,
  }: {
    showStatusButton?: boolean;
  }) => (
    <OrderPanel>
      <Container hideInput={true}>
        <RowBetween padding="10px">
          {inputToken ? (
            <CurrencySelect selected={true}>
              <Aligner>
                <CurrencyLogo
                  currency={inputToken ?? undefined}
                  size={"18px"}
                />
                <StyledTokenName>
                  {inputToken?.name ?? <Dots />}
                </StyledTokenName>
              </Aligner>
            </CurrencySelect>
          ) : (
            <Dots />
          )}
          <ArrowWrapper>
            <ArrowRight size="16" color={theme.text1} />
          </ArrowWrapper>
          {outputToken ? (
            <CurrencySelect selected={true}>
              <Aligner>
                <CurrencyLogo
                  currency={outputToken ?? undefined}
                  size={"18px"}
                />
                <StyledTokenName>
                  {outputToken.name ?? <Dots />}
                </StyledTokenName>
              </Aligner>
            </CurrencySelect>
          ) : (
            <Dots />
          )}
          <Spacer />
          {showStatusButton ? (
            <OrderStatus
              clickable={true}
              onClick={() => {
                if (!chainId) return;

                if (order.status === "open" && !isSubmissionPending)
                  setCancellationState({
                    attemptingTxn: false,
                    cancellationErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined,
                  });
                else if (order.status === "open" && isSubmissionPending)
                  window.open(
                    getExplorerLink(
                      chainId,
                      order.createdTxHash,
                      ExplorerDataType.TRANSACTION
                    ),
                    "_blank"
                  );
                else if (order.status === "cancelled" && order.cancelledTxHash)
                  window.open(
                    getExplorerLink(
                      chainId,
                      order.cancelledTxHash,
                      ExplorerDataType.TRANSACTION
                    ),
                    "_blank"
                  );
                else if (order.status === "executed" && order.executedTxHash)
                  window.open(
                    getExplorerLink(
                      chainId,
                      order.executedTxHash,
                      ExplorerDataType.TRANSACTION
                    ),
                    "_blank"
                  );
              }}
              status={
                isCancellationPending || isSubmissionPending
                  ? "pending"
                  : order.status
              }
            >
              {isSubmissionPending
                ? "pending"
                : isCancellationPending
                ? "cancelling"
                : order.status === "open"
                ? "cancel"
                : order.status}
              {isSubmissionPending || isCancellationPending ? <Dots /> : null}
            </OrderStatus>
          ) : null}
        </RowBetween>

        <Aligner style={{ marginTop: "10px" }}>
          <OrderRow>
            <RowBetween>
              <Text fontWeight={500} fontSize={14} color={theme.text1}>
                {`Stop Limit trigger price at ${
                  inputAmount ? inputAmount.toSignificant(4) : "-"
                } ${inputAmount?.currency.symbol ?? ""} for ${
                  maxOutputAmount ? maxOutputAmount?.toSignificant(4) : "-"
                } ${maxOutputAmount?.currency.symbol ?? ""}`}
              </Text>
            </RowBetween>
          </OrderRow>
        </Aligner>
        <Aligner
          style={{
            marginTop: "-2px",
            marginBottom: order.status === "open" ? "1px" : "20px",
          }}
        >
          <OrderRow>
            <RowBetween>
              <Text
                fontWeight={400}
                fontSize={12}
                color={theme.text1}
                style={{ marginRight: "4px", marginTop: "2px" }}
              >
                Current price:
              </Text>
              {trade ? (
                <TradePrice
                  price={trade.executionPrice}
                  showInverted={showCurrentPriceInverted}
                  setShowInverted={setShowCurrentPriceInverted}
                  fontWeight={500}
                  fontSize={12}
                />
              ) : (
                <Dots />
              )}
            </RowBetween>
          </OrderRow>
        </Aligner>

        {order.status === "open" ? (
          <>
            <Aligner style={{ marginTop: "-10px" }}>
              <OrderRow>
                <RowBetween>
                  <Text
                    fontWeight={400}
                    fontSize={12}
                    color={theme.text1}
                    style={{ marginRight: "4px", marginTop: "2px" }}
                  >
                    Stop price:
                  </Text>
                  {maxPrice ? (
                    <TradePrice
                      price={maxPrice}
                      showInverted={showExecutionPriceInverted}
                      setShowInverted={setShowExecutionPriceInverted}
                      fontWeight={500}
                      fontSize={12}
                    />
                  ) : (
                    <Dots />
                  )}
                </RowBetween>
              </OrderRow>
            </Aligner>
            <Aligner style={{ marginTop: "-10px" }}>
              <OrderRow>
                <RowBetween>
                  <Text
                    fontWeight={400}
                    fontSize={12}
                    color={theme.text1}
                    style={{ marginRight: "4px", marginTop: "2px" }}
                  >
                    Limit price:
                  </Text>
                  {executionPrice ? (
                    isEthereum ? (
                      <>
                        <MouseoverTooltip
                          text={`The execution price takes into account the gas necessary to execute your order and guarantees that your desired rate is fulfilled, so that the minimum you receive is ${
                            outputAmount ? outputAmount.toSignificant(4) : "-"
                          } ${
                            outputAmount?.currency.symbol ?? ""
                          }. It fluctuates according to gas prices. Current gas price: ${parseFloat(
                            gasPrice ? formatUnits(gasPrice, "gwei") : "-"
                          ).toFixed(0)} GWEI.`}
                        >
                          {ethereumExecutionPrice ? (
                            <TradePrice
                              price={ethereumExecutionPrice}
                              showInverted={showEthereumExecutionPriceInverted}
                              setShowInverted={
                                setShowEthereumExecutionPriceInverted
                              }
                              fontWeight={500}
                              fontSize={12}
                            />
                          ) : ethereumExecutionPrice === undefined ? (
                            <TYPE.body fontSize={14} color={theme.text2}>
                              <HoverInlineText text={"never executes"} />
                            </TYPE.body>
                          ) : (
                            <Dots />
                          )}
                        </MouseoverTooltip>
                      </>
                    ) : (
                      <TradePrice
                        price={executionPrice}
                        showInverted={showExecutionPriceInverted}
                        setShowInverted={setShowExecutionPriceInverted}
                        fontWeight={500}
                        fontSize={12}
                      />
                    )
                  ) : (
                    <Dots />
                  )}
                </RowBetween>
              </OrderRow>
            </Aligner>
            <Aligner style={{ marginTop: "-10px" }}>
              <OrderRow>
                <RowBetween>
                  <Text
                    fontWeight={400}
                    fontSize={12}
                    color={theme.text1}
                    style={{ marginRight: "4px", marginTop: "2px" }}
                  >
                    Expiry Date: {expireDate}
                  </Text>
                </RowBetween>
              </OrderRow>
            </Aligner>
          </>
        ) : null}
      </Container>
    </OrderPanel>
  );

  return (
    <>
      <ConfirmCancellationModal
        isOpen={showConfirm}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        onConfirm={handleCancellation}
        swapErrorMessage={cancellationErrorMessage}
        onDismiss={handleConfirmDismiss}
        topContent={() => (
          <>
            <br />
            <OrderCard showStatusButton={false} />
          </>
        )}
      />
      <OrderCard />
    </>
  );
}
