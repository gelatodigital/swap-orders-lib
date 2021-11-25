import { Currency, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";
import React, { Fragment, memo } from "react";
import { ChevronRight } from "react-feather";
import { Flex } from "rebass";
import useTheme from "../../hooks/useTheme";
import { TYPE } from "../../theme";
import { unwrappedToken } from "../../utils/unwrappedToken";

export default memo(function SwapRoute({
  trade,
}: {
  trade: Trade<Currency, Currency, TradeType>;
}) {
  const tokenPath = trade.route.path;
  const theme = useTheme();
  return (
    <Flex
      flexWrap="wrap"
      width="100%"
      justifyContent="flex-start"
      alignItems="center"
    >
      {tokenPath.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1;
        const currency = unwrappedToken(token);
        return (
          <Fragment key={i}>
            <Flex alignItems="end">
              <TYPE.black color={theme.text1} ml="0.145rem" mr="0.145rem">
                {currency.symbol}
              </TYPE.black>
            </Flex>
            {isLastItem ? null : <ChevronRight size={14} color={theme.text2} />}
          </Fragment>
        );
      })}
    </Flex>
  );
});
