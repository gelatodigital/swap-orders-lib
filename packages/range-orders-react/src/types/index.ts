export enum Field {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
  PRICE = "PRICE",
}

export const NativeCurrency = {
  1: "ETH",
  3: "ETH",
  56: "BNB",
  137: "MATIC",
  43114: "AVAX",
};

export interface LimitOrderState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly inputValue?: string;
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined;
  };
}

// We use this address to define a native currency in all chains
export const NATIVE_CURRENCY = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
