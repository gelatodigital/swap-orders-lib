# Place Buy/Sell range orders on Uniswap V3 Pools `@gelatonetwork/range-orders-react`

### Installation
```
yarn add -D @gelatonetwork/range-orders-lib
```
or
```
npm install --save-dev @gelatonetwork/range-orders-lib
```

### `RangeOrderPayload`
```typescript=
export type RangeOrderPayload = {
  pool: string; // Uniswap pool
  zeroForOne: boolean; // Trade direction
  tickThreshold: number; // Tick Threshold for selected price
  amountIn: BigNumber; // Amount of input currency
  minLiquidity: BigNumber; // Minimum liquidity provided
  receiver: string; // Account for receiver (user's account)
  maxFeeAmount: BigNumber; // Fee amount in Native Currency
};
```
### `setRangeOrder`
Create a range order.
```
setRangeOrder(rangeOrderPayload: RangeOrderPayload, overrides?: PayableOverrides): Promise<ContractTransaction | undefined>;
```
##### Example
```typescript=
// MATIC/USDC Pool: "0xA374094527e1673A86dE625aa59517c5dE346d32";
const [, pool] = usePool(
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    FeeAmount.MEDIUM
);

const { amount0 } = gelatoRangeOrders.getAmountsIn(
        currentTick,
        lowerTick,
        upperTick,
        1000000000000000000,
        ethers.constants.Zero,
        BigNumber.from(pool?.sqrtRatioX96.toString()) ?? ethers.constants.Zero
);

const orderPayload: RangeOrderPayload = {
    pool: "0xA374094527e1673A86dE625aa59517c5dE346d32",
    zeroForOne: false,
    tickThreshold: 7756,
    amountIn: 1000000000000000000, // 1 MATIC
    minLiquidity: amount0,
    receiver: "0x00",
    maxFeeAmount: 1000000000000000000, // 1 MATIC
};

const overrides: PayableOverrides = {
    // max fee amount 1 MATIC + if input currency is NATIVE currency then input currency value
    value: 
      inputCurrency?.wrapped.address === nativeCurrency?.wrapped.address
        ? BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()).add(
            orderToSubmit.inputAmount
          )
        : BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
};

const tx = await gelatoRangeOrders.setRangeOrder(orderPayload, overrides);
if (!tx) {
    throw new Error("No transaction");
}
```
### `RangeOrderData`
`RangeOrderData` is used to store Range Orders fetched from subgraph.
```typescript=
export type RangeOrderData = {
  id: BigNumber;
  status?: RangeOrderStatus;
  creator: string;
  tickThreshold?: BigNumber;
  zeroForOne?: boolean;
  startTime?: BigNumber;
  expiryTime?: BigNumber;
  amountIn?: BigNumber;
  receiver?: string;
  feeToken?: string;
  resolver?: string;
  maxFeeAmount?: BigNumber;
  feeAmount?: BigNumber | undefined;
  amount0?: BigNumber | undefined;
  amount1?: BigNumber | undefined;
  pool?: string | undefined;
  submittedTxHash?: BytesLike;
  executedTxHash?: BytesLike | undefined;
  cancelledTxHash?: BytesLike | undefined;
  createdAt?: BigNumber;
  updatedAt?: BigNumber;
  createdAtBlock?: BigNumber;
  updatedAtBlock?: BigNumber;
  updatedAtBlockHash?: BytesLike | undefined;
};
```
### `cancelRangeOrder`
Cancel an open range order.
```
cancelRangeOrder(tokenId: BigNumber, rangeOrderPayload: RangeOrderPayload, startTime: number): Promise<ContractTransaction | undefined>;
```
##### Example
Fetch open range orders using `range-orders-lib`. Optionally you can use our hosted subgraph https://thegraph.com/hosted-service/subgraph/gelatodigital/range-orders-polygon to fetch the data.
```typescript=
// Fetch open orders gelatoRangeOrders.getOpenRangeOrders(account.toLowerCase())
const order = {
    "id": "58911",
    "status": "executed",
    "creator": "0x83fc020d7681513263042e6c2c93d0137318dc0d",
    "tickThreshold": "-271180",
    "zeroForOne": false,
    "startTime": "1645179896",
    "expiryTime": "1652955896",
    "amountIn": "1000000",
    "receiver": "0x83fc020d7681513263042e6c2c93d0137318dc0d",
    "feeToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "resolver": "0x878d22d19deba127f1690065220df24bd1c6cafb",
    "maxFeeAmount": "1000000000000000000",
    "feeAmount": "12965540264692286",
    "amount0": "599207969883765429",
    "amount1": "1231",
    "pool": "0xa374094527e1673a86de625aa59517c5de346d32",
    "submittedTxHash": "0x9870100728c2814e37f7ec44d73741a67eca86c299a07d405cd827d8691e8f15",
    "executedTxHash": "0x8d2e8a54e9e175b48b17af851a513c00f0f0775f157cdad01f28fe2bff2b84a6",
    "cancelledTxHash": null,
    "createdAt": "1645179896",
    "updatedAt": "1645184234",
    "createdAtBlock": "25078262",
    "updatedAtBlock": "25079927",
    "updatedAtBlockHash": "0xdf9fdff5c1ff42add90a53760073522d817d641e9f0685b089a885a2afdb9c27"
},
const tx = await gelatoRangeOrders.cancelRangeOrder(
    order.id,
    orderPayload,
    order.startTime?.toNumber() ?? 0
);
if (!tx) {
    throw new Error("No transaction");
}
```
### `getExchangeRate`
### `isActiveRangeOrder`
### `getOpenRangeOrders`
Get list of all open range orders.
```
getOpenRangeOrders(user: string): Promise<RangeOrderData[]>;
```
##### Example
```typescript=
const openRangeOrders = await gelatoRangeOrders.getOpenRangeOrders(account.toLowerCase())
```
### `getExecutedRangeOrders`
Get list of all executed range orders.
```
getExecutedRangeOrders(user: string): Promise<RangeOrderData[]>;
```
##### Example
```typescript=
const executedRangeOrders = await gelatoRangeOrders.getExecutedRangeOrders(account.toLowerCase())
```
### `getCancelledRangeOrders`
Get list of all cancelled range orders.
```
getCancelledRangeOrders(user: string): Promise<RangeOrderData[]>;
```
##### Example
```typescript=
const cancelledRangeOrders = await gelatoRangeOrders.getCancelledRangeOrders(account.toLowerCase())
```
### `getExpiredRangeOrders`
Get list of all expired range orders.
```
getExpiredRangeOrders(user: string): Promise<RangeOrderData[]>;
```
##### Example
```typescript=
const expiredRangeOrders = await gelatoRangeOrders.getExpiredRangeOrders(account.toLowerCase())
```
### `getMinReturn`
Get minimum return amount for a desired swap.
```
getMinReturn(rangeOrderPayload: RangeOrderPayload): Promise<BigNumber>;
```
##### Example
```typescript=
const minReturn = await library.getMinReturn({
      pool,
      zeroForOne,
      tickThreshold: selectedTick,
      amountIn: BigNumber.from(rawAmounts.input),
      minLiquidity: BigNumber.from(0),
      receiver: account,
      maxFeeAmount: BigNumber.from(MAX_FEE_AMOUNTS[chainId].toString()),
});
```
### `getNearTicks`
Get near tick values for given price. Returns nearest upper and lower tick for the given price.
```
getNearTicks(poolAddr: string, price: BigNumber): Promise<{
    lower: number;
    upper: number;
}>;
```
##### Example
```typescript=
const ticks = await gelatoRangeOrders.getNearTicks(
  poolAddress,
  utils.parseUnits(priceValue, 18)
);
```
### `getNearestPrice`
Get nearest price values for given price. Returns lower price and upper price for the given price value.
```
getNearestPrice(poolAddr: string, price: BigNumber): Promise<{
    lowerPrice: BigNumber;
    upperPrice: BigNumber;
}>;
```
##### Example
```typescript=
const prices = await gelatoRangeOrders.getNearestPrice(
  poolAddress,
  utils.parseUnits(priceValue, 18)
);
```
### `getPriceFromTick`
Get price for a given tick.
```
getPriceFromTick(poolAddr: string, tick: number): Promise<{
    lowerPrice: BigNumber;
    upperPrice: BigNumber;
}>;
```
##### Example
```typescript=
const prices = await gelatoRangeOrders.getPriceFromTick(
  poolAddress,
  7735
);
```
### `getRemainingTime`
Get remaining time of an open range order.
```
getRemainingTime(rangeOrderData: RangeOrderData): BigNumber | null;
```
### `getAmountsIn`
Get required minimum liquidity for Range Order payload.
```
getAmountsIn(
    currentTick: number,
    lowerTick: number,
    upperTick: number,
    amount0: BigNumber,
    amount1: BigNumber,
    sqrtPriceX96: BigNumber
): {
    amount0: BigNumber;
    amount1: BigNumber;
};
```
##### Example
```typescript=
const { amount0, amount1 } = gelatoRangeOrders.getAmountsIn(
    currentTick,
    lowerTick,
    upperTick,
    orderToSubmit.inputAmount,
    ethers.constants.Zero,
    BigNumber.from(pool?.sqrtRatioX96.toString()) ?? ethers.constants.Zero
);
```
### `encodeRangeOrderSubmission`

## Development

##### Build `range-orders-lib` and `range-orders-react` library
```shell
yarn workspace @gelatonetwork/range-orders-react build
```

##### Run the example app to see the changes in effect
```shell
cd swap-orders-lib/example
yarn start
```

## Publish packages
```shell
yarn publish:lerna # publish latest versions
yarn publish:lerna:next # publish next versions
```

## Buy/Sell Principle

Range Order Swaps are implemented based on the following possiblities

| ZeroForOne | Buy     | Sell    | TickThreashold |
| ---------- | ------- | ------- | -------------- |
| true       | 1/price | price   | tick > current |
| false      | price   | 1/price | tick < current |