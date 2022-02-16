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
import { utils } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import {
  RangeOrderData,
  RangeOrderStatus,
  RangeOrderPayload,
} from "@gelatonetwork/range-orders-lib";
import { PayableOverrides } from "@ethersproject/contracts";
import { NATIVE } from "../../constants/addresses";
import { MAX_FEE_AMOUNTS } from "../../constants/misc";
import { usePoolContract } from "../useContract";
import { useDispatch } from "react-redux";
import {
  setRangeUpperEnabled,
  setRangeLowerEnabled,
  setCurrentTick,
  setSelectedTick,
} from "../../state/gorder/actions";

export interface GelatoRangeOrdersHandlers {
  handleRangeOrderSubmission: (orderToSubmit: {
    inputAmount: BigNumber;
  }) => Promise<TransactionResponse>;
  handleRangeOrderCancellation: (
    order: RangeOrderData
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
  } = useOrderState();
  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const inputToken = useToken(inputCurrency?.wrapped.address);
  const outputToken = useToken(outputCurrency?.wrapped.address);
  const [pool, setPool] = useState<string>();
  const [tickThreshold, setTickThreshold] = useState<number>(0);
  const poolContract = usePoolContract(pool);
  const dispatch = useDispatch();

  // Current tick is fetched from Uniswap Pool Contract
  // If zeroForOne upper and lower ticks are enabled only when smaller
  // If not zeroForOne upper and lower ticks are enabled only when bigger
  const computeCurrentTick = useCallback(async () => {
    console.log(">>>>>>>>>>> compute ticks >>>>>>>>>>>>>>");
    if (!poolContract) {
      dispatch(setRangeUpperEnabled(false));
      dispatch(setRangeLowerEnabled(false));
      return;
    }
    const { tick } = await poolContract.slot0();
    dispatch(setCurrentTick(tick));
    console.log(tick);
    const { upper, lower } = range;
    console.log(rateType);
    dispatch(setRangeUpperEnabled(true));
    dispatch(setRangeLowerEnabled(true));
    // if (rateType === Rate.MUL) {
    //   if (zeroForOne) {
    //     if (tick < upper) {
    //       dispatch(setRangeUpperEnabled(true));
    //     } else {
    //       dispatch(setRangeUpperEnabled(false));
    //     }
    //     if (tick < lower) {
    //       dispatch(setRangeLowerEnabled(true));
    //     } else {
    //       dispatch(setRangeLowerEnabled(false));
    //     }
    //   } else {
    //     if (upper < tick) {
    //       dispatch(setRangeUpperEnabled(true));
    //     } else {
    //       dispatch(setRangeUpperEnabled(false));
    //     }
    //     if (lower < tick) {
    //       dispatch(setRangeLowerEnabled(true));
    //     } else {
    //       dispatch(setRangeLowerEnabled(false));
    //     }
    //   }
    // } else if (rateType === Rate.DIV) {
    //   if (zeroForOne) {
    //     if (upper < tick) {
    //       dispatch(setRangeUpperEnabled(true));
    //     } else {
    //       dispatch(setRangeUpperEnabled(false));
    //     }
    //     if (lower < tick) {
    //       dispatch(setRangeLowerEnabled(true));
    //     } else {
    //       dispatch(setRangeLowerEnabled(false));
    //     }
    //   } else {
    //     if (tick < upper) {
    //       dispatch(setRangeUpperEnabled(true));
    //     } else {
    //       dispatch(setRangeUpperEnabled(false));
    //     }
    //     if (tick < lower) {
    //       dispatch(setRangeLowerEnabled(true));
    //     } else {
    //       dispatch(setRangeLowerEnabled(false));
    //     }
    //   }
    // }
  }, [dispatch, poolContract, range, rateType, zeroForOne]);

  useEffect(() => {
    if (inputToken && outputToken) {
      const p = computePoolAddress({
        factoryAddress: FACTORY_ADDRESS,
        tokenA: inputToken,
        tokenB: outputToken,
        fee: FeeAmount.LOW,
      });
      setPool(p);
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
      console.log("----------> Updating Range Prices <----------");
      if (!gelatoRangeOrders) {
        throw new Error("Could not reach Gelato Range Orders library");
      }
      if (!chainId) {
        throw new Error("No chainId");
      }
      if (!gelatoRangeOrders?.signer) {
        throw new Error("No signer");
      }
      if (!pool) {
        throw new Error("No pool");
      }
      if (
        gelatoRangeOrders &&
        inputToken &&
        outputToken &&
        priceValue &&
        Number(priceValue) > 0
      ) {
        console.log("============ Try to parse rate ================");
        console.log(priceValue);
        const tokenA =
          parseInt(inputToken?.wrapped.address, 16) <
          parseInt(outputToken?.wrapped.address, 16)
            ? inputToken
            : outputToken;
        console.log("tokenA.decimals =====>>>>", tokenA.decimals);
        const tokenB =
          parseInt(inputToken?.wrapped.address, 16) <
          parseInt(outputToken?.wrapped.address, 16)
            ? outputToken
            : inputToken;
        console.log("tokenB.decimals =====>>>>", tokenB.decimals);
        console.log(`Pool tokens: ${tokenA.symbol} -> ${tokenB.symbol}`);
        console.log(
          `Trade tokens: ${inputToken.symbol} -> ${outputToken.symbol}`
        );
        console.log(zeroForOne);
        const rate =
          rateType === Rate.MUL
            ? zeroForOne
              ? Number(priceValue).toFixed(tokenA.decimals)
              : (1 / Number(priceValue)).toFixed(tokenA.decimals)
            : zeroForOne
            ? (1 / Number(priceValue)).toFixed(tokenA.decimals)
            : Number(priceValue).toFixed(tokenA.decimals);
        console.log("rate: ", rate);
        const parsedRate = utils.parseUnits(rate, tokenA.decimals);
        console.log(
          "parsedRate >>>>>>>>>> ",
          utils.formatUnits(parsedRate, tokenA.decimals)
        );
        const prices = await gelatoRangeOrders.getNearestPrice(
          pool,
          parsedRate
        );
        console.log("prices", prices);
        const ticks = await gelatoRangeOrders.getNearTicks(pool, parsedRate);
        console.log("ticks", ticks);
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
    inputToken,
    onRangeChange,
    outputToken,
    pool,
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

      if (!pool) {
        throw new Error("No pool");
      }

      if (!account) {
        throw new Error("No account");
      }

      const { order } = await gelatoRangeOrders.encodeRangeOrderSubmission(
        pool,
        zeroForOne,
        tickThreshold,
        orderToSubmit.inputAmount,
        account,
        BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString())
      );

      const orderPayload: RangeOrderPayload = {
        pool,
        zeroForOne,
        tickThreshold,
        amountIn: orderToSubmit.inputAmount,
        receiver: account,
        maxFeeAmount: BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
      };
      const overrides: PayableOverrides = {
        value:
          inputCurrency?.wrapped.address === nativeCurrency?.wrapped.address
            ? BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()).add(
                orderToSubmit.inputAmount
              )
            : BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
      };
      console.log(orderPayload);
      console.log(overrides);

      const tx = await gelatoRangeOrders.setRangeOrder(orderPayload, overrides);
      if (!tx) {
        throw new Error("No transaction");
      }
      const now = Math.round(Date.now() / 1000);
      addTransaction(tx, {
        summary: `Order submission`,
        type: "submission",
        order: ({
          ...order,
          id: order.id.toString(),
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
      tickThreshold,
      zeroForOne,
    ]
  );

  const handleRangeOrderCancellation = useCallback(
    async (order: RangeOrderData) => {
      console.log("Will cancel order...");
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
      console.log(orderPayload);
      console.log(order.id);
      console.log(order.startTime?.toNumber() ?? 0);
      const tx = await gelatoRangeOrders.cancelRangeOrder(
        order.id,
        orderPayload,
        order.startTime?.toNumber() ?? 0
      );
      if (!tx) {
        throw new Error("No transaction");
      }
      return tx;
    },
    [account, chainId, gelatoRangeOrders, zeroForOne]
  );

  const handleRangeSelection = useCallback(async (tick) => {
    if (tick) {
      dispatch(setSelectedTick(tick));
    }
  }, []);

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
