import React, { useCallback, useMemo, useState, useEffect } from "react";
import styled, { DefaultTheme } from "styled-components/macro";
import { darken } from "polished";
import { ArrowRight } from "react-feather";
import { Text } from "rebass";
import { RowBetween } from "../../Row";
import { RangeOrderData as Order } from "@gelatonetwork/range-orders-lib";
import useTheme from "../../../hooks/useTheme";
import { useCurrency } from "../../../hooks/Tokens";
import CurrencyLogo from "../../CurrencyLogo";
import { useGelatoRangeOrdersHandlers } from "../../../hooks/gelato";
import { CurrencyAmount, Price } from "@uniswap/sdk-core";
import ConfirmCancellationModal from "../ConfirmCancellationModal";
import { useTradeExactIn } from "../../../hooks/useTrade";
import { Dots } from "../../order/styleds";
import { useWeb3 } from "../../../web3";
import { ButtonGray } from "../../Button";
import { useIsTransactionPending } from "../../../state/gtransactions/hooks";
import {
  ExplorerDataType,
  getExplorerLink,
} from "../../../utils/getExplorerLink";
import TradePrice from "../../order/TradePrice";
import useGelatoRangeOrdersLib from "../../../hooks/gelato/useGelatoRangeOrdersLib";
import { usePoolContract } from "../../../hooks/useContract";
import { BigNumber, constants } from "ethers";
import { MAX_FEE_AMOUNTS } from "../../../constants/misc";
import { getAdjustAmountFrom18 } from "../../../utils/adjustCurrencyDecimals";

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

export default function OrderCard({ order }: { order: Order }) {
  const theme = useTheme();

  const { chainId, handler } = useWeb3();

  const [
    showExecutionPriceInverted,
    setShowExecutionPriceInverted,
  ] = useState<boolean>(false);

  const [
    showCurrentPriceInverted,
    setShowCurrentPriceInverted,
  ] = useState<boolean>(true);

  const { handleRangeOrderCancellation } = useGelatoRangeOrdersHandlers();

  const gelatoLibrary = useGelatoRangeOrdersLib();

  const poolContract = usePoolContract(order.pool);

  const [token0, setToken0] = useState<string | undefined>();
  const [token1, setToken1] = useState<string | undefined>();
  const [minReturnRaw, setMinReturn] = useState<BigNumber | undefined>();

  const inputToken = useCurrency(order.zeroForOne ? token0 : token1);
  const outputToken = useCurrency(order.zeroForOne ? token1 : token0);

  const inputAmount = useMemo(
    () =>
      inputToken && order.amountIn
        ? CurrencyAmount.fromRawAmount(inputToken, order.amountIn.toString())
        : undefined,
    [inputToken, order.amountIn]
  );

  const outputAmount = useMemo(
    () =>
      outputToken && minReturnRaw
        ? CurrencyAmount.fromRawAmount(
            outputToken,
            getAdjustAmountFrom18(
              minReturnRaw.toString(),
              outputToken.decimals
            ).toString()
          )
        : undefined,
    [outputToken, minReturnRaw]
  );

  useEffect(() => {
    async function getTokenList() {
      if (poolContract) {
        const t0 = await poolContract.token0();
        setToken0(t0);
        const t1 = await poolContract.token1();
        setToken1(t1);
      }
    }
    getTokenList();
  }, [poolContract]);

  useEffect(() => {
    async function getMinReturn() {
      if (
        gelatoLibrary &&
        chainId &&
        order.pool &&
        typeof order.zeroForOne !== "undefined" &&
        order.tickThreshold &&
        order.amountIn &&
        order.receiver
      ) {
        const mr = await gelatoLibrary.getMinReturn({
          pool: order.pool,
          zeroForOne: order.zeroForOne,
          tickThreshold: order.tickThreshold.toNumber(),
          amountIn: order.amountIn,
          minLiquidity: constants.Zero,
          receiver: order.receiver,
          maxFeeAmount: BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
        });
        setMinReturn(mr);
      }
    }
    getMinReturn();
  }, [chainId, gelatoLibrary, order]);

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

  const trade = useTradeExactIn(inputAmount, outputToken ?? undefined, handler);

  const isSubmissionPending = useIsTransactionPending(
    order.submittedTxHash ? order.submittedTxHash.toString() : undefined
  );
  const isCancellationPending = useIsTransactionPending(
    order.cancelledTxHash ? order.cancelledTxHash.toString() : undefined
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
    if (!handleRangeOrderCancellation) {
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
          }
        : undefined;

    handleRangeOrderCancellation(order, orderDetails)
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
    handleRangeOrderCancellation,
    showConfirm,
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    order,
  ]);

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

                if (order.status === "submitted" && !isSubmissionPending)
                  setCancellationState({
                    attemptingTxn: false,
                    cancellationErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined,
                  });
                else if (order.status === "submitted" && isSubmissionPending)
                  window.open(
                    getExplorerLink(
                      chainId,
                      order.submittedTxHash
                        ? order.submittedTxHash.toString()
                        : "",
                      ExplorerDataType.TRANSACTION
                    ),
                    "_blank"
                  );
                else if (order.status === "cancelled" && order.cancelledTxHash)
                  window.open(
                    getExplorerLink(
                      chainId,
                      order.cancelledTxHash
                        ? order.cancelledTxHash.toString()
                        : "",
                      ExplorerDataType.TRANSACTION
                    ),
                    "_blank"
                  );
                else if (order.status === "executed" && order.executedTxHash)
                  window.open(
                    getExplorerLink(
                      chainId,
                      order.executedTxHash
                        ? order.executedTxHash.toString()
                        : "",
                      ExplorerDataType.TRANSACTION
                    ),
                    "_blank"
                  );
              }}
              status={
                isCancellationPending || isSubmissionPending
                  ? "pending"
                  : order.status ?? "pending"
              }
            >
              {isSubmissionPending
                ? "pending"
                : isCancellationPending
                ? "cancelling"
                : order.status === "submitted"
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
                {`Sell ${inputAmount ? inputAmount.toSignificant(4) : "-"} ${
                  inputAmount?.currency.symbol ?? ""
                } for ${outputAmount ? outputAmount.toSignificant(4) : "-"} ${
                  outputAmount?.currency.symbol ?? ""
                }`}
              </Text>
            </RowBetween>
          </OrderRow>
        </Aligner>
        <Aligner
          style={{
            marginTop: "-2px",
            marginBottom: order.status === "submitted" ? "1px" : "20px",
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

        {order.status === "submitted" ? (
          <Aligner style={{ marginTop: "-10px" }}>
            <OrderRow>
              <RowBetween>
                <Text
                  fontWeight={400}
                  fontSize={12}
                  color={theme.text1}
                  style={{ marginRight: "4px", marginTop: "2px" }}
                >
                  Execution price:
                </Text>
                {executionPrice ? (
                  <TradePrice
                    price={executionPrice}
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
