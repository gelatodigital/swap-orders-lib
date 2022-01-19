import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useSelector } from "react-redux";
import { useOrderActionHandlers } from "../../state/gorder/hooks";
import { Field } from "../../types";
import { Currency, Price } from "@uniswap/sdk-core";
import { Rate } from "../../state/gorder/actions";
import { useWeb3 } from "../../web3";
import { useTransactionAdder } from "../../state/gtransactions/hooks";
import useGelatoRangeOrdersLib from "./useGelatoRangeOrdersLib";
import { useCurrency, useToken } from "../../hooks/Tokens";
import { AppState } from "../../state";
import {
  computePoolAddress,
  FACTORY_ADDRESS,
  FeeAmount,
} from "@uniswap/v3-sdk";
import { parseUnits } from "ethers/lib/utils";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { RangeOrderData, RangeOrderStatus, RangeOrderPayload } from "@gelatonetwork/range-orders-lib";
import { Overrides } from "@ethersproject/contracts";

export interface GelatoRangeOrdersHandlers {
  handleRangeOrderSubmission: (orderToSubmit: {
    inputAmount: BigNumber;
  }) => Promise<TransactionResponse>;
  // handleLimitOrderCancellation: (
  //   order: RangeOrderData,
  //   orderDetails?: {
  //     inputTokenSymbol: string;
  //     outputTokenSymbol: string;
  //     inputAmount: string;
  //     outputAmount: string;
  //   },
  //   overrides?: Overrides
  // ) => Promise<TransactionResponse>;
  handleInput: (field: Field, value: string) => void;
  handleCurrencySelection: (
    field: Field.INPUT | Field.OUTPUT,
    currency: Currency
  ) => void;
  handleSwitchTokens: () => void;
  handleRateType: (rateType: Rate, price?: Price<Currency, Currency>) => void;
  handleRangeSelection: (rangePrice: string) => void;
}

export function useOrderState(): AppState["granger"] {
  return useSelector<AppState, AppState["granger"]>((state) => state.granger);
}

export default function useGelatoLimitOrdersHandlers(): GelatoRangeOrdersHandlers {
  const { chainId, account } = useWeb3();

  const gelatoRangeOrders = useGelatoRangeOrdersLib();

  const addTransaction = useTransactionAdder();

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
    range,
  } = useOrderState();
  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const inputToken = useToken(inputCurrency?.wrapped.address);
  const outputToken = useToken(outputCurrency?.wrapped.address);
  const [pool, setPool] = useState<string>();
  const [tickThreshold, setTickThreshold] = useState<number>(0);
  const [zeroForOne, setZeroForOne] = useState<boolean>(false);

  useEffect(() => {
    if(inputCurrency && outputCurrency) {
      if(parseInt(inputCurrency?.wrapped.address, 16) > parseInt(outputCurrency?.wrapped.address, 16)) {
        setZeroForOne(true);
      } else setZeroForOne(false);
    }
  }, [inputCurrency, outputCurrency]);

  useEffect(() => {
    if(inputToken && outputToken) {
      const p = computePoolAddress({
        factoryAddress: FACTORY_ADDRESS,
        tokenA: inputToken,
        tokenB: outputToken,
        fee: FeeAmount.LOW,
      });
      setPool(p);
    }
  }, [inputToken, outputToken]);

  const handleInput = useCallback(
    (field: Field, value: string) => {
      onUserInput(field, value);
      const updateRange = async () => {
        // console.log("----------> Updating Range Prices <----------");
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
          const parsedRate = parseUnits(priceValue, outputToken.decimals);
          const prices = await gelatoRangeOrders.getNearestPrice(
            pool,
            parsedRate
          );
          const ticks = await gelatoRangeOrders.getNearTicks(pool, parsedRate);
          console.log("prices", prices);
          console.log("ticks", ticks);
          if (prices && ticks) {
            const {
              upperPrice,
              lowerPrice,
            }: { upperPrice: BigNumber; lowerPrice: BigNumber } = prices;
            const { upper, lower }: { upper: number; lower: number } = ticks;
            if (upperPrice && lowerPrice) onRangeChange(upper, upperPrice, lower, lowerPrice);
          }
        }
      };
      if (field === Field.PRICE && Number(priceValue) > 0) {
        updateRange();
      }
    },
    [onUserInput, priceValue, gelatoRangeOrders, chainId, pool, inputToken, outputToken, onRangeChange]
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

  const handleRangeOrderSubmission = useCallback(async (
    orderToSubmit: {
        inputAmount: BigNumber;
    },
    overrides?: Overrides
  ) => {
    if (!gelatoRangeOrders) {
      throw new Error("Could not reach Gelato Limit Orders library");
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

    const {
      order
    } = await gelatoRangeOrders.encodeRangeOrderSubmission(
      pool,
      zeroForOne,
      tickThreshold,
      orderToSubmit.inputAmount,
      account,
      BigNumber.from(1),
    );
    
    const tx = await gelatoRangeOrders.setRangeOrder({
      pool,
      zeroForOne,
      tickThreshold,
      amountIn: orderToSubmit.inputAmount,
      receiver: account,
      maxFeeAmount: BigNumber.from(100),
    });
    if (!tx) {
      throw new Error("No transaction");
    }
    const now = Math.round(Date.now() / 1000);
    addTransaction(tx, {
      summary: `Order submission`,
      type: "submission",
      order: {
        ...order,
        submittedTxHash: tx?.hash.toLowerCase(),
        status: RangeOrderStatus.Submitted,
        updatedAt: now.toString(),
      } as unknown as RangeOrderData,
    })

    return tx;
  }, [account, addTransaction, chainId, gelatoRangeOrders, pool, tickThreshold, zeroForOne]);

  const handleRangeSelection = useCallback(async (tick) => {
    if(tick) {
      setTickThreshold(tick);
    }
  }, [])

  return {
    handleInput,
    handleCurrencySelection,
    handleSwitchTokens,
    handleRateType,
    handleRangeOrderSubmission,
    handleRangeSelection
  };
}
