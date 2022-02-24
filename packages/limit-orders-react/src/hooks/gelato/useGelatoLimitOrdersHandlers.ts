import { useCallback } from "react";
import { Order } from "@gelatonetwork/limit-orders-lib";
import { BigNumber } from "@ethersproject/bignumber";
import { Overrides } from "@ethersproject/contracts";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { isEthereumChain } from "@gelatonetwork/limit-orders-lib/dist/utils";

import { useOrderActionHandlers } from "../../state/gorder/hooks";
import { Field } from "../../types";
import { Currency, Price } from "@uniswap/sdk-core";
import { Rate } from "../../state/gorder/actions";
import { useWeb3 } from "../../web3";
import { useTransactionAdder } from "../../state/gtransactions/hooks";
import useGelatoLimitOrdersLib from "./useGelatoLimitOrdersLib";

export interface GelatoLimitOrdersHandlers {
  handleLimitOrderSubmission: (orderToSubmit: {
    inputToken: string;
    outputToken: string;
    inputAmount: string;
    outputAmount: string;
    owner: string;
    overrides?: Overrides;
  }) => Promise<TransactionResponse>;
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

export default function useGelatoLimitOrdersHandlers(): GelatoLimitOrdersHandlers {
  const { chainId, account } = useWeb3();

  const gelatoLimitOrders = useGelatoLimitOrdersLib();

  const addTransaction = useTransactionAdder();

  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRateType,
  } = useOrderActionHandlers();

  const handleLimitOrderSubmission = useCallback(
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
      if (!gelatoLimitOrders) {
        throw new Error("Could not reach Gelato Limit Orders library");
      }

      if (!chainId) {
        throw new Error("No chainId");
      }

      if (!gelatoLimitOrders?.signer) {
        throw new Error("No signer");
      }

      const {
        witness,
        payload,
        order,
      } = await gelatoLimitOrders.encodeLimitOrderSubmissionWithSecret(
        orderToSubmit.inputToken,
        orderToSubmit.outputToken,
        orderToSubmit.inputAmount,
        orderToSubmit.outputAmount,
        orderToSubmit.owner
      );

      const tx = await gelatoLimitOrders.signer.sendTransaction({
        ...(overrides ?? {}),
        to: payload.to,
        data: payload.data,
        value: BigNumber.from(payload.value),
      });

      const now = Math.round(Date.now() / 1000);

      addTransaction(tx, {
        summary: `Order submission`,
        type: "submission",
        order: {
          ...order,
          createdTxHash: tx?.hash.toLowerCase(),
          witness,
          status: "open",
          updatedAt: now.toString(),
          createdAt: now.toString(),
        } as Order,
      });

      return tx;
    },
    [addTransaction, chainId, gelatoLimitOrders]
  );

  const handleLimitOrderCancellation = useCallback(
    async (
      orderToCancel: Order,
      orderDetails?: {
        inputTokenSymbol: string;
        outputTokenSymbol: string;
        inputAmount: string;
        outputAmount: string;
      },
      overrides?: Overrides
    ) => {
      if (!gelatoLimitOrders) {
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

      const tx = await gelatoLimitOrders.cancelLimitOrder(
        orderToCancel,
        checkIfOrderExists,
        overrides ?? {
          gasLimit: isEthereumChain(chainId) ? 600_000 : 2_000_000,
        }
      );

      const now = Math.round(Date.now() / 1000);

      const summary = orderDetails
        ? `Order cancellation: Swap ${orderDetails.inputAmount} ${orderDetails.inputTokenSymbol} for ${orderDetails.outputAmount} ${orderDetails.outputTokenSymbol}`
        : "Order cancellation";

      addTransaction(tx, {
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
    [gelatoLimitOrders, chainId, account, addTransaction]
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
    handleLimitOrderSubmission,
    handleLimitOrderCancellation,
    handleInput,
    handleCurrencySelection,
    handleSwitchTokens,
    handleRateType,
  };
}
