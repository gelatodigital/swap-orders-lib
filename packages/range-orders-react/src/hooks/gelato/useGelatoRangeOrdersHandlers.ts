import { useCallback } from "react";
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

export interface GelatoRangeOrdersHandlers {
  // handleLimitOrderSubmission: (orderToSubmit: {
  //   inputToken: string;
  //   outputToken: string;
  //   inputAmount: string;
  //   outputAmount: string;
  //   owner: string;
  //   overrides?: Overrides;
  // }) => Promise<TransactionResponse>;
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
  } = useOrderState();
  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const inputToken = useToken(inputCurrency?.wrapped.address);
  const outputToken = useToken(outputCurrency?.wrapped.address);

  const handleInput = useCallback(
    (field: Field, value: string) => {
      onUserInput(field, value);
      const updateRange = async () => {
        // console.log("----------> Updating Range Prices <----------");
        if (!gelatoRangeOrders) {
          throw new Error("Could not reach Gelato Limit Orders library");
        }
        if (!chainId) {
          throw new Error("No chainId");
        }
        if (!gelatoRangeOrders?.signer) {
          throw new Error("No signer");
        }
        if (
          gelatoRangeOrders &&
          inputToken &&
          outputToken &&
          priceValue &&
          Number(priceValue) > 0
        ) {
          const parsedRate = parseUnits(priceValue, outputToken.decimals);
          const pool = computePoolAddress({
            factoryAddress: FACTORY_ADDRESS,
            tokenA: inputToken,
            tokenB: outputToken,
            fee: FeeAmount.LOW,
          });
          // console.log('pool', pool)

          const prices = await gelatoRangeOrders.getNearestPrice(
            pool,
            parsedRate
          );
          // console.log("prices", prices);
          if (prices) {
            const {
              upperPrice,
              lowerPrice,
            }: { upperPrice: BigNumber; lowerPrice: BigNumber } = prices;
            if (upperPrice && lowerPrice) onRangeChange(upperPrice, lowerPrice);
          }
        }
      };
      if (field === Field.PRICE && Number(priceValue) > 0) {
        updateRange();
      }
    },
    [
      onUserInput,
      priceValue,
      gelatoRangeOrders,
      chainId,
      inputToken,
      outputToken,
      onRangeChange,
    ]
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
    handleInput,
    handleCurrencySelection,
    handleSwitchTokens,
    handleRateType,
  };
}
