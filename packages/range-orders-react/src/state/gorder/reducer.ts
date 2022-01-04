import { createReducer } from "@reduxjs/toolkit";
import { NATIVE } from "../../constants/addresses";
import {
  Field,
  Rate,
  selectCurrency,
  typeInput,
  switchCurrencies,
  setRecipient,
  setRateType,
} from "./actions";

export interface OrderState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly inputValue?: string;
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined;
  };

  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null;
  readonly rateType: Rate;
}

export const initialState: OrderState = {
  independentField: Field.INPUT,
  typedValue: "",
  inputValue: "",
  [Field.INPUT]: {
    currencyId: NATIVE,
  },
  [Field.OUTPUT]: {
    currencyId: "",
  },
  rateType: Rate.MUL,
  recipient: null,
};

export default createReducer<OrderState>(initialState, (builder) =>
  builder
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT;
      if (field === Field.PRICE)
        return {
          ...state,
        };

      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField:
            state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        };
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId: currencyId },
        };
      }
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...initialState,
        rateType: state.rateType,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      };
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return field === Field.INPUT
        ? {
            ...state,
            inputValue: typedValue,
            independentField: field,
            typedValue,
          }
        : {
            ...state,
            independentField: field,
            typedValue,
          };
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient;
    })
    .addCase(setRateType, (state, { payload: { rateType } }) => {
      state.rateType = rateType;
    })
);
