# Development
## Add `.env` variables
```
REACT_APP_INFURA_KEY=2c3b24c762574d0dabbd5387839ec816
```
## Add `limit-orders-react` package to example project
```
cd packages/limit-orders-react
yarn link
cd ../../example
yarn link @gelatonetwork/limit-orders-react
```