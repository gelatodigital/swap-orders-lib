import { createReducer } from "@reduxjs/toolkit";
import { BigNumber } from "ethers";
import { NATIVE } from "../../constants/addresses";
import {
  Field,
  Rate,
  selectCurrency,
  typeInput,
  switchCurrencies,
  setRecipient,
  setRateType,
  setRange,
  setZeroForOne,
  setRangeLowerEnabled,
  setRangeUpperEnabled,
  setCurrentTick,
} from "./actions";

export interface OrderState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly inputValue?: string;
  readonly priceValue?: string;
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined;
  };

  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null;
  readonly rateType: Rate;
  readonly range: {
    readonly upper: number;
    readonly upperPrice: BigNumber;
    readonly lower: number;
    readonly lowerPrice: BigNumber;
  };
  readonly zeroForOne: boolean;
  readonly rangeLowerEnabled: boolean;
  readonly rangeUpperEnabled: boolean;
  readonly currentTick: number;
}

export const initialState: OrderState = {
  independentField: Field.INPUT,
  typedValue: "",
  inputValue: "",
  priceValue: "",
  [Field.INPUT]: {
    currencyId: NATIVE,
  },
  [Field.OUTPUT]: {
    currencyId: "",
  },
  rateType: Rate.MUL,
  recipient: null,
  range: {
    upper: 0,
    upperPrice: BigNumber.from(0),
    lower: 0,
    lowerPrice: BigNumber.from(0),
  },
  zeroForOne: true,
  rangeLowerEnabled: false,
  rangeUpperEnabled: false,
  currentTick: 0,
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
      switch (field) {
        case Field.INPUT:
          return {
            ...state,
            inputValue: typedValue,
            independentField: field,
            typedValue,
          };
          break;
        case Field.PRICE:
          return {
            ...state,
            priceValue: typedValue,
            independentField: field,
            typedValue,
          };
          break;
        default:
          return {
            ...state,
            inputValue: typedValue,
            independentField: field,
            typedValue,
          };
          break;
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient;
    })
    .addCase(setRateType, (state, { payload: { rateType } }) => {
      state.rateType = rateType;
    })
    .addCase(
      setRange,
      (state, { payload: { upper, upperPrice, lower, lowerPrice } }) => {
        state.range = { upper, upperPrice, lower, lowerPrice };
      }
    )
    .addCase(setZeroForOne, (state, { payload }) => {
      state.zeroForOne = payload;
    })
    .addCase(setRangeLowerEnabled, (state, { payload }) => {
      state.rangeLowerEnabled = payload;
    })
    .addCase(setRangeUpperEnabled, (state, { payload }) => {
      state.rangeUpperEnabled = payload;
    })
    .addCase(setCurrentTick, (state, { payload }) => {
      state.currentTick = payload;
    })
);
