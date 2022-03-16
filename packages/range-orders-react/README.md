# Place Buy/Sell range orders on Uniswap V3 Pools `@gelatonetwork/range-orders-react`

## Buy/Sell Principle

Range Order Swaps are implemented based on the following possiblities

| ZeroForOne | Buy     | Sell    | TickThreashold |
| ---------- | ------- | ------- | -------------- |
| true       | 1/price | price   | tick > current |
| false      | price   | 1/price | tick < current |

## Usage

```
const rangeOrdersReact = require('@gelatonetwork/range-orders-react');
```
