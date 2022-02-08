import { useCallback } from "react";
import { StopLimitOrder } from "@gelatonetwork/limit-orders-lib";
import { BigNumber } from "@ethersproject/bignumber";
import { Overrides } from "@ethersproject/contracts";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { useOrderActionHandlers } from "../../state/gstoplimit/hooks";
import { Field } from "../../types";
import { Currency, Price } from "@uniswap/sdk-core";
import { Rate } from "../../state/gstoplimit/actions";
import { useWeb3 } from "../../web3";
import { useTransactionAdder } from "../../state/gstoplimittransactions/hooks";
import useGasPrice from "../useGasPrice";
import useGelatoStopLimitOrdersLib from "./useGelatoStopLimitOrdersLib";

export interface GelatoStopLimitOrdersHandlers {
  handleStopLimitOrderSubmission: (orderToSubmit: {
    inputToken: string;
    outputToken: string;
    inputAmount: string;
    outputAmount: string;
    owner: string;
    overrides?: Overrides;
  }) => Promise<TransactionResponse>;
  handleStopLimitOrderCancellation: (
    order: StopLimitOrder,
    orderDetails?: {
      inputTokenSymbol: string;
      outputTokenSymbol: string;
      inputAmount: string;
      outputAmount: string;
      maxOutputAmount: string | undefined;
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

export default function useGelatoStopLimitOrdersHandlers(): GelatoStopLimitOrdersHandlers {
  const { chainId, account } = useWeb3();

  const gelatoStopLimitOrders = useGelatoStopLimitOrdersLib();

  const addStopLimitTransaction = useTransactionAdder();

  const gasPrice = useGasPrice();

  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRateType,
  } = useOrderActionHandlers();

  const handleStopLimitOrderSubmission = useCallback(
    async (
      orderToSubmit: {
        inputToken: string;
        outputToken: string;
        inputAmount: string;
        outputAmount: string;
        owner: string;
      },
      overrides?: Overrides
    ) => {
      if (!gelatoStopLimitOrders) {
        throw new Error("Could not reach Gelato Limit Orders library");
      }

      if (!chainId) {
        throw new Error("No chainId");
      }

      if (!gelatoStopLimitOrders?.signer) {
        throw new Error("No signer");
      }

      const {
        witness,
        payload,
        order,
      } = await gelatoStopLimitOrders.encodeStopLimitOrderSubmissionWithSecret(
        orderToSubmit.inputToken,
        orderToSubmit.outputToken,
        orderToSubmit.inputAmount,
        orderToSubmit.outputAmount,
        orderToSubmit.owner
      );

      const tx = await gelatoStopLimitOrders.signer.sendTransaction({
        ...(overrides ?? { gasPrice }),
        to: payload.to,
        data: payload.data,
        value: BigNumber.from(payload.value),
      });

      const now = Math.round(Date.now() / 1000);

      addStopLimitTransaction(tx, {
        summary: `Order submission`,
        type: "submission",
        order: {
          ...order,
          createdTxHash: tx?.hash.toLowerCase(),
          witness,
          status: "open",
          updatedAt: now.toString(),
        } as StopLimitOrder,
      });

      return tx;
    },
    [addStopLimitTransaction, chainId, gasPrice, gelatoStopLimitOrders]
  );

  const handleStopLimitOrderCancellation = useCallback(
    async (
      orderToCancel: StopLimitOrder,
      orderDetails?: {
        inputTokenSymbol: string;
        outputTokenSymbol: string;
        inputAmount: string;
        outputAmount: string;
        maxOutputAmount: string | undefined;
      },
      overrides?: Overrides
    ) => {
      if (!gelatoStopLimitOrders) {
        throw new Error("Could not reach Gelato Limit Orders library");
      }

      if (!chainId) {
        throw new Error("No chainId");
      }

      if (!account) {
        throw new Error("No account");
      }

      const checkIfOrderExists = Boolean(
        orderToCancel.module &&
          orderToCancel.inputToken &&
          orderToCancel.owner &&
          orderToCancel.witness &&
          orderToCancel.data
      );

      const tx = await gelatoStopLimitOrders.cancelStopLimitOrder(
        orderToCancel,
        checkIfOrderExists,
        overrides ?? { gasPrice, gasLimit: 600000 }
      );

      const now = Math.round(Date.now() / 1000);

      const summary = orderDetails
        ? `Order cancellation: Stop Limit ${orderDetails.inputAmount} ${orderDetails.inputTokenSymbol} valid at ${orderDetails.maxOutputAmount} ${orderDetails.outputTokenSymbol}`
        : "Order cancellation";

      addStopLimitTransaction(tx, {
        summary,
        type: "cancellation",
        order: {
          ...orderToCancel,
          updatedAt: now.toString(),
          status: "cancelled",
          cancelledTxHash: tx?.hash.toLowerCase(),
        },
      });

      return tx;
    },
    [gelatoStopLimitOrders, chainId, account, gasPrice, addStopLimitTransaction]
  );

  const handleInput = useCallback(
    (field: Field, value: string) => {
      onUserInput(field, value);
    },
    [onUserInput]
  );

  const handleCurrencySelection = useCallback(
    (field: Field.INPUT | Field.OUTPUT, currency: Currency) => {
      onCurrencySelection(field, currency);
    },
    [onCurrencySelection]
  );

  const handleSwitchTokens = useCallback(() => {
    onSwitchTokens();
  }, [onSwitchTokens]);

  const handleRateType = useCallback(
    async (rateType: Rate, price?: Price<Currency, Currency>) => {
      if (rateType === Rate.MUL) {
        if (price) onUserInput(Field.PRICE, price.invert().toSignificant(6));
        onChangeRateType(Rate.DIV);
      } else {
        if (price) onUserInput(Field.PRICE, price.toSignificant(6));
        onChangeRateType(Rate.MUL);
      }
    },
    [onChangeRateType, onUserInput]
  );

  return {
    handleStopLimitOrderSubmission,
    handleStopLimitOrderCancellation,
    handleInput,
    handleCurrencySelection,
    handleSwitchTokens,
    handleRateType,
  };
}
