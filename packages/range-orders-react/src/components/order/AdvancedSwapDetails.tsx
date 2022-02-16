/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isRangeOrderSupportedChain } from "@gelatonetwork/range-orders-lib/dist/utils";
import { CurrencyAmount, BigintIsh } from "@uniswap/sdk-core";
import { formatUnits } from "@ethersproject/units";
import React, { useState, useMemo, useEffect } from "react";
import { useGelatoRangeOrders } from "../../hooks/gelato";
import useGelatoRangeOrdersLib from "../../hooks/gelato/useGelatoRangeOrdersLib";
import useGasOverhead from "../../hooks/useGasOverhead";
import useTheme from "../../hooks/useTheme";
import { Rate } from "../../state/gorder/actions";
import { TYPE } from "../../theme";
import { useWeb3 } from "../../web3";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed } from "../Row";
import { MouseoverTooltip } from "../Tooltip";
import { BigNumber } from "ethers";
import { useToken } from "../../hooks/Tokens";
import {
  computePoolAddress,
  FACTORY_ADDRESS,
  FeeAmount,
} from "@uniswap/v3-sdk";
import {
  useOrderState,
} from "../../state/gorder/hooks";
import { MAX_FEE_AMOUNTS } from "../../constants/misc";
import { utils } from "ethers";

export function AdvancedSwapDetails() {
  const theme = useTheme();
  const { chainId, account } = useWeb3();
  const [pool, setPool] = useState<string>();
  const {
    derivedOrderInfo: { parsedAmounts, rawAmounts, currencies },
    orderState: { rateType },
  } = useGelatoRangeOrders();
  const {
    zeroForOne,
  } = useOrderState();

  const library = useGelatoRangeOrdersLib();
  const [minReturnRaw, setMinReturn] = useState<BigintIsh>(0);
  const inputToken = useToken(currencies.input?.wrapped.address);
  const outputToken = useToken(currencies.output?.wrapped.address);

  const { gasPrice, realExecutionPriceAsString } = useGasOverhead(
    parsedAmounts.input,
    parsedAmounts.output,
    rateType
  );

  const isInvertedRate = rateType === Rate.DIV;

  const realExecutionRateWithSymbols = useMemo(
    () =>
      parsedAmounts.input?.currency &&
      parsedAmounts.output?.currency &&
      realExecutionPriceAsString
        ? realExecutionPriceAsString === "never executes"
          ? realExecutionPriceAsString
          : `1 ${
              isInvertedRate
                ? parsedAmounts.output.currency.symbol
                : parsedAmounts.input.currency.symbol
            } = ${realExecutionPriceAsString} ${
              isInvertedRate
                ? parsedAmounts.input.currency.symbol
                : parsedAmounts.output.currency.symbol
            }`
        : undefined,
    [parsedAmounts, realExecutionPriceAsString, isInvertedRate]
  );

  const outputAmount = parsedAmounts.output;

  const { minReturn, slippagePercentage, gelatoFeePercentage } = useMemo(() => {
    if (!outputAmount || !library || !chainId || !pool || !account)
      return {
        minReturn: undefined,
        slippagePercentage: undefined,
        gelatoFeePercentage: undefined,
      };

    if (isRangeOrderSupportedChain(chainId))
      return {
        minReturn: outputAmount,
        slippagePercentage: undefined,
        gelatoFeePercentage: undefined,
      };
    async () => {
      const mr = await library.getMinReturn({
        pool,
        zeroForOne,
        tickThreshold: 0,
        amountIn: BigNumber.from(rawAmounts.input),
        receiver: account,
        maxFeeAmount: BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
      });
      setMinReturn(utils.formatUnits(mr, 18));
    };

    const slippagePercentage = 0;
    const gelatoFeePercentage = 0;

    const minReturnParsed = CurrencyAmount.fromRawAmount(
      outputAmount.currency,
      minReturnRaw
    );
    console.log('minReturnParsed ===============>', minReturnParsed.toSignificant(6));

    return {
      minReturn: minReturnParsed,
      slippagePercentage,
      gelatoFeePercentage,
    };
  }, [outputAmount, library, chainId, pool, account, minReturnRaw, zeroForOne, rawAmounts.input]);

  useEffect(() => {
    if (inputToken && outputToken) {
      const p = computePoolAddress({
        factoryAddress: FACTORY_ADDRESS,
        tokenA: inputToken,
        tokenB: outputToken,
        fee: FeeAmount.LOW,
      });
      setPool(p);
    }
  }, [inputToken, outputToken]);

  return !chainId ? null : (
    <AutoColumn gap="8px">
      {!isRangeOrderSupportedChain(chainId) ? (
        <>
          <RowBetween>
            <RowFixed>
              <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
                Gelato Fee
              </TYPE.black>
            </RowFixed>
            <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
              {gelatoFeePercentage ? `${gelatoFeePercentage}` : "-"}%
            </TYPE.black>
          </RowBetween>

          <RowBetween>
            <RowFixed>
              <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
                Slippage
              </TYPE.black>
            </RowFixed>
            <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
              {slippagePercentage ? `${slippagePercentage}` : "-"}%
            </TYPE.black>
          </RowBetween>
        </>
      ) : (
        <>
          <RowBetween>
            <RowFixed>
              <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
                Gas Price
              </TYPE.black>
            </RowFixed>
            <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
              {gasPrice
                ? `${parseFloat(formatUnits(gasPrice, "gwei")).toFixed(0)} GWEI`
                : "-"}
            </TYPE.black>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <MouseoverTooltip
                text={`The actual execution price. Takes into account the gas necessary to execute your order and guarantees that your desired rate is fulfilled. It fluctuates according to gas prices. ${
                  realExecutionRateWithSymbols
                    ? `Assuming current gas price it should execute when ` +
                      realExecutionRateWithSymbols +
                      "."
                    : ""
                }`}
              >
                <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
                  Real Execution Price (?)
                </TYPE.black>{" "}
              </MouseoverTooltip>
            </RowFixed>
            <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
              {realExecutionRateWithSymbols
                ? `${realExecutionRateWithSymbols}`
                : "-"}
            </TYPE.black>
          </RowBetween>
        </>
      )}

      <RowBetween>
        <RowFixed>
          <MouseoverTooltip
            text={`The minimum amount you can receive. It includes all fees and maximum slippage tolerance.`}
          >
            <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
              Minimum Received (?)
            </TYPE.black>
          </MouseoverTooltip>
        </RowFixed>
        <TYPE.black textAlign="right" fontSize={12} color={theme.text1}>
          {minReturn
            ? `${minReturn.toSignificant(4)} ${
                outputAmount ? outputAmount.currency.symbol : "-"
              }`
            : "-"}
        </TYPE.black>
      </RowBetween>
    </AutoColumn>
  );
}
