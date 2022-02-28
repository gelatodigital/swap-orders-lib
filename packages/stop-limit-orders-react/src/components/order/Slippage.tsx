import React from "react";
import styled from "styled-components/macro";
import { RowBetween, RowFixed } from "../Row";
import { TYPE } from "../../theme";
import { MouseoverTooltipContent } from "../Tooltip";

import { Info } from "react-feather";

const StyledSwap = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  color: ${({ theme }) => theme.text2};
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

const SlippageText = () => (
  <>
    When your stop loss order is executed your tokens will be swapped. Your
    slippage tolerance dictates how much slippage you are willing to accept for
    this swap. The smaller the value here the more risk there is that your stop
    loss will not execute. Currently the Slippage is set to a fixed 5%.
  </>
);

const Slippage = () => (
  <StyledSwap>
    <RowBetween>
      <RowFixed>
        <TYPE.black fontWeight={500} fontSize={16}>
          Fixed Slippage Rate
        </TYPE.black>
        <MouseoverTooltipContent content={<SlippageText />}>
          <StyledInfo />
        </MouseoverTooltipContent>
      </RowFixed>
      <RowFixed>5%</RowFixed>
    </RowBetween>
  </StyledSwap>
);

export default Slippage;
