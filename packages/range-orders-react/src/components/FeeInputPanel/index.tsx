import React, { useState, useCallback, Fragment, useMemo } from "react";
import styled from "styled-components/macro";
import { Input as NumericalInput } from "../NumericalInput";
import { TYPE } from "../../theme";
import { RowFixed } from "../Row";
import { MouseoverTooltip } from "../Tooltip";

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? "16px" : "20px")};
  background-color: ${({ theme, hideInput }) =>
    hideInput ? "transparent" : theme.bg2};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? "100%" : "initial")};
`;
const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? "16px" : "20px")};
  border: 1px solid
    ${({ theme, hideInput }) => (hideInput ? " transparent" : theme.bg2)};
  background-color: ${({ theme }) => theme.bg1};
  width: ${({ hideInput }) => (hideInput ? "100%" : "initial")};
  :focus,
  :hover {
    border: 1px solid
      ${({ theme, hideInput }) => (hideInput ? " transparent" : theme.bg3)};
  }
`;
const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem 0.75rem 1rem;
`;

interface FeeInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  hideInput?: boolean;
  id: string;
}

export default function FeeInputPanel({
  value,
  id,
  hideInput = false,
  onUserInput,
  ...rest
}: FeeInputPanelProps) {
  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      <Container hideInput={hideInput}>
        <InputRow
          style={hideInput ? { padding: "0", borderRadius: "8px" } : {}}
        >
          <RowFixed style={{ height: "17px" }}>
            <MouseoverTooltip text={`Max fees you want to put in.`}>
              <TYPE.main>{"Max fee"}</TYPE.main>
            </MouseoverTooltip>
          </RowFixed>
          {!hideInput && (
            <NumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={(val: string) => {
                onUserInput(val);
              }}
            />
          )}
          <TYPE.main>ETH</TYPE.main>
        </InputRow>
      </Container>
    </InputPanel>
  );
}
