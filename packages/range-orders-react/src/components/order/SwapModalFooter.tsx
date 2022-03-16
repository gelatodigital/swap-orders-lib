import { Currency, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";
import React, { Fragment } from "react";
import { Text } from "rebass";
import { ButtonError } from "../Button";
import { AutoRow } from "../Row";
import { SwapCallbackError } from "./styleds";

export default function SwapModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade?: Trade<Currency, Currency, TradeType>;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  disabledConfirm: boolean;
}) {
  return (
    <Fragment>
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: "10px 0 0 0" }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            Confirm Order
          </Text>
        </ButtonError>

        {swapErrorMessage ? (
          <SwapCallbackError error={swapErrorMessage} />
        ) : null}
      </AutoRow>
    </Fragment>
  );
}
