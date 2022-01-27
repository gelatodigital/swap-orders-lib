import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components/macro";
import { darken } from "polished";
import { FixedSizeList } from "react-window";
import Row from "../Row";
import AppBody from "../GelatoRangeOrder/AppBody";
import { AutoColumn } from "../Column";
import { useWeb3 } from "../../web3";
import { TYPE } from "../../theme";
import { useGelatoRangeOrdersHistory } from "../../hooks/gelato";
import useTheme from "../../hooks/useTheme";
import OrderCard from "./OrderCard/index";
import { Wrapper } from "../order/styleds";

const TopSection = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`;

const StyledRangeOrderHistoryHeader = styled.div`
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

const RangeOrdersHistoryHeader = ({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) => (
  <StyledRangeOrderHistoryHeader>
    <TYPE.black fontWeight={500} fontSize={16}>
      <StyledNavLink
        id={`order-history-nav-link`}
        active={active}
        onClick={onClick}
      >
        {title}
      </StyledNavLink>
    </TYPE.black>
  </StyledRangeOrderHistoryHeader>
);

export default function GelatoRangeOrderHistory() {
  const [orderTab, setOrderTab] = useState<Tab>("executed");
  const { account } = useWeb3();
  const theme = useTheme();
  const { open, cancelled, executed } = useGelatoRangeOrdersHistory();
  // console.log("open", open);
  // console.log("cancelled", cancelled);
  // console.log("executed", executed);

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
  return account ? (
    <>
      <AppBody>
        <HeaderTitles>
          <RangeOrdersHistoryHeader
            title={"Open"}
            active={orderTab === "submitted"}
            onClick={() => handleActiveHeader("submitted")}
          />
          <RangeOrdersHistoryHeader
            title={"Cancelled"}
            active={orderTab === "cancelled"}
            onClick={() => handleActiveHeader("cancelled")}
          />
          <RangeOrdersHistoryHeader
            title={"Executed"}
            active={orderTab === "executed"}
            onClick={() => handleActiveHeader("executed")}
          />
        </HeaderTitles>

        <Wrapper id="limit-order-history">
          <TopSection gap="sm">
            {orderTab === "submitted" && !allOpenOrders.length ? (
              <TYPE.body
                color={theme.text3}
                style={{
                  paddingTop: "20px",
                  paddingBottom: "20px",
                  textAlign: "center",
                }}
                fontWeight={400}
                fontSize={16}
              >
                {"No open orders"}
              </TYPE.body>
            ) : orderTab === "submitted" ? (
              <FixedSizeList
                height={438}
                ref={fixedListRef as any}
                width="100%"
                itemData={allOpenOrders}
                itemCount={allOpenOrders.length}
                itemSize={itemSize}
                itemKey={itemKey}
              >
                {Row}
              </FixedSizeList>
            ) : null}

            {orderTab === "executed" && !executed.length ? (
              <TYPE.body
                color={theme.text3}
                style={{
                  paddingTop: "20px",
                  paddingBottom: "20px",
                  textAlign: "center",
                }}
                fontWeight={400}
                fontSize={16}
              >
                {"No executed orders"}
              </TYPE.body>
            ) : orderTab === "executed" ? (
              <FixedSizeList
                height={438}
                ref={fixedListRef as any}
                width="100%"
                itemData={executed}
                itemCount={executed.length}
                itemSize={itemSize}
                itemKey={itemKey}
              >
                {Row}
              </FixedSizeList>
            ) : null}

            {orderTab === "cancelled" && !allCancelledOrders.length ? (
              <TYPE.body
                color={theme.text3}
                style={{
                  paddingTop: "20px",
                  paddingBottom: "20px",
                  textAlign: "center",
                }}
                fontWeight={400}
                fontSize={16}
              >
                {"No cancelled orders"}
              </TYPE.body>
            ) : orderTab === "cancelled" ? (
              <FixedSizeList
                height={438}
                ref={fixedListRef as any}
                width="100%"
                itemData={allCancelledOrders}
                itemCount={allCancelledOrders.length}
                itemSize={itemSize}
                itemKey={itemKey}
              >
                {Row}
              </FixedSizeList>
            ) : null}
          </TopSection>
        </Wrapper>
      </AppBody>
    </>
  ) : null;
}
