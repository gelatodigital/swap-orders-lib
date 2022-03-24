import { useMemo } from "react";
import { formatUnits } from "@ethersproject/units";
import { useWeb3 } from "../web3";
import useGasPrice from "./useGasPrice";
import { useCurrency } from "./Tokens";
import { BigNumber } from "@ethersproject/bignumber";
import { GENERIC_GAS_LIMIT_ORDER_EXECUTION } from "../constants/misc";
import { useTradeExactIn } from "./useTrade";
import { tryParseAmount } from "../state/gstoplimit/hooks";
import { Currency, CurrencyAmount, Price } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { isTransactionCostDependentChain } from "@gelatonetwork/limit-orders-lib/dist/utils";
import { Rate } from "../state/gstoplimit/actions";

export default function useGasOverhead(
  inputAmount: CurrencyAmount<Currency> | undefined,
  outputAmount: CurrencyAmount<Currency> | undefined,
  rateType: Rate = Rate.MUL
): {
  realExecutionPrice: Price<Currency, Currency> | undefined | null;
  realExecutionPriceAsString: string | undefined;
  gasPrice: number | undefined;
} {
  const { chainId, handler } = useWeb3();

  const gasPrice = useGasPrice();
  const nativeCurrency = useCurrency("NATIVE");

  const requiredGas = formatUnits(
    gasPrice
      ? BigNumber.from(gasPrice).mul(GENERIC_GAS_LIMIT_ORDER_EXECUTION)
      : "0"
  );

  const requiredGasAsCurrencyAmount = tryParseAmount(
    requiredGas,
    nativeCurrency ?? undefined
  );

  const gasCostInInputTokens = useTradeExactIn(
    requiredGasAsCurrencyAmount,
    inputAmount?.currency,
    handler
  );

  const bufferedOutputAmount = useMemo(
    () =>
      gasCostInInputTokens &&
      gasCostInInputTokens.outputAmount &&
      gasCostInInputTokens.outputAmount.add(
        gasCostInInputTokens.outputAmount.multiply(2000).divide(10000)
      ),
    [gasCostInInputTokens]
  );

  const realInputAmount = useMemo(
    () =>
      bufferedOutputAmount &&
      inputAmount &&
      inputAmount.subtract(bufferedOutputAmount),
    [bufferedOutputAmount, inputAmount]
  );

  const realExecutionPrice = useMemo(() => {
    if (
      !inputAmount ||
      !gasCostInInputTokens ||
      !realInputAmount ||
      !outputAmount
    )
      return null;

    if (gasCostInInputTokens.outputAmount.greaterThan(inputAmount.asFraction))
      return undefined;
    else {
      return new Price({
        baseAmount: realInputAmount,
        quoteAmount: outputAmount,
      });
    }
  }, [realInputAmount, outputAmount, inputAmount, gasCostInInputTokens]);

  const realExecutionPriceAsString = useMemo(() => {
    if (
      !inputAmount ||
      !gasCostInInputTokens ||
      !realInputAmount ||
      !outputAmount
    )
      return undefined;

    if (gasCostInInputTokens.outputAmount.greaterThan(inputAmount.asFraction))
      return "never executes";
    else
      return rateType === Rate.DIV
        ? realInputAmount
            .divide(outputAmount.asFraction)
            ?.multiply(
              JSBI.exponentiate(
                JSBI.BigInt(10),
                JSBI.BigInt(outputAmount.currency.decimals)
              )
            )
            ?.toSignificant(6)
        : outputAmount
            ?.divide(realInputAmount.asFraction)
            ?.multiply(
              JSBI.exponentiate(
                JSBI.BigInt(10),
                JSBI.BigInt(inputAmount.currency.decimals)
              )
            )
            ?.toSignificant(6);
  }, [
    rateType,
    realInputAmount,
    outputAmount,
    inputAmount,
    gasCostInInputTokens,
  ]);

  return chainId && isTransactionCostDependentChain(chainId)
    ? { realExecutionPrice, gasPrice, realExecutionPriceAsString }
    : {
        realExecutionPrice: undefined,
        realExecutionPriceAsString: undefined,
        gasPrice: undefined,
      };
}
