import React from "react";
import styled from "styled-components/macro";
import Row, { RowBetween, RowFixed } from "../Row";
import { TYPE } from "../../theme";
import { darken } from "polished";

const StyledSwapHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  color: ${({ theme }) => theme.text2};
`;

const HeaderTitles = styled(Row)`
  justify-self: flex-end;
  background-color: ${({ theme }) => theme.bg0};

  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  overflow: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
`;

const StyledOrdersHeaderTabs = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.text2};
`;

const StyledNavLink = styled.div<{ active: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: right;
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

const OrdersHeaderTabs = ({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) => (
  <StyledOrdersHeaderTabs>
    <TYPE.black fontWeight={500} fontSize={16}>
      <StyledNavLink
        id={`order-history-nav-link`}
        active={active}
        onClick={onClick}
      >
        {title}
      </StyledNavLink>
    </TYPE.black>
  </StyledOrdersHeaderTabs>
);

export default function SwapHeader({
  handleActiveTab,
  activeTab,
}: {
  handleActiveTab: (tab: "sell" | "buy") => void;
  activeTab: string;
}) {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontWeight={500} fontSize={16}>
            Range Order
          </TYPE.black>
        </RowFixed>
        <RowFixed>
          <HeaderTitles>
            <OrdersHeaderTabs
              title={"Sell"}
              active={activeTab === "sell"}
              onClick={() => handleActiveTab("sell")}
            />

            <OrdersHeaderTabs
              title={"Buy"}
              active={activeTab === "buy"}
              onClick={() => handleActiveTab("buy")}
            />
          </HeaderTitles>
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  );
}
