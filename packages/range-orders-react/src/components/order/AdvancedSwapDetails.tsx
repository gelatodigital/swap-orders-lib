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
import { useOrderState } from "../../state/gorder/hooks";
import { MAX_FEE_AMOUNTS } from "../../constants/misc";

export function AdvancedSwapDetails() {
  const theme = useTheme();
  const { chainId, account } = useWeb3();
  const [pool, setPool] = useState<string>();
  const {
    derivedOrderInfo: { parsedAmounts, rawAmounts, currencies, selectedTick },
  } = useGelatoRangeOrders();
  const { zeroForOne } = useOrderState();

  const library = useGelatoRangeOrdersLib();
  const [minReturnRaw, setMinReturn] = useState<BigNumber>();
  const inputToken = useToken(currencies.input?.wrapped.address);
  const outputToken = useToken(currencies.output?.wrapped.address);
  const outputAmount = parsedAmounts.output;
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

  useEffect(() => {
    const getMinReturn = async () => {
      if(library && pool && chainId && account) {
        const mr = await library.getMinReturn({
          pool,
          zeroForOne,
          tickThreshold: selectedTick,
          amountIn: BigNumber.from(rawAmounts.input),
          receiver: account,
          maxFeeAmount: BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
        });
        setMinReturn(mr);
      }
    };
    getMinReturn();
  }, [account, chainId, library, pool, rawAmounts.input, selectedTick, zeroForOne]);

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
            ? `${Number.parseFloat(minReturn).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${
                outputAmount ? outputAmount.currency.symbol : "-"
              }`
            : "-"}
        </TYPE.black>
      </RowBetween>
    </AutoColumn>
  );
}
