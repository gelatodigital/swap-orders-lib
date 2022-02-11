import { Currency, CurrencyAmount, Price, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { USDC_POLYGON } from "../constants/tokens";
import { useWeb3 } from "../web3";
import { useTradeExactOut } from "./useTrade";
import { useBestV3TradeExactOut } from "./useBestV3Trade";
import { SupportedChainId } from "../constants/chains";

// USDC amount used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
// const usdcCurrencyAmount = CurrencyAmount.fromRawAmount(USDC, 100_000e6);
// Stablecoin amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.

const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(
    USDC_POLYGON,
    10_000e6
  ),
};

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(
  currency?: Currency
): Price<Currency, Token> | undefined {
  const { chainId, handler } = useWeb3();
  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined;
  const stablecoin = amountOut?.currency;
  const v2USDCTrade = useTradeExactOut(
    currency,
    chainId === 1 ? STABLECOIN_AMOUNT_OUT[chainId] : undefined,
    handler,
    {
      maxHops: 2,
    }
  );
  const v3USDCTrade = useBestV3TradeExactOut(currency, amountOut);

  return useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined;
    }

    // handle usdc
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, "1", "1");
    }

    // use v2 price if available, v3 as fallback
    if (v2USDCTrade) {
      const { numerator, denominator } = v2USDCTrade.route.midPrice;
      return new Price(currency, stablecoin, denominator, numerator);
    } else if (v3USDCTrade.trade) {
      const { numerator, denominator } = v3USDCTrade.trade.route.midPrice;
      return new Price(currency, stablecoin, denominator, numerator);
    }

    return undefined;
  }, [currency, stablecoin, v2USDCTrade, v3USDCTrade.trade]);
}

export function useUSDCValue(
  currencyAmount: CurrencyAmount<Currency> | undefined | null
) {
  const price = useUSDCPrice(currencyAmount?.currency);

  return useMemo(() => {
    if (!price || !currencyAmount) return null;
    try {
      return price.quote(currencyAmount);
    } catch (error) {
      return null;
    }
  }, [currencyAmount, price]);
}
