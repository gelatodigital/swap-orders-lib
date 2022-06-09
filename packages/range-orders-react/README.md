# Place Buy/Sell range orders on Uniswap V3 Pools `@gelatonetwork/range-orders-react`

### Installation

```
yarn add -D @gelatonetwork/range-orders-react
```

or

```
npm install --save-dev @gelatonetwork/range-orders-react
```

## Development

##### Build `range-orders-lib` and `range-orders-react` library

```shell
yarn workspace @gelatonetwork/range-orders-lib build
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

### Need help? Want to add a new handler?

Reach out to us on [Telegram](https://t.me/gelatonetwork), [Discord](https://discord.gg/ApbA39BKyJ) or [Twitter](https://twitter.com/gelatonetwork)
