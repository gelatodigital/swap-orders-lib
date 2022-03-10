import React, { useState, useMemo, useEffect } from "react";
import { useGelatoRangeOrders } from "../../hooks/gelato";
import useGelatoRangeOrdersLib from "../../hooks/gelato/useGelatoRangeOrdersLib";
import useTheme from "../../hooks/useTheme";
import { TYPE } from "../../theme";
import { useWeb3 } from "../../web3";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed } from "../Row";
import { MouseoverTooltip } from "../Tooltip";
import { BigNumber, utils } from "ethers";
import { useToken } from "../../hooks/Tokens";
import {
  computePoolAddress,
  FACTORY_ADDRESS,
  FeeAmount,
} from "@uniswap/v3-sdk";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useOrderState } from "../../state/gorder/hooks";
import { MAX_FEE_AMOUNTS } from "../../constants/misc";
import {
  getAdjustAmountTo18,
  getAdjustAmountFrom18,
} from "../../utils/adjustCurrencyDecimals";

export function AdvancedSwapDetails() {
  const theme = useTheme();
  const { chainId, account } = useWeb3();
  const [pool, setPool] = useState<string>();
  const {
    derivedOrderInfo: { rawAmounts, currencies, selectedTick },
  } = useGelatoRangeOrders();
  const { zeroForOne } = useOrderState();

  const library = useGelatoRangeOrdersLib();
  const [minReturnRaw, setMinReturn] = useState<BigNumber>();
  const inputToken = useToken(currencies.input?.wrapped.address);
  const outputToken = useToken(currencies.output?.wrapped.address);
  // const outputAmount = parsedAmounts.output;
  const { minReturn } = useMemo(() => {
    if (!library || !chainId || !pool || !account)
      return {
        minReturn: undefined,
        slippagePercentage: undefined,
        gelatoFeePercentage: undefined,
      };

    return {
      minReturn: minReturnRaw ? utils.formatUnits(minReturnRaw, 18) : undefined,
    };
  }, [library, chainId, pool, account, minReturnRaw]);

  console.log("minReturnRaw------------", minReturnRaw?.toString());
  console.log(
    minReturnRaw && inputToken
      ? utils.formatUnits(minReturnRaw.toString(), inputToken?.decimals)
      : 0
  );
  console.log(
    rawAmounts.input ? utils.parseUnits(rawAmounts.input, 12).toString() : 0
  );

  const outputAmount = useMemo(
    () =>
      outputToken && minReturnRaw
        ? CurrencyAmount.fromRawAmount(outputToken, minReturnRaw.toString())
        : undefined,
    [outputToken, minReturnRaw]
  );

  useEffect(() => {
    const getMinReturn = async () => {
      console.log(rawAmounts.input);
      if (
        library &&
        pool &&
        chainId &&
        account &&
        inputToken &&
        rawAmounts.input
      ) {
        const mr = await library.getMinReturn({
          pool,
          zeroForOne,
          tickThreshold: selectedTick,
          amountIn: BigNumber.from(rawAmounts.input),
          minLiquidity: BigNumber.from(0),
          receiver: account,
          maxFeeAmount: BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
        });
        console.log("mr------>>", mr);
        setMinReturn(mr);
      }
    };
    getMinReturn();
  }, [
    account,
    chainId,
    inputToken,
    library,
    pool,
    rawAmounts,
    selectedTick,
    zeroForOne,
  ]);

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
            ? `${outputAmount ? outputAmount.toSignificant(4) : "-"} ${
                outputAmount ? outputAmount.currency.symbol : "-"
              }`
            : "-"}
        </TYPE.black>
      </RowBetween>
    </AutoColumn>
  );
}
