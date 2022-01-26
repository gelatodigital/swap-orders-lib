import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components/macro";
import { darken } from "polished";
import Row from "../Row";
import { AutoColumn } from "../Column";
import { useWeb3 } from "../../web3";
import { useGelatoRangeOrdersHistory } from "../../hooks/gelato";
import useTheme from "../../hooks/useTheme";
import OrderCard from "./OrderCard/index";

const TopSection = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`;

const StyledLimitOrderHistoryHeader = styled.div`
  padding-top: 0.75rem;
  padding-bottom: 0.2rem;
  padding-left: 0.3rem;
  width: 100%;
  color: ${({ theme }) => theme.text2};
`;

const StyledNavLink = styled.div<{ active: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  padding: 8px 12px;

  ${({ active, theme }) =>
    active &&
    `    
    border-radius: 12px;
    font-weight: 600;
    color: ${theme.text1};
    background-color: ${theme.bg2};
  `}

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`;

const HeaderTitles = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg0};
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  overflow: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
`;

type Tab = "submitted" | "cancelled" | "executed";

export default function GelatoRangeOrderHistory() {
  const [orderTab, setOrderTab] = useState<Tab>("submitted");
  const { account } = useWeb3();
  const theme = useTheme();
  const { open, cancelled, executed } = useGelatoRangeOrdersHistory();

  const fixedListRef = useRef<FixedSizeList>();

  const allOpenOrders = useMemo(
    () => [...cancelled.pending, ...open.pending, ...open.confirmed],
    [open.pending, cancelled.pending, open.confirmed]
  );

  const allCancelledOrders = useMemo(() => cancelled.confirmed, [
    cancelled.confirmed,
  ]);

  const Row = useCallback(function OrderRow({ data, index, style }) {
    return (
      <div style={style}>
        <OrderCard key={index} order={data[index]} />
      </div>
    );
  }, []);

  const itemKey = useCallback((index: number) => {
    return index;
  }, []);

  const handleActiveHeader = (tab: Tab) => {
    setOrderTab(tab);
  };

  const itemSize = 160;
  return null;
}
