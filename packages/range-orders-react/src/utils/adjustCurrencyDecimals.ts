import { BigNumber } from "ethers";
import JSBI from "jsbi";

export function getAdjustAmountFrom18(
  amount: string | number,
  currencyDecimals: number
): BigNumber {
  return BigNumber.from(
    JSBI.divide(
      JSBI.BigInt(amount),
      JSBI.exponentiate(
        JSBI.BigInt(10),
        JSBI.subtract(JSBI.BigInt(18), JSBI.BigInt(currencyDecimals))
      )
    ).toString()
  );
}

export function getAdjustAmountTo18(
  amount: string | number,
  currencyDecimals: number
) {
  return BigNumber.from(
    JSBI.multiply(
      JSBI.BigInt(amount),
      JSBI.exponentiate(
        JSBI.BigInt(10),
        JSBI.subtract(JSBI.BigInt(18), JSBI.BigInt(currencyDecimals))
      )
    ).toString()
  );
}
