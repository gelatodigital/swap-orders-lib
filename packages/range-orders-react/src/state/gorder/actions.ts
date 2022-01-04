import { createAction } from "@reduxjs/toolkit";

export enum Field {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
  PRICE = "PRICE",
}

export enum Rate {
  MUL = "MUL",
  DIV = "DIV",
}

export const selectCurrency = createAction<{
  field: Field;
  currencyId: string;
}>("granger/selectCurrency");
export const switchCurrencies = createAction<void>("granger/switchCurrencies");
export const typeInput = createAction<{ field: Field; typedValue: string }>(
  "granger/typeInput"
);
export const setRecipient = createAction<{ recipient: string | null }>(
  "granger/setRecipient"
);
export const setRateType = createAction<{ rateType: Rate }>(
  "granger/setRateType"
);
