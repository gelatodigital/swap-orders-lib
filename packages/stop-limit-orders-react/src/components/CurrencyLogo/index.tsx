import { Currency } from "@uniswap/sdk-core";
import React, { useMemo } from "react";
import styled from "styled-components/macro";
import useHttpLocations from "../../hooks/useHttpLocations";
import { WrappedTokenInfo } from "../../state/glists/wrappedTokenInfo";
import Logo from "../Logo";
import { getBaseTokenLogoURLByTokenSymbol } from "../../constants/tokens";
import { useCombinedActiveList } from "../../state/glists/hooks";
import EthereumLogo from "../../assets/images/ethereum-logo.png";
import { isEthereumChain } from "@gelatonetwork/limit-orders-lib/dist/utils";

export const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`;

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`;

export default function CurrencyLogo({
  currency,
  chainId,
  size = "24px",
  style,
  ...rest
}: {
  chainId?: number;
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
}) {
  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo ? currency.logoURI : undefined
  );

  const activeTokenList = useCombinedActiveList();

  const srcs: string[] = useMemo(() => {
    if (!currency || currency.isNative) return [];

    const uriBySymbol = getBaseTokenLogoURLByTokenSymbol(currency.symbol);

    if (currency.isToken) {
      const urlFromList =
        chainId && activeTokenList[chainId][currency.address]
          ? activeTokenList[chainId][currency.address]["token"]["tokenInfo"][
              "logoURI"
            ]
          : undefined;
      const defaultUrls =
        chainId && isEthereumChain(chainId)
          ? [getTokenLogoURL(currency.address)]
          : [];
      if (currency instanceof WrappedTokenInfo) {
        return uriBySymbol
          ? [...uriLocations, ...defaultUrls, uriBySymbol]
          : [...uriLocations, ...defaultUrls];
      }
      const tokenUrlsSoFar = uriBySymbol
        ? [uriBySymbol, ...defaultUrls]
        : defaultUrls;
      return urlFromList
        ? ([urlFromList, ...tokenUrlsSoFar] as string[])
        : (tokenUrlsSoFar as string[]);
    }
    return [];
  }, [currency, uriLocations, chainId, activeTokenList]);

  if (currency?.isNative) {
    return chainId !== 1 ? (
      <StyledLogo
        srcs={[getBaseTokenLogoURLByTokenSymbol(currency.symbol) ?? ""]}
        size={size}
        style={style}
        {...rest}
      />
    ) : (
      <StyledEthereumLogo
        src={EthereumLogo}
        size={size}
        style={style}
        {...rest}
      />
    );
  }

  return (
    <StyledLogo
      size={size}
      srcs={srcs}
      alt={`${currency?.symbol ?? "token"} logo`}
      style={style}
      {...rest}
    />
  );
}
