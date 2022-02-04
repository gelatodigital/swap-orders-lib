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
}>("gstoplimit/selectCurrency");
export const switchCurrencies = createAction<void>(
  "gstoplimit/switchCurrencies"
);
export const typeInput = createAction<{ field: Field; typedValue: string }>(
  "gstoplimit/typeInput"
);
export const setRecipient = createAction<{ recipient: string | null }>(
  "gstoplimit/setRecipient"
);
export const setRateType = createAction<{ rateType: Rate }>(
  "gstoplimit/setRateType"
);

