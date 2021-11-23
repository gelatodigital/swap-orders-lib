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
}>("gorder/selectCurrency");
export const switchCurrencies = createAction<void>("gorder/switchCurrencies");
export const typeInput = createAction<{ field: Field; typedValue: string }>(
  "gorder/typeInput"
);
export const setRecipient = createAction<{ recipient: string | null }>(
  "gorder/setRecipient"
);
export const setRateType = createAction<{ rateType: Rate }>(
  "gorder/setRateType"
);
