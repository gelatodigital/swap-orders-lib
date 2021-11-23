# GelatoNetwork Orders Library monorepo

## Development
### Add a new react-component-library `range-orders-react`

```shell
mkdir packages/range-orders-react
cd packages/range-orders-react
yarn init
lerna add @gelatonetwork/limit-orders-lib --scope=@gelatonetwork/range-orders-react #asuming `range-orders-react` also uses `limit-orders-lib`
yarn build
```

## Add newly created component to example
```shell
cd packages/range-orders-react
yarn link
cd ../../example
yarn link @gelatonetwork/range-orders-react
```
## Build specific package
```shell
yarn workspace @gelatonetwork/limit-orders-react build
```