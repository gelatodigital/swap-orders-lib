import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import {
  useOrderActionHandlers,
  useOrderState,
} from "../../state/gorder/hooks";
import { Field } from "../../types";
import { Currency, Price } from "@uniswap/sdk-core";
import { Rate } from "../../state/gorder/actions";
import { useWeb3 } from "../../web3";
import { useTransactionAdder } from "../../state/gtransactions/hooks";
import useGelatoRangeOrdersLib from "./useGelatoRangeOrdersLib";
import { useCurrency, useToken } from "../../hooks/Tokens";
import {
  computePoolAddress,
  FACTORY_ADDRESS,
  FeeAmount,
} from "@uniswap/v3-sdk";
import { ethers, utils } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import {
  RangeOrderData,
  RangeOrderStatus,
  RangeOrderPayload,
} from "@gelatonetwork/range-orders-lib";
import { PayableOverrides } from "@ethersproject/contracts";
import { NATIVE } from "../../constants/addresses";
import { MAX_FEE_AMOUNTS } from "../../constants/misc";
import { usePool } from "../../hooks/usePools";
import { useDispatch } from "react-redux";
import {
  setRangeUpperEnabled,
  setRangeLowerEnabled,
  setCurrentTick,
  setSelectedTick,
} from "../../state/gorder/actions";
import { getPendingLSOrdersID } from "../../utils/localStorageOrders";

export interface GelatoRangeOrdersHandlers {
  handleRangeOrderSubmission: (orderToSubmit: {
    inputAmount: BigNumber;
  }) => Promise<TransactionResponse>;
  handleRangeOrderCancellation: (
    order: RangeOrderData,
    orderDetails?: {
      inputTokenSymbol: string;
      outputTokenSymbol: string;
      inputAmount: string;
      outputAmount: string;
    }
  ) => Promise<TransactionResponse>;
  handleInput: (field: Field, value: string) => void;
  updateRange: () => void;
  handleCurrencySelection: (
    field: Field.INPUT | Field.OUTPUT,
    currency: Currency
  ) => void;
  handleSwitchTokens: () => void;
  handleRateType: (rateType: Rate, price?: Price<Currency, Currency>) => void;
  handleRangeSelection: (rangePrice: string) => void;
}

export default function useGelatoRangeOrdersHandlers(): GelatoRangeOrdersHandlers {
  const { chainId, account } = useWeb3();

  const gelatoRangeOrders = useGelatoRangeOrdersLib();

  const addTransaction = useTransactionAdder();

  const nativeCurrency = useCurrency(NATIVE);

  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRateType,
    onRangeChange,
  } = useOrderActionHandlers();

  const {
    priceValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    zeroForOne,
    range,
    rateType,
    selectedTick,
  } = useOrderState();

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const inputToken = useToken(inputCurrency?.wrapped.address);
  const outputToken = useToken(outputCurrency?.wrapped.address);
  const [poolAddress, setPoolAddress] = useState<string>();
  const [, pool] = usePool(
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    FeeAmount.MEDIUM
  );
  const dispatch = useDispatch();

  // Current tick is fetched from Uniswap Pool Contract
  // If zeroForOne upper and lower ticks are enabled only when smaller
  // If not zeroForOne upper and lower ticks are enabled only when bigger
  const computeCurrentTick = useCallback(async () => {
    if (!pool) {
      dispatch(setRangeUpperEnabled(false));
      dispatch(setRangeLowerEnabled(false));
      return;
    }
    // const { tick } = await poolContract.slot0();
    const { tickCurrent: tick } = pool;
    dispatch(setCurrentTick(tick));
    const { upper, lower } = range;
    if (zeroForOne) {
      if (upper > tick) {
        dispatch(setRangeUpperEnabled(true));
      } else {
        dispatch(setRangeUpperEnabled(false));
      }
      if (lower > tick) {
        dispatch(setRangeLowerEnabled(true));
      } else {
        dispatch(setRangeLowerEnabled(false));
      }
    } else {
      if (upper < tick) {
        dispatch(setRangeUpperEnabled(true));
      } else {
        dispatch(setRangeUpperEnabled(false));
      }
      if (lower < tick) {
        dispatch(setRangeLowerEnabled(true));
      } else {
        dispatch(setRangeLowerEnabled(false));
      }
    }
  }, [dispatch, pool, range, zeroForOne]);

  useEffect(() => {
    if (inputToken && outputToken) {
      const p = computePoolAddress({
        factoryAddress: FACTORY_ADDRESS,
        tokenA: inputToken,
        tokenB: outputToken,
        fee: FeeAmount.LOW,
      });
      setPoolAddress(p);
      computeCurrentTick();
    }
  }, [computeCurrentTick, inputToken, outputToken]);

  const handleInput = useCallback(
    (field: Field, value: string) => {
      onUserInput(field, value);
    },
    [onUserInput]
  );

  const updateRange = useCallback(() => {
    const update = async () => {
      if (!gelatoRangeOrders) {
        throw new Error("Could not reach Gelato Range Orders library");
      }
      if (!chainId) {
        throw new Error("No chainId");
      }
      if (!gelatoRangeOrders?.signer) {
        throw new Error("No signer");
      }
      if (!poolAddress) {
        throw new Error("No pool");
      }
      if (gelatoRangeOrders && priceValue && Number(priceValue) > 0) {
        const prices = await gelatoRangeOrders.getNearestPrice(
          poolAddress,
          utils.parseUnits(
            rateType === Rate.MUL
              ? zeroForOne
                ? priceValue
                : (1 / Number(priceValue)).toPrecision(10)
              : zeroForOne
              ? (1 / Number(priceValue)).toPrecision(10)
              : priceValue,
            18
          )
        );
        const ticks = await gelatoRangeOrders.getNearTicks(
          poolAddress,
          utils.parseUnits(
            rateType === Rate.MUL
              ? zeroForOne
                ? priceValue
                : (1 / Number(priceValue)).toPrecision(10)
              : zeroForOne
              ? (1 / Number(priceValue)).toPrecision(10)
              : priceValue,
            18
          )
        );
        if (prices && ticks) {
          const {
            upperPrice,
            lowerPrice,
          }: { upperPrice: BigNumber; lowerPrice: BigNumber } = prices;
          const { upper, lower }: { upper: number; lower: number } = ticks;
          if (upperPrice && lowerPrice && upper && lower)
            onRangeChange(upper, upperPrice, lower, lowerPrice);
        }
      }
    };
    if (Number(priceValue) > 0) {
      update();
    }
  }, [
    chainId,
    gelatoRangeOrders,
    onRangeChange,
    poolAddress,
    priceValue,
    rateType,
    zeroForOne,
  ]);

  const handleCurrencySelection = useCallback(
    (field: Field.INPUT | Field.OUTPUT, currency: Currency) => {
      onCurrencySelection(field, currency);
      dispatch(setRangeUpperEnabled(false));
      dispatch(setRangeLowerEnabled(false));
    },
    [dispatch, onCurrencySelection]
  );

  const handleSwitchTokens = useCallback(() => {
    onSwitchTokens();
    dispatch(setRangeUpperEnabled(false));
    dispatch(setRangeLowerEnabled(false));
  }, [dispatch, onSwitchTokens]);

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

  const handleRangeOrderSubmission = useCallback(
    async (orderToSubmit: { inputAmount: BigNumber }) => {
      if (!gelatoRangeOrders) {
        throw new Error("Could not reach Gelato Range Orders library");
      }

      if (!chainId) {
        throw new Error("No chainId");
      }

      if (!gelatoRangeOrders?.signer) {
        throw new Error("No signer");
      }

      if (!poolAddress) {
        throw new Error("No pool");
      }

      if (!account) {
        throw new Error("No account");
      }

      const currentTick = pool?.tickCurrent ?? 0;
      const tickSpacing = pool?.tickSpacing ?? 0;
      const lowerTick = currentTick - (currentTick % tickSpacing) + tickSpacing;
      const upperTick = lowerTick + tickSpacing;
      // console.log(currentTick);
      // console.log(lowerTick, upperTick);

      const { amount0, amount1 } = gelatoRangeOrders.getAmountsIn(
        currentTick,
        lowerTick,
        upperTick,
        zeroForOne ? orderToSubmit.inputAmount : ethers.constants.Zero,
        zeroForOne ? ethers.constants.Zero : orderToSubmit.inputAmount,
        BigNumber.from(pool?.sqrtRatioX96.toString()) ?? ethers.constants.Zero
      );

      // console.log(amount0, amount1);
      // console.log(amount0.toString(), amount1.toString());

      // TODO: check if amount0 and amount1 are same after pass them again to gelatoRangeOrders.getAmountsIn
      //
      // const { amount0: amount0d, amount1: amount1d } = gelatoRangeOrders.getAmountsIn(
      //   currentTick,
      //   lowerTick,
      //   upperTick,
      //   amount0,
      //   ethers.constants.Zero,
      //   BigNumber.from(pool?.sqrtRatioX96.toString()) ?? ethers.constants.Zero
      // );
      // console.log(amount0d, amount1d);
      // console.log(amount0d.toString(), amount1d.toString());

      const { order } = await gelatoRangeOrders.encodeRangeOrderSubmission(
        poolAddress,
        zeroForOne,
        selectedTick,
        zeroForOne ? amount0 : amount1,
        account,
        BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString())
      );

      const orderPayload: RangeOrderPayload = {
        pool: poolAddress,
        zeroForOne,
        tickThreshold: selectedTick,
        amountIn: zeroForOne ? amount0 : amount1,
        receiver: account,
        maxFeeAmount: BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
      };
      // console.log(orderPayload);
      const overrides: PayableOverrides = {
        value:
          inputCurrency?.wrapped.address === nativeCurrency?.wrapped.address
            ? BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()).add(amount0)
            : BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
      };
      // console.log(overrides);

      const tx = await gelatoRangeOrders.setRangeOrder(orderPayload, overrides);
      if (!tx) {
        throw new Error("No transaction");
      }
      const now = Math.round(Date.now() / 1000);
      const orderId = getPendingLSOrdersID(chainId, account);
      addTransaction(tx, {
        summary: `Order submission`,
        type: "submission",
        order: ({
          ...order,
          id: BigNumber.from(orderId).add(BigNumber.from("1")),
          pool,
          submittedTxHash: tx?.hash.toLowerCase(),
          status: RangeOrderStatus.Submitted,
          updatedAt: now.toString(),
          feeToken: nativeCurrency?.wrapped.address,
          amountIn:
            inputCurrency?.wrapped.address === nativeCurrency?.wrapped.address
              ? BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()).add(
                  orderToSubmit.inputAmount
                )
              : BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
        } as unknown) as RangeOrderData,
      });

      return tx;
    },
    [
      account,
      addTransaction,
      chainId,
      gelatoRangeOrders,
      inputCurrency?.wrapped.address,
      nativeCurrency?.wrapped.address,
      pool,
      poolAddress,
      selectedTick,
      zeroForOne,
    ]
  );

  const handleRangeOrderCancellation = useCallback(
    async (
      order: RangeOrderData,
      orderDetails?: {
        inputTokenSymbol: string;
        outputTokenSymbol: string;
        inputAmount: string;
        outputAmount: string;
      }
    ) => {
      if (!gelatoRangeOrders) {
        throw new Error("Could not reach Gelato Range Orders library");
      }

      if (!chainId) {
        throw new Error("No chainId");
      }

      if (!gelatoRangeOrders?.signer) {
        throw new Error("No signer");
      }

      if (!order.pool) {
        throw new Error("No pool");
      }

      if (!account) {
        throw new Error("No account");
      }

      if (!order.amountIn) {
        throw new Error("No amount in");
      }

      if (!order.tickThreshold) {
        throw new Error("No tick threshold");
      }

      const orderPayload: RangeOrderPayload = {
        pool: order.pool,
        zeroForOne,
        amountIn: order.amountIn,
        receiver: account,
        maxFeeAmount: BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
        tickThreshold: Number(order.tickThreshold.toString()),
      };
      const tx = await gelatoRangeOrders.cancelRangeOrder(
        order.id,
        orderPayload,
        order.startTime?.toNumber() ?? 0
      );
      if (!tx) {
        throw new Error("No transaction");
      }
      const now = Math.round(Date.now() / 1000);

      const summary = orderDetails
        ? `Order cancellation: Swap ${orderDetails.inputAmount} ${orderDetails.inputTokenSymbol} for ${orderDetails.outputAmount} ${orderDetails.outputTokenSymbol}`
        : "Order cancellation";

      addTransaction(tx, {
        summary,
        type: "cancellation",
        order: {
          ...order,
          updatedAt: BigNumber.from(now.toString()),
          status: RangeOrderStatus.Cancelled,
          cancelledTxHash: tx?.hash.toLowerCase(),
        },
      });
      return tx;
    },
    [account, addTransaction, chainId, gelatoRangeOrders, zeroForOne]
  );

  const handleRangeSelection = useCallback(
    async (tick) => {
      if (tick) {
        dispatch(setSelectedTick(tick));
      }
    },
    [dispatch]
  );

  return {
    handleInput,
    updateRange,
    handleCurrencySelection,
    handleSwitchTokens,
    handleRateType,
    handleRangeOrderSubmission,
    handleRangeSelection,
    handleRangeOrderCancellation,
  };
}
