import React, { FunctionComponent } from "react";
import styled from "styled-components/macro";
import { RowBetween, RowFixed } from "../Row";
import { TYPE } from "../../theme";
import { Info } from "react-feather";
import { MouseoverTooltipContent } from "../Tooltip";

const StyledSwapHeader = styled.div`
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

const LimitPrice = styled.b`
  color: ${({ theme }) => theme.primary2};
`;
const PrimaryText = styled.b`
  color: ${({ theme }) => theme.primary2};
`;

const ToolTipText = () => (
  <>
    <p>
      {" "}
      A stop-limit order triggers the submission of a limit order, once the
      stock reaches, or breaks through, a specified stop price.
    </p>
    <p>
      A stop-limit order consists of two prices: the{" "}
      <PrimaryText>stop price</PrimaryText> and the{" "}
      <LimitPrice>limit price</LimitPrice>.
    </p>
    <p>
      The <PrimaryText>stop price</PrimaryText> is the price that activates the
      limit order and is based on the last trade price. The{" "}
      <PrimaryText>limit price</PrimaryText> is the price constraint required to
      execute the order, once triggered. Just as with limit orders, there is no
      guarantee that a stop-limit order, once triggered, will result in an order
      execution. This is an important point that is worth repeating. A
      stop-limit order{" "}
      <PrimaryText>doesn’t guarantee that any trade will occur</PrimaryText>.
    </p>
  </>
);

export const SwapHeader: FunctionComponent = () => {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontWeight={500} fontSize={16}>
            Stop Limit Order
          </TYPE.black>
          <MouseoverTooltipContent content={<ToolTipText />}>
            <StyledInfo />
          </MouseoverTooltipContent>
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  );
};
