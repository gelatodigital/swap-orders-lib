import React from "react";
import styled from "styled-components/macro";
import Row, { RowBetween, RowFixed } from "../Row";
import { TYPE } from "../../theme";
import { darken } from "polished";
import { MouseoverTooltipContent } from "../Tooltip";
import { Input as NumericalInput } from "../NumericalInput";

import { Info } from "react-feather";

const StyledSwap = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  color: ${({ theme }) => theme.text2};
`;

const Tabs = styled(Row)`
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

const StyledSlippageTab = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.text2};
`;

const StyledTab = styled.div<{ active: boolean; minWidth?: string }>`
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

  ${({ minWidth }) => minWidth && `min-width: ${minWidth}; `}

  ${({ active, theme }) =>
    active &&
    `    
    border-radius: 12px;
    font-weight: 600;
    color: ${theme.text1};
    background-color: ${theme.bg1};
  `}

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`;

const StyledInfo = styled(Info)`
  opacity: 0.4;
  color: ${({ theme }) => theme.text1};
  height: 16px;
  width: 16px;
  :hover {
    opacity: 0.8;
  }
`;

const StyledInput = styled(NumericalInput)`
  height: "auto";
  background-color: transparent;
`;

const SlippageTab = ({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) => (
  <StyledSlippageTab>
    <TYPE.black fontWeight={500} fontSize={16}>
      <StyledTab
        id={`order-history-nav-link`}
        active={active}
        onClick={onClick}
      >
        {title}
      </StyledTab>
    </TYPE.black>
  </StyledSlippageTab>
);

const SlippageInputTab = ({
  title,
  active,
  onClick,
  onUserInput,
  value,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  onUserInput: (input: string) => void;
  value: string;
}) => (
  <StyledSlippageTab>
    <StyledTab
      id={`stoplimit-order-slippage-tap`}
      active={active}
      onClick={onClick}
      minWidth={"85px"}
    >
      <StyledInput
        value={active ? value : title}
        onUserInput={onUserInput}
        fontSize={"16px"}
        error={parseFloat(value) >= 100 || parseFloat(value) < 0}
      />
      {active && "%"}
    </StyledTab>
  </StyledSlippageTab>
);

const SlippageText = () => (
  <>
    When your stop loss order is executed your tokens will be swapped. Your
    slippage tolerance dictates how much slippage you are willing to accept for
    this swap. The smaller your defined value here the more risk there is that
    your stop loss will not execute because of your low tolerance.
  </>
);

export default function Slippage({
  handleActiveTab,
  handleInput,
  value,
  activeTab,
}: {
  handleActiveTab: (tab: number) => void;
  handleInput: (value: string) => void;
  value: string;
  activeTab: number;
}) {
  const handleTab = (tab: number, newValue: string) => {
    if (tab === activeTab) return;
    handleActiveTab(tab);
    handleInput(newValue);
  };

  const handleInputValidator = (newValue: string) => {
    if (!isNaN(parseFloat(newValue))) {
      handleInput(newValue);
    }
  };

  return (
    <StyledSwap>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontWeight={500} fontSize={16}>
            Max Slippage Rate
          </TYPE.black>
          <MouseoverTooltipContent content={<SlippageText />}>
            <StyledInfo />
          </MouseoverTooltipContent>
        </RowFixed>
        <RowFixed>
          <Tabs>
            <SlippageTab
              title={"1%"}
              active={activeTab === 0}
              onClick={() => handleTab(0, "1")}
            />

            <SlippageTab
              title={"2%"}
              active={activeTab === 1}
              onClick={() => handleTab(1, "2")}
            />
            <SlippageTab
              title={"5%"}
              active={activeTab === 2}
              onClick={() => handleTab(2, "5")}
            />
            <SlippageInputTab
              title={"Custom"}
              active={activeTab === 3}
              onClick={() => handleTab(3, value)}
              onUserInput={(value) => handleInputValidator(value)}
              value={value}
            />
          </Tabs>
        </RowFixed>
      </RowBetween>
    </StyledSwap>
  );
}
